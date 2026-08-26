import Taro from '@tarojs/taro'
import { isWeapp } from './platform'

/**
 * 分享配置封装（主要服务微信小程序）
 *
 * - enableShareMenu：开启页面右上角「...」分享菜单
 * - shareConfig：生成 onShareAppMessage 返回值，页面里直接 return
 * - H5 / App 无原生分享能力，需要时自行接入 web share API 或第三方 SDK
 */

export interface ShareConfig {
  /** 分享标题 */
  title: string
  /** 分享路径（默认当前页面路径，可带参数） */
  path?: string
  /** 分享封面图（默认页面截图或留空用默认图） */
  imageUrl?: string
}

/** 开启页面右上角分享菜单（小程序，页面 onLoad 时调用） */
export function enableShareMenu() {
  if (isWeapp) {
    Taro.showShareMenu({ withShareTicket: false })
  }
}

/** 生成 onShareAppMessage 返回值（页面中：onShareAppMessage: () => shareConfig({ title: 'xxx' })） */
export function shareConfig(config: ShareConfig) {
  const currentPath = Taro.getCurrentInstance().router?.path ?? ''
  return {
    title: config.title,
    path: config.path ?? currentPath,
    imageUrl: config.imageUrl,
  }
}
