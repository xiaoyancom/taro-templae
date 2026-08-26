import Taro from '@tarojs/taro'

/**
 * 交互反馈封装（toast / loading / modal / actionSheet 统一入口）
 *
 * - 业务层不直接散调 Taro.showToast，统一交互规范
 * - showLoading 计数配对：多处同时发起加载只展示一个 loading，全部完成才消失
 */

export function toast(
  title: string,
  options?: { icon?: 'success' | 'error' | 'none'; duration?: number }
) {
  Taro.showToast({ title, icon: options?.icon ?? 'none', duration: options?.duration ?? 2000 })
}

export function toastSuccess(title: string) {
  Taro.showToast({ title, icon: 'success' })
}

export function toastError(title: string) {
  Taro.showToast({ title, icon: 'error' })
}

let loadingCount = 0

export function showLoading(title = '加载中...') {
  loadingCount++
  Taro.showLoading({ title, mask: true })
}

export function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1)
  if (loadingCount === 0) Taro.hideLoading()
}

export interface ModalOptions {
  content: string
  title?: string
  confirmText?: string
  cancelText?: string
}

/** 确认框（Promise 化，resolve 用户是否点击确定） */
export function confirm(options: ModalOptions): Promise<boolean> {
  return Taro.showModal({
    title: options.title ?? '提示',
    content: options.content,
    confirmText: options.confirmText ?? '确定',
    cancelText: options.cancelText ?? '取消',
  }).then((res) => res.confirm)
}

/** 操作菜单（resolve 所选下标，取消返回 -1）。注：微信 showActionSheet 不支持 title，需标题请用自定义弹层 */
export function actionSheet(itemList: string[]): Promise<number> {
  return Taro.showActionSheet({ itemList })
    .then((res) => res.tapIndex)
    .catch(() => -1)
}
