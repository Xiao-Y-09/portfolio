# 全局头部

> **项目简介**：Next.js + TypeScript + Tailwind CSS 个人 CS 作品集静态网站，部署 Vercel。黑白几何矢量风格，JSON 数据驱动。

> **设计哲学**：纯黑白灰度，几何 SVG 装饰，Outfit 标题 / Plus Jakarta Sans 正文 / JetBrains Mono 代码，大量留白，交互克制。

## 铁律

1. 数据与视图分离：展示性文本在 JSON 中。
2. 设计令牌集中管理：颜色/字体/间距引用 CSS 变量。
3. 组件单一职责。
4. TypeScript 严格，禁止 any。
5. 静态生成优先。
6. 文件命名强约定。
7. 图片路径统一规范。

---

# Phase 4 — 首页：个人介绍 + 作品网格

## 目标

构建首页两大区块：Hero（个人介绍）和项目网格。完成后访问首页能看到个人信息和 7 个项目卡片。点击卡片暂时会 404（详情页在 Phase 5 实现），属于预期行为。

## Context

- Phase 0-3 已完成。已有文件：
  - 设计令牌、全局样式、Tailwind 配置
  - 类型定义 `src/lib/types.ts`，数据读取 `src/lib/projects.ts`
  - 7 个项目 JSON + profile JSON
  - UI 组件：`GeometricDivider`、`Tag`、`SectionTitle`、`PlaceholderImage`、`IconLink`
  - 布局组件：`Header`、`Footer`、`PageWrapper`（已集成到 `layout.tsx`）
- 本 Phase 创建文件在 `src/components/home/` 和 `src/components/project/`

## Prompt

**1. 创建 `src/components/home/HeroSection.tsx`：**

```tsx
import type { Profile } from "@/lib/types";

interface HeroSectionProps {
  profile: Profile;
}
```

- 外层 padding 上下 `var(--space-4xl)`，添加 `id="about"` 锚点
- 桌面端左右两栏（7:3 比例），移动端堆叠为单栏
- **左栏**：
  - 名字 `<h1>`：`font-size: var(--text-5xl)`，`font-family: var(--font-heading)`，`font-weight: 700`
  - 头衔 `<p>`：`font-size: var(--text-xl)`，`color: var(--color-text-secondary)`，`margin-top: var(--space-sm)`
  - 简介 `<p>`：`font-size: var(--text-lg)`，`color: var(--color-text-secondary)`，`margin-top: var(--space-lg)`，`max-width: 600px`，`line-height: 1.7`
  - 技术栈标签：`margin-top: var(--space-xl)`，用 `Tag` 渲染 `profile.skills`，`flex-wrap`，间距 `var(--space-sm)`
  - 联系方式：`margin-top: var(--space-xl)`，用 `IconLink` 水平排列
- **右栏**：一个几何装饰图形区域（纯 SVG，同心圆 + 交叉直线，280×280，颜色 `var(--color-gray-200)`），移动端隐藏
- 底部 `GeometricDivider variant="dots"`

**2. 创建 `src/components/project/ProjectCard.tsx`：**

```tsx
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}
```

- 渲染为 `<a href={"/projects/" + project.slug}>` 包裹 `<article>`
- 卡片：`border: var(--card-border-width) solid var(--color-border)`，`transition` 用 `var(--transition-base)` + `var(--easing)`
- **缩略图区域**：`aspect-ratio: 16/10`，当前统一用 `PlaceholderImage`
- **文字区域**（padding `var(--card-padding)`）：
  - 标题 `<h3>`：`font-family: var(--font-heading)`，`font-size: var(--text-xl)`，`font-weight: 600`
  - 摘要 `<p>`：`font-size: var(--text-sm)`，`color: var(--color-text-secondary)`，`margin-top: var(--space-sm)`，`-webkit-line-clamp: 2`
  - 标签：`margin-top: var(--space-md)`，用 `Tag` 渲染（最多 3 个），间距 `var(--space-xs)`
  - 日期：`font-family: var(--font-mono)`，`font-size: var(--text-xs)`，`color: var(--color-text-tertiary)`，`margin-top: var(--space-md)`
- **悬停**：`transform: translateY(var(--hover-translate-y))`，`border-color` 变 `var(--color-border-hover)`

**3. 创建 `src/components/home/ProjectGrid.tsx`：**

```tsx
import type { Project } from "@/lib/types";

interface ProjectGridProps {
  projects: Project[];
}
```

- 顶部 `SectionTitle title="Projects" subtitle="Selected works and experiments"`，添加 `id="projects"` 锚点
- CSS Grid：`grid-template-columns: repeat(var(--grid-columns), 1fr)`，`gap: var(--grid-gap)`
- 响应式：桌面 3 列、平板 2 列、移动 1 列（通过 `design-tokens.css` 中的变量或 Tailwind 断点控制）
- 遍历 `projects` 渲染 `ProjectCard`
- 上下 padding `var(--space-3xl)`

**4. 更新 `src/app/page.tsx`：**

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

这是 Server Component，直接调用数据函数，不需要 `useEffect`。

## 预期产出

```bash
npx tsc --noEmit
npm run build

npm run dev
# 1. 首页显示个人介绍（名字、头衔、简介、技术栈标签、联系方式）
# 2. 下方 "Projects" 标题 + 7 个卡片
# 3. 桌面 3 列，缩小到 2 列 → 1 列
# 4. 卡片悬停上移 + 边框变黑
# 5. 点击卡片导航到 /projects/project-01/ 等（此时 404 属于预期）
# 6. Header "Projects" 链接滚动到项目网格区域
```
