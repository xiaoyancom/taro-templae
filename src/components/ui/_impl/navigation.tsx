// RN 端实现：导航类组件
import { useState } from 'react'
import { Text as TText, View as TView } from '../_rn'
import { THEME, s, text as t } from '../_theme'

type AnyProps = Record<string, any>

/** 顶部导航栏：标题 + 返回 + 右侧 */
export const NavBar = ({ title = '', leftShow = true, right, onClickBack, onClickRight }: AnyProps) => (
  <TView style={{ flexDirection: 'row', alignItems: 'center', height: s(44), paddingHorizontal: s(12), backgroundColor: THEME.background, borderBottomWidth: 0.5, borderBottomColor: THEME.border }}>
    <TView style={{ width: s(60) }} onClick={onClickBack}>
      {leftShow ? <TText style={t(14, THEME.primary)}>‹ 返回</TText> : null}
    </TView>
    <TView style={{ flex: 1, alignItems: 'center' }}>
      <TText style={t(16, THEME.title, '600')}>{title}</TText>
    </TView>
    <TView style={{ width: s(60), alignItems: 'flex-end' }} onClick={onClickRight}>
      {typeof right === 'string' ? <TText style={t(12, THEME.text)}>{right}</TText> : right}
    </TView>
  </TView>
)

/** 底部标签栏 */
export const Tabbar = ({ visible = true, children }: AnyProps) => {
  if (!visible) return null
  return <TView style={{ flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: THEME.border, backgroundColor: THEME.background }}>{children}</TView>
}
export const TabbarItem = ({ title, active = false, onClick }: AnyProps) => (
  <TView onClick={onClick} style={{ flex: 1, alignItems: 'center', paddingVertical: s(8) }}>
    <TText style={t(11, active ? THEME.primary : THEME.help)}>{title}</TText>
  </TView>
)

/** 选项卡 + 内容面板 */
export const Tabs = ({ value = 0, list = [], titleScroll = false, children, onClickTab }: AnyProps) => {
  const titles = list.map((i: any) => (typeof i === 'string' ? i : i?.title))
  const active = Number(value) || 0
  const panels = Array.isArray(children) ? children : [children]
  return (
    <TView style={{ flex: 1 }}>
      <TView style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: THEME.border }}>
        {titles.map((title: string, i: number) => (
          <TView key={i} style={{ paddingVertical: s(10), paddingHorizontal: s(14), borderBottomWidth: 2, borderBottomColor: i === active ? THEME.primary : 'transparent' }} onClick={() => onClickTab?.(i)}>
            <TText style={t(14, i === active ? THEME.primary : THEME.text, i === active ? '600' : '400')}>{title}</TText>
          </TView>
        ))}
      </TView>
      <TView>{panels[active] ?? null}</TView>
      {void titleScroll}
    </TView>
  )
}
export const TabPane = ({ children }: AnyProps) => <TView style={{ padding: s(12) }}>{children}</TView>

/** 侧边栏 */
export const SideBar = ({ value = 0, list = [], children, onChange }: AnyProps) => {
  const active = Number(value) || 0
  const titles = list.map((i: any) => (typeof i === 'string' ? i : i?.title))
  return (
    <TView style={{ flexDirection: 'row', flex: 1 }}>
      <TView style={{ width: s(88), backgroundColor: THEME.fill }}>
        {titles.map((title: string, i: number) => (
          <TView key={i} onClick={() => onChange?.(i)} style={{ paddingVertical: s(14), paddingHorizontal: s(10), backgroundColor: i === active ? THEME.background : 'transparent', borderLeftWidth: 2, borderLeftColor: i === active ? THEME.primary : 'transparent' }}>
            <TText style={t(13, i === active ? THEME.primary : THEME.text, i === active ? '600' : '400')}>{title}</TText>
          </TView>
        ))}
      </TView>
      <TView style={{ flex: 1, padding: s(10) }}>{children}</TView>
    </TView>
  )
}
export const SideBarItem = ({ children }: AnyProps) => <TView>{children}</TView>

