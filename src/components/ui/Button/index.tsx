// Button 分发层 —— 微信/H5 端实现
// 直接透传 NutUI Button，视觉与直接使用 NutUI 完全一致。
// babel-plugin-import 按需引入在此文件内的 import 上触发（组件 + 样式）。
// 类型也来自 NutUI，业务侧 TS 提示与直接使用 NutUI 相同。
// RN 端编译时由同目录 index.rn.tsx 替代（rn-supporter 平台后缀优先解析）。
import { Button } from '@nutui/nutui-react-taro'

export default Button
