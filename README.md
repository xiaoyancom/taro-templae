# Taro-templae — Taro 多端应用模板

一套代码同时编译 **H5 / 微信小程序 / App（React Native）**。

技术栈：**Taro 4.2.1 + React 18 + TypeScript 5 + Sass + Webpack5**，App 端基于 React Native 0.73.11（分离模式 + Taro Native Shell 壳工程）。三端编译均已在 Windows 环境实测通过。

## 一、整体架构

```
d:\gitlab\Taro-templae\      # 本仓库：JS 工程 + 原生壳工程一体化
├── src/                    # 业务源码（一套代码）
├── config/                 # Taro 编译配置（dev/prod 环境拆分）
├── scripts/                # 一键脚本（setup-env.ps1 / release-android.ps1）
├── index.js                # RN 入口（Taro 自动生成，勿删）
├── metro.config.js         # RN metro 配置（Taro 自动生成，勿删）
├── project.config.json     # 微信开发者工具项目配置
├── .npmrc                  # legacy-peer-deps（见“配置要点”）
├── README.md               # 本文件：总览 + 开发指引
├── PACKAGING.md            # 打包发布说明（Android 签名/iOS 流程）
└── native-shell/           # 原生壳工程（集成在本仓库内，fork 自官方 0.73.0 分支）
    ├── android/            # Android 原生工程（已配正式签名）
    └── ios/                # iOS 原生工程（需 macOS 才能构建）
```

**分离模式工作原理**：JS 工程执行 `build:rn:*` 时，Taro 用 Metro 把业务代码编译成 bundle 和静态资源，直接输出到壳工程的 `android/app/src/main/assets/` 和 `res/` 目录；壳工程的 Gradle 配置了 `debuggableVariants = ["debug", "release"]` 跳过自带打包，原生 APK 只负责装载 Taro 产物。业务迭代只需重新编译 JS 工程，壳工程基本不动。

## 二、环境要求

| 依赖 | 要求 | 本机状态 |
|---|---|---|
| Node.js | ≥ 18（Taro 4 要求） | v20.18.1 ✓ |
| JDK | 17（Android 构建） | Temurin 17 ✓ |
| Android Studio | **可选**：仅作为安装 SDK 的推荐途径，命令行构建只需 SDK，SDK 就绪后 AS 非必需 | ✓ 已装（SDK 已就绪） |
| Android SDK | Platform 34 / Build-Tools 34.0.0 / Platform-Tools | ✓ 已装（AGP 首次构建自动补装 34 组件，APK 已实测产出） |
| Xcode + CocoaPods | iOS 构建必需 | 需 macOS |
| 微信开发者工具 | 小程序开发调试 | 按需安装 |

## 三、快速开始

### 首次使用（新同事必看）

拉取仓库后执行一条命令完成全部环境初始化（Windows）：

```bash
npm run setup
```

自动完成：工具检查（Node≥18/Git/JDK17）→ JS 与壳工程依赖安装 → 校验壳工程 `native-shell/` 已随仓库就位（screens 锁定、Gradle 腾讯镜像、签名配置均已固化在仓库内，无需再打补丁）→ 生成 Android 开发签名 → SDK 路径与 ANDROID_HOME 配置。脚本幂等可重复执行，日志末尾会汇总待处理提醒（如缺 JDK/SDK）。macOS 同事参考 PACKAGING.md 手动步骤。

### 日常开发

```bash
npm run dev:weapp       # 微信小程序：微信开发者工具导入本仓库 dist/ 目录
npm run dev:h5          # H5：浏览器访问 http://localhost:10086（热更新）
npm run dev:rn:android  # App-Android：启动 metro（--watch）
npm run dev:rn:qr       # App 扫码调试：用 Taro Playground APP 扫终端二维码
```

### 生产构建

```bash
npm run build:weapp         # 小程序（dist/ 供上传）
npm run build:h5            # H5（dist/ 部署到静态服务器）
npm run build:rn:android    # App-Android（bundle 直出壳工程）
npm run build:rn:ios        # App-iOS
npm run release:android     # 一键出正式签名 APK（= bundle 编译 + gradle 打包，产物在 release/）
```

`release:android` 支持参数：`npm run release:android -- -SkipBundle`（JS 代码未变、仅原生层变更时跳过 bundle 编译）、`-- -SkipApk`（只更新 bundle 不打 APK）。完整打包流程与排障见 [PACKAGING.md](./PACKAGING.md)。

## 四、App 调试

先说明 `npm run dev:rn:android` 执行后发生了什么：它**不生成 bundle 文件**，而是在 **8081 端口启动 Metro Dev Server**（watch 模式监听代码变化）；终端停在 Metro 欢迎界面不动 = 正常，服务在等设备连接。只有 `build:rn:*`（生产构建）才会把 bundle 写到 `rn.output` 指定的壳工程目录。

验证 Metro 是否就绪：浏览器访问 `http://127.0.0.1:8081/status`，显示 `packager-status:running` 即可。

