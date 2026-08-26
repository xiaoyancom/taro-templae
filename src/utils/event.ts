import Taro from '@tarojs/taro'

/**
 * 类型安全事件总线（基于 Taro.eventCenter，三端通用）
 *
 * - 事件名与参数类型在 EventMap 注册，on/emit 自动获得类型提示
 * - 新增事件：在 EventMap 加一行即可
 * - 跨页面通信：登录成功通知全页面刷新、购物车角标变更等
 */

interface EventMap {
  /** 登录成功（页面监听后刷新用户态） */
  'login:success': { token: string }
  /** 退出登录（页面监听后清理本地状态） */
  logout: undefined
  /** 购物车数量变更（tabBar 角标等） */
  'cart:updated': { count: number }
}

type EventName = keyof EventMap

/** 订阅事件，返回取消订阅函数（组件卸载时调用，防止内存泄漏） */
export function on<K extends EventName>(
  name: K,
  handler: (payload: EventMap[K]) => void
): () => void {
  Taro.eventCenter.on(name, handler as (...args: unknown[]) => void)
  return () => Taro.eventCenter.off(name, handler as (...args: unknown[]) => void)
}

/** 取消订阅 */
export function off<K extends EventName>(name: K, handler: (payload: EventMap[K]) => void) {
  Taro.eventCenter.off(name, handler as (...args: unknown[]) => void)
}

/** 发布事件 */
export function emit<K extends EventName>(name: K, payload: EventMap[K]) {
  Taro.eventCenter.trigger(name, payload)
}
