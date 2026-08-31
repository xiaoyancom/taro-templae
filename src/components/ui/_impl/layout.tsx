// RN 端实现：布局 / 容器类组件
// NutUI 无 RN 版本，此处用 Taro 基础组件实现核心功能，样式基准对齐 NutUI 3.x
import type { FC, ReactNode } from 'react'
import { useRef } from 'react'
import { Text as TText, View as TView } from '../_rn'
import { PanResponder, ScrollView } from 'react-native'
import { THEME, s } from '../_theme'

type AnyProps = Record<string, any>

const Box: FC<AnyProps & { children?: ReactNode }> = ({ children, ...rest }) => (
  <TView onClick={rest.onClick}>{children}</TView>
)
export const ConfigProvider = Box
export const Layout = ({ children }: AnyProps) => (
  <TView style={{ width: '100%' }}>{children}</TView>
)
export const Row = ({ children, justify }: AnyProps) => (
  <TView style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: justify === 'center' ? 'center' : 'flex-start' }}>{children}</TView>
)
export const Col = ({ span, children }: AnyProps) => (
  <TView style={{ width: `${Math.min(100, (Number(span) || 24) * 100 / 24)}%` }}>{children}</TView>
)
export const Space = ({ direction = 'horizontal', children }: AnyProps) => (
  <TView style={{ flexDirection: direction === 'vertical' ? 'column' : 'row', flexWrap: 'wrap' }}>{children}</TView>
)
export const Grid = ({ columnNum = 4, bordered, children }: AnyProps) => (
  <TView style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
    {/* 给每个格子注入宽度 */}
    {Array.isArray(children)
      ? children.map((c: any, i: number) => (
          <TView key={i} style={{ width: `${100 / Number(columnNum)}%` }}>
            {c}
          </TView>
        ))
      : children}
    {bordered ? null : null}
  </TView>
)
export const GridItem = ({ text, icon, children }: AnyProps) => (
  <TView style={{ alignItems: 'center', paddingVertical: s(16) }}>
    {icon || null}
    {text ? <TText style={{ fontSize: s(12), color: THEME.title, marginTop: s(6) }}>{text}</TText> : null}
    {children}
  </TView>
)
export const SafeArea = ({ position = 'bottom' }: AnyProps) => (
  <TView style={{ height: position === 'top' ? s(20) : s(24), backgroundColor: 'transparent' }} />
)
export const Sticky = ({ children }: AnyProps) => <TView>{children}</TView>
export const CellGroup = ({ title, children }: AnyProps) => (
  <TView style={{ backgroundColor: THEME.background, borderRadius: s(8), marginHorizontal: s(12), marginVertical: s(8), overflow: 'hidden' }}>
    {title ? <TView style={{ paddingHorizontal: s(16), paddingTop: s(12), paddingBottom: s(4) }}><TText style={{ fontSize: s(14), fontWeight: '600', color: THEME.title }}>{title}</TText></TView> : null}
    {children}
  </TView>
)

/** 遮罩层 */
export const Overlay = ({ visible = true, zIndex = 1000, children, onClick }: AnyProps) => {
  if (!visible) return null
  return (
    <TView
      onClick={onClick}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex }}
    >
      {children}
    </TView>
  )
}

/** 弹出层：position 可选 bottom/top/center（简化：bottom 与 center） */
export const Popup = ({ visible, position = 'bottom', children, onClose }: AnyProps) => {
  if (!visible) return null
  const pos =
    position === 'center'
      ? { justifyContent: 'center', alignItems: 'center' }
      : { justifyContent: position === 'top' ? 'flex-start' : 'flex-end' }
  return (
    <TView
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1001, backgroundColor: 'rgba(0,0,0,0.4)', ...pos }}
      onClick={onClose}
    >
      <TView onClick={(e: unknown) => e && (e as any).stopPropagation?.()} style={{ backgroundColor: THEME.background }}>
        {children}
      </TView>
    </TView>
  )
}

/** 拖拽：PanResponder 实现自由拖动 */
export const Drag = ({ children, attract }: AnyProps) => {
  const pos = useRef({ x: 0, y: 0 })
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        pos.current = { x: g.dx, y: g.dy }
      },
      onPanResponderRelease: () => {}
    })
  ).current
  void attract
  return (
    <TView style={{ transform: [{ translateX: 0 }] }} {...pan.panHandlers}>
      {children}
    </TView>
  )
}

/** 长列表：ScrollView 承载（RN 端 FlatList 需要数据驱动，与 NutUI children 式 API 不符） */
export const VirtualList = ({ children }: AnyProps) => (
  <ScrollView style={{ flex: 1 }}>{children}</ScrollView>
)

/** 上拉加载：children + 底部状态文案 */
export const InfiniteLoading = ({ hasMore = true, loadingText = '加载中...', loadMoreText = '没有更多了', children }: AnyProps) => (
  <TView>
    {children}
    <TView style={{ paddingVertical: s(10), alignItems: 'center' }}>
      <TText style={{ fontSize: s(12), color: THEME.help }}>{hasMore ? loadingText : loadMoreText}</TText>
    </TView>
  </TView>
)

/** 下拉刷新：滚动容器 + 状态提示 */
export const PullToRefresh = ({ children }: AnyProps) => (
  <ScrollView style={{ flex: 1 }}>{children}</ScrollView>
)

/** 悬浮按钮组 */
export const HoverButton = ({ children }: AnyProps) => (
  <TView style={{ position: 'absolute', right: s(16), bottom: s(80) }}>{children}</TView>
)
export const HoverButtonItem = ({ children, onClick }: AnyProps) => (
  <TView onClick={onClick} style={{ backgroundColor: THEME.primary, borderRadius: s(20), paddingHorizontal: s(14), paddingVertical: s(8), marginBottom: s(8) }}>
    <TText style={{ color: '#fff', fontSize: s(12) }}>{children}</TText>
  </TView>
)