### 方式一：手机装 Taro Playground（无需 Android Studio，推荐先用这个）

1. **手机安装 Taro Playground APP**（58 同城官方调试器）：应用市场搜“Taro Playground”，或从 GitHub Releases 下载 APK 安装：https://github.com/wuba/taro-playground/releases
2. **手机连与电脑同一 WiFi**（需能互通，路由器不能开 AP 隔离）
3. 连接 Metro，两种姿势任选：
   - 直接输入地址：JS 工程跑 `npm run dev:rn:android`，手机 APP 里输入 `电脑局域网IP:8081`（查 IP：`ipconfig` 看 IPv4 地址；本机当前为 192.168.17.204）
   - 扫码：改跑 `npm run dev:rn:qr`，终端直接打印二维码，APP 扫码即连
4. 改代码 → 保存 → Metro 自动重编译 → APP 内摇一摇调出 Dev Menu → Reload 看效果

> Windows 防火墙首次会弹窗询问 Node.js 网络权限，勾选允许（专用于专用网络）；若没弹窗且手机连不上，按下方「真机连不上 Metro」的两种方案处理。

### 方式二：模拟器/真机 + 壳工程（装好 Android Studio 后）

```bash
# 终端 1（JS 工程）：起 metro
npm run dev:rn:android

# 终端 2（壳工程）：把 APP 装到模拟器/真机
cd native-shell
npm run android    # 即 react-native run-android
```

- **模拟器**：自动发现并连接 Metro，无需额外配置（Android Studio → Device Manager 先建好 AVD）
- **USB 真机**：需先执行 `adb reverse tcp:8081 tcp:8081`（把手机的 8081 转发到电脑），否则 APP 连不上 Metro

### 方式三：DevTools 深度调试（APP 跑起来之后）

| 工具 | 用法 |
|---|---|
| RN Dev Menu | 摇一摇手机（模拟器：侧边菜单键）→ Reload / Toggle Inspector（点选元素看节点）/ Remote JS Debugging |
| Remote JS Debugging | JS 在 Chrome 里跑，`chrome://inspect` 看 Console、断点调试（Dev Menu 里开启） |
| React DevTools | `npx react-devtools`，自动连接运行中的 APP，看组件树和 props/state |
| Metro 终端 | `console.log` 直接在 Metro 终端查看（APP 内 log 会转发） |

### 调试常见坑

| 现象 | 原因/解法 |
|---|---|
| APP 提示 packager Not Available | 手机与电脑不在同一局域网，或路由器开了 AP 隔离，或防火墙未放行 |
| 加载一直转圈 | 首次加载 Metro 要全量编译，等终端出现 `BUNDLE ./index` 进度条 |
| 改 `app.config.ts` 不生效 | metro 缓存，重启 `npm run dev:rn:android -- --reset-cache` |
| console.log 看不到 | Metro 终端看，或开 Remote JS Debugging 后在 Chrome Console 看 |

### 真机连不上 Metro（Cannot connect to Metro）

现象：APP 内报 **Cannot connect to Metro**（或首次扫码报错、Reload 后正常）。先确认三件事：

1. Metro 是否在跑：`dev:rn:android` / `dev:rn:qr` 的终端还开着，浏览器访问 `http://127.0.0.1:8081/status` 返回 `packager-status:running`
2. 手机与电脑是否同一 WiFi（不能开手机流量；路由器不能开 AP 隔离）
3. 扫码/填写的 IP 是否电脑当前 IP：`ipconfig` 查 IPv4，双网卡机器（以太网+WiFi）手机只能连 WiFi 那个网段的地址

仍连不上，用下面两种方案之一（`npm run setup` 已自动执行方案 A 的防火墙步骤，管理员运行时直接生效）：

**方案 A：放行 Windows 防火墙 8081 端口（WiFi 调试，需管理员权限）**

```powershell
# 以管理员身份打开 PowerShell 执行（已放行过会报“规则已存在”，无碍）
netsh advfirewall firewall add rule name="Taro Metro 8081" dir=in action=allow protocol=TCP localport=8081
```

**方案 B：adb reverse（USB 调试，无需管理员、不依赖 WiFi，最稳）**

```powershell
# 手机 USB 连电脑并开启 USB 调试（开发者选项）后执行：
adb reverse tcp:8081 tcp:8081
# 执行后 APP 内把 Metro 地址填 localhost:8081 或重新扫码，USB 隧道直通电脑，绕过防火墙与路由器
```

验证连通：手机浏览器访问 `http://电脑IP:8081/status`，看到 `packager-status:running` 即通，重新扫码即可。

## 五、源码结构

```
src/
├── app.ts               # 应用入口（App 生命周期、全局样式引入）
├── app.config.ts        # 全局配置：页面注册、window、tabBar
├── app.scss             # 全局样式
├── index.html           # H5 端 HTML 模板
└── pages/index/         # 页面目录（组件/样式/配置三件套）
    ├── index.tsx
    ├── index.scss
    └── index.config.ts  # 页面级配置（navigationBarTitleText 等）
```

