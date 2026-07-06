# 全局头部

> **项目简介**：Next.js + TypeScript + Tailwind CSS 个人 CS 作品集静态网站，部署 Vercel。黑白几何矢量风格，JSON 数据驱动。

> **设计哲学**：纯黑白灰度，几何 SVG 装饰，Outfit 标题 / Plus Jakarta Sans 正文 / JetBrains Mono 代码，大量留白，交互克制。

## 铁律

1. 数据与视图分离。
2. 设计令牌集中管理：所有新增样式值引用 CSS 变量。
3. 组件单一职责。
4. TypeScript 严格，禁止 any。
5. 静态生成优先。
6. 文件命名强约定。
7. 图片路径统一规范。

---

# Phase 6 — 响应式设计与交互打磨

## 目标

完善所有页面的移动端适配，添加入场动画和交互微效果。完成后网站在手机、平板、桌面端都有良好体验。所有动画必须尊重 `prefers-reduced-motion`。

## Context

- Phase 0-5 已完成：所有页面和组件可正常运行，首页和 7 个项目详情页均可访问
- 本 Phase 主要修改现有文件，不创建新组件
- 打开 `src/app/globals.css`、各组件文件做修改

## Prompt

**1. 在 `src/app/globals.css` 底部添加动画基础设施：**

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fadeInUp var(--transition-slow) var(--easing) both;
}

.animate-delay-1 { animation-delay: 100ms; }
.animate-delay-2 { animation-delay: 200ms; }
.animate-delay-3 { animation-delay: 300ms; }
.animate-delay-4 { animation-delay: 400ms; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

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

- 名字 `<h1>` → `className="animate-fade-in-up"`
- 头衔 `<p>` → `className="animate-fade-in-up animate-delay-1"`
- 简介 `<p>` → `className="animate-fade-in-up animate-delay-2"`
- 技术栈区域 → `className="animate-fade-in-up animate-delay-3"`
- 联系方式 → `className="animate-fade-in-up animate-delay-4"`

**3. 为 `ProjectGrid.tsx` 中每个卡片添加入场动画：**

每个卡片外层添加 `className="animate-fade-in-up"` 和内联 `style={{ animationDelay: \`${index * 100}ms\` }}`。

**4. 确保 `Header.tsx` 移动端菜单完整：**

- 汉堡图标点击后变为 X 形（旋转动画）
- 全屏覆盖层：`background: var(--color-black)`，`color: var(--color-white)`
- 链接垂直居中，`font-size: var(--text-2xl)`，`font-family: var(--font-heading)`
- 点击链接自动关闭
- 展开时 `body` 禁止滚动（`useEffect` 设置 `document.body.style.overflow`）

**5. 项目详情页添加淡入：**

`PageWrapper` 内容添加 `className="animate-fade-in-up"`。

**6. 全面检查移动端表现，确保：**

- `HeroSection`：单栏，几何装饰隐藏
- `ProjectGrid`：1 列
- `ProjectHeader`：标签换行，链接堆叠
- `AlgorithmFlow`：步骤圆缩小为 24×24，连接线位置调整
- `ImageGallery`：1 列
- `LivePreview`：iframe 高度移动端 `300px`
- `Footer`：内容居中堆叠

## 预期产出

```bash
npx tsc --noEmit
npm run build

npm run dev
# 1. 首页加载时个人介绍和卡片依次淡入
# 2. 缩小到 375px 宽，所有内容合理排列无溢出
# 3. 汉堡菜单开关动画正常
# 4. 移动菜单展开时页面不可滚动
# 5. 进入详情页有淡入效果
# 6. 系统设置开启 "Reduce Motion" → 所有动画消失
```
