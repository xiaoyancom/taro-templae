// RN 端实现：选择器类组件
// 基于 @react-native-picker/picker（项目已装，Playground/壳工程原生侧支持）实现滚轮，
// Calendar 实现月历网格。
import { useMemo, useState } from 'react'
import { Text as TText, View as TView } from '../_rn'
import { Picker as RNPicker } from '@react-native-picker/picker'
import { THEME, s, text as t } from '../_theme'

type AnyProps = Record<string, any>
type Opt = { label: string; value: string | number }

const toOpts = (list: any[]): Opt[] =>
  (list || []).map((o: any, i: number) => (typeof o === 'string' ? { label: o, value: o } : { label: o?.text ?? o?.label ?? String(i), value: o?.value ?? i }))

/** 滚轮选择视图（多列） */
export const PickerView = ({ columns = [], value = [], onChange }: AnyProps) => {
  const cols: Opt[][] = columns.map((c: any) => toOpts(c?.options ?? c?.list ?? c ?? []))
  return (
    <TView style={{ flexDirection: 'row', height: s(180) }}>
      {cols.map((opts, ci) => (
        <TView key={ci} style={{ flex: 1 }}>
          <RNPicker
            selectedValue={value[ci] ?? opts[0]?.value}
            onValueChange={(v: any) => {
              const next = [...value]
              next[ci] = v
              onChange?.(next)
            }}
            style={{ flex: 1 }}
            itemStyle={{ fontSize: s(14) }}
          >
            {opts.map((o) => (
              <RNPicker.Item key={String(o.value)} label={o.label} value={o.value} />
            ))}
          </RNPicker>
        </TView>
      ))}
    </TView>
  )
}

/** 底部弹层滚轮选择器 */
export const Picker = ({ visible = false, columns = [], value = [], title = '请选择', onConfirm, onClose }: AnyProps) => {
  const [inner, setInner] = useState<any[]>(value)
  if (!visible) return null
  return (
    <TView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1400, justifyContent: 'flex-end' }} onClick={onClose}>
      <TView style={{ backgroundColor: THEME.background }} onClick={(e: any) => e?.stopPropagation?.()}>
        <TView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: s(12) }}>
          <TText style={t(13, THEME.help)} onClick={onClose}>取消</TText>
          <TText style={t(14, THEME.title, '600')}>{title}</TText>
          <TText style={t(13, THEME.primary, '600')} onClick={() => onConfirm?.(inner)}>确定</TText>
        </TView>
        <PickerView columns={columns} value={inner.length ? inner : value} onChange={setInner} />
      </TView>
    </TView>
  )
}

/** 年月日三列滚轮 */
const buildDateColumns = (startYear = 2000, endYear = 2030) => {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => String(startYear + i))
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
  return [
    { options: years.map((y) => ({ label: y + '年', value: y })) },
    { options: months.map((m) => ({ label: m + '月', value: m })) },
    { options: days.map((d) => ({ label: d + '日', value: d })) }
  ]
}
const fmtDate = (v: any[]) => `${v[0]}-${v[1]}-${v[2]}`

export const DatePickerView = ({ modelValue, onChange }: AnyProps) => {
  const cols = useMemo(() => buildDateColumns(), [])
  const now = new Date()
  const value = modelValue
    ? String(modelValue).split('-')
    : [String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')]
  return <PickerView columns={cols} value={value} onChange={(v: any[]) => onChange?.(fmtDate(v))} />
}

export const DatePicker = ({ visible = false, modelValue, onConfirm, onClose }: AnyProps) => {
  if (!visible) return null
  return (
    <TView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1400, justifyContent: 'flex-end' }} onClick={onClose}>
      <TView style={{ backgroundColor: THEME.background }} onClick={(e: any) => e?.stopPropagation?.()}>
        <TView style={{ flexDirection: 'row', justifyContent: 'space-between', padding: s(12) }}>
          <TText style={t(13, THEME.help)} onClick={onClose}>取消</TText>
          <TText style={t(13, THEME.primary, '600')} onClick={() => onConfirm?.(modelValue)}>确定</TText>
        </TView>
        <DatePickerView modelValue={modelValue} onChange={onConfirm} />
      </TView>
    </TView>
  )
}

