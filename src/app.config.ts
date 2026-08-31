// 是否生产构建
const isProd = process.env.NODE_ENV === 'production'

export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/detail/index',
    'pages/chat/index',
    'pages/nutui-demo/index'
  ],
  // 组件功能冒烟测试页：独立分包（分包体积独立计算，不占主包 2M 限额），
  // 仅开发模式（watch 调试）注册，生产构建（NODE_ENV=production）自动移除
  ...(isProd ? {} : {
    subPackages: [
      {
        root: 'pages-sub',
        pages: ['ui-test/index']
      }
    ]
  }),
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
})