**新建页面**：`npm run new`（@tarojs/plugin-generator 交互式生成页面/组件），或在 `app.config.ts` 的 `pages` 数组注册路由后手动建目录。

## 六、多端差异处理

跨端逻辑用 `process.env.TARO_ENV` 判断（编译期替换，不会把其他端代码打进包）：

```tsx
if (process.env.TARO_ENV === 'weapp') {
  // 仅小程序端（如 wx.login）
} else if (process.env.TARO_ENV === 'h5') {
  // 仅 H5 端（如 window.location）
} else if (process.env.TARO_ENV === 'rn') {
  // 仅 App 端
}
```

文件级隔离：同名不同端的文件后缀（`index.weapp.tsx` / `index.h5.tsx` / `index.rn.tsx`）会被各端自动优先选取。API 一律用 `Taro.xxx`（`Taro.request`/`Taro.navigateTo` 等），框架自动映射到各端实现。

注意：小程序专属能力（微信支付、订阅消息等）与 H5/RN 能力（DOM 操作）没有对应实现，必须按端分支处理。

## 七、配置要点（本项目已调好的部分）

| 配置 | 位置 | 说明 |
|---|---|---|
| RN 产物输出 | `config/index.ts` → `rn.output` | bundle/sourcemap/资源直出壳工程 `native-shell/` 对应目录，**改壳工程路径时需同步改** |
| RN 注册名 | `config/index.ts` → `rn.appName` | `taroDemo`，必须与壳工程 `app.json` 及原生 moduleName 三处一致，否则 App 白屏 |
| 包管理行为 | `.npmrc` → `legacy-peer-deps=true` | 防止 npm 强制解析 Taro RN 包的全部 peer（会拉入整个 expo 全家桶），**勿删** |
| stylelint 版本 | `package.json` 锁 `16.4.0` | `stylelint-taro-rn@4.2.1` 依赖其内部模块路径，16.26+ 已移除该模块，**勿升级** |
| 小程序 AppID | `project.config.json` → `appid` | 当前 `touristappid` 占位（游客模式），正式开发需替换 |
| 小程序项目根 | `project.config.json` → `miniprogramRoot` | 指向 `./dist`，微信开发者工具导入**本仓库根目录**即可 |
| 环境变量 | `.env.development / .env.production / .env.test` | `TARO_APP_` 前缀变量，按 NODE_ENV 注入 |
| Android 正式签名 | 壳工程 `android/keystore.properties` + `app/release.keystore` | 已生成并接入 gradle，文件不入库（.gitignore 已防护），**务必备份** |
| 设计稿尺寸 | `config/index.ts` → `designWidth: 750` | 按 750 设计稿写 px，编译时自动转换 |

## 八、关键版本锁定关系

升级任何一处前先确认整条链路兼容：

```
Taro 4.2.1  ←→  react-native ^0.73.11  ←→  @react-native/metro-config 0.73.x
           ←→  metro-react-native-babel-preset 0.77.x
           ←→  壳工程分支 0.73.0（RN 0.73 线）
React 18   ←→  react-native 0.73（不支持 React 19）
```

Taro 大版本升级时，壳工程需换对应 RN 版本分支（官方仓库 taro-native-shell 按版本分分支）：从官方对应分支拉取新版代码覆盖 `native-shell/`，并同步升级 JS 工程 `@tarojs/*-rn` 全家桶版本。

## 九、代码规范

已内置：ESLint（eslint-config-taro + react hooks 规则）、Stylelint、Commitlint（conventional 提交规范）、Husky + lint-staged（提交时自动校验）。

提交信息格式：`feat: xxx` / `fix: xxx` / `docs: xxx` 等类型前缀，不合规提交会被拦截。

## 十、已知问题与注意事项

1. **Android 构建链路已实测跑通**（2026-08 验证：APK 39.5MB，签名有效）；首次构建的镜像加速与版本锁定坑点已写入 [PACKAGING.md](./PACKAGING.md)，构建前建议先读
2. **iOS 在 Windows 上无法构建**：需 Mac + Xcode，bundle 产出命令可用（`build:rn:ios`），但原生编译必须 macOS
3. **`metro.config.js` / `index.js` 是首次 RN 构建时 Taro 自动生成的**，已按需定制（merge Taro 默认配置），可提交入库
4. **改 `app.config.ts` 后 App 端不生效**：metro 缓存问题，`npm run dev:rn -- --reset-cache`
5. **H5 部署 history 路由**：默认 hash 模式免配置；切 `browser` 模式需在 `config/index.ts` 的 `h5.router.mode` 修改且服务器做 fallback

## 十一、相关文档

- 打包发布全流程（含 Android Studio 安装、签名、发布前检查清单）：[PACKAGING.md](./PACKAGING.md)
- Taro 官方文档：https://docs.taro.zone
- Taro Native Shell 壳工程：https://github.com/NervJS/taro-native-shell
- Taro Playground（App 扫码调试 APP）：https://github.com/wuba/taro-playground
