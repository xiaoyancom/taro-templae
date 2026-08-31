// RN 端分发层共享主题与工具
// 数值基准对齐 NutUI 3.x（375 设计稿），经 scalePx2dp 保持三端缩放一致
import { scalePx2dp } from '@tarojs/runtime-rn'

/** NutUI 3.x 默认主题色 */
export const THEME = {
  primary: '#fa2c19',
  success: '#4fc08d',
  danger: '#fa2c19',
  warning: '#ff9800',
  info: '#496980',
  default: '#333333',
  title: '#1a1a1a',
  text: '#666666',
  help: '#999999',
  disable: '#c8c9cc',
  border: '#f0f0f0',
  background: '#ffffff',
  mask: 'rgba(0,0,0,0.7)',
  fill: '#f7f8fa'
} as const

export const s = (n: number) => scalePx2dp(n)

/** 通用文本样式生成 */
export const text = (fontSize: number, color: string, weight?: '400' | '500' | '600' | '700') => ({
  fontSize: s(fontSize),
  color,
  ...(weight ? { fontWeight: weight } : {})
})

/** 组件类型色映射 */
export const typeColor = (type?: string) =>
  (THEME as Record<string, string>)[type || 'default'] || THEME.default
