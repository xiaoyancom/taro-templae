import Taro from '@tarojs/taro'

/**
 * 本地存储封装（H5 localStorage / 小程序 storage / App AsyncStorage 统一接口）
 *
 * - 自动 JSON 序列化，读取时自动反序列化并返回类型化结果
 * - 支持过期时间（毫秒），过期后读取自动清理返回 null
 * - 用法：setStorage('cart', { count: 2 }) / getStorage<Cart>('cart')
 */

interface StorageWrapper<T> {
  value: T
  /** 过期时间戳（毫秒），0 表示永不过期 */
  expiresAt: number
}

export function setStorage<T>(key: string, value: T, expiresMs?: number) {
  const wrapper: StorageWrapper<T> = {
    value,
    expiresAt: expiresMs ? Date.now() + expiresMs : 0,
  }
  Taro.setStorageSync(key, JSON.stringify(wrapper))
}

export function getStorage<T>(key: string): T | null {
  const raw = Taro.getStorageSync(key)
  if (!raw) return null
  try {
    const wrapper = JSON.parse(raw) as StorageWrapper<T>
    if (wrapper.expiresAt && Date.now() > wrapper.expiresAt) {
      Taro.removeStorageSync(key)
      return null
    }
    return wrapper.value
  } catch {
    // 非本工具写入的历史数据，原样返回
    return raw as T
  }
}

export function removeStorage(key: string) {
  Taro.removeStorageSync(key)
}

/** 清空全部本地存储（退出登录等场景慎用，会清掉非业务 key） */
export function clearStorage() {
  Taro.clearStorageSync()
}
