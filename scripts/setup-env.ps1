#Requires -Version 5.1
<#
.SYNOPSIS
  Taro 多端项目一键环境初始化（Windows）
.DESCRIPTION
  新同事拉取本仓库后执行一次，完成全部环境初始化：
    1. 前置工具检查（Node>=18 / Git / JDK 17）
    2. JS 工程依赖安装（.npmrc 已含 legacy-peer-deps）
    3. 校验原生壳工程 native-shell/ 已随仓库就位（不再远程克隆，已集成到本仓库）
    4. 壳工程配置自检与修复：screens 版本锁定 / Gradle 腾讯镜像 / 签名配置 / gitignore 防泄漏
    5. 生成 Android 开发签名 release.keystore + keystore.properties（已存在则跳过）
    6. 写入 local.properties（Android SDK 路径）并配置 ANDROID_HOME 环境变量
    7. 壳工程依赖安装
  脚本幂等，可重复执行；已完成的步骤自动跳过。
  之后的日常开发只需 dev:* 命令，打正式 APK 用 npm run release:android。
.EXAMPLE
  npm run setup
  powershell -ExecutionPolicy Bypass -File scripts/setup-env.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$JsRoot    = Split-Path $PSScriptRoot -Parent
# 壳工程已集成在本仓库内（与 JS 工程同仓库提交，不再单独克隆）
$ShellDir  = Join-Path $JsRoot 'native-shell'
$warnings  = New-Object System.Collections.Generic.List[string]

function Write-Step { param([string]$m) Write-Host "`n==> $m" -ForegroundColor Cyan }
function Write-Ok   { param([string]$m) Write-Host "  [OK] $m" -ForegroundColor Green }
function Write-Hint { param([string]$m) Write-Host "  [!!] $m" -ForegroundColor Yellow; $script:warnings.Add($m) | Out-Null }
function Test-Cmd   { param([string]$n) [bool](Get-Command $n -ErrorAction SilentlyContinue) }
# 归一化换行符：脚本内 here-string 统一转 LF，与归一化后的目标文件匹配
function To-Lf { param([string]$s) $s -replace "`r`n", "`n" }

# ============================================================
# 1. 前置工具检查
# ============================================================
Write-Step 'Step 1/6 前置工具检查（Node.js >= 18 / Git / JDK 17）'

if (-not (Test-Cmd node)) { throw '未找到 node，请先安装 Node.js 18+：https://nodejs.org' }
$nodeMajor = [int](((& node -v) -replace '^v', '').Split('.')[0])
if ($nodeMajor -lt 18) { throw "Node.js 版本过低（当前 $(& node -v)），请升级到 18+" }
Write-Ok "Node.js $(& node -v)"

if (-not (Test-Cmd git)) { throw '未找到 git，请先安装：https://git-scm.com' }
Write-Ok (& git --version)

# keytool（生成签名用）：优先 JAVA_HOME，其次 PATH
$keytool = $null
if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME 'bin\keytool.exe'))) {
    $keytool = Join-Path $env:JAVA_HOME 'bin\keytool.exe'
} elseif (Test-Cmd keytool) {
    $keytool = (Get-Command keytool).Source
}
if ($keytool) {
    Write-Ok "JDK keytool: $keytool"
} else {
    Write-Hint '未检测到 JDK 17（keytool）。H5/小程序开发不受影响；生成签名与 APK 打包需要 JDK，请安装：https://adoptium.net（装完重跑本脚本）'
}

# npm 源提示（不修改用户配置，仅提醒）
$registry = (& npm config get registry).Trim()
if ($registry -notmatch 'npmmirror|taobao') {
    Write-Hint "当前 npm 源为官方源（$registry），国内较慢建议切换：npm config set registry https://registry.npmmirror.com"
}

# 1.5 Metro 端口防火墙放行（真机调试必需；需管理员权限，失败仅提示不阻断）
$fwRuleName = 'Taro Metro 8081'
$fwShow = & netsh advfirewall firewall show rule name="$fwRuleName" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Ok "防火墙已放行 8081 端口（Taro Metro 真机调试）: $fwRuleName"
} else {
    & netsh advfirewall firewall add rule name="$fwRuleName" dir=in action=allow protocol=TCP localport=8081 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Ok '已放行防火墙 8081 端口（Taro Metro 真机调试）'
    } else {
        Write-Hint '未能自动放行防火墙 8081（需要管理员权限）。真机调试连不上 Metro 时，请以管理员身份执行：netsh advfirewall firewall add rule name="Taro Metro 8081" dir=in action=allow protocol=TCP localport=8081'
    }
}

