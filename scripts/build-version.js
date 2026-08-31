/**
 * 打包版本信息生成脚本
 * 在 taro build 完成后执行，向 dist/ 目录写入 version.json
 *
 * 用法: node scripts/build-version.js <platform> [env]
 *   platform: 打包平台（h5 / weapp / alipay ...）
 *   env:      当前环境（production / test / development，默认 production）
 *
 * 生成内容: 打包人 / 打包时间 / 当前环境 / 打包平台 / 打包分支 / 提交号
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const platform = process.argv[2] || 'h5'
const env = process.argv[3] || process.env.NODE_ENV || 'production'

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

const user = run('git config user.name') || process.env.USERNAME || process.env.USER || 'unknown'
const email = run('git config user.email')
const branch = run('git rev-parse --abbrev-ref HEAD') || 'unknown'
const commit = run('git rev-parse --short HEAD')
const now = new Date()
const buildTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

const info = {
  // 打包人（git user.name + user.email，CI 环境无 git 时回退系统用户名）
  buildBy: email ? `${user} <${email}>` : user,
  // 打包时间
  buildTime,
  // 当前环境
  env,
  // 打包平台
  platform,
  // 打包分支
  branch,
  // 提交号（便于版本追溯）
  commit
}

const distDir = path.resolve(__dirname, '..', 'dist')
fs.mkdirSync(distDir, { recursive: true })
const target = path.join(distDir, 'version.json')
fs.writeFileSync(target, JSON.stringify(info, null, 2) + '\n', 'utf8')

console.log(`[build-version] ${target}`)
console.log(JSON.stringify(info, null, 2))
