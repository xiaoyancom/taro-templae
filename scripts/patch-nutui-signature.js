// NutUI 3.0.20 Signature 组件库 bug 补丁（npm install 后自动执行）
// 问题：H5 下 Taro 将 canvas 渲染为 taro-canvas-core 自定义元素（内部原生 canvas 在 Shadow DOM），
// document.getElementById(canvasId) 拿到的是自定义元素，getElementsByTagName('canvas') 取不到内部节点，
// canvasSetting 收到 undefined 后执行 canvas.current = canvas 抛 TypeError，
// dev 环境下触发 webpack 全屏错误覆盖层（error overlay），页面被遮罩、点击无响应看似卡死。
// 小程序端走 WEAPP 分支（createSelectorQuery）不受影响。
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
  'signature',
  'signature.js'
)

// 未打补丁的原始代码片段（canvasSetting 入口，canvas 变量可能为 undefined）
const from = 'var canvas = canvasDom;\n        canvas.current = canvas;'
// 打补丁后的代码片段（canvas 为空时跳过初始化）
const to = 'var canvas = canvasDom;\n        if (!canvas) return;\n        canvas.current = canvas;'

if (!fs.existsSync(target)) {
  console.warn('[patch-nutui-signature] 未找到 signature.js，跳过补丁')
  process.exit(0)
}

const source = fs.readFileSync(target, 'utf8')

if (source.includes(to)) {
  console.log('[patch-nutui-signature] Signature canvas 防御补丁已应用，跳过')
  process.exit(0)
}

if (!source.includes(from)) {
  console.warn('[patch-nutui-signature] signature.js 内容已变化，补丁未匹配，请检查组件库版本')
  process.exit(1)
}

fs.writeFileSync(target, source.replace(from, to), 'utf8')
console.log('[patch-nutui-signature] 已为 Signature 补上 canvas 空值防御，消除 H5 error overlay')
