// RN 端实现：表单输入类组件
import { Text as TText, View as TView, Input as TaroInput, Textarea as TaroTextarea } from '../_rn'
import Slider from '@react-native-community/slider'
import { THEME, s, text as t } from '../_theme'

type AnyProps = Record<string, any>

/** 输入框 */
export const Input = ({ value, placeholder, type, disabled, onChange, onBlur }: AnyProps) => (
  <TView style={[{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: THEME.border, paddingVertical: s(8) }, disabled ? { backgroundColor: THEME.fill } : null]}>
    <TaroInput
      style={{ flex: 1, fontSize: s(14), color: THEME.title }}
      value={value}
      type={type === 'number' ? 'number' : 'text'}
      password={type === 'password'}
      placeholder={placeholder}
      disabled={disabled}
      onInput={(e: any) => onChange?.(e?.detail?.value)}
      onBlur={onBlur}
    />
  </TView>
)

/** 文本域 */
export const TextArea = ({ value, placeholder, maxLength = 200, rows = 3, onChange }: AnyProps) => (
  <TView style={{ backgroundColor: THEME.fill, borderRadius: s(6), padding: s(8) }}>
    <TaroTextarea
      style={{ width: '100%', height: s(Number(rows) * 20), fontSize: s(14), color: THEME.title }}
      value={value}
      placeholder={placeholder}
      maxlength={Number(maxLength)}
      onInput={(e: any) => onChange?.(e?.detail?.value)}
    />
    <TText style={[t(11, THEME.help), { textAlign: 'right' }]}>{String(value || '').length}/{maxLength}</TText>
  </TView>
)

/** 数字步进器 */
export const InputNumber = ({ modelValue = 0, min = 0, max = 999, step = 1, onChange }: AnyProps) => {
  const val = Number(modelValue) || 0
  const set = (v: number) => onChange?.(Math.max(Number(min), Math.min(Number(max), v)))
  return (
    <TView style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TView onClick={() => set(val - Number(step))} style={{ width: s(26), height: s(26), borderRadius: s(4), backgroundColor: THEME.fill, alignItems: 'center', justifyContent: 'center' }}>
        <TText style={t(16, val > Number(min) ? THEME.title : THEME.disable)}>-</TText>
      </TView>
      <TText style={[t(14, THEME.title), { minWidth: s(40), textAlign: 'center' }]}>{val}</TText>
      <TView onClick={() => set(val + Number(step))} style={{ width: s(26), height: s(26), borderRadius: s(4), backgroundColor: THEME.fill, alignItems: 'center', justifyContent: 'center' }}>
        <TText style={t(16, val < Number(max) ? THEME.title : THEME.disable)}>+</TText>
      </TView>
    </TView>
  )
}

/** 开关 */
export const Switch = ({ checked = false, disable = false, onChange }: AnyProps) => (
  <TView
    onClick={() => !disable && onChange?.(!checked, undefined)}
    style={{ width: s(48), height: s(26), borderRadius: s(13), backgroundColor: checked ? THEME.primary : '#e5e5e5', padding: s(2), justifyContent: 'center' }}
  >
    <TView style={{ width: s(22), height: s(22), borderRadius: s(11), backgroundColor: '#fff', alignSelf: checked ? 'flex-end' : 'flex-start' }} />
  </TView>
)

/** 复选框（单个体） */
export const Checkbox = ({ checked = false, label, shape = 'square', onChange }: AnyProps) => (
  <TView onClick={() => onChange?.(!checked)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: s(6) }}>
    <TView style={{ width: s(16), height: s(16), borderRadius: shape === 'round' ? s(8) : s(3), borderWidth: s(1.5), borderColor: checked ? THEME.primary : THEME.disable, alignItems: 'center', justifyContent: 'center', backgroundColor: checked ? THEME.primary : 'transparent' }}>
      {checked ? <TText style={{ color: '#fff', fontSize: s(10) }}>✓</TText> : null}
    </TView>
    {label ? <TText style={[t(14, THEME.title), { marginLeft: s(6) }]}>{label}</TText> : null}
  </TView>
)

/** 复选组 */
export const CheckboxGroup = ({ value = [], options = [], onChange }: AnyProps) => {
  const arr: string[] = Array.isArray(value) ? value : []
  const toggle = (v: string) => {
    const next = arr.includes(v) ? arr.filter((i) => i !== v) : [...arr, v]
    onChange?.(next)
  }
  return (
    <TView>
      {options.map((o: any, i: number) => {
        const v = typeof o === 'string' ? o : o?.value ?? String(i)
        const label = typeof o === 'string' ? o : o?.label ?? v
        return <Checkbox key={i} checked={arr.includes(v)} label={label} onChange={() => toggle(v)} />
      })}
    </TView>
  )
}

/** 单选框（单个体） */
export const Radio = ({ checked = false, label, onChange }: AnyProps) => (
  <TView onClick={() => !checked && onChange?.(true)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: s(6) }}>
    <TView style={{ width: s(16), height: s(16), borderRadius: s(8), borderWidth: s(1.5), borderColor: checked ? THEME.primary : THEME.disable, alignItems: 'center', justifyContent: 'center' }}>
      {checked ? <TView style={{ width: s(8), height: s(8), borderRadius: s(4), backgroundColor: THEME.primary }} /> : null}
    </TView>
    {label ? <TText style={[t(14, THEME.title), { marginLeft: s(6) }]}>{label}</TText> : null}
  </TView>
)

