// @nutui/icons-react-taro 图标标签兼容补丁（npm install 后自动执行）
// 问题：NutUI 图标组件渲染 React.createElement(globalConfig.tag, ...)，
// 默认 tag 为 HTML 的 <i>（字体图标）。该标签名是运行时动态变量，Taro 编译期
// 静态分析不到，base.wxml 不会为其生成模板，小程序运行时报
// "Template tmpl_0_i not found"（触发场景：Button loading / Toast icon 等
// 渲染 NutUI 图标时）。
// 修复：tag 改为 "view"——view 模板已收录，且 .nut-icon-* 字体图标样式
// 对 view 同样生效，视觉不变。
// 若 Taro 后续版本支持动态组件模板生成或 NutUI 修复此问题，可删除本脚本。
const fs = require('fs')
const path = require('path')

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@nutui',
  'icons-react-taro',
  'dist',
  'es',
  'icons',
  'internal.js'
)

const from = 'tag: "i",'
const to = 'tag: "view",'

if (!fs.existsSync(target)) {
  console.warn('[patch-nutui-icon-tag] 未找到 icons internal.js，跳过补丁')
  process.exit(0)
}

const source = fs.readFileSync(target, 'utf8')

if (source.includes(to)) {
  console.log('[patch-nutui-icon-tag] 图标标签补丁已应用，跳过')
  process.exit(0)
}

if (!source.includes(from)) {
  console.warn('[patch-nutui-icon-tag] internal.js 内容已变化，补丁未匹配，请检查 @nutui/icons-react-taro 版本')
  process.exit(1)
}

fs.writeFileSync(target, source.replace(from, to), 'utf8')
console.log('[patch-nutui-icon-tag] 图标渲染标签已从 <i> 改为 <view>')
