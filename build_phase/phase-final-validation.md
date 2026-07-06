# 最终验收检查

> 所有 Phase 已完成。将以下检查命令逐条执行，确认全部通过。

---

## 第一层：架构铁律验证

```bash
# 铁律 1：组件中不应有长中文硬编码
grep -rn '[\u4e00-\u9fff]\{10,\}' src/components/ src/app/
# 期望：无输出（短提示如"返回"可豁免）

# 铁律 2：组件中不应有硬编码颜色
grep -rn '#[0-9a-fA-F]\{3,6\}' src/components/ src/app/ --include="*.tsx"
# 期望：无输出

# 铁律 2 补充：组件中不应直接写字体名称
grep -rn "'Outfit'\|'Plus Jakarta Sans'\|'JetBrains Mono'" src/components/ --include="*.tsx"
# 期望：无输出

# 铁律 4：禁止 any
grep -rn ': any\b\|as any\b' src/ --include="*.ts" --include="*.tsx"
# 期望：无输出

# 铁律 6：组件文件命名 PascalCase
ls src/components/ui/ src/components/layout/ src/components/home/ src/components/project/
# 期望：所有 .tsx 文件名以大写字母开头

# 铁律 7：数据文件中不应有完整图片路径
grep -rn '/images/' src/data/ --include="*.json"
# 期望：无输出
```

## 第二层：功能验证

```bash
# 编译
npx tsc --noEmit
# 期望：无报错

# 构建
npm run build
# 期望：成功，输出 7 个项目页 + 1 个首页

# 手动验证（启动 dev server）：
npm run dev
# □ 首页加载，显示个人介绍和 7 个项目卡片
# □ 点击每个卡片 → 跳转到对应详情页
# □ 详情页显示所有区块（标题、描述、算法流程、图片画廊、Live Preview）
# □ 点击 "← Back to Projects" 返回首页
# □ Header 导航链接滚动到锚点
# □ 移动端汉堡菜单正常
# □ 访问不存在的 URL → 404 页面

# 幂等性
npm run build && npm run build
# 期望：两次构建产出一致
```

## 第三层：安全检查

```bash
# .env 在 gitignore 中
cat .gitignore | grep '.env'
# 期望：有输出

# 无敏感信息
grep -rn 'password\|secret\|api_key\|token' src/ --include="*.ts" --include="*.tsx" --include="*.json"
# 期望：无输出

# iframe sandbox
grep -rn 'sandbox' src/components/project/LivePreview.tsx
# 期望：包含 sandbox="allow-scripts allow-same-origin"
```

## 第四层：数据验证

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
# 期望：7 个 OK + ALL PASSED

# Profile 完整性
node -e "
const p = require('./src/data/profile.json');
const req = ['name','title','bio','avatar','skills','experience','techStack','contact'];
const missing = req.filter(k => !(k in p));
console.log(missing.length ? 'MISSING: ' + missing : 'PROFILE OK');
"
# 期望：PROFILE OK
```

---

全部通过后，项目可以部署。