/** 单选组 */
export const RadioGroup = ({ value, options = [], onChange }: AnyProps) => (
  <TView>
    {options.map((o: any, i: number) => {
      const v = typeof o === 'string' ? o : o?.value ?? String(i)
      const label = typeof o === 'string' ? o : o?.label ?? v
      return <Radio key={i} checked={value === v} label={label} onChange={() => onChange?.(v)} />
    })}
  </TView>
)

/** 评分 */
export const Rate = ({ modelValue = 0, count = 5, allowHalf, onChange }: AnyProps) => {
  void allowHalf
  return (
    <TView style={{ flexDirection: 'row' }}>
      {Array.from({ length: Number(count) }).map((_, i) => (
        <TText key={i} onClick={() => onChange?.(i + 1)} style={{ fontSize: s(20), color: i < Number(modelValue) ? '#f5a623' : THEME.border, marginRight: s(4) }}>
          ★
        </TText>
      ))}
    </TView>
  )
}

/** 滑动选择条 */
export const Range = ({ modelValue = 0, min = 0, max = 100, step = 1, onChange }: AnyProps) => (
  <Slider
    style={{ width: '100%', height: s(30) }}
    minimumValue={Number(min)}
    maximumValue={Number(max)}
    step={Number(step)}
    value={Number(modelValue) || 0}
    minimumTrackTintColor={THEME.primary}
    maximumTrackTintColor={THEME.border}
    onValueChange={(v: number) => onChange?.(Math.round(v))}
  />
)

/** 搜索栏 */
export const SearchBar = ({ value, placeholder = '请输入搜索关键词', onChange, onSearch }: AnyProps) => (
  <TView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.fill, borderRadius: s(16), paddingHorizontal: s(12), paddingVertical: s(7) }}>
    <TText style={{ fontSize: s(13), marginRight: s(6) }}>🔍</TText>
    <TaroInput
      style={{ flex: 1, fontSize: s(13), color: THEME.title }}
      value={value}
      placeholder={placeholder}
      onInput={(e: any) => onChange?.(e?.detail?.value)}
      onConfirm={() => onSearch?.(value)}
    />
    {value ? (
      <TText onClick={() => onChange?.('')} style={t(13, THEME.help)}>✕</TText>
    ) : null}
  </TView>
)

/** 数字键盘 */
export const NumberKeyboard = ({ visible = true, title, onChange, onDelete, onClose }: AnyProps) => {
  if (!visible) return null
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']
  return (
    <TView style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: THEME.fill, zIndex: 1500 }}>
      {title ? <TText style={[t(12, THEME.help), { textAlign: 'center', paddingVertical: s(4) }]}>{title}</TText> : null}
      <TView style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {keys.map((k, i) =>
          k === '' ? (
            <TView key={i} style={{ width: `${33.33}%`, height: s(46) }} />
          ) : (
            <TView
              key={i}
              onClick={() => (k === '⌫' ? onDelete?.() : onChange?.(k))}
              style={{ width: `${33.33}%`, height: s(46), alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.background, borderWidth: 0.25, borderColor: THEME.border }}
            >
              <TText style={t(20, THEME.title)}>{k}</TText>
            </TView>
          )
        )}
      </TView>
      <TView onClick={onClose} style={{ alignItems: 'center', paddingVertical: s(10), backgroundColor: THEME.background }}>
        <TText style={t(14, THEME.primary)}>完成</TText>
      </TView>
    </TView>
  )
}

/** 密码输入（简化：密码点 + Input） */
export const ShortPassword = ({ modelValue = '', onChange }: AnyProps) => (
  <TView style={{ flexDirection: 'row', justifyContent: 'center' }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <TView key={i} style={{ width: s(40), height: s(48), borderWidth: 0.5, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center', marginLeft: i === 0 ? 0 : -0.5 }}>
        <TText style={t(20, THEME.title)}>{String(modelValue)[i] ? '●' : ''}</TText>
      </TView>
    ))}
    <TaroInput
      style={{ position: 'absolute', width: '100%', height: s(48), opacity: 0 }}
      type='number'
      maxlength={6}
      value={modelValue}
      onInput={(e: any) => onChange?.(e?.detail?.value)}
      focus
    />
  </TView>
)

/** 表单容器（简化：布局 + 说明文案） */
export const Form = ({ children }: AnyProps) => <TView>{children}</TView>
export const FormItem = ({ label, children }: AnyProps) => (
  <TView style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: s(8), paddingHorizontal: s(12) }}>
    {label ? <TText style={[t(14, THEME.title), { width: s(80), marginTop: s(8) }]}>{label}</TText> : null}
    <TView style={{ flex: 1 }}>{children}</TView>
  </TView>
)

/** 分段器 */
export const Segmented = ({ value = 0, options = [], onChange }: AnyProps) => (
  <TView style={{ flexDirection: 'row', backgroundColor: THEME.fill, borderRadius: s(6), padding: s(2) }}>
    {options.map((o: any, i: number) => {
      const label = typeof o === 'string' ? o : o?.text ?? ''
      const active = Number(value) === i
      return (
        <TView key={i} onClick={() => onChange?.(i)} style={{ flex: 1, alignItems: 'center', paddingVertical: s(6), borderRadius: s(5), backgroundColor: active ? THEME.background : 'transparent' }}>
          <TText style={t(13, active ? THEME.primary : THEME.text, active ? '600' : '400')}>{label}</TText>
        </TView>
      )
    })}
  </TView>
)
