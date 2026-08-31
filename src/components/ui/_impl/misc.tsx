// RN 端实现：折叠面板 / 结果页
import { useState } from 'react'
import { Text as TText, View as TView } from '../_rn'
import { THEME, s, text as t } from '../_theme'

type AnyProps = Record<string, any>

/** 折叠面板组 */
export const Collapse = ({ children }: AnyProps) => <TView>{children}</TView>

/** 折叠面板项 */
export const CollapseItem = ({ title = '', name, children }: AnyProps) => {
  const [open, setOpen] = useState(false)
  void name
  return (
    <TView style={{ borderBottomWidth: 0.5, borderBottomColor: THEME.border }}>
      <TView onClick={() => setOpen(!open)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: s(12), paddingHorizontal: s(14) }}>
        <TText style={t(14, THEME.title)}>{title}</TText>
        <TText style={t(12, THEME.help)}>{open ? '▲' : '▼'}</TText>
      </TView>
      {open ? <TView style={{ paddingHorizontal: s(14), paddingBottom: s(12) }}>{children}</TView> : null}
    </TView>
  )
}

/** 结果页 */
export const ResultPage = ({ type = 'success', title = '', description, children }: AnyProps) => {
  const icon = type === 'success' ? '✅' : type === 'fail' || type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'
  return (
    <TView style={{ alignItems: 'center', paddingVertical: s(50) }}>
      <TText style={{ fontSize: s(50) }}>{icon}</TText>
      {title ? <TText style={[t(17, THEME.title, '600'), { marginTop: s(10) }]}>{title}</TText> : null}
      {description ? <TText style={[t(13, THEME.help), { marginTop: s(6) }]}>{description}</TText> : null}
      {children}
    </TView>
  )
}
