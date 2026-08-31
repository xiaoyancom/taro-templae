// Button 分发层 —— RN 端实现
// NutUI 官方不支持 RN，此处用 Taro 基础组件实现同名 props 子集。
// 样式基准对齐 NutUI 3.x（375 设计稿），用 scalePx2dp 保持各端缩放一致。
// 注意：RN 端样式只支持单层 class/内联对象，无伪类与后代选择器。
import type { ReactNode } from 'react'
import { Text, View } from '@tarojs/components'
import { ActivityIndicator } from 'react-native'
import { scalePx2dp } from '@tarojs/runtime-rn'

// NutUI 3.x 主题色（与小程序/H5 端默认主题一致）
const THEME_COLORS: Record<string, string> = {
  primary: '#fa2c19',
  success: '#4fc08d',
  danger: '#fa2c19',
  warning: '#ff9800',
  info: '#496980',
  default: '#333333'
}

export interface ButtonProps {
  children?: ReactNode
  /** 按钮类型，语义与 NutUI 一致 */
  type?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'default'
  /** 幽灵按钮：白底 + 类型色描边 */
  plain?: boolean
  disabled?: boolean
  loading?: boolean
  /** 圆形按钮 */
  shape?: 'default' | 'round' | 'square'
  /** 通栏按钮 */
  block?: boolean
  onClick?: (e?: unknown) => void
}

export default function Button({
  children,
  type = 'default',
  plain = false,
  disabled = false,
  loading = false,
  shape = 'default',
  block = false,
  onClick
}: ButtonProps) {
  const color = THEME_COLORS[type] || THEME_COLORS.default

  // Taro style 类型为 Web CSSProperties：不支持 paddingHorizontal 简写与数组，
  // 用展开属性 + 条件展开表达（RN 0.73 运行时同样不认 paddingHorizontal）
  const btnStyle = {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    height: scalePx2dp(32),
    paddingLeft: scalePx2dp(12),
    paddingRight: scalePx2dp(12),
    borderRadius: shape === 'round' ? scalePx2dp(22) : scalePx2dp(4),
    alignSelf: block ? ('stretch' as const) : ('auto' as const),
    // 填充态 / 幽灵态
    ...(plain
      ? { backgroundColor: '#ffffff', borderWidth: scalePx2dp(1), borderColor: color }
      : { backgroundColor: disabled ? '#f2f3f5' : color }),
    ...(block ? { width: '100%' as const } : {})
  }

  const textStyle = {
    fontSize: scalePx2dp(14),
    color: plain ? color : !disabled ? '#ffffff' : '#c8c9cc',
    fontWeight: '500' as const
  }

  return (
    <View
      style={btnStyle}
      onClick={disabled || loading ? undefined : onClick}
    >
      {loading && <ActivityIndicator size='small' color={plain ? color : '#ffffff'} />}
      <Text style={textStyle}>{children}</Text>
    </View>
  )
}
