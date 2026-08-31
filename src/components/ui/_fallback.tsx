// RN 端通用智能兜底（被各组件的 index.rn.tsx 引用）
// NutUI 官方无 RN 版本，无法凭空复刻其样式与交互；本兜底保证组件在 RN 端：
// 1. 显隐语义：visible === false 时不渲染（Dialog/Popup/Toast 类组件）
// 2. 内容显示：渲染常用文本 props（title/content/description/extra 等）
// 3. children 正常渲染（布局/容器类组件近乎无损）
// 4. onClick 透传
// 需要精细视觉时，在对应组件的 index.rn.tsx 内替换为定制实现（参考 Button）。
import type { FC, ReactNode } from 'react'
import { Text, View } from '@tarojs/components'

const TEXT_PROPS = [
  'title', 'content', 'text', 'description', 'desc', 'extra', 'subTitle',
  'name', 'label', 'placeholder', 'value', 'price', 'message', 'tips'
] as const

export interface FallbackProps {
  children?: ReactNode
  visible?: boolean
  onClick?: (e?: unknown) => void
  [key: string]: unknown
}

const Fallback: FC<FallbackProps> = (props) => {
  const { children, visible, onClick, ...rest } = props
  if (visible === false) return null
  return (
    <View onClick={onClick}>
      {TEXT_PROPS.map((key) => {
        const v = rest[key]
        if (typeof v === 'string' || typeof v === 'number') {
          return <Text key={key}>{String(v)}</Text>
        }
        return null
      })}
      {children}
    </View>
  )
}

export default Fallback
