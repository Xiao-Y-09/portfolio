# 构建手册：个人 CS 作品集网站

---

## 第一章：使用说明

### 本手册是什么

这是一份面向 Coding Agent（Claude Code / Codex / Cursor）的完整构建指令。目标是让一个没有项目背景的 Agent 拿到这份文档后，从零开始、按 Phase 顺序独立完成整个项目。

### 如何使用

1. **粘贴位置**：将本手册完整粘贴至 Claude Code 的 `CLAUDE.md`、Codex 的 instructions 面板、或 Cursor 的 rules 文件中
2. **执行方式**：严格按 Phase 0 → Phase 1 → ... → Phase 7 的顺序逐步执行。**每个 Phase 完成后，运行该 Phase 的「预期产出」中的验证命令，确认通过后再进入下一个 Phase**
3. **禁止跳步**：不要一次性生成所有代码。每个 Phase 是一个独立里程碑，后续 Phase 依赖前序 Phase 的产出
4. **遇到歧义时**：以本手册为准。如果手册未覆盖某个细节，做最保守的实现（纯函数、无副作用、硬编码占位符），后续 Phase 会补全

---

## 第二章：系统定位与核心架构

### 系统定位声明

> 面向**技术招聘者与同行开发者**的**黑白几何风格** **CS 作品集展示**平台：
> 通过 **Next.js 静态生成** + **JSON 数据驱动** + **几何矢量视觉系统**，
> 将**结构化的项目数据文件**转化为**可交互浏览的专业作品集网站**。

### 物理部署架构

```
单端架构（纯前端静态站点）

[JSON 数据文件] → [Next.js SSG 构建] → [静态 HTML/CSS/JS] → [Vercel CDN]
                                                                    ↑
                                                              用户浏览器访问
```

- **端数**：1 端（纯前端，无后端服务器）
- **构建方式**：Next.js Static Site Generation（构建时生成所有 HTML）
- **部署平台**：Vercel（Git push 触发自动构建部署）
- **通信方式**：无 API 调用，所有数据在构建时静态嵌入页面

### 模块职责边界

| 模块 | 目录 | 职责（做什么） | 边界（不做什么） |
|------|------|---------------|-----------------|
| 数据层 | `src/data/` | 存储所有项目和个人信息的 JSON 文件 | 不包含任何逻辑代码 |
| 类型层 | `src/lib/types.ts` | 定义所有 TypeScript 接口 | 不包含运行时逻辑 |
| 数据访问层 | `src/lib/projects.ts` | 读取和解析 JSON 文件，返回类型安全的数据 | 不做数据转换或业务计算 |
| 页面层 | `src/app/` | 组装组件，传递数据，定义路由 | 不包含 UI 渲染细节 |
| 业务组件 | `src/components/home/`, `src/components/project/` | 渲染特定业务场景的 UI | 不直接读取数据文件 |
| UI 基础组件 | `src/components/ui/` | 提供可复用的纯视觉组件 | 不包含业务逻辑，不依赖数据层 |
| 设计系统 | `src/styles/design-tokens.css` | 集中管理所有视觉变量 | 不包含组件级样式 |

### 数据流向

```
用户访问 URL
    ↓
Next.js 路由匹配（/ 或 /projects/[slug]）
    ↓
页面组件调用 src/lib/projects.ts 的数据读取函数
    ↓
数据读取函数从 src/data/ 读取对应 JSON 文件
    ↓
JSON 数据经 TypeScript 类型校验后传入页面组件
    ↓
页面组件将数据分发给各业务组件
    ↓
业务组件使用 UI 基础组件 + 设计令牌渲染最终 HTML
    ↓
Vercel 将构建产物部署至 CDN，用户看到静态页面
```

---

## 第三章：全局技术决策（铁律）

**在开始前，把这 7 条铁律贴在显眼的地方。违反任何一条都要立即停下来。**

1. **数据与视图完全分离**：所有可展示的文本内容（项目名称、描述、个人介绍等）必须存放在 `src/data/` 目录下的 JSON 文件中。任何 `.tsx` 组件文件中不得出现硬编码的展示性文本（占位符提示文案除外）。原因：用户要求「结构性强、方便修改」，数据与视图分离是实现这一目标的基础。添加或修改项目内容时只需编辑 JSON 文件，不碰任何组件代码。

2. **设计令牌集中管理**：所有视觉决策（颜色、字体、间距、边框、圆角、阴影、动画时长）必须定义为 CSS 自定义属性（CSS Variables），集中存放在 `src/styles/design-tokens.css` 中。组件样式中禁止出现硬编码的颜色值（如 `#000`、`black`）、字体名称（如 `'Inter'`）或具体间距数值（如 `24px`）。原因：用户明确要求「保留前端设计的可变动性」。所有视觉调整只需修改一个文件。

3. **组件单一职责**：每个 `.tsx` 文件只导出一个组件。组件只做一件事——要么负责布局编排（容器组件），要么负责 UI 渲染（展示组件）。页面文件（`page.tsx`）只负责数据获取和组件组装，不包含 UI 渲染逻辑。原因：单一职责保证每个文件的改动范围可预测，修改某个组件的样式不会意外影响其他组件。

4. **TypeScript 严格模式，禁止 any**：`tsconfig.json` 开启 `strict: true`。全项目不得使用 `any` 类型。所有从 JSON 文件读取的数据必须经过类型定义约束。原因：类型安全是代码可维护性的底线。JSON 数据文件没有编译器保护，类型定义是唯一的结构校验手段。

5. **静态生成优先，零客户端数据请求**：所有页面使用 Next.js 的 `generateStaticParams` + SSG 模式构建。不使用 `useEffect` 发起数据请求，不使用 `useState` 管理从外部获取的数据。组件可以使用 `useState` 管理纯 UI 状态（如弹窗开关、Tab 切换）。原因：作品集是纯静态内容，SSG 提供最快的加载速度和最佳的 SEO，且不依赖任何运行时服务。

6. **文件命名强约定**：组件文件使用 PascalCase（如 `ProjectCard.tsx`）；数据文件使用 kebab-case（如 `project-01.json`）；工具函数文件使用 camelCase（如 `projects.ts`）；CSS 文件使用 kebab-case（如 `design-tokens.css`）。每个组件文件名必须与其导出的组件名一致。原因：命名一致性让文件系统本身成为文档，任何人看到文件名就知道里面是什么。

7. **图片路径统一规范**：所有项目图片存放在 `public/images/projects/[slug]/` 目录下。JSON 数据文件中只存储文件名（如 `"screenshot-1.png"`），完整路径由数据访问层拼接。个人头像等全局图片存放在 `public/images/` 根目录。原因：统一的路径约定消除了图片引用错误的可能性，添加新项目时只需在对应 slug 目录下放入图片。

---

## 第四章：核心算法与设计哲学

本项目无复杂算法。以下为业务逻辑要点和设计哲学。

### 业务逻辑要点

**数据读取流程（伪代码）**：

```
function getAllProjects():
    projectDir = "src/data/projects/"
    files = listFiles(projectDir).filter(f => f.endsWith(".json"))
    projects = []
    for file in files:
        raw = readJSON(projectDir + file)
        project = validateAndCast<Project>(raw)
        projects.push(project)
    return projects.sortBy(p => p.date, descending)

function getProjectBySlug(slug):
    filePath = "src/data/projects/" + slug + ".json"
    if not exists(filePath):
        return null
    raw = readJSON(filePath)
    return validateAndCast<Project>(raw)
```

**路由匹配逻辑**：

```
/                     → 首页（个人介绍 + 项目网格）
/projects/[slug]      → 项目详情页（根据 slug 加载对应 JSON）
```

**图片路径拼接逻辑**：

```
function getProjectImagePath(slug, filename):
    return "/images/projects/" + slug + "/" + filename
```

### 设计哲学：黑白几何矢量风格

视觉系统基于以下原则：