/** 月历卡片（当月网格 + 点选 + 换月） */
export const CalendarCard = ({ modelValue, onChange }: AnyProps) => {
  const init = modelValue ? new Date(modelValue) : new Date()
  const [ym, setYm] = useState({ y: init.getFullYear(), m: init.getMonth() })
  const [sel, setSel] = useState(modelValue ? String(modelValue).slice(0, 10) : '')
  const firstDay = new Date(ym.y, ym.m, 1).getDay()
  const days = new Date(ym.y, ym.m + 1, 0).getDate()
  const move = (d: number) => setYm(({ y, m }) => (m + d < 0 ? { y: y - 1, m: 11 } : m + d > 11 ? { y: y + 1, m: 0 } : { y, m: m + d }))
  const pick = (d: number) => {
    const date = `${ym.y}-${String(ym.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    setSel(date)
    onChange?.(date)
  }
  return (
    <TView style={{ padding: s(12), backgroundColor: THEME.background }}>
      <TView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: s(8) }}>
        <TText onClick={() => move(-1)} style={t(16, THEME.primary)}>‹</TText>
        <TText style={t(15, THEME.title, '600')}>{ym.y} 年 {ym.m + 1} 月</TText>
        <TText onClick={() => move(1)} style={t(16, THEME.primary)}>›</TText>
      </TView>
      <TView style={{ flexDirection: 'row', marginBottom: s(4) }}>
        {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
          <TView key={w} style={{ flex: 1, alignItems: 'center' }}><TText style={t(11, THEME.help)}>{w}</TText></TView>
        ))}
      </TView>
      {Array.from({ length: Math.ceil((firstDay + days) / 7) }).map((_, w) => (
        <TView key={w} style={{ flexDirection: 'row' }}>
          {Array.from({ length: 7 }).map((_, di) => {
            const day = w * 7 + di - firstDay + 1
            const valid = day >= 1 && day <= days
            const active = sel.endsWith(`-${String(day).padStart(2, '0')}`) && sel.startsWith(`${ym.y}-${String(ym.m + 1).padStart(2, '0')}`)
            return (
              <TView key={di} style={{ flex: 1, alignItems: 'center', paddingVertical: s(4) }}>
                {valid ? (
                  <TView onClick={() => pick(day)} style={{ width: s(30), height: s(30), borderRadius: s(15), backgroundColor: active ? THEME.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    <TText style={t(13, active ? '#fff' : THEME.title)}>{day}</TText>
                  </TView>
                ) : null}
              </TView>
            )
          })}
        </TView>
      ))}
    </TView>
  )
}

/** 日历弹层 */
export const Calendar = ({ visible = false, modelValue, onConfirm, onClose }: AnyProps) => {
  if (!visible) return null
  return (
    <TView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1400, justifyContent: 'flex-end' }} onClick={onClose}>
      <TView onClick={(e: any) => e?.stopPropagation?.()}>
        <CalendarCard modelValue={modelValue} onChange={onConfirm} />
        <TView style={{ backgroundColor: THEME.background, paddingBottom: s(12) }}>
          <TView onClick={onClose} style={{ alignItems: 'center', marginHorizontal: s(12), paddingVertical: s(10), backgroundColor: THEME.primary, borderRadius: s(6) }}>
            <TText style={{ color: '#fff', fontSize: s(14) }}>确定</TText>
          </TView>
        </TView>
      </TView>
    </TView>
  )
}

/** 日历单元格（供 CalendarCard 扩展用） */
export const CalendarItem = ({ day, active = false, onClick }: AnyProps) => (
  <TView onClick={onClick} style={{ width: s(30), height: s(30), borderRadius: s(15), backgroundColor: active ? THEME.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
    <TText style={t(13, active ? '#fff' : THEME.title)}>{day}</TText>
  </TView>
)

/** 级联选择（简化：逐级列表） */
export const Cascader = ({ options = [], onConfirm }: AnyProps) => {
  const [path, setPath] = useState<any[]>([])
  const level = (idx: number) => (idx === 0 ? options : path[idx - 1]?.children || [])
  const depth = path.length + 1
  return (
    <TView style={{ flexDirection: 'row', height: s(260) }}>
      {Array.from({ length: depth }).map((_, li) => (
        <TView key={li} style={{ flex: 1, borderRightWidth: 0.5, borderRightColor: THEME.border }}>
          {(level(li) as any[]).map((o: any, i: number) => {
            const label = typeof o === 'string' ? o : o?.text ?? o?.label ?? ''
            const hasChildren = Array.isArray(o?.children) && o.children.length > 0
            return (
              <TView key={i} onClick={() => (hasChildren ? setPath([...path.slice(0, li), o]) : onConfirm?.([...path.slice(0, li), o]))} style={{ paddingVertical: s(10), paddingHorizontal: s(10) }}>
                <TText style={t(13, THEME.title)}>{label}</TText>
              </TView>
            )
          })}
        </TView>
      ))}
    </TView>
  )
}

/** 地址选择（简化：三列滚轮，数据由 options 传入） */
export const Address = ({ visible = false, province = [], city = [], country = [], onConfirm, onClose }: AnyProps) => {
  if (!visible) return null
  return (
    <TView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1400, justifyContent: 'flex-end' }} onClick={onClose}>
      <TView style={{ backgroundColor: THEME.background }} onClick={(e: any) => e?.stopPropagation?.()}>
        <TView style={{ flexDirection: 'row', justifyContent: 'space-between', padding: s(12) }}>
          <TText style={t(13, THEME.help)} onClick={onClose}>取消</TText>
          <TText style={t(13, THEME.primary, '600')} onClick={() => onConfirm?.({})}>确定</TText>
        </TView>
        <PickerView
          columns={[
            { options: province.map((p: any) => ({ label: p?.name ?? p, value: p?.name ?? p })) },
            { options: city.map((c: any) => ({ label: c?.name ?? c, value: c?.name ?? c })) },
            { options: country.map((c: any) => ({ label: c?.name ?? c, value: c?.name ?? c })) }
          ]}
          value={[]}
          onChange={() => {}}
        />
      </TView>
    </TView>
  )
}

/** 时间选择（时段列表） */
export const TimeSelect = ({ times = [], onSelect }: AnyProps) => (
  <TView>
    {times.map((t0: any, i: number) => (
      <TView key={i} onClick={() => onSelect?.(t0)} style={{ paddingVertical: s(12), paddingHorizontal: s(14), borderBottomWidth: 0.5, borderBottomColor: THEME.border }}>
        <TText style={t(14, THEME.title)}>{t0?.time ?? String(t0)}</TText>
      </TView>
    ))}
  </TView>
)
export const TimeDetail = ({ times = [], onSelect }: AnyProps) => (
  <TView style={{ flexDirection: 'row', flexWrap: 'wrap', padding: s(10) }}>
    {times.map((t0: any, i: number) => (
      <TView key={i} onClick={() => onSelect?.(t0)} style={{ paddingHorizontal: s(14), paddingVertical: s(8), backgroundColor: THEME.fill, borderRadius: s(5), margin: s(4) }}>
        <TText style={t(13, THEME.title)}>{t0?.time ?? String(t0)}</TText>
      </TView>
    ))}
  </TView>
)
