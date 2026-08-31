import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import * as path from 'path'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import devConfig from './dev'
import prodConfig from './prod'

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(async (merge) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'Taro-templae',
    date: '2026-8-25',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [
      "@tarojs/plugin-generator"
    ],
    defineConstants: {
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'react',
    compiler: {
      type: 'webpack5',
      prebundle: {
        // 微信端排除 NutUI：其内部 icons 包入口 import 了 style_icon.css，
        // prebundle 会把这段 CSS 抽成 .wxss chunk，导致 dist/app.js 生成
        // require("./prebundle/xxx.wxss")，微信开发者工具解析为 xxx.wxss.js
        // 模块不存在，报 "module ... is not defined"（Taro 已知缺陷）。
        // 排除后 NutUI 走常规 webpack 编译（babel-plugin-import 按需引入样式不受影响）。
        // H5 端 prebundle 正常（CSS 走 link 注入，无此问题），仅微信端排除。
        exclude: process.env.TARO_ENV === 'weapp'
          ? ['@nutui/nutui-react-taro', '@nutui/icons-react-taro']
          : []
      }
    },
    // 生产打包关闭 source map（安全要求：map 会泄露源码），开发模式保留便于调试
    sourceMap: process.env.NODE_ENV !== 'production',
    // 全局注入 NutUI SCSS 变量（组件样式依赖），也支持自定义主题覆盖
    sass: {
      // 用 @use 而非 @import，避免 Dart Sass 废弃警告刷屏
      data: '@use "@nutui/nutui-react-taro/dist/styles/variables.scss" as *;'
    },
    cache: {
      enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    mini: {
      // sass-loader 附加配置：静默 NutUI 组件内部 scss 的 @import 废弃警告（Dart Sass 3.0 才移除 @import）
      // 注意：必须放在平台配置内，Taro 会展开到顶层（顶层直接配会被 getConfigWithNamed 白名单过滤）
      sassLoaderOption: {
        sassOptions: {
          silenceDeprecations: ['legacy-js-api', 'import']
        }
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {
            // NutUI 组件样式基于 375 设计稿 px，按文件路径排除，避免被 px→rpx 缩放
            // 注意：不能用 selectorBlackList（'nut-'）——它会连 rpx→rem 转换一起跳过，
            // 导致业务样式里含 nut- 类名的 rpx 值失效（浏览器不认识 rpx）
            exclude: (from) => from.includes('@nutui'),
            // 保护 app.scss 定制块（:root/page 上的 CSS 变量），变量值 px 不转换
            selectorBlackList: [':root', 'page']
          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      }
    },
    h5: {
      // sass-loader 附加配置（H5 端同样需要静默 @import 警告）
      sassLoaderOption: {
        sassOptions: {
          silenceDeprecations: ['legacy-js-api', 'import']
        }
      },
      publicPath: '/',
      staticDirectory: 'static',
      // 让 webpack 直接编译 NutUI 的 ESM 源码
      esnextModules: ['@nutui/nutui-react-taro'],
      output: {
        filename: 'js/[name].[contenthash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[contenthash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {
            // 与 mini 端一致：按文件排除 NutUI 组件样式，保留业务 rpx 正常转换
            exclude: (from) => from.includes('@nutui'),
            // 保护 app.scss 定制块（:root/page 上的 CSS 变量），变量值 px 不转换
            selectorBlackList: [':root', 'page']
          }
        },
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        if (process.env.NODE_ENV === 'production') {
          // 生产环境关闭 H5 source map，避免 .map 文件随部署物泄露源码
          chain.devtool(false)
        }
      }
    },
    rn: {
      appName: 'taroDemo',
      // RN 端 Metro 不读 tsconfig paths，需在此声明 @/ 别名
      // （mini/h5 端走 webpack 的 TsconfigPathsPlugin，不受影响）
      alias: {
        '@': path.resolve(__dirname, '..', 'src')
      },
      // 分离模式：将 bundle 与静态资源输出到壳工程（Taro Native Shell）对应目录
      // 壳工程位于本仓库内 native-shell/
      output: {
        iosSourceMapUrl: '',
        iosSourcemapOutput: 'native-shell/ios/main.map',
        iosSourcemapSourcesRoot: '',
        androidSourceMapUrl: '',
        androidSourcemapOutput: 'native-shell/android/app/src/main/assets/index.android.map',
        androidSourcemapSourcesRoot: '',
        ios: 'native-shell/ios/main.jsbundle',
        iosAssetsDest: 'native-shell/ios',
        android: 'native-shell/android/app/src/main/assets/index.android.bundle',
        androidAssetsDest: 'native-shell/android/app/src/main/res'
      },
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    }
  }


  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