- **色彩极简**：仅使用纯黑 `#000000`、纯白 `#FFFFFF`、以及 4 级灰度。无彩色。强调通过明暗对比而非色相差异来建立视觉层级
- **几何装饰**：使用 SVG 内联绘制的几何图形（三角形、圆形、直线网格、点阵）作为页面装饰元素。这些元素是纯视觉的，不承载信息
- **字体层级**：使用几何感强的无衬线字体。标题用 Space Grotesk（棱角分明的几何结构），正文用 Inter（高可读性），代码用 JetBrains Mono
- **留白即结构**：通过大量留白和精确的间距来组织信息层级，而非依赖背景色块或边框
- **交互克制**：悬停效果仅使用细微的几何变化（边框显现、微位移），不使用渐变、模糊、弹跳等效果

---

## 第五章：分 Phase 实施计划

---

### Phase 0 — 项目骨架搭建

#### 目标

从零创建 Next.js 项目，安装所有依赖，建立完整的目录结构，配置 TypeScript 和 Tailwind CSS。完成后项目可以 `npm run dev` 启动并看到一个空白页面。

#### Context

- 当前什么都没有，从空目录开始
- 使用 Next.js 14+ 的 App Router 模式
- 使用 TypeScript + Tailwind CSS

#### Prompt

**1. 创建 Next.js 项目：**

```bash
npx create-next-app@latest portfolio --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd portfolio
```

在安装交互中，选择 **不使用** Turbopack（稳定性优先）。

**2. 安装额外依赖：**

```bash
npm install @next/font
```

无其他运行时依赖。这是一个纯静态站点，保持依赖最小化。

**3. 创建完整目录结构：**

在项目根目录下执行，创建所有空目录：

```bash
mkdir -p src/styles
mkdir -p src/components/layout
mkdir -p src/components/home
mkdir -p src/components/project
mkdir -p src/components/ui
mkdir -p src/data/projects
mkdir -p src/lib
mkdir -p public/images/projects
```

**4. 创建设计令牌文件 `src/styles/design-tokens.css`：**

写入以下内容（这是整个项目视觉系统的唯一真相源）：

```css
:root {
  /* === 色彩系统 === */
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-gray-100: #F5F5F5;
  --color-gray-200: #E5E5E5;
  --color-gray-400: #A3A3A3;
  --color-gray-600: #525252;
  --color-gray-800: #262626;

  /* === 语义色彩 === */
  --color-bg: var(--color-white);
  --color-text-primary: var(--color-black);
  --color-text-secondary: var(--color-gray-600);
  --color-text-tertiary: var(--color-gray-400);
  --color-border: var(--color-gray-200);
  --color-border-hover: var(--color-black);
  --color-surface: var(--color-gray-100);

  /* === 字体 === */
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* === 字号 === */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;
  --text-4xl: 2.5rem;
  --text-5xl: 3.5rem;

  /* === 间距 === */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;

  /* === 布局 === */
  --max-width: 1200px;
  --header-height: 64px;
  --grid-columns: 3;
  --grid-gap: var(--space-lg);

  /* === 卡片 === */
  --card-border-width: 1px;
  --card-padding: var(--space-lg);

  /* === 预览 === */
  --iframe-height: 500px;

  /* === 动画 === */
  --transition-fast: 150ms;
  --transition-base: 300ms;
  --transition-slow: 500ms;
  --hover-translate-y: -2px;
  --easing: cubic-bezier(0.25, 0.1, 0.25, 1);

  /* === 断点（仅做参考，实际用 Tailwind 断点） === */
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
}
```

**5. 替换 `src/app/globals.css`：**

清空默认内容，写入：

```css
@import '../styles/design-tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

/* === 全局基础样式 === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.2;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

code, pre {
  font-family: var(--font-mono);
}

::selection {
  background-color: var(--color-black);
  color: var(--color-white);
}
```

**6. 更新 `tailwind.config.ts`：**

替换为以下内容，将设计令牌桥接到 Tailwind：

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-black)",
        background: "var(--color-bg)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",
        border: "var(--color-border)",
        "border-hover": "var(--color-border-hover)",
        surface: "var(--color-surface)",
        gray: {
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          400: "var(--color-gray-400)",
          600: "var(--color-gray-600)",
          800: "var(--color-gray-800)",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      maxWidth: {
        content: "var(--max-width)",
      },
      spacing: {
        header: "var(--header-height)",
      },
      transitionDuration: {
        fast: "var(--transition-fast)",
        base: "var(--transition-base)",
        slow: "var(--transition-slow)",
      },
    },
  },
  plugins: [],
};

export default config;
```

**7. 替换 `src/app/layout.tsx`：**

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "CS 作品集",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

**8. 替换 `src/app/page.tsx`：**

写入最小占位内容：

```tsx
export default function HomePage() {
  return (
    <main>
      <p>Portfolio — Phase 0 Complete</p>
    </main>
  );
}
```

**9. 更新 `next.config.ts`：**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
```

注意：`output: "export"` 启用完全静态导出，适配 Vercel 的静态部署。`images.unoptimized: true` 因为静态导出不支持 Next.js 的图片优化 API。

#### 预期产出

```bash
# 项目能成功启动开发服务器
npm run dev
# 浏览器访问 http://localhost:3000 看到 "Portfolio — Phase 0 Complete"

# 项目能成功构建
npm run build
# 无报错，在 out/ 目录生成静态文件

# TypeScript 类型检查通过
npx tsc --noEmit
# 无报错

# 目录结构验证
ls src/components/layout src/components/home src/components/project src/components/ui src/data/projects src/lib src/styles
# 所有目录存在
```

---

### Phase 1 — 类型定义与数据层

#### 目标

定义项目和个人资料的完整 TypeScript 类型，创建 7 个占位项目 JSON 文件和 1 个个人资料 JSON 文件，实现数据读取工具函数。完成后，可以在代码中类型安全地读取所有项目数据。

#### Context

- Phase 0 已完成：项目骨架和目录结构就绪
- 本 Phase 操作的文件全部是新建文件
- 数据文件中所有文本内容使用中英文占位符，图片字段使用 `"placeholder.png"` 占位

#### Prompt

**1. 创建类型定义文件 `src/lib/types.ts`：**

```typescript
export interface AlgorithmStep {
  step: number;
  title: string;
  description: string;
  image: string | null;
}

export interface Algorithm {
  overview: string;
  steps: AlgorithmStep[];
}

export interface ProjectImage {
  filename: string;
  caption: string;
  alt: string;
}

export interface ProjectLinks {
  live: string | null;
  github: string | null;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  date: string;
  thumbnail: string;
  thumbnailAlt: string;
  algorithm: Algorithm;
  images: ProjectImage[];
  links: ProjectLinks;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface TechCategory {
  category: string;
  items: string[];
}

export interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  skills: string[];
  experience: Experience[];
  techStack: TechCategory[];
  contact: ContactInfo;
}
```

**2. 创建个人资料数据文件 `src/data/profile.json`：**

```json
{
  "name": "Your Name",
  "title": "Computer Science Student",
  "bio": "Placeholder bio. A brief introduction about yourself, your interests in computer science, and what drives your work. Replace this with your actual introduction.",
  "avatar": "avatar.png",
  "skills": [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "React",
    "Next.js",
    "Node.js",
    "Git"
  ],
  "experience": [
    {
      "role": "Software Engineer Intern",
      "company": "Company A",
      "period": "2024.06 — 2024.09",
      "description": "Placeholder description of your internship responsibilities and achievements."
    },
    {
      "role": "Research Assistant",
      "company": "University Lab",
      "period": "2023.09 — 2024.05",
      "description": "Placeholder description of your research work."
    }
  ],
  "techStack": [
    {
      "category": "Frontend",
      "items": ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML/CSS"]
    },
    {
      "category": "Backend",
      "items": ["Node.js", "Python", "Express", "PostgreSQL"]
    },
    {
      "category": "Tools",
      "items": ["Git", "Docker", "Figma", "VS Code"]
    },
    {
      "category": "Other",
      "items": ["Data Structures", "Algorithms", "System Design", "Agile"]
    }
  ],
  "contact": {
    "email": "your@email.com",
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/in/yourusername"
  }
}
```

**3. 创建 7 个占位项目数据文件：**

在 `src/data/projects/` 目录下创建以下 7 个 JSON 文件。每个文件结构相同但内容不同。slug 必须与文件名一致（不含 `.json`）。

