# Taro 多端打包说明

Taro 4.2.1 + React 18 + TypeScript。一套代码编译 H5 / 微信小程序 / App(React Native)。

## 项目结构

```
d:\gitlab\Taro-templae\    # 本仓库（单一 git 仓库）：JS 工程 + 原生壳工程一体化
├── src/                 # 业务代码：一套代码多端编译
└── native-shell/        # 原生壳工程：Android/iOS 原生层（fork 自 Taro Native Shell 0.73.0 分支，已集成入库）
```

App 采用 **Taro 分离模式**：JS 工程编译出 bundle 与静态资源，输出到壳工程；壳工程负责原生打包。

## 三端开发命令（在 JS 工程执行）

| 端 | 开发模式 | 生产构建 |
|---|---|---|
| 微信小程序 | `npm run dev:weapp` | `npm run build:weapp` |
| H5 | `npm run dev:h5` | `npm run build:h5` |
| App Android | `npm run dev:rn:android` | `npm run build:rn:android` |
| App iOS | `npm run dev:rn:ios` | `npm run build:rn:ios` |
| App 扫码调试 | `npm run dev:rn:qr` | - |

- 小程序：微信开发者工具导入 JS 工程 `dist/` 目录
- H5：dev 模式访问 `http://localhost:10086`
- 扫码调试：`dev:rn:qr` 启动 metro 并打印二维码，用 Taro Playground APP 扫描

## Android 正式打包（含签名）

> **一键命令**：`npm run release:android` = 下述第 1 步 + 第 3 步（自动校验签名/依赖就绪，产物自动复制到 `release/` 目录，带版本号+时间戳）。支持 `-- -SkipBundle`（JS 代码未变只打原生）、`-- -SkipApk`（只更新 bundle）。首次环境准备用 `npm run setup`（详见 README「快速开始」）。以下手动步骤供理解原理与排障。

### 1. 编译 bundle 到壳工程

```bash
npm run build:rn:android
```

产物输出（由 `config/index.ts` 的 `rn.output` 配置）：

```
native-shell/android/app/src/main/assets/index.android.bundle
native-shell/android/app/src/main/assets/index.android.map
native-shell/android/app/src/main/res/   # 静态资源（其中 node_modules_* 为构建产物，不入库）
```

### 2. 电脑端：安装 Android Studio（含 Android SDK）

首次构建 APK 前，电脑需装好 Android Studio 环境（本机 JDK 17 已就绪）：

1. **下载安装**：Android Studio 国内官方下载地址：https://developer.android.google.cn/studio?hl=zh-cn （国际站 developer.android.com/studio 内容相同，国内访问慢用前者）；安装向导选 **Standard** 类型，会自动装齐 Android SDK、Platform-Tools、模拟器组件
2. **确认 SDK 组件**（壳工程 RN 0.73 要求）：打开 Android Studio → Settings → Languages & Frameworks → **Android SDK**，确认已装：
   - Android SDK Platform **34**（Android 14.0）
   - SDK Build-Tools **34.0.0**
   - Android SDK Platform-Tools（含 adb）
   - NDK **25.1.8937393**（SDK Tools 页签勾选 Show Package Details 可找到）
3. **配置环境变量**（命令行 gradlew 构建需要，PowerShell 管理员执行）：
   ```powershell
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "Machine")
   # 安卓 SDK 自带 platform-tools 目录追加到 Path（含 adb）
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:LOCALAPPDATA\Android\Sdk\platform-tools", "Machine")
   ```
   配完后重开终端验证：`adb version` 有输出即可
4. **验证构建链路**（可选，首次 Gradle 同步会下载依赖较久）：
   ```bash
   cd native-shell/android
   .\gradlew assembleRelease
   ```
5. **模拟器（可选）**：Android Studio → Device Manager → Create Device，选 Pixel 系列镜像（API 34）即可跑模拟器调试

### 3. 构建 APK

环境要求：Android Studio + Android SDK（见上节安装步骤），JDK 17（已装）。

```bash
# 方式一：命令行
cd native-shell/android
.\gradlew assembleRelease
# 产物: app/build/outputs/apk/release/app-release.apk

# 方式二：Android Studio 打开 native-shell/android，等待 Gradle 同步后
# Build → Build APK(s)
```

