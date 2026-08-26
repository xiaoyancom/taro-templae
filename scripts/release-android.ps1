#Requires -Version 5.1
<#
.SYNOPSIS
  一键打包正式 Android APK（Taro bundle 编译 + gradle 签名打包）
.DESCRIPTION
  等价于手动执行：
    1. npm run build:rn:android                 （编译业务代码 -> 壳工程 assets/index.android.bundle）
    2. cd native-shell\android
       .\gradlew assembleRelease                （打正式签名 APK）
  产物：壳工程 app\build\outputs\apk\release\app-release.apk
        并复制一份到本仓库 release\ 目录（带版本号与时间戳）
.PARAMETER SkipBundle
  跳过 bundle 编译（仅改了原生层/图标/包名等、JS 代码无变化时使用）
.PARAMETER SkipApk
  只编译 bundle 写入壳工程，不执行 gradle 打包
.EXAMPLE
  npm run release:android                     # 完整打包
  npm run release:android -- -SkipBundle      # 只打原生（JS 未变）
  npm run release:android -- -SkipApk         # 只更新 bundle
#>
[CmdletBinding()]
param(
    [switch]$SkipBundle,
    [switch]$SkipApk
)

$ErrorActionPreference = 'Stop'
$JsRoot     = Split-Path $PSScriptRoot -Parent
$ShellDir   = Join-Path $JsRoot 'native-shell'
$AndroidDir = Join-Path $ShellDir 'android'
$BundlePath = Join-Path $AndroidDir 'app\src\main\assets\index.android.bundle'
$ApkPath    = Join-Path $AndroidDir 'app\build\outputs\apk\release\app-release.apk'

function Write-Step { param([string]$m) Write-Host "`n==> $m" -ForegroundColor Cyan }
function Write-Ok   { param([string]$m) Write-Host "  [OK] $m" -ForegroundColor Green }
function Test-Cmd   { param([string]$n) [bool](Get-Command $n -ErrorAction SilentlyContinue) }

# ============================================================
# 前置检查
# ============================================================
Write-Step '前置检查'
if (-not (Test-Path (Join-Path $AndroidDir 'build.gradle'))) {
    throw "壳工程未初始化（$AndroidDir 不存在）。请先在仓库根目录执行: npm run setup"
}
if (-not (Test-Path (Join-Path $AndroidDir 'app\release.keystore'))) {
    throw '未找到签名文件 release.keystore。请先执行: npm run setup'
}
if (-not $SkipApk -and -not (Test-Cmd java) -and -not $env:JAVA_HOME) {
    throw '未检测到 JDK（gradle 打包需要 JDK 17）。请安装：https://adoptium.net'
}
Write-Ok "壳工程: $ShellDir"

# ============================================================
# Step 1/2 编译 Taro bundle（写入壳工程 assets）
# ============================================================
if (-not $SkipBundle) {
    Write-Step 'Step 1/2 编译 Taro bundle（写入壳工程 assets）'
    Push-Location $JsRoot
    try {
        npm run build:rn:android
        if ($LASTEXITCODE -ne 0) { throw 'Taro bundle 编译失败，请检查上方错误信息' }
    } finally { Pop-Location }
    if (Test-Path $BundlePath) {
        Write-Ok "bundle 已更新: $((Get-Item $BundlePath).LastWriteTime)"
    } else {
        throw "未找到 bundle 产物: $BundlePath"
    }
} else {
    Write-Step 'Step 1/2 跳过 bundle 编译（-SkipBundle，仅原生层变更）'
    if (Test-Path $BundlePath) {
        Write-Host "  沿用当前 bundle: $((Get-Item $BundlePath).LastWriteTime)"
    } else {
        throw "壳工程还没有 bundle（$BundlePath 不存在），请去掉 -SkipBundle 先完整打包一次"
    }
}

# ============================================================
# Step 2/2 Gradle 打包 APK
# ============================================================
if (-not $SkipApk) {
    Write-Step 'Step 2/2 Gradle 打包 APK（首次运行需下载 Gradle 与依赖约 20-30 分钟；增量约 5 分钟）'
    Push-Location $AndroidDir
    try {
        & .\gradlew.bat assembleRelease
        if ($LASTEXITCODE -ne 0) { throw 'gradle 打包失败。常见原因（screens 版本/签名路径/镜像）见 PACKAGING.md「首次构建实测记录与坑点」' }
    } finally { Pop-Location }

    if (-not (Test-Path $ApkPath)) { throw "构建报告成功但未找到 APK: $ApkPath" }
    $apk = Get-Item $ApkPath
    Write-Ok "APK 生成: $ApkPath"
    Write-Ok "大小: $([math]::Round($apk.Length/1MB,1)) MB，时间: $($apk.LastWriteTime)"
    # gradle 增量基于内容哈希：bundle 内容与 APK 内已有一致时不会重打，APK 时间早于 bundle 属正常
    if ($apk.LastWriteTime -lt (Get-Item $BundlePath).LastWriteTime) {
        Write-Host '  [说明] APK 时间早于 bundle：gradle 判定 bundle 内容未变化（代码没改），APK 已包含当前代码，无需重打' -ForegroundColor DarkGray
    }

    # 复制到 JS 仓库 release\ 目录（带版本号与时间戳，便于分发追溯）
    $releaseDir = Join-Path $JsRoot 'release'
    if (-not (Test-Path $releaseDir)) { New-Item -ItemType Directory -Path $releaseDir | Out-Null }
    $versionName = 'x.x'
    $gradleFile = Join-Path $AndroidDir 'app\build.gradle'
    if ([IO.File]::ReadAllText($gradleFile) -match 'versionName\s+"([^"]+)"') { $versionName = $Matches[1] }
    $stamp = Get-Date -Format 'yyyyMMdd-HHmm'
    $dest = Join-Path $releaseDir "app-release-$versionName-$stamp.apk"
    Copy-Item $ApkPath $dest -Force
    Write-Ok "已复制: $dest"

    Write-Host ''
    Write-Host '  打包完成。安装到手机: adb install -r "<APK路径>"' -ForegroundColor Green
    Write-Host '  发布前检查（包名/版本/图标/签名）: PACKAGING.md 第 5 节' -ForegroundColor Green
} else {
    Write-Step 'Step 2/2 跳过 gradle 打包（-SkipApk）'
    Write-Ok 'bundle 已就绪，可在装好 APP 的设备上通过 metro 调试，或去掉 -SkipApk 完整打包'
}
