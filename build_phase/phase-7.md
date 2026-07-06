# 全局头部

> **项目简介**：Next.js + TypeScript + Tailwind CSS 个人 CS 作品集静态网站，部署 Vercel。黑白几何矢量风格，JSON 数据驱动。

> **设计哲学**：纯黑白灰度，几何 SVG 装饰，Outfit 标题 / Plus Jakarta Sans 正文 / JetBrains Mono 代码，大量留白，交互克制。

## 铁律

1. 数据与视图分离。
2. 设计令牌集中管理。
3. 组件单一职责。
4. TypeScript 严格，禁止 any。
5. 静态生成优先。
6. 文件命名强约定。
7. 图片路径统一规范。

---

# Phase 7 — SEO、元数据与 Vercel 部署

## 目标

完善 SEO 元数据、Open Graph 标签、sitemap 生成、404 页面，配置 Vercel 部署。完成后项目可通过 `git push` 一键部署，社交媒体分享显示正确预览。

## Context

- Phase 0-6 已完成：所有页面、组件、响应式、动画全部就绪
- 本 Phase 主要修改配置文件和 metadata，不新增视觉组件
- 项目详情页的 `generateMetadata` 已在 Phase 5 实现

## Prompt

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
  robots: { index: true, follow: true },
};
```

域名在 Vercel 部署后替换为实际值，先用占位。

**2. 创建 `src/app/sitemap.ts`：**

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
    { url: baseUrl, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 1 },
    ...projectPages,
  ];
}
```

**3. 创建 `src/app/robots.ts`：**

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://your-domain.vercel.app/sitemap.xml",
  };
}
```

**4. 创建 `src/app/not-found.tsx`：**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      fontFamily: "var(--font-heading)", textAlign: "center", padding: "var(--space-lg)",
    }}>
      <p style={{ fontSize: "var(--text-5xl)", fontWeight: 700 }}>404</p>
      <p style={{ fontSize: "var(--text-lg)", color: "var(--color-text-secondary)", marginTop: "var(--space-md)" }}>
        Page not found
      </p>
      <Link href="/" style={{
        marginTop: "var(--space-xl)", fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)", borderBottom: "1px solid var(--color-border)",
        paddingBottom: "var(--space-xs)",
      }}>
        ← Back to Home
      </Link>
    </main>
  );
}
```

**5. 确认 `.gitignore` 包含：**

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

**6. 创建 `README.md`：**

```markdown
# Portfolio

个人 CS 作品集网站。

## 技术栈
- Next.js 14+ (App Router, SSG)
- TypeScript
- Tailwind CSS
- Vercel

## 本地开发
\```bash
npm install
npm run dev
\```

## 添加新项目
1. 在 `src/data/projects/` 下创建 `your-slug.json`
2. 按现有 JSON 结构填写所有字段
3. 在 `public/images/projects/your-slug/` 下放入图片
4. `npm run build` 确认无报错
5. `git push` 触发 Vercel 自动部署

## 修改设计
所有视觉变量在 `src/styles/design-tokens.css`，修改即全局调整。
```

**7. 部署指引（输出为文字，Agent 不执行部署操作）：**

```bash
git init
git add .
git commit -m "Initial commit: portfolio site"
git remote add origin https://github.com/yourusername/portfolio.git
git branch -M main
git push -u origin main
```

然后在 vercel.com：New Project → 选择仓库 → Framework: Next.js → Deploy。部署完成后将域名回填到 `layout.tsx`、`sitemap.ts`、`robots.ts` 中的占位值，重新 push。

## 预期产出

```bash
npm run build
# 无报错，out/ 目录含所有静态文件

ls src/app/sitemap.ts src/app/robots.ts src/app/not-found.tsx
# 三个文件都存在

npm run dev
# 访问不存在的 URL → 显示自定义 404

git status
# 工作目录干净（如已初始化 Git）
```