**首次构建实测记录与坑点（2026-08 验证，新环境必读）**：

1. **Gradle 发行版下载**：官方源 services.gradle.org 国内极慢/超时，壳工程 `gradle/wrapper/gradle-wrapper.properties` 已改为腾讯镜像（mirrors.cloud.tencent.com/gradle/）；若仍慢，可手动 curl 下载 gradle-8.3-all.zip 解压后直接调用其 `bin/gradle.bat`（绕过 wrapper）
2. **依赖仓库**：壳工程 build.gradle 已配阿里云镜像（public/google/gradle-plugin），首次构建依赖下载约 800MB，耐心等待（实测 26 分钟含编译）
3. **SDK 组件自动补装**：AS 初始只装了 Platform 37 / Build-Tools 36，AGP 首次构建会自动补装壳工程要求的 Platform 34 + Build-Tools 34.0.0，无需手动（前提 licenses 已接受）
4. **react-native-screens 版本已锁定 3.29.0（精确版本）**：壳工程原声明 `^3.29.0` 会浮动装到 3.37，其 `BaseReactPackage` API 需要 RN 0.74+，在 RN 0.73 下 Kotlin 编译报 `Unresolved reference: BaseReactPackage`，已改 `--save-exact` 固定，**勿改回 `^`**
5. **实测产物**：app-release.apk 约 39.5MB（含 Hermes 引擎 + expo 原生模块），二次增量构建约 5 分钟

### 4. 签名说明（已配置）

- 签名文件：`android/app/release.keystore`（RSA 2048，有效期 10000 天，已生成）
- 密码配置：`android/keystore.properties`（**不入库**，与 `.gitignore` 配合）；注意 `storeFile` 写**相对 `android/app/` 模块目录**的路径（即 `release.keystore`，不是 `app/release.keystore`，否则报 Keystore not found）
- 验证签名：`$SDK/build-tools/34.0.0/apksigner.bat verify --print-certs app-release.apk`，应显示 CN=TaroDemo 证书信息
- Gradle 已配置：release 构建读取 `keystore.properties`，debug 构建仍用 debug.keystore
- ⚠️ **keystore 与密码必须妥善备份**（`release.keystore` + `keystore.properties` 各存一份到安全位置），丢失后无法更新已上架应用
- 如需更换证书信息（CN 等），重新生成后同步替换两个文件即可

### 5. 发布前必改项

| 事项 | 位置 | 当前值 |
|---|---|---|
| 包名 applicationId | `android/gradle.properties` → `app_id`（同时改 `namespace`） | `com.tarodemo` |
| 应用显示名 | `android/app/src/main/res/values/strings.xml` → `app_name` | `taroDemo` |
| 版本号 | `android/app/build.gradle` → `versionCode` / `versionName` | 1 / 1.0 |
| App 图标 | `android/app/src/main/res/mipmap-*` | 默认 |
| RN 注册名 | JS 工程 `config/index.ts` → `rn.appName`（与原生 `MainActivity` 的 moduleName 一致） | `taroDemo` |

## iOS 打包

需要 macOS + Xcode + CocoaPods（当前 Windows 环境无法完成）：

```bash
npm run build:rn:ios
# 产物: native-shell/ios/main.jsbundle + 资源
cd native-shell/ios
npx pod-install
# 用 Xcode 打开 taroDemo.xcworkspace，配置签名后 Archive 发布
```

## 常见问题

- **App 白屏/报 "taroDemo has not been registered"**：`config/index.ts` 的 `rn.appName` 与原生工程 moduleName 不一致，三处需同步
- **改了 app.config 不生效**：metro 缓存导致，`npm run dev:rn -- --reset-cache`
- **stylelint 相关**：JS 工程 `stylelint` 固定在 `16.4.0`，不要升级（`stylelint-taro-rn@4.2.1` 依赖其内部模块路径）
- **bundle 未更新**：确认在 JS 工程执行了 `npm run build:rn:android`，且壳工程 `android/app/src/main/assets/` 下 bundle 时间戳是最新
