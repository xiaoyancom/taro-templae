import Taro from '@tarojs/taro'

/**
 * 运行环境判断（多端分支的核心工具）
 *
 * 用法：if (isWeapp) { 微信专有逻辑 } else if (isH5) { 浏览器逻辑 }
 * 判断结果在模块加载时确定，各端打包后是常量，webpack 会自动摇树掉死分支
 */

export type Platform =
  | 'weapp'
  | 'alipay'
  | 'swan'
  | 'tt'
  | 'qq'
  | 'jd'
  | 'web'
  | 'rn'
  | 'harmony'
  | 'unknown'

/** 当前运行端（Taro.getEnv 返回值小写化） */
export function getPlatform(): Platform {
  const env = Taro.getEnv()
  return (env || 'unknown').toLowerCase() as Platform
}

/** 微信小程序 */
export const isWeapp = getPlatform() === 'weapp'
/** 支付宝小程序 */
export const isAlipay = getPlatform() === 'alipay'
/** H5（浏览器） */
export const isH5 = getPlatform() === 'web'
/** App（React Native） */
export const isRN = getPlatform() === 'rn'
/** 任意小程序端（微信/支付宝/抖音等） */
export const isMp = !isH5 && !isRN

/** 开发环境（dev:xx 命令打包时为 true，生产构建为 false） */
export const isDev = process.env.NODE_ENV === 'development'

/**
 * 版本号比较：v1 > v2 返回 1，相等返回 0，小于返回 -1
 * 例：compareVersion('2.32.3', '2.31.0') -> 1
 * 用于判断微信基础库版本是否支持某 API
 */
export function compareVersion(v1: string, v2: string): number {
  const a = v1.split('.').map(Number)
  const b = v2.split('.').map(Number)
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0
    const y = b[i] ?? 0
    if (x > y) return 1
    if (x < y) return -1
  }
  return 0
}

/** 微信基础库版本号（仅小程序端有意义，其他端返回空串） */
export function getWxVersion(): string {
  if (!isMp) return ''
  return Taro.getSystemInfoSync().version || ''
}