# ============================================================
# 2. JS 工程依赖
# ============================================================
Write-Step 'Step 2/6 安装 JS 工程依赖（Taro-templae）'
Push-Location $JsRoot
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw 'npm install 失败（JS 工程），请检查上方错误信息' }
} finally { Pop-Location }
Write-Ok "JS 工程依赖就绪: $JsRoot"

# ============================================================
# 3. 壳工程校验（已集成在本仓库，随仓库拉取）
# ============================================================
Write-Step 'Step 3/6 校验原生壳工程（native-shell，随仓库拉取）'
if (Test-Path (Join-Path $ShellDir 'android\app\build.gradle')) {
    Write-Ok "壳工程已就位: $ShellDir"
} else {
    throw "未找到壳工程: $ShellDir。壳工程已集成在本仓库 native-shell/ 目录，请确认 clone/pull 时完整拉取了该目录（若老流程残留同级目录 taro-native-shell 可删除）"
}

# ============================================================
# 4. 壳工程补丁（全部幂等，已打过的自动跳过）
# ============================================================
Write-Step 'Step 4/6 壳工程配置自检与修复（screens 锁定 / Gradle 镜像 / 签名配置 / gitignore）'

# 4.1 react-native-screens 精确锁定 3.29.0
#     官方 0.73.0 分支声明 ^3.29.0，会浮动装到 3.37+，其 BaseReactPackage API
#     需要 RN 0.74+，在 RN 0.73 下 Kotlin 编译报 Unresolved reference: BaseReactPackage
$pkgPath = Join-Path $ShellDir 'package.json'
$pkg = [IO.File]::ReadAllText($pkgPath)
if ($pkg -match '"react-native-screens"\s*:\s*"3\.29\.0"') {
    Write-Ok 'screens 已锁定 3.29.0'
} elseif ($pkg -match '"react-native-screens"\s*:\s*"[^"]+"') {
    $pkg = $pkg -replace '"react-native-screens"\s*:\s*"[^"]+"', '"react-native-screens": "3.29.0"'
    [IO.File]::WriteAllText($pkgPath, $pkg)
    Write-Ok 'screens 已锁定 3.29.0（修复 RN 0.73 编译不兼容）'
} else {
    Write-Hint '壳工程 package.json 未找到 react-native-screens，请确认壳工程版本正确（应基于官方 0.73.0 分支）'
}

# 4.2 Gradle 发行版换腾讯镜像（官方源 services.gradle.org 国内超时）
$wrapperPath = Join-Path $ShellDir 'android\gradle\wrapper\gradle-wrapper.properties'
if (Test-Path $wrapperPath) {
    $wrapper = [IO.File]::ReadAllText($wrapperPath)
    if ($wrapper -match 'mirrors\.cloud\.tencent\.com') {
        Write-Ok 'Gradle 已使用腾讯镜像'
    } else {
        $wrapper = $wrapper -replace 'services\.gradle\.org/distributions/gradle-8\.3-all\.zip', 'mirrors.cloud.tencent.com/gradle/gradle-8.3-all.zip'
        [IO.File]::WriteAllText($wrapperPath, $wrapper)
        Write-Ok 'Gradle 发行版已切换腾讯镜像'
    }
} else {
    Write-Hint "未找到 $wrapperPath，请确认壳工程结构完整"
}

# 4.3 build.gradle 注入 release 签名配置（从 keystore.properties 读取，文件不入库）
$gradlePath = Join-Path $ShellDir 'android\app\build.gradle'
$g = [IO.File]::ReadAllText($gradlePath)
if ($g.Contains('keystorePropertiesFile')) {
    Write-Ok 'build.gradle 签名配置已存在'
} else {
    $crlf = $g.Contains("`r`n")
    $g = To-Lf $g

    # 4.3.1 头部注入 keystore.properties 读取逻辑
    $old1 = @'
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"
'@
    $new1 = @'
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

// 签名配置从 keystore.properties 读取（不入库，由本地提供）
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
'@
    if (-not $g.Contains((To-Lf $old1))) { throw 'build.gradle 补丁失败：未找到插件声明锚点（壳工程版本可能变化，请联系维护者）' }
    $g = $g.Replace((To-Lf $old1), (To-Lf $new1))

    # 4.3.2 signingConfigs 增加 release 块
    $old2 = @'
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
'@
    $new2 = @'
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
'@
    if (-not $g.Contains((To-Lf $old2))) { throw 'build.gradle 补丁失败：未找到 signingConfigs 锚点' }
    $g = $g.Replace((To-Lf $old2), (To-Lf $new2))

    # 4.3.3 release 构建改用正式签名（debug 构建保持 debug 签名不变）
    $old3 = @'
            signingConfig signingConfigs.debug
            minifyEnabled enableProguardInReleaseBuilds
'@
    $new3 = @'
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
'@
    if (-not $g.Contains((To-Lf $old3))) { throw 'build.gradle 补丁失败：未找到 release signingConfig 锚点' }
    $g = $g.Replace((To-Lf $old3), (To-Lf $new3))

    if ($crlf) { $g = $g -replace "`n", "`r`n" }
    [IO.File]::WriteAllText($gradlePath, $g)
    Write-Ok 'build.gradle 签名配置已注入'
}

