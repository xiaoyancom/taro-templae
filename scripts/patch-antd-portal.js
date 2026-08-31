// @ant-design/react-native 5.0.0 PortalHost 兼容补丁（npm install 后自动执行）
// 问题：PortalHost 在 componentWillUnmount 里调用
// DeviceEventEmitter.removeListener(type, listener)，
// 但 RN 0.65+ 已删除 EventEmitter 实例上的 removeListener 方法
// （新 API 为 addListener 返回 subscription，调用 subscription.remove()）。
// 表现为 RN 0.73 下报 "TypeError: y.removeListener is not a function (it is undefined)"。
// 上游 @ant-design/react-native 已停止维护（Taro components-rn 依赖其 5.0.0），
// 若 Taro 后续升级移除该依赖，可删除本脚本与 postinstall 引用。
const fs = require('fs')
const path = require('path')

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@ant-design',
  'react-native',
  'lib',
  'portal',
  'portal-host.js'
)

// 原始代码（压缩单行文件中的片段）：监听注册
const fromMount =
  'TopViewEventEmitter.addListener(addType,this._mount);TopViewEventEmitter.addListener(removeType,this._unmount);'
// 打补丁后：保存 subscription 引用，卸载时逐个 remove
const toMount =
  'this._subs=[TopViewEventEmitter.addListener(addType,this._mount),TopViewEventEmitter.addListener(removeType,this._unmount)];'

// 原始代码：卸载时调用已被 RN 删除的 removeListener
const fromUnmount =
  'TopViewEventEmitter.removeListener(addType,this._mount);TopViewEventEmitter.removeListener(removeType,this._unmount);'
// 打补丁后：用 subscription.remove() 替代
const toUnmount =
  'var subs=this._subs;if(subs){for(var i=0;i<subs.length;i++){if(subs[i]&&subs[i].remove){subs[i].remove();}}this._subs=null;}'

if (!fs.existsSync(target)) {
  console.warn('[patch-antd-portal] 未找到 portal-host.js，跳过补丁')
  process.exit(0)
}

const source = fs.readFileSync(target, 'utf8')

if (source.includes(toMount) && source.includes(toUnmount)) {
  console.log('[patch-antd-portal] PortalHost removeListener 补丁已应用，跳过')
  process.exit(0)
}

if (!source.includes(fromMount) || !source.includes(fromUnmount)) {
  console.warn('[patch-antd-portal] portal-host.js 内容已变化，补丁未匹配，请检查 @ant-design/react-native 版本')
  process.exit(1)
}

const patched = source.replace(fromMount, toMount).replace(fromUnmount, toUnmount)
fs.writeFileSync(target, patched, 'utf8')
console.log('[patch-antd-portal] 已修复 PortalHost 卸载时的 removeListener 调用，改用 subscription.remove()')
