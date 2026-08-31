// Cell 分发层 —— RN 端实现
// 用 Taro 基础组件实现 NutUI Cell 的同名 props 子集（含 Cell.Group）。
// 样式基准对齐 NutUI 3.x（375 设计稿）。
import type { FC, ReactNode } from 'react'
import { Text, View } from '@tarojs/components'
import { scalePx2dp } from '@tarojs/runtime-rn'

export interface CellProps {
  /** 左侧标题 */
  title?: ReactNode
  /** 标题下方描述文字 */
  description?: ReactNode
  /** 右侧额外内容 */
  extra?: ReactNode
  /** 点击态（配合 onClick 使用） */
  clickable?: boolean
  onClick?: (e?: unknown) => void
}

export interface CellGroupProps {
  children?: ReactNode
}

type CellType = FC<CellProps> & { Group: FC<CellGroupProps> }

function CellBase({ title, description, extra, clickable, onClick }: CellProps) {
  const handlePress = clickable || onClick ? onClick : undefined
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: scalePx2dp(16),
        paddingRight: scalePx2dp(16),
        paddingTop: scalePx2dp(13),
        paddingBottom: scalePx2dp(13),
        backgroundColor: '#ffffff'
      }}
      onClick={handlePress}
    >
      <View style={{ flex: 1, marginRight: scalePx2dp(8) }}>
        {title != null && (
          <Text style={{ fontSize: scalePx2dp(14), color: '#1a1a1a' }}>{title}</Text>
        )}
        {description != null && (
          <Text style={{ fontSize: scalePx2dp(12), color: '#999999', marginTop: scalePx2dp(4) }}>
            {description}
          </Text>
        )}
      </View>
      {extra != null && (
        <Text style={{ fontSize: scalePx2dp(12), color: '#999999' }}>{extra}</Text>
      )}
    </View>
  )
}

function CellGroup({ children }: CellGroupProps) {
  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: '#f0f0f0'
      }}
    >
      {children}
    </View>
  )
}

const Cell = Object.assign(CellBase, { Group: CellGroup }) as CellType

export default Cell