**`src/data/projects/project-01.json`**：
```json
{
  "slug": "project-01",
  "title": "Project Alpha",
  "summary": "A brief one-line summary of Project Alpha for the card display.",
  "description": "A detailed description of Project Alpha. Explain what the project does, the problem it solves, and why it matters. This paragraph will appear at the top of the project detail page.",
  "tags": ["React", "TypeScript", "API"],
  "date": "2024-12",
  "thumbnail": "thumbnail.png",
  "thumbnailAlt": "Screenshot of Project Alpha main interface",
  "algorithm": {
    "overview": "This project uses a custom algorithm to process user input and generate optimized output. The core logic involves three main stages.",
    "steps": [
      {
        "step": 1,
        "title": "Input Parsing",
        "description": "Raw user input is parsed and validated against the expected schema. Invalid entries are filtered out at this stage.",
        "image": "algo-step-1.png"
      },
      {
        "step": 2,
        "title": "Core Processing",
        "description": "The validated data passes through the main processing pipeline, where the optimization algorithm is applied.",
        "image": "algo-step-2.png"
      },
      {
        "step": 3,
        "title": "Output Generation",
        "description": "Processed results are formatted and returned to the user in a structured format.",
        "image": null
      }
    ]
  },
  "images": [
    {
      "filename": "screenshot-1.png",
      "caption": "Main dashboard showing the overview panel",
      "alt": "Dashboard screenshot"
    },
    {
      "filename": "screenshot-2.png",
      "caption": "Detail view of the processing results",
      "alt": "Results view screenshot"
    }
  ],
  "links": {
    "live": "https://example.com",
    "github": "https://github.com/yourusername/project-alpha"
  }
}
```

**`src/data/projects/project-02.json`**：与上面结构完全相同，修改以下字段：`slug` 为 `"project-02"`，`title` 为 `"Project Beta"`，`summary` 为 `"A brief one-line summary of Project Beta."`，`tags` 为 `["Python", "Machine Learning", "Data"]`，`date` 为 `"2024-10"`。其余字段保持占位内容但描述文字改为 Project Beta 相关。

**`src/data/projects/project-03.json`**：`slug` 为 `"project-03"`，`title` 为 `"Project Gamma"`，`tags` 为 `["Java", "Backend", "Database"]`，`date` 为 `"2024-08"`。

**`src/data/projects/project-04.json`**：`slug` 为 `"project-04"`，`title` 为 `"Project Delta"`，`tags` 为 `["React", "Node.js", "Full Stack"]`，`date` 为 `"2024-06"`。

**`src/data/projects/project-05.json`**：`slug` 为 `"project-05"`，`title` 为 `"Project Epsilon"`，`tags` 为 `["C++", "Algorithm", "Optimization"]`，`date` 为 `"2024-04"`。

**`src/data/projects/project-06.json`**：`slug` 为 `"project-06"`，`title` 为 `"Project Zeta"`，`tags` 为 `["Swift", "iOS", "Mobile"]`，`date` 为 `"2024-02"`。

**`src/data/projects/project-07.json`**：`slug` 为 `"project-07"`，`title` 为 `"Project Eta"`，`tags` 为 `["Python", "NLP", "AI"]`，`date` 为 `"2023-12"`。

每个文件的 `summary`、`description`、`algorithm`、`images` 字段结构与 `project-01.json` 完全一致，仅替换项目名称和标签。所有文件都必须是合法 JSON，所有字段不得遗漏。

**4. 创建数据访问工具函数 `src/lib/projects.ts`：**

```typescript
import fs from "fs";
import path from "path";
import type { Project, Profile } from "./types";

const PROJECTS_DIR = path.join(process.cwd(), "src/data/projects");
const PROFILE_PATH = path.join(process.cwd(), "src/data/profile.json");

export function getAllProjects(): Project[] {
  const fileNames = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".json"));
  const projects: Project[] = fileNames.map((fileName) => {
    const filePath = path.join(PROJECTS_DIR, fileName);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Project;
  });
  return projects.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getProjectBySlug(slug: string): Project | null {
  const filePath = path.join(PROJECTS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Project;
}

export function getAllProjectSlugs(): string[] {
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

export function getProfile(): Profile {
  const raw = fs.readFileSync(PROFILE_PATH, "utf-8");
  return JSON.parse(raw) as Profile;
}

export function getProjectImagePath(slug: string, filename: string): string {
  return `/images/projects/${slug}/${filename}`;
}
```

**5. 为每个项目创建图片占位目录：**

```bash
mkdir -p public/images/projects/project-01
mkdir -p public/images/projects/project-02
mkdir -p public/images/projects/project-03
mkdir -p public/images/projects/project-04
mkdir -p public/images/projects/project-05
mkdir -p public/images/projects/project-06
mkdir -p public/images/projects/project-07
```

在每个目录下创建一个占位 SVG 文件 `thumbnail.png`（实际上是占位 SVG 重命名，或使用一个简单脚本生成纯灰色 PNG 占位图）。更简洁的做法：在组件中当图片不存在时显示一个 CSS 绘制的占位块，因此这一步仅创建目录，不放文件。

#### 预期产出

```bash
# TypeScript 类型检查通过
npx tsc --noEmit

# 数据文件格式验证：所有 JSON 文件可被解析
node -e "
const fs = require('fs');
const dir = 'src/data/projects';
fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(f => {
  const data = JSON.parse(fs.readFileSync(dir + '/' + f, 'utf-8'));
  console.log(f, '-> slug:', data.slug, '| tags:', data.tags.length, '| steps:', data.algorithm.steps.length);
});
const profile = JSON.parse(fs.readFileSync('src/data/profile.json', 'utf-8'));
console.log('profile -> name:', profile.name, '| skills:', profile.skills.length);
"
# 输出 7 个项目文件的 slug、tags 数量、steps 数量，以及 profile 的 name 和 skills 数量

# 构建仍然通过
npm run build
```

---

### Phase 2 — UI 基础组件

#### 目标

创建所有可复用的 UI 基础组件：几何装饰分割线、标签徽章、章节标题。这些组件不包含业务逻辑，只接收 props 渲染纯视觉元素。完成后可以在 Storybook 或临时页面中独立预览每个组件。

#### Context

- Phase 0 和 Phase 1 已完成：目录结构、设计令牌、类型定义、数据文件全部就绪
- 本 Phase 创建的文件全部在 `src/components/ui/` 目录下
- 所有样式必须引用 CSS 变量，不得硬编码颜色或字体

#### Prompt

**1. 创建 `src/components/ui/GeometricDivider.tsx`：**

一个基于 SVG 的几何装饰分割线组件。接收 `variant` prop 控制不同图案。

```tsx
interface GeometricDividerProps {
  variant?: "dots" | "line" | "triangles";
  className?: string;
}
```

- `variant="dots"`：渲染一排等距小圆点（7 个圆，半径 2px，间距 16px），水平居中
- `variant="line"`：渲染一条水平细线（1px 高），左右各有一个小三角形
- `variant="triangles"`：渲染 3 个等间距的小三角形（边长 8px），水平居中
- 默认 `variant="line"`
- SVG 内所有颜色使用 `currentColor`，由父元素的 `color` CSS 属性控制
- 组件外层 `<div>` 添加垂直 margin，使用 `var(--space-2xl)` 上下间距

**2. 创建 `src/components/ui/Tag.tsx`：**

一个标签/徽章组件，用于展示技术栈标签。

```tsx
interface TagProps {
  label: string;
  className?: string;
}
```

- 渲染为 `<span>` 元素
- 样式：`border: 1px solid var(--color-border)`，`padding: var(--space-xs) var(--space-md)`，`font-family: var(--font-mono)`，`font-size: var(--text-xs)`，`text-transform: uppercase`，`letter-spacing: 0.05em`
- 悬停效果：`border-color` 变为 `var(--color-border-hover)`，`transition` 使用 `var(--transition-fast)`

**3. 创建 `src/components/ui/SectionTitle.tsx`：**

章节标题组件，用于页面中各区块的标题。

```tsx
interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}
```

