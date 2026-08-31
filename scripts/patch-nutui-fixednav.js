// NutUI 3.0.20 FixedNav 组件库 bug 补丁（npm install 后自动执行）
// 问题：fixednav.js 的 list.map 直接返回无 key 的 React.Fragment，
// 触发 React 警告 "Each child in a list should have a unique key prop"
// 升级 @nutui/nutui-react-taro 后若官方修复，可删除本脚本与 postinstall 引用。
const fs = require('fs')
const path = require('path')

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@nutui',
  'nutui-react-taro',
  'dist',
  'es',
  'packages',
  'fixednav',
  'fixednav.js'
)

// 未打补丁的原始代码片段（匹配 fixednav.js 中 list.map 返回的无 key Fragment）
const from =
  'return /*#__PURE__*/ React.createElement(React.Fragment, null, item.num ? /*#__PURE__*/ React.createElement(Badge, {'
// 打补丁后的代码片段
const to = `return /*#__PURE__*/ React.createElement(React.Fragment, {
            key: item.id || index
        }, item.num ? /*#__PURE__*/ React.createElement(Badge, {`

if (!fs.existsSync(target)) {
  console.warn('[patch-nutui-fixednav] 未找到 fixednav.js，跳过补丁')
  process.exit(0)
}

const source = fs.readFileSync(target, 'utf8')

if (source.includes(to)) {
  console.log('[patch-nutui-fixednav] FixedNav key 补丁已应用，跳过')
  process.exit(0)
}

if (!source.includes(from)) {
  console.warn('[patch-nutui-fixednav] fixednav.js 内容已变化，补丁未匹配，请检查组件库版本')
  process.exit(1)
}

fs.writeFileSync(target, source.replace(from, to), 'utf8')
console.log('[patch-nutui-fixednav] 已为 FixedNav 列表项补上 key，消除 React key 警告')
