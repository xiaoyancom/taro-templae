import Taro from '@tarojs/taro'
import { BASE_URL } from './request'
import { getToken } from './auth'

/**
 * 文件上传封装（头像/图片/附件等场景）
 *
 * - 自动携带 token（Authorization 头）
 * - 进度回调（小程序/H5 支持，App 端无进度事件自动跳过）
 * - Promise 化，响应尝试按 JSON 解析
 */

export interface UploadOptions {
  /** 上传接口路径（相对 BASE_URL） */
  url: string
  /** 本地文件路径（chooseImage / chooseVideo 返回值） */
  filePath: string
  /** 后端接收的文件字段名，默认 file */
  name?: string
  /** 附加表单字段 */
  formData?: Record<string, string>
  /** 上传进度回调（0-100） */
  onProgress?: (percent: number) => void
}

export function uploadFile<T = unknown>(options: UploadOptions): Promise<T> {
  const { url, filePath, name = 'file', formData, onProgress } = options

  const header: Record<string, string> = {}
  const token = getToken()
  if (token) header.Authorization = `Bearer ${token}`

  return new Promise<T>((resolve, reject) => {
    const task = Taro.uploadFile({
      url: `${BASE_URL}${url}`,
      filePath,
      name,
      formData,
      header,
      success: (res) => {
        try {
          resolve(JSON.parse(res.data) as T)
        } catch {
          resolve(res.data as unknown as T)
        }
      },
      fail: (err) => reject(err),
    })
    // 进度回调（部分端不支持，做存在性判断）
    if (task && typeof task.progress === 'function') {
      task.progress((res) => onProgress?.(res.progress))
    }
  })
}

/** 选择图片并上传（chooseImage + uploadFile 一步到位，返回各图上传结果） */
export async function uploadImage<T = unknown>(
  options: Omit<UploadOptions, 'filePath'> & { count?: number }
): Promise<T[]> {
  const res = await Taro.chooseImage({ count: options.count ?? 1 })
  const results: T[] = []
  for (const filePath of res.tempFilePaths) {
    results.push(await uploadFile<T>({ ...options, filePath }))
  }
  return results
}