- `title` 渲染为 `<h2>`，`font-family: var(--font-heading)`，`font-size: var(--text-3xl)`，`font-weight: 700`
- `subtitle` 渲染为 `<p>`，位于标题下方，`font-size: var(--text-base)`，`color: var(--color-text-secondary)`，`margin-top: var(--space-sm)`
- `align` 控制文本对齐，默认 `"left"`
- 标题上方添加一个小几何装饰：一个 16px × 2px 的矩形色块（使用 `var(--color-black)`），在标题上方 `var(--space-md)` 处

**4. 创建 `src/components/ui/PlaceholderImage.tsx`：**

当项目图片尚未上传时显示的占位元素。

```tsx
interface PlaceholderImageProps {
  width?: string;
  height?: string;
  label?: string;
  className?: string;
}
```

- 渲染为一个 `<div>`，背景色 `var(--color-surface)`，边框 `1px solid var(--color-border)`
- 内部用 SVG 绘制一个简单的几何图案（居中的十字线 + 对角线，颜色 `var(--color-gray-400)`）
- 如果传了 `label`，在几何图案下方显示灰色小字
- `width` 和 `height` 默认 `"100%"` 和 `"200px"`

**5. 创建 `src/components/ui/IconLink.tsx`：**

带图标的外部链接组件，用于 GitHub / 网站 等链接。

```tsx
interface IconLinkProps {
  href: string;
  icon: "github" | "external" | "email" | "linkedin";
  label: string;
  className?: string;
}
```

- 渲染为 `<a target="_blank" rel="noopener noreferrer">`
- 图标用内联 SVG 绘制（不引入图标库）：
  - `"github"`：简化的 GitHub 标志（圆形 + 内部猫耳轮廓），16×16 viewBox
  - `"external"`：右上角箭头 + 方框（经典外部链接图标），16×16 viewBox
  - `"email"`：信封图标，16×16 viewBox
  - `"linkedin"`：简化的 LinkedIn 标志，16×16 viewBox
- 图标与文字水平排列，间距 `var(--space-sm)`
- 悬停时添加下划线，`transition` 使用 `var(--transition-fast)`

#### 预期产出

```bash
# TypeScript 类型检查通过
npx tsc --noEmit

# 构建通过
npm run build

# 验证所有 UI 组件文件存在
ls src/components/ui/
# 输出：GeometricDivider.tsx  IconLink.tsx  PlaceholderImage.tsx  SectionTitle.tsx  Tag.tsx
```

为快速视觉验证，临时修改 `src/app/page.tsx`，导入并渲染每个 UI 组件（传入示例 props），在浏览器中确认所有组件正确渲染。验证完毕后将 `page.tsx` 恢复为占位内容。

---

### Phase 3 — 全局布局与导航

#### 目标

创建 Header、Footer、PageWrapper 三个布局组件，并将它们集成到 `layout.tsx` 中。完成后，所有页面共享统一的页头、页脚和内容容器。

#### Context

- Phase 0-2 已完成：设计令牌、数据层、UI 基础组件全部就绪
- 本 Phase 创建的文件在 `src/components/layout/` 目录下
- Header 需要包含导航链接，指向首页和一个页面锚点（#projects）
- Footer 包含联系方式链接

#### Prompt

**1. 创建 `src/components/layout/Header.tsx`：**

```tsx
interface HeaderProps {
  className?: string;
}
```

- 固定在页面顶部（`position: sticky; top: 0; z-index: 50`）
- 高度使用 `var(--header-height)`
- 背景色 `var(--color-bg)`，底部边框 `1px solid var(--color-border)`
- 添加 `backdrop-filter: blur(8px)` 和半透明背景（`rgba(255,255,255,0.9)`）实现毛玻璃效果
- 内部布局：左侧为网站标识（文字 logo，使用 `var(--font-heading)` 粗体，链接到 `/`），右侧为导航链接
- 导航链接项：`Projects`（链接到 `/#projects`）、`About`（链接到 `/#about`）、`Contact`（链接到 `/#contact`）
- 导航链接样式：`font-family: var(--font-mono)`，`font-size: var(--text-sm)`，`text-transform: uppercase`，`letter-spacing: 0.1em`
- 悬停效果：链接文字下方出现 1px 横线，使用 `var(--transition-fast)` 过渡
- 最大宽度 `var(--max-width)`，水平居中，左右 padding `var(--space-lg)`
- 移动端（< 768px）：导航链接隐藏，显示一个汉堡菜单按钮（用 3 条水平线的 SVG 绘制）。点击后展开全屏导航覆盖层（黑色背景白色文字）。此交互需要使用 React 的 `useState`。组件顶部添加 `"use client";` 指令

**2. 创建 `src/components/layout/Footer.tsx`：**

```tsx
interface FooterProps {
  className?: string;
}
```

- 上边框 `1px solid var(--color-border)`
- 上下 padding `var(--space-3xl)`
- 内部分两行：
  - 第一行：左侧是名字（从 `profile.json` 读取，但 Footer 不直接读数据文件——由 layout 传入 prop 或直接硬编码为占位符，后续通过数据层解决），右侧是社交链接（使用 `IconLink` 组件）
  - 第二行：居中的版权声明 `© {当前年份} All rights reserved.`，`font-size: var(--text-xs)`，`color: var(--color-text-tertiary)`
- 由于 Footer 不涉及交互状态，保持为 Server Component（不添加 `"use client"`）
- Footer 接收 props：

```tsx
interface FooterProps {
  name: string;
  contact: {
    email: string;
    github: string;
    linkedin: string;
  };
  className?: string;
}
```

**3. 创建 `src/components/layout/PageWrapper.tsx`：**

页面内容容器，提供统一的最大宽度和内边距。

```tsx
interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}
```

- 渲染为 `<main>` 标签
- `max-width: var(--max-width)`，水平居中（`margin: 0 auto`）
- 左右 padding：`var(--space-lg)`
- 顶部 padding：`var(--header-height)`（为 sticky header 留出空间）
- 底部 padding：`var(--space-4xl)`

**4. 更新 `src/app/layout.tsx`：**

在 body 内添加 Header 和 Footer 组件。从 `getProfile()` 获取 profile 数据传入 Footer。结构如下：

```tsx
<body>
  <Header />
  {children}
  <Footer name={profile.name} contact={profile.contact} />
</body>
```

在 `layout.tsx` 顶部导入 `getProfile` 和两个布局组件。注意 `layout.tsx` 是 Server Component，可以直接调用 `getProfile()`。

#### 预期产出

```bash
# TypeScript 类型检查通过
npx tsc --noEmit

# 构建通过
npm run build

# 开发服务器启动，浏览器验证：
npm run dev
# 1. 页面顶部有 sticky header，包含 logo 和导航链接
# 2. 页面底部有 footer，包含社交链接和版权声明
# 3. 缩小浏览器窗口到 < 768px，汉堡菜单出现，点击展开全屏导航
# 4. 点击导航链接不报错（目标锚点尚未存在，但不应 404）
```

---

### Phase 4 — 首页：个人介绍 + 作品网格

#### 目标

构建首页的两个核心区块：Hero 区域（个人介绍）和项目网格。完成后，访问首页能看到个人信息和所有 7 个项目的卡片。点击卡片暂时不跳转（详情页在 Phase 5 实现）。

#### Context

- Phase 0-3 已完成：数据层、UI 组件、布局组件全部就绪
- 本 Phase 创建的文件在 `src/components/home/` 和 `src/components/project/`（ProjectCard 是复用组件）
- 首页 `page.tsx` 作为 Server Component，直接调用数据读取函数

#### Prompt

**1. 创建 `src/components/home/HeroSection.tsx`：**

首页顶部的个人介绍区域。

```tsx
import type { Profile } from "@/lib/types";

interface HeroSectionProps {
  profile: Profile;
}
```

