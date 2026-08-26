import Taro from '@tarojs/taro'
import { getToken } from './auth'
import { toastError } from './ui'

/**
 * 网络请求封装
 *
 * - 统一 baseURL / token 注入 / 超时 / 失败提示
 * - 假设后端统一返回 { code, msg, data }，code === 0 表示成功（按实际后端协议调整此处）
 * - 泛型返回：const list = await http.get<Goods[]>('/goods')
 * - 401 等业务码如需统一处理（如跳登录页），在下方 catch 前拦截
 */

/** 后端接口地址（按环境调整：可用 isDev 区分开发/生产） */
export const BASE_URL = 'https://api.example.com'

/** 后端统一响应结构（按实际协议调整） */
interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: unknown
  /** 是否携带 token，默认 true */
  auth?: boolean
  /** 失败时是否自动 toast 错误，默认 true（页面可传 false 自行处理） */
  showError?: boolean
  timeout?: number
}

export async function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, auth = true, showError = true, timeout = 15000 } = options

  const header: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) header.Authorization = `Bearer ${token}`
  }

  try {
    const res = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
      timeout,
    })
    const body = res.data as ApiResponse<T>
    if (body.code === 0) return body.data
    throw new Error(body.msg || `请求失败（${body.code}）`)
  } catch (err) {
    if (showError) {
      toastError(err instanceof Error ? err.message : '网络异常，请稍后重试')
    }
    throw err
  }
}

/** 便捷方法：http.get<T>('/goods', { page: 1 }) */
export const http = {
  get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return request<T>({ url, method: 'GET', data: params })
  },
  post<T>(url: string, data?: unknown): Promise<T> {
    return request<T>({ url, method: 'POST', data })
  },
  put<T>(url: string, data?: unknown): Promise<T> {
    return request<T>({ url, method: 'PUT', data })
  },
  delete<T>(url: string, data?: unknown): Promise<T> {
    return request<T>({ url, method: 'DELETE', data })
  },
}
