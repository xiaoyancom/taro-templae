/**
 * 通用工具（无平台差异的纯函数）
 */

/** 防抖：停止触发 wait 毫秒后执行（搜索框输入、窗口 resize 等场景） */
export function debounce<A extends unknown[], R>(fn: (...args: A) => R, wait = 300): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: A) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}

/** 节流：wait 毫秒内最多执行一次（滚动监听、按钮重复点击等场景） */
export function throttle<A extends unknown[], R>(fn: (...args: A) => R, wait = 300): (...args: A) => void {
  let lastTime = 0
  return (...args: A) => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      fn(...args)
    }
  }
}

/** 深拷贝（优先 structuredClone，老环境降级 JSON 方案） */
export function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

/** 生成唯一 ID（时间戳 + 随机数，够用不求碰撞保证） */
export function uuid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** 延时（配合 await 使用：await sleep(500)） */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 对象转 query 字符串（自动过滤 undefined/null，navigate 内部同样使用） */
export function queryString(params: Record<string, unknown>): string {
  const parts = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`)
  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

/** query 字符串转对象（?a=1&b=2 -> { a: '1', b: '2' }） */
export function parseQueryString(query: string): Record<string, string> {
  const result: Record<string, string> = {}
  const q = query.startsWith('?') ? query.slice(1) : query
  if (!q) return result
  for (const part of q.split('&')) {
    const [k, v] = part.split('=')
    if (k) result[decodeURIComponent(k)] = decodeURIComponent(v ?? '')
  }
  return result
}

/** 空值判断（null / undefined / 空串 / 空数组 / 空对象） */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}
