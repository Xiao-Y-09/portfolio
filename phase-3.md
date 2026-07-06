# 全局头部

> **项目简介**：这是一个 Next.js + TypeScript + Tailwind CSS 的个人 CS 作品集静态网站，部署到 Vercel。设计风格为黑白几何矢量。数据用 JSON 文件驱动，无后端。

> **设计哲学**：纯黑白 + 灰度，无彩色。标题字体 Outfit，正文字体 Plus Jakarta Sans，代码字体 JetBrains Mono。大量留白，交互克制。

## 铁律

1. 数据与视图分离：展示性文本在 JSON 中，不在组件中硬编码。
2. 设计令牌集中管理：颜色/字体/间距全部引用 CSS 变量。
3. 组件单一职责：每文件一个组件。
4. TypeScript 严格模式，禁止 any。
5. 静态生成优先。
6. 文件命名强约定：组件 PascalCase。
7. 图片路径统一规范。

---

# Phase 3 — 全局布局与导航

## 目标

创建 Header、Footer、PageWrapper 布局组件，集成到 `layout.tsx`。完成后所有页面共享统一的页头、页脚和内容容器。

## Context

- Phase 0-2 已完成。已有文件：
  - `src/styles/design-tokens.css`，`src/app/globals.css`，`src/app/layout.tsx`
  - `src/lib/types.ts`，`src/lib/projects.ts`
  - `src/data/profile.json`，`src/data/projects/*.json`（7 个）
  - `src/components/ui/`：`GeometricDivider.tsx`，`Tag.tsx`，`SectionTitle.tsx`，`PlaceholderImage.tsx`，`IconLink.tsx`
- 本 Phase 在 `src/components/layout/` 下创建新文件，并修改 `src/app/layout.tsx`

## Prompt

**1. 创建 `src/components/layout/Header.tsx`：**

```tsx
interface HeaderProps {
  className?: string;
}
```

- 固定顶部：`position: sticky; top: 0; z-index: 50`
- 高度 `var(--header-height)`，背景 `rgba(255,255,255,0.9)` + `backdrop-filter: blur(8px)`，底部边框 `1px solid var(--color-border)`
- 内部：左侧文字 logo（`var(--font-heading)` 粗体，链接到 `/`），右侧导航链接
- 导航项：`Projects`（`/#projects`）、`About`（`/#about`）、`Contact`（`/#contact`）
- 导航链接样式：`font-family: var(--font-mono)`，`font-size: var(--text-sm)`，`text-transform: uppercase`，`letter-spacing: 0.1em`
- 悬停：链接下方出现 1px 横线，`transition` 用 `var(--transition-fast)`
- 最大宽度 `var(--max-width)`，水平居中，左右 padding `var(--space-lg)`
- **移动端（< 768px）**：导航链接隐藏，显示汉堡菜单按钮（3 条水平线 SVG）。点击展开全屏覆盖层（黑色背景白色文字），导航链接垂直居中，`font-size: var(--text-2xl)`，`font-family: var(--font-heading)`。点击链接后自动关闭。菜单展开时 `body` 禁止滚动。
- 组件顶部添加 `"use client";`（因为有 `useState` 控制菜单状态）

**2. 创建 `src/components/layout/Footer.tsx`：**

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

- 上边框 `1px solid var(--color-border)`，上下 padding `var(--space-3xl)`
- 第一行：左侧名字，右侧社交链接（使用 `IconLink` 组件）
- 第二行：居中版权声明 `© {当前年份} All rights reserved.`，`font-size: var(--text-xs)`，`color: var(--color-text-tertiary)`
- 添加 `id="contact"` 作为导航锚点
- 保持为 Server Component（不添加 `"use client"`）

**3. 创建 `src/components/layout/PageWrapper.tsx`：**

```tsx
interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}
```

- 渲染为 `<main>`
- `max-width: var(--max-width)`，水平居中
- 左右 padding `var(--space-lg)`，顶部 padding `var(--header-height)`，底部 padding `var(--space-4xl)`

**4. 更新 `src/app/layout.tsx`：**

在 body 内添加 Header 和 Footer。从 `getProfile()` 获取数据传入 Footer：

```tsx
<body>
  <Header />
  {children}
  <Footer name={profile.name} contact={profile.contact} />
</body>
```

`layout.tsx` 是 Server Component，可直接调用 `getProfile()`。

## 预期产出

```bash
npx tsc --noEmit

npm run build

npm run dev
# 1. 页面顶部有 sticky header，含 logo 和导航链接
# 2. 页面底部有 footer，含社交链接和版权声明
# 3. 缩小窗口到 < 768px，汉堡菜单出现，点击展开全屏导航
# 4. 点击导航链接不报错
```
