// RN 端实现：数据展示类组件
import { useEffect, useState } from 'react'
import { TaroImage, Text as TText, View as TView } from '../_rn'
import { THEME, s, text as t, typeColor } from '../_theme'

type AnyProps = Record<string, any>

/** 头像 */
export const Avatar = ({ size = 40, src, children, icon }: AnyProps) => {
  const d = s(Number(size) || 40)
  return (
    <TView style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: THEME.fill, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      {src ? <TaroImage src={src} style={{ width: d, height: d }} /> : null}
      {!src && (children || icon) ? <TText style={t(12, THEME.help)}>{typeof children === 'string' ? children : ''}</TText> : null}
    </TView>
  )
}
export const AvatarGroup = ({ children }: AnyProps) => (
  <TView style={{ flexDirection: 'row', alignItems: 'center' }}>{children}</TView>
)

/** 角标 */
export const Badge = ({ value, dot = false, top = 0, right = 0, children }: AnyProps) => (
  <TView style={{ position: 'relative' }}>
    {children}
    {dot ? (
      <TView style={{ position: 'absolute', top: s(top), right: s(right), width: s(8), height: s(8), borderRadius: s(4), backgroundColor: THEME.primary }} />
    ) : value ? (
      <TView style={{ position: 'absolute', top: s(top - 8), right: s(right - 8), minWidth: s(16), paddingHorizontal: s(4), paddingVertical: s(1), borderRadius: s(8), backgroundColor: THEME.primary, alignItems: 'center' }}>
        <TText style={{ color: '#fff', fontSize: s(10) }}>{String(value)}</TText>
      </TView>
    ) : null}
  </TView>
)

/** 卡片 */
export const Card = ({ title, content, extra }: AnyProps) => (
  <TView style={{ backgroundColor: THEME.background, borderRadius: s(8), margin: s(10), padding: s(12) }}>
    {title ? <TText style={t(15, THEME.title, '600')}>{title}</TText> : null}
    {content ? <TText style={[t(13, THEME.text), { marginTop: s(6) }]}>{content}</TText> : null}
    {extra ? <TText style={[t(11, THEME.help), { marginTop: s(4) }]}>{extra}</TText> : null}
  </TView>
)

/** 倒计时 */
export const CountDown = ({ time = 0, format = 'HH:mm:ss' }: AnyProps) => {
  const [remain, setRemain] = useState(Number(time) || 0)
  useEffect(() => {
    setRemain(Number(time) || 0)
  }, [time])
  useEffect(() => {
    if (remain <= 0) return
    const timer = setInterval(() => setRemain((r) => r - 1), 1000)
    return () => clearInterval(timer)
  }, [remain > 0])
  const sec = Math.max(0, remain)
  const hh = String(Math.floor(sec / 3600)).padStart(2, '0')
  const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
  const ss = String(sec % 60).padStart(2, '0')
  const label = format.replace(/HH/i, hh).replace(/mm/, mm).replace(/ss/, ss)
  return <TText style={t(14, THEME.primary, '600')}>{label}</TText>
}

/** 文本省略 */
export const Ellipsis = ({ content = '', rows = 1 }: AnyProps) => (
  <TText numberOfLines={Number(rows) || 1} style={t(14, THEME.title)}>{content}</TText>
)

/** 空状态 */
export const Empty = ({ description = '暂无数据', children }: AnyProps) => (
  <TView style={{ alignItems: 'center', paddingVertical: s(40) }}>
    <TText style={{ fontSize: s(40) }}>📭</TText>
    <TText style={[t(13, THEME.help), { marginTop: s(8) }]}>{description}</TText>
    {children}
  </TView>
)

/** 图片预览：全屏遮罩 + 大图 */
export const ImagePreview = ({ show = false, images = [], onClose }: AnyProps) => {
  if (!show) return null
  return (
    <TView onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 2000, justifyContent: 'center' }}>
      {(images as string[]).map((src, i) => (
        <TaroImage key={i} src={src} style={{ width: '100%', height: 300 }} mode='aspectFit' />
      ))}
    </TView>
  )
}

/** 轮播指示器 */
export const Indicator = ({ total = 0, current = 0 }: AnyProps) => (
  <TView style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: s(6) }}>
    {Array.from({ length: Number(total) }).map((_, i) => (
      <TView key={i} style={{ width: s(i === Number(current) ? 14 : 6), height: s(6), borderRadius: s(3), backgroundColor: i === Number(current) ? THEME.primary : THEME.disable, marginHorizontal: s(3) }} />
    ))}
  </TView>
)

/** 价格 */
export const Price = ({ price = 0, symbol = '¥', size = 'normal' }: AnyProps) => {
  const fs = size === 'large' ? 20 : size === 'small' ? 12 : 15
  return (
    <TText style={t(fs, THEME.primary, '600')}>
      {symbol}
      {Number(price).toFixed(2)}
    </TText>
  )
}

/** 条形进度条 */
export const Progress = ({ percent = 0, color }: AnyProps) => {
  const p = Math.max(0, Math.min(100, Number(percent)))
  return (
    <TView style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: s(6) }}>
      <TView style={{ flex: 1, height: s(10), borderRadius: s(5), backgroundColor: THEME.fill }}>
        <TView style={{ width: `${p}%`, height: s(10), borderRadius: s(5), backgroundColor: color || THEME.primary }} />
      </TView>
      <TText style={[t(11, THEME.help), { marginLeft: s(6) }]}>{p}%</TText>
    </TView>
  )
}

