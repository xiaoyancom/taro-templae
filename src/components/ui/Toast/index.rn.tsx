// Toast 分发层 —— RN 端实现
// 组件式 Toast：visible 控制显隐，duration 到期后自动回调 onClose（与 NutUI 默认 2s 行为一致）。
// RN 端无全局文档流，用绝对定位浮层实现。
import { useEffect, useRef } from 'react'
import { Text, View } from '@tarojs/components'
import { scalePx2dp } from '@tarojs/runtime-rn'

export interface ToastProps {
  /** 提示内容 */
  content?: string
  /** 是否可见 */
  visible: boolean
  /** 显示时长（ms），到期自动触发 onClose，与 NutUI 默认一致 */
  duration?: number
  onClose?: () => void
}

export default function Toast({ content, visible, duration = 2000, onClose }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(() => {
        onClose?.()
      }, duration)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
  }, [visible, duration, onClose])

  if (!visible) return null

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: scalePx2dp(8),
          paddingLeft: scalePx2dp(24),
          paddingRight: scalePx2dp(24),
          paddingTop: scalePx2dp(12),
          paddingBottom: scalePx2dp(12),
          maxWidth: '70%'
        }}
      >
        <Text style={{ fontSize: scalePx2dp(14), color: '#ffffff' }}>{content}</Text>
      </View>
    </View>
  )
}
