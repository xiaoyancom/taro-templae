import Taro from '@tarojs/taro'
import { getStorage, setStorage, removeStorage } from './storage'
import { http } from './request'
import { emit } from './event'
import { isWeapp } from './platform'

/**
 * 登录态管理 + 微信授权
 *
 * - 微信小程序：silentLogin 静默授权（wx.login 换 code，无需用户交互，启动时自动调）
 * - H5 / App：loginByAccount 账号密码登录（静默授权仅微信可用）
 * - 用户信息 / 手机号授权必须由用户点击触发（微信规范限制）
 * - request 自动注入 token，logout 一键清理并通知全页面
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export interface UserInfo {
  id: string | number
  nickname: string
  avatar?: string
  phone?: string
  [key: string]: unknown
}

/** 保存 token（expiresMs 为有效期，如后端返回的过期时长） */
export function setToken(token: string, expiresMs?: number) {
  setStorage(TOKEN_KEY, token, expiresMs)
}

export function getToken(): string | null {
  return getStorage<string>(TOKEN_KEY)
}

export function setUserInfo(user: UserInfo) {
  setStorage(USER_KEY, user)
}

export function getUserInfo(): UserInfo | null {
  return getStorage<UserInfo>(USER_KEY)
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

/** 退出登录：清理本地登录态并发布 logout 事件（页面订阅后刷新界面） */
export function logout() {
  removeStorage(TOKEN_KEY)
  removeStorage(USER_KEY)
  emit('logout', undefined)
}

/** 登录成功通用收尾：存 token/用户信息 + 通知全页面 */
function handleLoginSuccess(data: { token: string; expiresIn?: number; user?: UserInfo }) {
  setToken(data.token, data.expiresIn ? data.expiresIn * 1000 : undefined)
  if (data.user) setUserInfo(data.user)
  emit('login:success', { token: data.token })
}

/**
 * 微信静默授权登录（仅小程序可用）
 * Taro.login 获取临时 code -> 后端 code2session 换取 token
 * 无需用户任何交互，可在 App 启动时调用；失败说明未登录，再引导用户走登录页
 */
export async function silentLogin(): Promise<boolean> {
  if (!isWeapp) {
    console.warn('[auth] silentLogin 仅微信小程序可用，H5/App 请用 loginByAccount')
    return false
  }
  const { code } = await Taro.login()
  const data = await http.post<{ token: string; expiresIn?: number; user?: UserInfo }>('/auth/login', {
    code,
  })
  handleLoginSuccess(data)
  return true
}

/** 账号密码登录（H5 / App 使用） */
export async function loginByAccount(username: string, password: string): Promise<boolean> {
  const data = await http.post<{ token: string; expiresIn?: number; user?: UserInfo }>('/auth/login', {
    username,
    password,
  })
  handleLoginSuccess(data)
  return true
}

/**
 * 微信用户信息授权（昵称/头像）
 * 注意：必须由用户点击触发（如 <Button onClick={handleGetUserProfile}>），否则微信拒绝
 * 微信 2022 年后 getUserInfo 不再返回真实信息，统一走 getUserProfile
 */
export async function getUserProfile(): Promise<UserInfo> {
  if (!isWeapp) throw new Error('getUserProfile 仅微信小程序可用')
  const res = await Taro.getUserProfile({ desc: '用于完善会员资料' })
  return res.userInfo as unknown as UserInfo
}

/**
 * 微信手机号授权（需企业主体小程序 + 用户点击按钮）
 * 用法：
 * <Button openType="getPhoneNumber" onGetPhoneNumber={(e) => bindPhone(e.detail.code)}>
 * 新规范后端用 code 换取手机号，不再下发 encryptedData
 */
export async function bindPhoneByCode(code: string): Promise<string> {
  if (!isWeapp) throw new Error('bindPhoneByCode 仅微信小程序可用')
  const data = await http.post<{ phone: string }>('/auth/bind-phone', { code })
  const user = getUserInfo()
  if (user) setUserInfo({ ...user, phone: data.phone })
  return data.phone
}