# 4.4 壳工程 .gitignore 防泄漏（keystore.properties 含签名密码，严禁入库）
$giPath = Join-Path $ShellDir '.gitignore'
if (Test-Path $giPath) {
    $gi = [IO.File]::ReadAllText($giPath)
    if ($gi -match '(?m)^keystore\.properties\s*$') {
        Write-Ok '.gitignore 已防护 keystore.properties'
    } else {
        if (-not $gi.EndsWith("`n")) { $gi += "`n" }
        $gi += "keystore.properties`n"
        [IO.File]::WriteAllText($giPath, $gi)
        Write-Ok '.gitignore 已追加 keystore.properties（防止签名密码入库）'
    }
}

# ============================================================
# 5. Android 签名与 SDK 配置
# ============================================================
Write-Step 'Step 5/6 Android 签名与 SDK 配置'

$ksPath  = Join-Path $ShellDir 'android\app\release.keystore'
$kspPath = Join-Path $ShellDir 'android\keystore.properties'

if (Test-Path $ksPath) {
    Write-Ok "签名已存在: $ksPath"
} elseif (-not $keytool) {
    Write-Hint "跳过签名生成（本机无 JDK）。装好 JDK 后重新运行本脚本即可补齐"
} else {
    $ksPwd = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 20 | ForEach-Object { [char]$_ })
    & $keytool -genkeypair -keystore $ksPath -alias taro-release -keyalg RSA -keysize 2048 -validity 10000 -storepass $ksPwd -keypass $ksPwd -dname 'CN=TaroDemo, OU=Taro, O=Taro, L=Beijing, ST=Beijing, C=CN'
    if ($LASTEXITCODE -ne 0) { throw 'keystore 生成失败，请检查上方 keytool 输出' }
    # storeFile 相对 android/app/ 模块目录解析（写 release.keystore，不能写 app/release.keystore）
    $ksp = "storeFile=release.keystore`nstorePassword=$ksPwd`nkeyAlias=taro-release`nkeyPassword=$ksPwd"
    [IO.File]::WriteAllText($kspPath, $ksp)
    Write-Ok "已生成开发签名: $ksPath"
    Write-Host ''
    Write-Host '  ================= 签名密码（请记录并妥善备份！） =================' -ForegroundColor Magenta
    Write-Host "  storePassword / keyPassword : $ksPwd" -ForegroundColor Magenta
    Write-Host '  说明：这是本机开发签名；正式发布签名由发版负责人统一保管' -ForegroundColor Magenta
    Write-Host '  ==============================================================' -ForegroundColor Magenta
}

# SDK 探测：ANDROID_HOME -> 默认安装路径 -> PATH 中 adb 反推
$sdk = $null
if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) { $sdk = $env:ANDROID_HOME }
if (-not $sdk) {
    $defaultSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
    if (Test-Path $defaultSdk) { $sdk = $defaultSdk }
}
if (-not $sdk) {
    # 最后一搏：PATH 里的 adb 反推 SDK 根（adb 位于 <SDK>\platform-tools\adb.exe）
    $adbCmd = Get-Command adb -ErrorAction SilentlyContinue
    if ($adbCmd) { $sdk = Split-Path (Split-Path $adbCmd.Source -Parent) -Parent }
}

