import Taro from '@tarojs/taro'
import { queryString } from './common'

/**
 * 页面跳转封装（H5 / 小程序 / App 三端通用）
 *
 * - 对象传参：navigateTo('/pages/detail/index', { id: '1', name: '张三' })
 * - 类型安全：路径与参数由 types/route.d.ts 的 RouteMap 约束，写错路径/参数编译期报错
 * - 参数经 URL query 传递，仅支持 string/number/boolean，不可传对象（如需传大对象请用 storage）
 */

/** 解析页面 onLoad 收到的 query（各端参数格式统一转成对象） */
export function parseQuery<T = Record<string, string>>(
  query: Record<string, string | undefined> | undefined
): T {
  return (query ?? {}) as T
}

/** 普通跳转（可返回上一页） */
export function navigateTo<P extends RoutePath>(path: P, params?: RouteParams<P>) {
  return Taro.navigateTo({ url: `${path}${queryString(params as Record<string, unknown>)}` })
}

/** 重定向跳转（不留历史记录，返回键不可回到本页） */
export function redirectTo<P extends RoutePath>(path: P, params?: RouteParams<P>) {
  return Taro.redirectTo({ url: `${path}${queryString(params as Record<string, unknown>)}` })
}

/** 关闭当前页，返回上一页 */
export function navigateBack(delta = 1) {
  return Taro.navigateBack({ delta })
}

/** 关闭所有页面，重开到指定页（登录后回首页、退出登录等场景） */
export function reLaunch<P extends RoutePath>(path: P, params?: RouteParams<P>) {
  return Taro.reLaunch({ url: `${path}${queryString(params as Record<string, unknown>)}` })
}

/** 切换 tabBar 页（path 必须在 app.config.ts 的 tabBar 中注册） */
export function switchTab<P extends RoutePath>(path: P) {
  return Taro.switchTab({ url: path })
}
