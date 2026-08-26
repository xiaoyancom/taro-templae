/**
 * 格式化工具（展示层高频：日期/金额/脱敏/文件大小）
 */

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/**
 * 日期格式化
 * formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss') -> '2026-08-26 10:30:00'
 * 占位符支持：YYYY 年 / MM 月 / DD 日 / HH 时 / mm 分 / ss 秒
 */
export function formatDate(date: Date | number | string, pattern = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  const map: Record<string, string> = {
    YYYY: String(d.getFullYear()),
    MM: pad(d.getMonth() + 1),
    DD: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
  }
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (k) => map[k])
}

/** 金额分转元：formatMoney(1990) -> '19.90'（后端常用分存储，展示转元） */
export function formatMoney(cents: number, digits = 2): string {
  return (cents / 100).toFixed(digits)
}

/** 千分位：formatThousands(1234567) -> '1,234,567'（手写正则避免 toLocaleString 差异） */
export function formatThousands(num: number): string {
  const [int, dec] = String(num).split('.')
  const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec ? `${formatted}.${dec}` : formatted
}

/** 手机号脱敏：maskPhone('13812348000') -> '138****8000' */
export function maskPhone(phone: string): string {
  if (!/^1\d{10}$/.test(phone)) return phone
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

/** 姓名脱敏：张伟 -> 张*，李小龙 -> 李*龙 */
export function maskName(name: string): string {
  if (!name) return ''
  if (name.length === 1) return name
  if (name.length === 2) return `${name[0]}*`
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`
}

/** 文件大小：formatSize(1536) -> '1.5 KB' */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let size = bytes / 1024
  let i = 0
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(1)} ${units[i]}`
}

/** 相对时间：刚刚 / N分钟前 / N小时前 / N天前 / 具体日期 */
export function fromNow(time: Date | number | string): string {
  const t = new Date(time).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 30 * day) return `${Math.floor(diff / day)}天前`
  return formatDate(t, 'YYYY-MM-DD')
}