/** 圆形进度（简化为数值 + 描边圆） */
export const CircleProgress = ({ percent = 0, size = 80 }: AnyProps) => {
  const d = s(Number(size) || 80)
  return (
    <TView style={{ width: d, height: d, borderRadius: d / 2, borderWidth: s(6), borderColor: THEME.fill, alignItems: 'center', justifyContent: 'center' }}>
      <TText style={t(14, THEME.primary, '600')}>{Math.round(Number(percent))}%</TText>
    </TView>
  )
}

/** 骨架屏 */
export const Skeleton = ({ row = 3, title = true, animated }: AnyProps) => {
  void animated
  return (
    <TView style={{ padding: s(12) }}>
      {title ? <TView style={{ height: s(16), borderRadius: s(4), backgroundColor: THEME.fill, marginBottom: s(10), width: '40%' }} /> : null}
      {Array.from({ length: Number(row) }).map((_, i) => (
        <TView key={i} style={{ height: s(12), borderRadius: s(4), backgroundColor: THEME.fill, marginBottom: s(8), width: `${100 - i * 12}%` }} />
      ))}
    </TView>
  )
}

/** 步骤条 */
export const Steps = ({ current = 0, children }: AnyProps) => {
  void children
  const items: any[] = []
  // NutUI Steps 通过 children 传 Step；此处兼容直接渲染
  return (
    <TView style={{ flexDirection: 'row', paddingVertical: s(12) }}>
      {(Array.isArray(children) ? children : [children]).map((c: any, i: number) => {
        const done = i <= Number(current)
        const title = c?.props?.title ?? `步骤${i + 1}`
        return (
          <TView key={i} style={{ flex: 1, alignItems: 'center' }}>
            <TView style={{ width: s(18), height: s(18), borderRadius: s(9), backgroundColor: done ? THEME.primary : THEME.fill, alignItems: 'center', justifyContent: 'center' }}>
              <TText style={{ color: '#fff', fontSize: s(10) }}>{done ? '✓' : i + 1}</TText>
            </TView>
            <TText style={[t(11, done ? THEME.primary : THEME.help), { marginTop: s(4) }]}>{title}</TText>
          </TView>
        )
      })}
      {items.length ? items : null}
    </TView>
  )
}
export const Step = ({ title }: AnyProps) => <TText style={t(11, THEME.help)}>{title}</TText>

/** 轮播 */
export const Swiper = ({ children, autoPlay, loop }: AnyProps) => {
  void autoPlay
  void loop
  return <TView>{children}</TView>
}
export const SwiperItem = ({ children }: AnyProps) => <TView>{children}</TView>

/** 表格（简化：columns + data 驱动） */
export const Table = ({ columns = [], data = [] }: AnyProps) => (
  <TView style={{ borderWidth: 0.5, borderColor: THEME.border, borderRadius: s(4) }}>
    <TView style={{ flexDirection: 'row', backgroundColor: THEME.fill }}>
      {columns.map((c: any, i: number) => (
        <TView key={i} style={{ flex: 1, padding: s(8) }}>
          <TText style={t(12, THEME.title, '600')}>{c?.title ?? ''}</TText>
        </TView>
      ))}
    </TView>
    {data.map((row: any, r: number) => (
      <TView key={r} style={{ flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: THEME.border }}>
        {columns.map((c: any, i: number) => (
          <TView key={i} style={{ flex: 1, padding: s(8) }}>
            <TText style={t(12, THEME.text)}>{row[c?.key] ?? ''}</TText>
          </TView>
        ))}
      </TView>
    ))}
  </TView>
)

/** 标签 */
export const Tag = ({ type = 'default', plain = false, children, onClick }: AnyProps) => {
  const color = typeColor(type)
  return (
    <TView onClick={onClick} style={{ backgroundColor: plain ? 'transparent' : color, borderWidth: 0.5, borderColor: color, borderRadius: s(3), paddingHorizontal: s(6), paddingVertical: s(2), alignSelf: 'flex-start' }}>
      <TText style={{ color: plain ? color : '#fff', fontSize: s(11) }}>{children}</TText>
    </TView>
  )
}

/** 涨跌箭头 */
export const TrendArrow = ({ rate = 0, rise = true }: AnyProps) => (
  <TView style={{ flexDirection: 'row', alignItems: 'center' }}>
    <TText style={t(13, rise ? THEME.danger : THEME.success)}>{rate}{rise ? ' ↑' : ' ↓'}</TText>
  </TView>
)

/** 水印（简化：覆盖文本） */
export const WaterMark = ({ content = 'Taro', fullPage = false }: AnyProps) => (
  <TView style={fullPage ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', opacity: 0.08, zIndex: 99 } : { opacity: 0.15, padding: s(20) }}>
    <TText style={{ fontSize: s(28), color: THEME.title, transform: [{ rotate: '-20deg' }] }}>{content}</TText>
  </TView>
)

/** 数字滚动（简化：直接展示终值） */
export const AnimatingNumbers = ({ value = 0, count = 0 }: AnyProps) => (
  <TText style={t(16, THEME.title, '600')}>{String(value || count || 0)}</TText>
)

/** 分割线 */
export const Divider = ({ content }: AnyProps) => (
  <TView style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: s(10) }}>
    <TView style={{ flex: 1, height: 0.5, backgroundColor: THEME.border }} />
    {content ? <TText style={[t(12, THEME.help), { marginHorizontal: s(10) }]}>{content}</TText> : null}
    <TView style={{ flex: 1, height: 0.5, backgroundColor: THEME.border }} />
  </TView>
)

/** 图片 */
export const Image = ({ src, style, mode }: AnyProps) => (
  <TaroImage src={src} style={style} mode={mode} />
)