- 外层容器 padding：上下 `var(--space-4xl)`
- 布局：左右两栏（桌面端），左宽右窄（约 7:3 比例）。移动端堆叠为单栏
- **左栏内容**：
  - 名字：`<h1>`，`font-size: var(--text-5xl)`，`font-family: var(--font-heading)`，`font-weight: 700`
  - 头衔：`<p>`，`font-size: var(--text-xl)`，`color: var(--color-text-secondary)`，`margin-top: var(--space-sm)`
  - 个人简介：`<p>`，`font-size: var(--text-lg)`，`color: var(--color-text-secondary)`，`margin-top: var(--space-lg)`，`max-width: 600px`，`line-height: 1.7`
  - 技术栈标签区域：`margin-top: var(--space-xl)`，使用 `Tag` 组件渲染 `profile.skills` 数组，标签之间间距 `var(--space-sm)`，使用 `flex-wrap`
  - 联系方式：`margin-top: var(--space-xl)`，使用 `IconLink` 组件水平排列
- **右栏内容**：
  - 一个几何装饰图形区域（纯 SVG）。绘制一个由多个同心圆和交叉直线组成的抽象几何图案，尺寸 280×280，颜色使用 `var(--color-gray-200)` 的线条。这个区域在移动端隐藏
- 底部添加 `GeometricDivider variant="dots"`
- 给外层容器添加 `id="about"` 作为导航锚点

**2. 创建 `src/components/project/ProjectCard.tsx`：**

单个项目卡片组件，用于首页网格。

```tsx
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}
```

- 渲染为 `<a href={"/projects/" + project.slug}>` 包裹的 `<article>` 元素
- 卡片样式：
  - `border: var(--card-border-width) solid var(--color-border)`
  - `padding: 0`（图片区域紧贴边缘）
  - `transition` 使用 `var(--transition-base)` 和 `var(--easing)`
- **缩略图区域**：
  - 宽高比 `16:10`（使用 `aspect-ratio: 16/10`）
  - 如果 `project.thumbnail` 对应文件存在，显示 `<img>` 标签，`object-fit: cover`
  - 如果不存在，显示 `PlaceholderImage` 组件
  - 为简化判断，当前阶段统一使用 `PlaceholderImage`，因为尚未上传真实图片
- **文字区域**（padding `var(--card-padding)`）：
  - 项目标题：`<h3>`，`font-family: var(--font-heading)`，`font-size: var(--text-xl)`，`font-weight: 600`
  - 摘要：`<p>`，`font-size: var(--text-sm)`，`color: var(--color-text-secondary)`，`margin-top: var(--space-sm)`，限制为 2 行（使用 `-webkit-line-clamp: 2`）
  - 标签栏：`margin-top: var(--space-md)`，使用 `Tag` 组件渲染 `project.tags`（最多显示 3 个），标签间距 `var(--space-xs)`
  - 日期：`font-family: var(--font-mono)`，`font-size: var(--text-xs)`，`color: var(--color-text-tertiary)`，`margin-top: var(--space-md)`
- **悬停效果**：
  - 整个卡片 `transform: translateY(var(--hover-translate-y))`
  - `border-color` 变为 `var(--color-border-hover)`

**3. 创建 `src/components/home/ProjectGrid.tsx`：**

项目卡片网格容器。

```tsx
import type { Project } from "@/lib/types";

interface ProjectGridProps {
  projects: Project[];
}
```

- 顶部添加 `SectionTitle title="Projects" subtitle="Selected works and experiments"` 和 `id="projects"` 锚点
- 使用 CSS Grid 布局：`grid-template-columns: repeat(var(--grid-columns), 1fr)`，`gap: var(--grid-gap)`
- 响应式：
  - 桌面端（≥ 1024px）：3 列
  - 平板端（≥ 768px）：2 列
  - 移动端（< 768px）：1 列
- 遍历 `projects` 数组，每个项目渲染一个 `ProjectCard`
- 上下 padding `var(--space-3xl)`

**4. 更新 `src/app/page.tsx`：**

替换为完整的首页实现：

```tsx
import { getAllProjects, getProfile } from "@/lib/projects";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { HeroSection } from "@/components/home/HeroSection";
import { ProjectGrid } from "@/components/home/ProjectGrid";

export default function HomePage() {
  const profile = getProfile();
  const projects = getAllProjects();

  return (
    <PageWrapper>
      <HeroSection profile={profile} />
      <ProjectGrid projects={projects} />
    </PageWrapper>
  );
}
```

注意：这是 Server Component，可以直接调用 `getProfile()` 和 `getAllProjects()`，不需要 `useEffect`。

#### 预期产出

```bash
# TypeScript 类型检查通过
npx tsc --noEmit

# 构建通过
npm run build

# 开发服务器启动后浏览器验证：
npm run dev
# 1. 首页显示个人介绍区（名字、头衔、简介、技术栈标签、联系方式链接）
# 2. 下方显示 "Projects" 标题和 7 个项目卡片
# 3. 桌面端卡片排列为 3 列，缩小窗口变为 2 列 → 1 列
# 4. 卡片悬停时有上移 + 边框变黑效果
# 5. 点击卡片导航到 /projects/project-01/ 等 URL（此时会 404，属于预期行为）
# 6. 点击 Header 中的 "Projects" 链接，页面滚动到项目网格区域
```

---

### Phase 5 — 项目详情页

#### 目标

实现 `/projects/[slug]` 动态路由页面。每个项目有独立的详情页，包含：项目标题与信息、详细描述、算法流程、图片画廊、以及网页链接预览。完成后，从首页点击任意项目卡片能进入该项目的完整详情页。

#### Context

- Phase 0-4 已完成：数据层、UI 组件、布局、首页全部就绪
- 本 Phase 创建的文件在 `src/app/projects/[slug]/` 和 `src/components/project/`
- 需要使用 `generateStaticParams` 预生成所有项目页的静态路由

#### Prompt

**1. 创建 `src/components/project/ProjectHeader.tsx`：**

项目详情页顶部的标题区域。

```tsx
import type { Project } from "@/lib/types";

interface ProjectHeaderProps {
  project: Project;
}
```

- **返回首页链接**：页面最顶部，显示 `← Back to Projects`，链接到 `/`，`font-family: var(--font-mono)`，`font-size: var(--text-sm)`，`color: var(--color-text-secondary)`。悬停时颜色变为 `var(--color-text-primary)`
- **标题区域**（`margin-top: var(--space-xl)`）：
  - 项目标题：`<h1>`，`font-size: var(--text-4xl)`，`font-family: var(--font-heading)`
  - 标签栏：`margin-top: var(--space-md)`，使用 `Tag` 组件渲染所有 `project.tags`
  - 日期和链接行：`margin-top: var(--space-lg)`，水平排列，`font-family: var(--font-mono)`，`font-size: var(--text-sm)`
    - 日期显示（`color: var(--color-text-tertiary)`）
    - 如果 `project.links.github` 不为 null，显示 `IconLink icon="github"`
    - 如果 `project.links.live` 不为 null，显示 `IconLink icon="external" label="Live Demo"`
- 底部添加 `GeometricDivider variant="line"`

**2. 创建 `src/components/project/AlgorithmFlow.tsx`：**

算法流程展示组件——垂直步骤列表。

```tsx
import type { Algorithm } from "@/lib/types";

interface AlgorithmFlowProps {
  algorithm: Algorithm;
  projectSlug: string;
}
```

- 顶部使用 `SectionTitle title="Algorithm Flow"`
- **概述段落**：渲染 `algorithm.overview`，`font-size: var(--text-base)`，`color: var(--color-text-secondary)`，`margin-bottom: var(--space-xl)`
- **步骤列表**：垂直排列，每个步骤之间用一条垂直细线连接（视觉上形成时间轴效果）
  - 每个步骤的布局：
    - 左侧：步骤编号，渲染在一个 32×32 的圆形中（`border: 1px solid var(--color-black)`，数字居中，`font-family: var(--font-mono)`，`font-size: var(--text-sm)`）
    - 右侧：步骤内容
      - 标题：`<h4>`，`font-family: var(--font-heading)`，`font-size: var(--text-lg)`，`font-weight: 600`
      - 描述：`<p>`，`font-size: var(--text-base)`，`color: var(--color-text-secondary)`，`margin-top: var(--space-sm)`
      - 图片（如果 `step.image` 不为 null）：`margin-top: var(--space-md)`，渲染对应图片或 `PlaceholderImage`。图片路径由 `getProjectImagePath(projectSlug, step.image)` 拼接
  - 垂直连接线：`width: 1px`，`background: var(--color-border)`，连接相邻步骤的圆形
  - 最后一个步骤后面没有连接线