/** 回到顶部按钮 */
export const BackTop = ({ onClick }: AnyProps) => (
  <TView onClick={onClick} style={{ position: 'absolute', right: s(16), bottom: s(80), width: s(40), height: s(40), borderRadius: s(20), backgroundColor: THEME.background, alignItems: 'center', justifyContent: 'center', elevation: 3 }}>
    <TText style={t(16, THEME.primary, '600')}>↑</TText>
  </TView>
)

/** 电梯楼层（简化：字母索引列表） */
export const Elevator = ({ indexList = [] }: AnyProps) => (
  <TView style={{ position: 'absolute', right: s(4), top: s(80) }}>
    {indexList.map((item: any, i: number) => (
      <TText key={i} style={t(10, THEME.primary)}>{typeof item === 'string' ? item : item?.name ?? ''}</TText>
    ))}
  </TView>
)

/** 固定导航挂件 */
export const FixedNav = ({ items = [], visible = true, onChange }: AnyProps) => {
  const [open, setOpen] = useState(false)
  if (!visible) return null
  return (
    <TView style={{ position: 'absolute', right: s(12), top: s(80), alignItems: 'center' }}>
      <TView onClick={() => setOpen(!open)} style={{ backgroundColor: THEME.primary, borderRadius: s(18), width: s(36), height: s(36), alignItems: 'center', justifyContent: 'center' }}>
        <TText style={{ color: '#fff', fontSize: s(16) }}>{open ? '×' : '≡'}</TText>
      </TView>
      {open && (
        <TView style={{ backgroundColor: THEME.background, borderRadius: s(8), marginTop: s(6), padding: s(8), elevation: 4 }}>
          {items.map((it: any, i: number) => (
            <TView key={i} onClick={() => onChange?.(it)} style={{ paddingVertical: s(8), paddingHorizontal: s(12) }}>
              <TText style={t(12, THEME.title)}>{it?.title ?? String(it)}</TText>
            </TView>
          ))}
        </TView>
      )}
    </TView>
  )
}

/** 菜单（横向下拉） */
export const Menu = ({ children }: AnyProps) => (
  <TView style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: THEME.border, backgroundColor: THEME.background }}>{children}</TView>
)
export const MenuItem = ({ title, options = [], onChoice }: AnyProps) => {
  const [open, setOpen] = useState(false)
  return (
    <TView style={{ flex: 1 }}>
      <TView onClick={() => setOpen(!open)} style={{ alignItems: 'center', paddingVertical: s(10) }}>
        <TText style={t(13, THEME.title)}>{title} {open ? '▲' : '▼'}</TText>
      </TView>
      {open && (
        <TView style={{ position: 'absolute', top: s(38), left: 0, right: 0, backgroundColor: THEME.background, elevation: 4, zIndex: 100 }}>
          {options.map((o: any, i: number) => (
            <TView key={i} onClick={() => { onChoice?.(o); setOpen(false) }} style={{ paddingVertical: s(10), paddingHorizontal: s(14) }}>
              <TText style={t(13, THEME.text)}>{typeof o === 'string' ? o : o?.text ?? ''}</TText>
            </TView>
          ))}
        </TView>
      )}
    </TView>
  )
}

/** 分页器 */
export const Pagination = ({ modelValue = 1, totalPages = 1, onChange }: AnyProps) => {
  const current = Number(modelValue) || 1
  return (
    <TView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: s(10) }}>
      <TView onClick={() => current > 1 && onChange?.({ pageIndex: current - 1 })} style={{ paddingHorizontal: s(12), paddingVertical: s(6) }}>
        <TText style={t(13, current > 1 ? THEME.primary : THEME.disable)}>‹</TText>
      </TView>
      <TText style={t(13, THEME.title)}>{current} / {totalPages}</TText>
      <TView onClick={() => current < totalPages && onChange?.({ pageIndex: current + 1 })} style={{ paddingHorizontal: s(12), paddingVertical: s(6) }}>
        <TText style={t(13, current < totalPages ? THEME.primary : THEME.disable)}>›</TText>
      </TView>
    </TView>
  )
}
