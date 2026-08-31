/**
 * 页面路由参数类型映射
 *
 * 新增页面时在此注册：路径 -> 参数类型（无参数用 undefined）
 * navigate 系列工具会据此在跳转时提供参数类型提示与校验
 */
declare global {
  interface RouteMap {
    '/pages/index/index': undefined
    '/pages/chat/index': undefined
    '/pages/detail/index': {
      id: string
      name?: string
      from?: string
    }
    '/pages/nutui-demo/index': undefined
  }

  type RoutePath = keyof RouteMap
  type RouteParams<P extends RoutePath> = RouteMap[P]
}

export {}