**3. 创建 `src/components/project/ImageGallery.tsx`：**

项目截图画廊组件。

```tsx
import type { ProjectImage } from "@/lib/types";

interface ImageGalleryProps {
  images: ProjectImage[];
  projectSlug: string;
}
```

- 顶部使用 `SectionTitle title="Screenshots"`
- CSS Grid 布局：2 列（桌面端），1 列（移动端），`gap: var(--space-lg)`
- 每个图片项：
  - 图片容器：`border: 1px solid var(--color-border)`，`overflow: hidden`
  - 图片：使用 `<img>` 标签或 `PlaceholderImage`（当前阶段统一用占位符）。图片路径由 `getProjectImagePath(projectSlug, image.filename)` 拼接
  - 图注：`<figcaption>`，`font-size: var(--text-sm)`，`color: var(--color-text-secondary)`，`margin-top: var(--space-sm)`，`font-family: var(--font-mono)`

**4. 创建 `src/components/project/LivePreview.tsx`：**

网站链接预览组件。使用 iframe 嵌入，带降级处理。

```tsx
"use client";

interface LivePreviewProps {
  url: string;
  title: string;
}
```

- 顶部使用 `SectionTitle title="Live Preview"`
- **URL 显示栏**：模拟浏览器地址栏样式。`background: var(--color-surface)`，`border: 1px solid var(--color-border)`，`padding: var(--space-sm) var(--space-md)`，`font-family: var(--font-mono)`，`font-size: var(--text-xs)`。左侧有一个小圆点装饰（模拟浏览器窗口按钮）。右侧有一个 `IconLink icon="external"` 链接到实际 URL
- **iframe 容器**：
  - `width: 100%`，`height: var(--iframe-height)`
  - `border: 1px solid var(--color-border)`，`border-top: none`（与地址栏连为一体）
  - iframe 的 `sandbox` 属性设置为 `"allow-scripts allow-same-origin"`
  - iframe 的 `loading` 设为 `"lazy"`
- **降级处理**：
  - 使用 `useState` 追踪 iframe 加载状态（`"loading" | "loaded" | "error"`）
  - iframe 的 `onLoad` 事件设为 `"loaded"`
  - iframe 的 `onError` 事件设为 `"error"`
  - 加载中：显示一个带几何动画的 loading 指示器（旋转的三角形 SVG）
  - 加载失败：显示一个提示框 `"Preview unavailable. Visit the site directly →"`，附带 `IconLink` 链接
  - 添加一个 3 秒超时检测：如果 3 秒后仍在 loading 状态，也显示降级提示
- 此组件使用 `"use client"` 因为包含交互状态

**5. 创建项目详情页面 `src/app/projects/[slug]/page.tsx`：**

```tsx
import { notFound } from "next/navigation";
import { getProjectBySlug, getAllProjectSlugs, getProjectImagePath } from "@/lib/projects";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { AlgorithmFlow } from "@/components/project/AlgorithmFlow";
import { ImageGallery } from "@/components/project/ImageGallery";
import { LivePreview } from "@/components/project/LivePreview";
import { GeometricDivider } from "@/components/ui/GeometricDivider";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} — Portfolio`,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <PageWrapper>
      <ProjectHeader project={project} />

      <section style={{ marginTop: "var(--space-3xl)" }}>
        <p style={{
          fontSize: "var(--text-lg)",
          lineHeight: "1.8",
          color: "var(--color-text-secondary)",
        }}>
          {project.description}
        </p>
      </section>

      <GeometricDivider variant="dots" />

      <AlgorithmFlow algorithm={project.algorithm} projectSlug={project.slug} />

      <GeometricDivider variant="triangles" />

      <ImageGallery images={project.images} projectSlug={project.slug} />

      {project.links.live && (
        <>
          <GeometricDivider variant="line" />
          <LivePreview url={project.links.live} title={project.title} />
        </>
      )}
    </PageWrapper>
  );
}
```

注意 `params` 在 Next.js 15 中是 `Promise<{ slug: string }>` 类型，需要 `await`。如果使用 Next.js 14，则直接解构 `{ params: { slug } }`。根据实际安装的 Next.js 版本调整。

#### 预期产出

```bash
# TypeScript 类型检查通过
npx tsc --noEmit

# 构建通过（会为每个 slug 生成静态页面）
npm run build
# 终端输出应包含：
# ├ /projects/project-01
# ├ /projects/project-02
# ... 共 7 个项目页

# 开发服务器验证：
npm run dev
# 1. 从首页点击任意项目卡片，成功跳转到 /projects/[slug] 页面
# 2. 详情页显示：返回链接、标题、标签、日期、GitHub/Live 链接
# 3. 详情页显示：项目描述段落
# 4. 详情页显示：算法流程（带步骤编号和垂直时间轴）
# 5. 详情页显示：截图画廊（当前为占位图）
# 6. 详情页显示：Live Preview iframe（当前 example.com 可能触发降级提示，属于预期行为）
# 7. 点击 "← Back to Projects" 返回首页
```

---

### Phase 6 — 响应式设计与交互打磨

#### 目标

完善所有页面的移动端适配，添加页面加载动画和交互微效果，确保全设备体验一致。完成后，网站在手机、平板、桌面端都有良好的视觉和交互体验。

#### Context

- Phase 0-5 已完成：所有页面和组件已可正常运行
- 本 Phase 主要修改现有文件，不创建新组件
- 所有动画必须尊重用户的 `prefers-reduced-motion` 设置

#### Prompt

**1. 在 `src/app/globals.css` 底部添加全局动画基础设施：**

```css
/* === 入场动画 === */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp var(--transition-slow) var(--easing) both;
}

.animate-delay-1 { animation-delay: 100ms; }
.animate-delay-2 { animation-delay: 200ms; }
.animate-delay-3 { animation-delay: 300ms; }
.animate-delay-4 { animation-delay: 400ms; }

/* === Reduced Motion === */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* === 响应式工具 === */
@media (max-width: 768px) {
  :root {
    --text-5xl: 2.5rem;
    --text-4xl: 2rem;
    --text-3xl: 1.5rem;
    --grid-columns: 1;
    --space-4xl: 64px;
    --space-3xl: 48px;
  }
}

@media (min-width: 769px) and (max-width: 1023px) {
  :root {
    --grid-columns: 2;
  }
}
```

**2. 为 `HeroSection.tsx` 添加入场动画：**

- 名字 `<h1>` 添加 `className="animate-fade-in-up"`
- 头衔 `<p>` 添加 `className="animate-fade-in-up animate-delay-1"`
- 简介 `<p>` 添加 `className="animate-fade-in-up animate-delay-2"`
- 技术栈标签区域添加 `className="animate-fade-in-up animate-delay-3"`
- 联系方式添加 `className="animate-fade-in-up animate-delay-4"`

**3. 为 `ProjectCard.tsx` 添加网格入场动画：**

使 `ProjectGrid` 中的每个卡片依次淡入。由于卡片数量动态，在 `ProjectGrid.tsx` 中为每个卡片的外层容器添加内联的 `animation-delay`：

```tsx
style={{ animationDelay: `${index * 100}ms` }}
```

并添加 `className="animate-fade-in-up"`。

**4. 确保 `Header.tsx` 移动端菜单的完整实现：**

- 汉堡菜单图标：3 条水平线，点击后变为 X 形（旋转动画）
- 展开的移动菜单：
  - 全屏覆盖层，`background: var(--color-black)`，`color: var(--color-white)`
  - 导航链接垂直居中排列，`font-size: var(--text-2xl)`，`font-family: var(--font-heading)`
  - 点击任意链接后自动关闭菜单
  - 菜单展开时 `body` 禁止滚动（使用 `useEffect` 设置 `document.body.style.overflow`）

**5. 为项目详情页 (`ProjectPage`) 添加平滑过渡：**

- 整个 `PageWrapper` 内容添加 `className="animate-fade-in-up"`

**6. 全面检查所有组件的移动端表现，确保以下几点：**

- `HeroSection`：移动端单栏布局，几何装饰图隐藏
- `ProjectGrid`：移动端 1 列
- `ProjectHeader`：标签换行，链接堆叠
- `AlgorithmFlow`：步骤编号圆缩小为 24×24，连接线位置调整
- `ImageGallery`：移动端 1 列
- `LivePreview`：iframe 高度移动端减小为 `300px`
- `Footer`：移动端内容居中堆叠

#### 预期产出

```bash
# TypeScript 类型检查通过
npx tsc --noEmit

