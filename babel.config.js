// babel-preset-taro 更多选项和默认值：
// https://docs.taro.zone/docs/next/babel-config
module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: true,
      compiler: 'webpack5',
      // 真机兼容：老款手机 JS 内核（iOS < 13.4 / 老安卓 X5）不支持
      // ?? 与 ?. 等 ES2020 语法，默认 targets 会保留这些语法导致真机报
      // SyntaxError: Unexpected token ?。显式降级编译目标，让 babel
      // 把新语法转译为 ES5（三端产物通用，无副作用）。
      targets: { ios: '10', android: '6', chrome: '60' }
    }]
  ],
  plugins: [
    // NutUI React Taro 按需引入（样式自动加载）
    // 3.x 起包结构从 dist/esm 调整为 dist/es/packages，且组件目录为全小写拼接（datepicker/calendarcard），
    // 用 customName/customStyleName 转小写，避免 Windows 大小写不敏感 FS 下的重复模块警告
    ['import', {
      libraryName: '@nutui/nutui-react-taro',
      customName: (name) => `@nutui/nutui-react-taro/dist/es/packages/${name.toLowerCase()}`,
      // 样式导入用 style 函数而非 customStyleName：后者返回空串仍会生成
      // `import ''`（webpack 忽略但 Metro 报 Unable to resolve module ''），
      // 前者返回空值才会真正跳过（见 babel-plugin-import Plugin.js）。
      // 跳过条件：
      // 1. 工具函数/hooks（pxtransform、useXxx）无对应样式文件；
      // 2. RN 端整体跳过 NutUI 样式——NutUI 官方不支持 RN，其样式依赖
      //    伪类/CSS 变量/translate 百分比等 RN StyleSheet 无法表达的语法，
      //    强行编译直接炸 bundle。RN 端组件先渲染为无样式裸组件，
      //    后续由 src/components/ui 分发层补齐。
      // 注意：此回调运行于 Metro worker（Taro 已设置 TARO_ENV=rn），微信/H5 端走 webpack 不受影响。
      style: (path) => {
        const name = path.split('/').pop().toLowerCase()
        if (/^(pxtransform|use)/.test(name) || process.env.TARO_ENV === 'rn') return ''
        return `@nutui/nutui-react-taro/dist/es/packages/${name}/style`
      },
      camel2DashComponentName: false
    }, 'nutui-react-taro']
  ]
}
