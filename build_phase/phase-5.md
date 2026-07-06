# 全局头部

> **项目简介**：Next.js + TypeScript + Tailwind CSS 个人 CS 作品集静态网站，部署 Vercel。黑白几何矢量风格，JSON 数据驱动。

> **设计哲学**：纯黑白灰度，几何 SVG 装饰，Outfit 标题 / Plus Jakarta Sans 正文 / JetBrains Mono 代码，大量留白，交互克制。

## 铁律

1. 数据与视图分离：展示性文本在 JSON 中。
2. 设计令牌集中管理：颜色/字体/间距引用 CSS 变量。
3. 组件单一职责。
4. TypeScript 严格，禁止 any。
5. 静态生成优先，用 `generateStaticParams` 预生成所有项目页。
6. 文件命名强约定。
7. 图片路径统一规范：用 `getProjectImagePath(slug, filename)` 拼接。

---

# Phase 5 — 项目详情页

## 目标

实现 `/projects/[slug]` 动态路由页面。每个项目有独立详情页，包含：标题信息、详细描述、算法流程、图片画廊、网页链接预览。完成后从首页点击任意卡片进入完整详情页。

## Context

- Phase 0-4 已完成。已有文件：
  - 所有设计令牌、类型、数据文件、数据读取函数
  - UI 组件：`GeometricDivider`、`Tag`、`SectionTitle`、`PlaceholderImage`、`IconLink`
  - 布局组件：`Header`、`Footer`、`PageWrapper`
  - 首页组件：`HeroSection`、`ProjectGrid`、`ProjectCard`
  - 首页 `src/app/page.tsx` 已完成
- 本 Phase 在 `src/app/projects/[slug]/` 和 `src/components/project/` 下创建新文件

## Prompt

**1. 创建 `src/components/project/ProjectHeader.tsx`：**

```tsx
import type { Project } from "@/lib/types";
interface ProjectHeaderProps { project: Project; }
```

- 顶部返回链接：`← Back to Projects`，链接到 `/`，`font-family: var(--font-mono)`，`font-size: var(--text-sm)`，`color: var(--color-text-secondary)`，悬停变 `var(--color-text-primary)`
- 标题区域（`margin-top: var(--space-xl)`）：
  - 项目标题 `<h1>`：`font-size: var(--text-4xl)`，`font-family: var(--font-heading)`
  - 标签栏：`margin-top: var(--space-md)`，用 `Tag` 渲染所有 tags
  - 日期 + 链接行：`margin-top: var(--space-lg)`，水平排列，`font-family: var(--font-mono)`，`font-size: var(--text-sm)`
    - 日期（`color: var(--color-text-tertiary)`）
    - `project.links.github` 非 null → `IconLink icon="github"`
    - `project.links.live` 非 null → `IconLink icon="external" label="Live Demo"`
- 底部 `GeometricDivider variant="line"`

**2. 创建 `src/components/project/AlgorithmFlow.tsx`：**

```tsx
import type { Algorithm } from "@/lib/types";
interface AlgorithmFlowProps { algorithm: Algorithm; projectSlug: string; }
```

- 顶部 `SectionTitle title="Algorithm Flow"`
- 概述段落：`algorithm.overview`，`color: var(--color-text-secondary)`，`margin-bottom: var(--space-xl)`
- 垂直步骤列表（时间轴效果）：
  - 每步左侧：32×32 圆形中显示步骤编号（`border: 1px solid var(--color-black)`，数字居中，`font-family: var(--font-mono)`，`font-size: var(--text-sm)`）
  - 每步右侧：标题 `<h4>`（`font-family: var(--font-heading)`，`font-size: var(--text-lg)`）+ 描述 `<p>`（`color: var(--color-text-secondary)`）+ 图片（如果 `step.image` 非 null，用 `getProjectImagePath` 拼接路径，当前用 `PlaceholderImage`）
  - 相邻步骤间用垂直细线连接（`width: 1px`，`background: var(--color-border)`），最后一步后无连接线

**3. 创建 `src/components/project/ImageGallery.tsx`：**

```tsx
import type { ProjectImage } from "@/lib/types";
interface ImageGalleryProps { images: ProjectImage[]; projectSlug: string; }
```

- 顶部 `SectionTitle title="Screenshots"`
- CSS Grid：桌面 2 列，移动 1 列，`gap: var(--space-lg)`
- 每个图片项：图片容器（`border: 1px solid var(--color-border)`，`overflow: hidden`）+ 图注 `<figcaption>`（`font-size: var(--text-sm)`，`color: var(--color-text-secondary)`，`font-family: var(--font-mono)`）
- 当前统一用 `PlaceholderImage`

**4. 创建 `src/components/project/LivePreview.tsx`：**

```tsx
"use client";
interface LivePreviewProps { url: string; title: string; }
```

- 顶部 `SectionTitle title="Live Preview"`
- URL 显示栏：模拟浏览器地址栏，`background: var(--color-surface)`，`border: 1px solid var(--color-border)`，左侧小圆点装饰，右侧 `IconLink icon="external"` 链接到实际 URL
- iframe：`width: 100%`，`height: var(--iframe-height)`，`border: 1px solid var(--color-border)` + `border-top: none`，`sandbox="allow-scripts allow-same-origin"`，`loading="lazy"`
- 降级处理（`useState` 追踪状态 `"loading" | "loaded" | "error"`）：
  - 加载中：旋转三角形 SVG loading 指示器
  - 加载失败或 3 秒超时：提示框 `"Preview unavailable. Visit the site directly →"` + `IconLink`
- 此组件用 `"use client"`

**5. 创建 `src/app/projects/[slug]/page.tsx`：**

```tsx
import { notFound } from "next/navigation";
import { getProjectBySlug, getAllProjectSlugs } from "@/lib/projects";
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
  return { title: `${project.title} — Portfolio`, description: project.summary };
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

注意：`params` 在 Next.js 15 是 `Promise` 类型需要 `await`。如果用 Next.js 14 则直接解构。根据实际版本调整。

## 预期产出

```bash
npx tsc --noEmit
npm run build
# 终端应显示 7 个项目页被生成：
# ├ /projects/project-01
# ├ /projects/project-02
# ... 共 7 个

npm run dev
# 1. 从首页点击任意卡片 → 成功跳转到详情页
# 2. 详情页显示：返回链接、标题、标签、日期、GitHub/Live 链接
# 3. 详情页显示：项目描述段落
# 4. 详情页显示：算法流程（步骤编号 + 垂直时间轴）
# 5. 详情页显示：截图画廊（当前为占位图）
# 6. 详情页显示：Live Preview iframe（可能触发降级提示，属预期）
# 7. "← Back to Projects" 返回首页
```