# 构建通过
npm run build

# 开发服务器验证：
npm run dev
# 1. 首页加载时，个人介绍和项目卡片依次淡入
# 2. 缩小浏览器到手机宽度（375px），所有内容合理排列无溢出
# 3. 汉堡菜单打开/关闭动画正常
# 4. 移动端菜单展开时页面不可滚动，关闭后恢复
# 5. 进入项目详情页时有淡入效果
# 6. 在系统设置中开启 "Reduce Motion"，所有动画消失
```

---

### Phase 7 — SEO、元数据与 Vercel 部署

#### 目标

完善 SEO 元数据、Open Graph 标签、sitemap 生成，配置 Vercel 部署。完成后，项目可通过 `git push` 一键部署到 Vercel，并在社交媒体分享时显示正确的预览信息。

#### Context

- Phase 0-6 已完成：所有功能和视觉效果就绪
- 本 Phase 主要修改配置文件和 metadata，不新增视觉组件

#### Prompt

**1. 更新 `src/app/layout.tsx` 的 metadata：**

```tsx
export const metadata: Metadata = {
  title: {
    default: "Your Name — Portfolio",
    template: "%s — Portfolio",
  },
  description: "CS 作品集 — Projects, experiments, and technical work by Your Name.",
  metadataBase: new URL("https://your-domain.vercel.app"),
  openGraph: {
    title: "Your Name — Portfolio",
    description: "CS 作品集",
    url: "https://your-domain.vercel.app",
    siteName: "Your Name Portfolio",
    locale: "zh_CN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

注意：`metadataBase` 和 `openGraph.url` 的域名需要在 Vercel 部署后替换为实际分配的域名。先使用占位值。

**2. 确认每个项目详情页的 `generateMetadata` 已正确设置**（Phase 5 已实现，此处检查即可）。

**3. 创建 `src/app/sitemap.ts`：**

```typescript
import { MetadataRoute } from "next";
import { getAllProjectSlugs } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://your-domain.vercel.app";
  const slugs = getAllProjectSlugs();

  const projectPages = slugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1,
    },
    ...projectPages,
  ];
}
```

**4. 创建 `src/app/robots.ts`：**

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://your-domain.vercel.app/sitemap.xml",
  };
}
```

**5. 创建 `src/app/not-found.tsx`：**

自定义 404 页面，与整体设计风格一致。

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      fontFamily: "var(--font-heading)",
      textAlign: "center",
      padding: "var(--space-lg)",
    }}>
      <p style={{
        fontSize: "var(--text-5xl)",
        fontWeight: 700,
      }}>
        404
      </p>
      <p style={{
        fontSize: "var(--text-lg)",
        color: "var(--color-text-secondary)",
        marginTop: "var(--space-md)",
      }}>
        Page not found
      </p>
      <Link
        href="/"
        style={{
          marginTop: "var(--space-xl)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: "var(--space-xs)",
        }}
      >
        ← Back to Home
      </Link>
    </main>
  );
}
```

**6. 创建 `.gitignore`（如果 `create-next-app` 未生成或内容不完整）：**

确保包含以下内容：

```
node_modules/
.next/
out/
.env
.env.local
.env.production
.DS_Store
*.tsbuildinfo
```

**7. 创建 `README.md`：**

```markdown
# Portfolio

个人 CS 作品集网站。

## 技术栈

- Next.js 14+ (App Router, SSG)
- TypeScript
- Tailwind CSS
- Vercel 部署

## 本地开发

\```bash
npm install
npm run dev
\```

## 添加新项目

1. 在 `src/data/projects/` 目录下创建 `your-project-slug.json` 文件
2. 按照现有 JSON 文件的结构填写所有字段
3. 在 `public/images/projects/your-project-slug/` 目录下放入项目图片
4. 运行 `npm run build` 确认无报错
5. `git push` 触发 Vercel 自动部署

## 修改设计风格

所有视觉变量集中在 `src/styles/design-tokens.css` 中，修改该文件即可全局调整设计。
```

**8. Vercel 部署步骤（Agent 输出为文字指引，非代码执行）：**

在项目根目录执行：

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: portfolio site"

# 推送到 GitHub（需先在 GitHub 创建空仓库）
git remote add origin https://github.com/yourusername/portfolio.git
git branch -M main
git push -u origin main
```

然后：
1. 登录 [vercel.com](https://vercel.com)，点击 "New Project"
2. 选择刚推送的 GitHub 仓库
3. Framework Preset 选择 "Next.js"
4. 点击 "Deploy"
5. 部署完成后获得 `https://your-project.vercel.app` 域名
6. 将此域名回填到 `layout.tsx` 的 `metadataBase`、`sitemap.ts`、`robots.ts` 中，重新 push

#### 预期产出

```bash
# 最终构建验证
npm run build
# 无报错，out/ 目录包含所有静态文件

# 文件完整性检查
ls src/app/sitemap.ts src/app/robots.ts src/app/not-found.tsx
# 三个文件都存在

# 访问 /not-found-page 看到自定义 404 页面

# Git 仓库初始化成功
git status
# 工作目录干净，所有文件已提交
```

---

## 第六章：验收检查清单

### 第一层：架构铁律验证

```bash
# 铁律 1：数据与视图分离 — 组件文件中不应有超过 10 个字符的中文字符串
grep -rn '[\u4e00-\u9fff]\{10,\}' src/components/ src/app/
# 期望：无输出（占位提示如"返回"、"预览不可用"短文案可豁免）

# 铁律 2：设计令牌集中管理 — 组件中不应有硬编码颜色
grep -rn '#[0-9a-fA-F]\{3,6\}' src/components/ src/app/ --include="*.tsx"
# 期望：无输出

# 铁律 2 补充：组件中不应直接写字体名称
grep -rn "'Inter'\|'Space Grotesk'\|'JetBrains Mono'" src/components/ --include="*.tsx"
# 期望：无输出

# 铁律 4：禁止 any 类型
grep -rn ': any\b\|as any\b' src/ --include="*.ts" --include="*.tsx"
# 期望：无输出

# 铁律 6：文件命名规范 — 组件文件必须是 PascalCase
ls src/components/ui/ src/components/layout/ src/components/home/ src/components/project/
# 期望：所有 .tsx 文件名以大写字母开头

# 铁律 7：图片路径规范 — 数据文件中不应有完整路径
grep -rn '/images/' src/data/ --include="*.json"
# 期望：无输出（JSON 中只存文件名，路径由代码拼接）
```

### 第二层：功能验证

```bash
# 编译检查
npx tsc --noEmit
# 期望：无报错

# 构建检查
npm run build
# 期望：成功，输出 7 个项目静态页 + 1 个首页

# 手动功能验证（启动 dev server 后）：
# □ 首页加载，显示个人介绍和 7 个项目卡片
# □ 点击每个项目卡片，跳转到对应详情页
# □ 详情页显示所有区块（标题、描述、算法流程、图片画廊、Live Preview）
# □ 点击 "← Back to Projects" 返回首页
# □ Header 导航链接可正确滚动到锚点
# □ 移动端汉堡菜单展开/收起正常
# □ 访问不存在的 URL 显示 404 页面

# 幂等性验证
npm run build && npm run build
# 期望：两次构建产出一致
```

### 第三层：安全检查

```bash
# .env 文件不被 Git 追踪
cat .gitignore | grep '.env'
# 期望：输出 .env 相关条目

# 无敏感信息泄露（本项目为纯静态站，安全风险低）
grep -rn 'password\|secret\|api_key\|token' src/ --include="*.ts" --include="*.tsx" --include="*.json"
# 期望：无输出

# iframe sandbox 属性已设置
grep -rn 'sandbox' src/components/project/LivePreview.tsx
# 期望：包含 sandbox="allow-scripts allow-same-origin"
```

