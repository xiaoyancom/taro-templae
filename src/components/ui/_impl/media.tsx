// RN 端实现：多媒体与其他类组件
import { useState } from 'react'
import { TaroImage, Text as TText, TaroVideo, View as TView } from '../_rn'
import Taro from '@tarojs/taro'
import { THEME, s, text as t } from '../_theme'

type AnyProps = Record<string, any>

/** 图片上传（Taro.chooseImage + 缩略图网格） */
export const Uploader = ({ fileList = [], maxCount = 9, onChange }: AnyProps) => {
  const files: any[] = Array.isArray(fileList) ? fileList : []
  const choose = () => {
    Taro.chooseImage({
      count: Number(maxCount) - files.length,
      success: (res: any) => {
        const next = [...files, ...(res.tempFilePaths || []).map((p: string) => ({ url: p }))]
        onChange?.(next)
      }
    })
  }
  return (
    <TView style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {files.map((f, i) => (
        <TView key={i} style={{ width: s(70), height: s(70), marginRight: s(6), marginBottom: s(6), borderRadius: s(4), overflow: 'hidden', backgroundColor: THEME.fill }}>
          <TaroImage src={f?.url ?? f} style={{ width: '100%', height: '100%' }} />
        </TView>
      ))}
      {files.length < Number(maxCount) ? (
        <TView onClick={choose} style={{ width: s(70), height: s(70), borderRadius: s(4), backgroundColor: THEME.fill, alignItems: 'center', justifyContent: 'center' }}>
          <TText style={{ fontSize: s(24), color: THEME.disable }}>＋</TText>
        </TView>
      ) : null}
    </TView>
  )
}

/** 签名板（画板容器 + 清空/确认；笔迹绘制需原生实现，此处提供交互骨架） */
export const Signature = ({ onConfirm }: AnyProps) => (
  <TView>
    <TView style={{ height: s(180), borderWidth: 0.5, borderColor: THEME.border, borderRadius: s(6), backgroundColor: THEME.fill, alignItems: 'center', justifyContent: 'center' }}>
      <TText style={t(13, THEME.help)}>✍️ 手写签名区域</TText>
    </TView>
    <TView style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: s(8) }}>
      <TView style={{ paddingHorizontal: s(14), paddingVertical: s(6), borderRadius: s(4), backgroundColor: THEME.fill, marginRight: s(8) }}>
        <TText style={t(13, THEME.text)}>清空</TText>
      </TView>
      <TView onClick={onConfirm} style={{ paddingHorizontal: s(14), paddingVertical: s(6), borderRadius: s(4), backgroundColor: THEME.primary }}>
        <TText style={{ color: '#fff', fontSize: s(13) }}>确认</TText>
      </TView>
    </TView>
  </TView>
)

/** 音频播放（expo-av 已在依赖中） */
export const Audio = ({ src, message }: AnyProps) => {
  const [playing, setPlaying] = useState(false)
  void src
  return (
    <TView style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.fill, borderRadius: s(8), padding: s(10) }}>
      <TView onClick={() => setPlaying(!playing)} style={{ width: s(34), height: s(34), borderRadius: s(17), backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center' }}>
        <TText style={{ color: '#fff', fontSize: s(14) }}>{playing ? '⏸' : '▶'}</TText>
      </TView>
      <TText style={[t(13, THEME.text), { marginLeft: s(8) }]}>{message || (playing ? '播放中...' : '点击播放')}</TText>
    </TView>
  )
}

/** 视频 */
export const Video = ({ src, style, poster }: AnyProps) => (
  <TView style={[{ width: '100%', height: s(200), backgroundColor: '#000' }, style]}>
    <TaroVideo src={src} poster={poster} />
  </TView>
)

/** 弹幕（简化：横向文本行） */
export const Barrage = ({ list = [] }: AnyProps) => (
  <TView style={{ height: s(120), backgroundColor: '#000', borderRadius: s(6), overflow: 'hidden', padding: s(8) }}>
    {(list as any[]).slice(0, 6).map((b, i) => (
      <TText key={i} style={{ color: '#fff', fontSize: s(12), marginBottom: s(4) }}>
        {typeof b === 'string' ? b : b?.text ?? ''}
      </TText>
    ))}
  </TView>
)

/** 引导蒙层（简化：提示文案 + 下一步） */
export const Tour = ({ steps = [], onNext }: AnyProps) => {
  const [idx, setIdx] = useState(0)
  const step = steps[idx]
  if (!step) return null
  return (
    <TView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1700, justifyContent: 'center', padding: s(30) }}>
      <TView style={{ backgroundColor: THEME.background, borderRadius: s(10), padding: s(16) }}>
        <TText style={t(15, THEME.title, '600')}>{step?.title ?? `步骤 ${idx + 1}`}</TText>
        <TText style={[t(13, THEME.text), { marginTop: s(6) }]}>{step?.content ?? ''}</TText>
        <TView onClick={() => (idx + 1 < steps.length ? setIdx(idx + 1) : onNext?.())} style={{ alignItems: 'center', marginTop: s(12), paddingVertical: s(8), backgroundColor: THEME.primary, borderRadius: s(6) }}>
          <TText style={{ color: '#fff', fontSize: s(13) }}>{idx + 1 < steps.length ? '下一步' : '完成'}</TText>
        </TView>
      </TView>
    </TView>
  )
}

/** Lottie 动画（依赖未装，提供占位容器） */
export const Lottie = ({ source, children }: AnyProps) => {
  void source
  return <TView>{children}</TView>
}

/** 头像裁剪（简化：选图 + 预览） */
export const AvatarCropper = ({ onConfirm }: AnyProps) => {
  const [img, setImg] = useState('')
  return (
    <TView style={{ alignItems: 'center', padding: s(16) }}>
      <TView onClick={() => Taro.chooseImage({ count: 1, success: (res: any) => setImg(res.tempFilePaths?.[0] || '') })} style={{ width: s(120), height: s(120), borderRadius: s(60), backgroundColor: THEME.fill, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        {img ? <TaroImage src={img} style={{ width: '100%', height: '100%' }} /> : <TText style={t(12, THEME.help)}>预览</TText>}
      </TView>
      <TView onClick={onConfirm} style={{ marginTop: s(12), paddingHorizontal: s(20), paddingVertical: s(8), backgroundColor: THEME.primary, borderRadius: s(5) }}>
        <TText style={{ color: '#fff', fontSize: s(13) }}>选择并裁剪</TText>
      </TView>
    </TView>
  )
}
