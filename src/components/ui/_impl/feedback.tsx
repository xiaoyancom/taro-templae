// RN 端实现：反馈交互类组件
import { Text as TText, View as TView } from '../_rn'
import { ActivityIndicator } from 'react-native'
import { THEME, s, text as t, typeColor } from '../_theme'

type AnyProps = Record<string, any>

/** 对话框 */
export const Dialog = ({
  visible = false, title = '', content = '', okText = '确定', cancelText = '取消',
  noCancel = false, onOk, onCancel, onClose
}: AnyProps) => {
  if (!visible) return null
  const close = () => { onCancel?.(); onClose?.() }
  return (
    <TView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1500, justifyContent: 'center', paddingHorizontal: s(40) }}>
      <TView style={{ backgroundColor: THEME.background, borderRadius: s(12), overflow: 'hidden' }}>
        {title ? <TView style={{ alignItems: 'center', paddingTop: s(18) }}><TText style={t(16, THEME.title, '600')}>{title}</TText></TView> : null}
        <TView style={{ alignItems: 'center', padding: s(18) }}>
          <TText style={t(14, THEME.text)}>{content}</TText>
        </TView>
        <TView style={{ flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: THEME.border }}>
          {!noCancel && (
            <TView style={{ flex: 1, alignItems: 'center', paddingVertical: s(12), borderRightWidth: 0.5, borderRightColor: THEME.border }} onClick={close}>
              <TText style={t(14, THEME.text)}>{cancelText}</TText>
            </TView>
          )}
          <TView style={{ flex: 1, alignItems: 'center', paddingVertical: s(12) }} onClick={onOk}>
            <TText style={t(14, THEME.primary, '600')}>{okText}</TText>
          </TView>
        </TView>
      </TView>
    </TView>
  )
}

/** 动作面板 */
export const ActionSheet = ({ visible = false, title, options = [], onCancel, onSelect }: AnyProps) => {
  if (!visible) return null
  return (
    <TView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1400, justifyContent: 'flex-end' }} onClick={onCancel}>
      <TView style={{ backgroundColor: THEME.background, borderTopLeftRadius: s(12), borderTopRightRadius: s(12) }} >
        {title ? <TView style={{ alignItems: 'center', paddingVertical: s(12) }}><TText style={t(13, THEME.help)}>{title}</TText></TView> : null}
        {options.map((o: any, i: number) => (
          <TView key={i} onClick={() => onSelect?.(o)} style={{ alignItems: 'center', paddingVertical: s(14), borderTopWidth: 0.5, borderTopColor: THEME.border }}>
            <TText style={t(15, THEME.primary)}>{typeof o === 'string' ? o : o?.name ?? o?.text ?? ''}</TText>
          </TView>
        ))}
        <TView onClick={onCancel} style={{ alignItems: 'center', paddingVertical: s(14), marginTop: s(6), borderTopWidth: 0.5, borderTopColor: THEME.border }}>
          <TText style={t(15, THEME.title, '600')}>取消</TText>
        </TView>
      </TView>
    </TView>
  )
}

/** 顶部通知 */
export const Notify = ({ visible = true, type = 'base', msg = '', onClick }: AnyProps) => {
  if (!visible) return null
  const bg = type === 'base' ? '#1989fa' : typeColor(type)
  return (
    <TView onClick={onClick} style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: bg, paddingVertical: s(10), paddingHorizontal: s(14), zIndex: 1600, alignItems: 'center' }}>
      <TText style={{ color: '#fff', fontSize: s(14) }}>{msg}</TText>
    </TView>
  )
}

/** 加载 */
export const Loading = ({ children }: AnyProps) => (
  <TView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: s(10) }}>
    <ActivityIndicator size='small' color={THEME.primary} />
    {children ? <TText style={[t(13, THEME.help), { marginLeft: s(6) }]}>{children}</TText> : null}
  </TView>
)

/** 动画（简化：直接渲染 children） */
export const Animate = ({ children }: AnyProps) => <TView>{children}</TView>

/** 通告栏 */
export const NoticeBar = ({ text = '', leftIcon }: AnyProps) => (
  <TView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7eb', paddingVertical: s(8), paddingHorizontal: s(12) }}>
    {leftIcon || <TText style={{ fontSize: s(14), marginRight: s(6) }}>📣</TText>}
    <TText numberOfLines={1} style={t(13, '#ed6a0c')}>{text}</TText>
  </TView>
)

/** 气泡弹出（简化：点击 children 切换气泡） */
export const Popover = ({ content = '', children }: AnyProps) => (
  <TView style={{ position: 'relative' }}>
    {children}
    <TView style={{ position: 'absolute', bottom: '110%', left: 0, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: s(6), paddingHorizontal: s(10), paddingVertical: s(6) }}>
      <TText style={{ color: '#fff', fontSize: s(12) }}>{content}</TText>
    </TView>
  </TView>
)

/** 左滑操作（简化：始终显示右侧操作区） */
export const Swipe = ({ rightAction, children }: AnyProps) => (
  <TView style={{ flexDirection: 'row', overflow: 'hidden' }}>
    <TView style={{ flex: 1 }}>{children}</TView>
    {rightAction ? (
      <TView onClick={rightAction?.onClick ?? rightAction} style={{ backgroundColor: THEME.primary, paddingHorizontal: s(14), alignItems: 'center', justifyContent: 'center' }}>
        <TText style={{ color: '#fff', fontSize: s(13) }}>{rightAction?.text ?? '删除'}</TText>
      </TView>
    ) : null}
  </TView>
)