### 第四层：数据验证

```bash
# 项目数据完整性
node -e "
const fs = require('fs');
const dir = 'src/data/projects';
const required = ['slug','title','summary','description','tags','date','thumbnail','thumbnailAlt','algorithm','images','links'];
let ok = true;
fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(f => {
  const data = JSON.parse(fs.readFileSync(dir + '/' + f, 'utf-8'));
  const missing = required.filter(k => !(k in data));
  if (missing.length) { console.log(f, 'MISSING:', missing); ok = false; }
  else console.log(f, 'OK');
  if (data.slug !== f.replace('.json','')) { console.log(f, 'SLUG MISMATCH'); ok = false; }
});
console.log(ok ? 'ALL PASSED' : 'ERRORS FOUND');
"
# 期望：7 个文件都显示 OK，最终输出 ALL PASSED

# Profile 数据完整性
node -e "
const p = require('./src/data/profile.json');
const req = ['name','title','bio','avatar','skills','experience','techStack','contact'];
const missing = req.filter(k => !(k in p));
console.log(missing.length ? 'MISSING: ' + missing : 'PROFILE OK');
"
# 期望：输出 PROFILE OK
```

---

## 第七章：关键常量参考表

| 模块 | 参数 | 默认值 | 含义 | 可调？ |
|------|------|--------|------|--------|
| 色彩 | `--color-black` | `#000000` | 主色（纯黑） | 是，改全站主色调 |
| 色彩 | `--color-white` | `#FFFFFF` | 背景色（纯白） | 是，改全站背景 |
| 色彩 | `--color-gray-100` | `#F5F5F5` | 最浅灰（表面色） | 是 |
| 色彩 | `--color-gray-200` | `#E5E5E5` | 浅灰（边框色） | 是 |
| 色彩 | `--color-gray-400` | `#A3A3A3` | 中灰（三级文字） | 是 |
| 色彩 | `--color-gray-600` | `#525252` | 深灰（二级文字） | 是 |
| 色彩 | `--color-gray-800` | `#262626` | 最深灰 | 是 |
| 字体 | `--font-heading` | `Space Grotesk` | 标题字体 | 是，换任意 Google Font |
| 字体 | `--font-body` | `Inter` | 正文字体 | 是，换任意 Google Font |
| 字体 | `--font-mono` | `JetBrains Mono` | 等宽字体 | 是，换任意等宽字体 |
| 字号 | `--text-5xl` | `3.5rem` | 最大标题（Hero 名字） | 是，范围 2.5-5rem |
| 字号 | `--text-4xl` | `2.5rem` | 项目标题 | 是 |
| 字号 | `--text-3xl` | `2rem` | 章节标题 | 是 |
| 字号 | `--text-base` | `1rem` | 正文 | 是 |
| 字号 | `--text-sm` | `0.875rem` | 辅助文字 | 是 |
| 字号 | `--text-xs` | `0.75rem` | 最小文字（标签、日期） | 是 |
| 布局 | `--max-width` | `1200px` | 内容最大宽度 | 是，范围 960-1440px |
| 布局 | `--header-height` | `64px` | 导航栏高度 | 是，范围 48-80px |
| 布局 | `--grid-columns` | `3` | 项目网格列数（桌面端） | 是，范围 2-4 |
| 布局 | `--grid-gap` | `24px` | 网格间距 | 是 |
| 间距 | `--space-xs` | `4px` | 最小间距 | 是 |
| 间距 | `--space-sm` | `8px` | 小间距 | 是 |
| 间距 | `--space-md` | `16px` | 中间距 | 是 |
| 间距 | `--space-lg` | `24px` | 大间距 | 是 |
| 间距 | `--space-xl` | `32px` | 超大间距 | 是 |
| 间距 | `--space-2xl` | `48px` | 章节间距 | 是 |
| 间距 | `--space-3xl` | `64px` | 大章节间距 | 是 |
| 间距 | `--space-4xl` | `96px` | Hero 区域间距 | 是 |
| 卡片 | `--card-border-width` | `1px` | 卡片边框宽度 | 是，范围 0-2px |
| 卡片 | `--card-padding` | `24px` | 卡片内边距 | 是 |
| 预览 | `--iframe-height` | `500px` | Live Preview 高度 | 是，范围 300-700px |
| 动画 | `--transition-fast` | `150ms` | 快速过渡 | 是 |
| 动画 | `--transition-base` | `300ms` | 标准过渡 | 是 |
| 动画 | `--transition-slow` | `500ms` | 慢速过渡 | 是 |
| 动画 | `--hover-translate-y` | `-2px` | 悬停上移距离 | 是，范围 -1 至 -6px |
| 断点 | `--bp-sm` | `640px` | 小屏断点 | 否（与 Tailwind 一致） |
| 断点 | `--bp-md` | `768px` | 中屏断点 | 否 |
| 断点 | `--bp-lg` | `1024px` | 大屏断点 | 否 |
| LivePreview | 超时阈值 | `3000ms` | iframe 加载超时时间 | 是，代码内常量 |

---

## 第八章：附录 — 可选扩展

以下扩展在核心系统稳定后再考虑。当前架构已预留接入方式。

### 1. 深色模式

- **功能**：一键切换黑白配色反转（黑底白字）
- **接入方式**：在 `design-tokens.css` 中添加 `[data-theme="dark"]` 选择器，覆写所有 `--color-*` 变量。在 `Header` 中添加主题切换按钮，使用 `localStorage` 持久化选择。因为所有组件都通过 CSS 变量取色，切换主题时无需修改任何组件代码
- **预留接口**：`design-tokens.css` 的语义色彩层（`--color-bg`、`--color-text-primary` 等）已将具体色值解耦，直接覆写语义变量即可

### 2. 博客/文章系统

- **功能**：支持发布技术博客文章，使用 Markdown 编写
- **接入方式**：在 `src/data/` 下新增 `posts/` 目录存放 `.md` 文件。使用 `next-mdx-remote` 或 `gray-matter` + `remark` 解析 Markdown。新增 `/blog` 和 `/blog/[slug]` 路由
- **预留接口**：数据访问层的模式（JSON 文件 → 读取函数 → 页面组件）可直接复制用于博客模块。`lib/types.ts` 中新增 `Post` 接口即可

### 3. 项目筛选与搜索

- **功能**：首页项目网格支持按标签筛选、按关键词搜索
- **接入方式**：在 `ProjectGrid` 上方添加筛选栏组件（客户端组件），使用 `useState` 管理筛选状态，客户端过滤已加载的项目数组
- **预留接口**：`Project` 类型已包含 `tags` 字段，`getAllProjects()` 已返回完整列表，筛选逻辑只需在前端过滤

### 4. 国际化（i18n）

- **功能**：支持中英文切换
- **接入方式**：使用 `next-intl` 或 Next.js 内置的 i18n 路由。将 `profile.json` 和项目 JSON 扩展为多语言版本（如 `profile.zh.json` / `profile.en.json`）
- **预留接口**：数据与视图分离的架构使得多语言只需准备多套数据文件，组件层不变

### 5. 访问统计

- **功能**：匿名统计页面访问量、访客地理分布
- **接入方式**：集成 Vercel Analytics（一行代码引入 `@vercel/analytics`）或 Plausible/Umami 等隐私友好的统计服务
- **预留接口**：在 `layout.tsx` 的 `<body>` 中添加统计脚本即可，不影响现有组件
- **降级策略**：统计服务不可用时不影响网站正常访问（异步加载，失败静默）

### 6. CMS 后台迁移

- **功能**：从 JSON 文件迁移至 Headless CMS（如 Contentful、Sanity）
- **接入方式**：只需修改 `src/lib/projects.ts` 中的数据读取函数，从读取本地文件改为调用 CMS API。类型定义和所有组件完全不变
- **预留接口**：数据访问层作为唯一的数据入口（铁律 1），保证了数据源可替换性

---

*手册结束。按 Phase 0 → Phase 7 顺序逐步执行，每个 Phase 完成后验证再进入下一个。*
