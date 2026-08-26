/**
 * 表单校验工具（返回 boolean，配合表单提交前统一校验）
 */

/** 手机号（中国大陆 11 位） */
export function isPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value)
}

/** 邮箱 */
export function isEmail(value: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
}

/** URL（http/https） */
export function isUrl(value: string): boolean {
  return /^https?:\/\/[\w.-]+(:\d+)?([/?#]\S*)?$/i.test(value)
}

/**
 * 身份证号（15 位旧版 / 18 位新版，18 位含校验位验证）
 * 注：仅格式校验，实名场景需后端接口核验
 */
export function isIdCard(value: string): boolean {
  const id = value.trim().toUpperCase()
  if (!/^\d{17}[\dX]$/.test(id) && !/^\d{15}$/.test(id)) return false
  if (id.length === 15) return true
  // 前 17 位加权求和 mod 11 得校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  let sum = 0
  for (let i = 0; i < 17; i++) sum += Number(id[i]) * weights[i]
  return checkCodes[sum % 11] === id[17]
}

/** 中文姓名（2-10 位，支持间隔号如 欧阳娜娜） */
export function isChineseName(value: string): boolean {
  return /^[\u4e00-\u9fa5·]{2,10}$/.test(value)
}

/** 密码强度：6-20 位，至少同时包含字母和数字 */
export function isPassword(value: string): boolean {
  return /^(?=.*[a-zA-Z])(?=.*\d)[\w!@#$%^&*.-]{6,20}$/.test(value)
}

/** 金额（元）：最多两位小数，如 0 / 12 / 12.5 / 12.50 */
export function isAmount(value: string): boolean {
  return /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value)
}

/** 正整数（数量、分页等场景） */
export function isPositiveInt(value: string): boolean {
  return /^[1-9]\d*$/.test(value)
}
