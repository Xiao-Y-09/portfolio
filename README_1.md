# 切片使用指南

## 文件清单

| 文件 | 用途 | 何时粘贴 |
|------|------|----------|
| `00-shared-header.md` | 全局头部参考（不单独使用，已嵌入每个切片） | 不粘贴，仅供参考 |
| `phase-0.md` | 项目骨架搭建 | 第 1 轮对话 |
| `phase-1.md` | 类型定义与数据层 | 第 2 轮对话 |
| `phase-2.md` | UI 基础组件 | 第 3 轮对话 |
| `phase-3.md` | 全局布局与导航 | 第 4 轮对话 |
| `phase-4.md` | 首页（Hero + 项目网格） | 第 5 轮对话 |
| `phase-5.md` | 项目详情页 | 第 6 轮对话 |
| `phase-6.md` | 响应式与动效打磨 | 第 7 轮对话 |
| `phase-7.md` | SEO + 元数据 + Vercel 部署 | 第 8 轮对话 |
| `phase-final-validation.md` | 最终验收检查 | 第 9 轮对话（所有 Phase 完成后） |

## 使用流程

### 前置准备（一次性）

安装 Skills：

```bash
npx skills add anthropics/skills --skill frontend-design -g
npx skills add vercel-labs/next-skills --skill next-best-practices -g
npx skills add vercel-labs/agent-skills --skill react-best-practices -g
npx skills add vercel-labs/agent-skills --skill web-design-guidelines -g
```

### 执行流程

1. 打开 Claude Code（或你使用的 Coding Agent）
2. 打开 `phase-0.md`，全选复制，粘贴到对话框，发送
3. Agent 执行完毕后，运行文件底部「预期产出」中的验证命令
4. 全部通过 → **开一轮新对话** → 打开 `phase-1.md`，粘贴，发送
5. 重复以上步骤，直到 `phase-7.md` 完成
6. 最后开新对话，粘贴 `phase-final-validation.md`，让 Agent 跑完所有检查
7. 全部通过 → 部署到 Vercel

### 关键规则

- **每个 Phase 一轮新对话**，不要在同一对话中执行多个 Phase
- **先验证再下一步**，每个 Phase 的验证命令必须全部通过
- **Agent 看代码仓库**，不需要提前让 Agent 读完整手册
- **Skills 自动生效**，不需要手动调用