$lpPath = Join-Path $ShellDir 'android\local.properties'
if ($sdk) {
    # 组件完整性：platforms / build-tools 至少各有一个版本（缺失时 AGP 首次构建可自动补装，仅提醒）
    $hasPlatform = (Test-Path (Join-Path $sdk 'platforms')) -and ((Get-ChildItem (Join-Path $sdk 'platforms') -Directory -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0)
    $hasBuildTools = (Test-Path (Join-Path $sdk 'build-tools')) -and ((Get-ChildItem (Join-Path $sdk 'build-tools') -Directory -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0)
    if (-not $hasPlatform -or -not $hasBuildTools) {
        Write-Hint 'Android SDK 组件不完整（platforms/build-tools 缺失）。首次 gradle 构建 AGP 会自动补装平台 34（需接受 license），或 Android Studio → SDK Manager 手动勾选'
    }
    if (Test-Path $lpPath) {
        Write-Ok 'local.properties 已存在'
    } else {
        [IO.File]::WriteAllText($lpPath, "sdk.dir=$($sdk.Replace('\', '\\'))`n")
        Write-Ok "local.properties 已写入: sdk.dir=$sdk"
    }
    # platform-tools 组件检测（adb 需要，AS Standard 安装默认自带）
    if (-not (Test-Path (Join-Path $sdk 'platform-tools\adb.exe'))) {
        Write-Hint "Android SDK 缺少 platform-tools（adb）。打开 Android Studio → SDK Manager → SDK Tools 勾选 Android SDK Platform-Tools 安装后重跑本脚本"
    }
    # 用户级环境变量（对新终端生效，命令行 gradle 构建与 adb 需要）
    if (-not [Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User')) {
        [Environment]::SetEnvironmentVariable('ANDROID_HOME', $sdk, 'User')
        Write-Ok "已设置用户级 ANDROID_HOME=$sdk"
    }
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if (-not $userPath -or ($userPath -notlike "*$sdk\platform-tools*")) {
        $newPath = if ($userPath) { "$userPath;$sdk\platform-tools" } else { "$sdk\platform-tools" }
        [Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
        Write-Ok '已追加 platform-tools（含 adb）到用户 Path'
    }
    # 同步当前会话（脚本跑完立即生效，无需重开终端）
    $env:ANDROID_HOME = $sdk
    if ($env:Path -notlike "*$sdk\platform-tools*") { $env:Path = "$env:Path;$sdk\platform-tools" }
} else {
    Write-Hint '未检测到 Android SDK。H5/小程序开发不受影响；APK 打包前需安装 Android SDK（推荐装 Android Studio 自带：https://developer.android.google.cn/studio?hl=zh-cn ，装完重跑本脚本）'
}

# ============================================================
# 6. 壳工程依赖
# ============================================================
Write-Step 'Step 6/6 安装壳工程依赖（首次约 3-10 分钟）'
Push-Location $ShellDir
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw 'npm install 失败（壳工程），请检查上方错误信息' }
} finally { Pop-Location }
Write-Ok '壳工程依赖就绪'

# ============================================================
# 完成
# ============================================================
Write-Host ''
Write-Host '================================================================' -ForegroundColor Green
Write-Host '  环境初始化完成，可以开始开发了！' -ForegroundColor Green
Write-Host '================================================================' -ForegroundColor Green
Write-Host ''
Write-Host '  日常开发（在本仓库根目录执行）：'
Write-Host '    npm run dev:h5           # H5（浏览器 http://localhost:10086）'
Write-Host '    npm run dev:weapp        # 微信小程序（微信开发者工具导入 dist/）'
Write-Host '    npm run dev:rn:qr        # App 扫码调试（手机装 Taro Playground）'
Write-Host '    npm run dev:rn:android   # App-Android（metro，配合模拟器/真机）'
Write-Host ''
Write-Host '  打正式 Android APK：'
Write-Host '    npm run release:android  # 一键 bundle + gradle，产物在 release/'
Write-Host ''
Write-Host '  按需安装（脚本无法自动完成，用到时再装）：'
Write-Host '    - 微信小程序调试：安装微信开发者工具（官网下载）'
Write-Host '    - App 真机调试：手机安装 Taro Playground（应用市场或 GitHub Releases）'
Write-Host '    - 真机连不上 Metro（Cannot connect to Metro）：手机与电脑连同一 WiFi 后重新扫码；仍不行执行 adb reverse tcp:8081 tcp:8081 再重扫'
Write-Host '    - 首次打 APK 前建议先预热 Gradle（下载发行版约 1-2 分钟）：cd native-shell/android; .\gradlew --version'
Write-Host '    - 环境变量已写入用户级（ANDROID_HOME / adb），本终端已同步生效；其他已开终端需重开'
Write-Host ''
if ($script:warnings.Count -gt 0) {
    Write-Host '  待处理提醒：' -ForegroundColor Yellow
    $script:warnings | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
    Write-Host ''
}
Write-Host '  更多文档：README.md（开发指南）/ PACKAGING.md（打包发布）'
