import { View, Text, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import {
  navigateTo,
  setStorage,
  getStorage,
  showLoading,
  hideLoading,
  toast,
  toastSuccess,
  emit,
  sleep,
  isWeapp,
  isH5,
  isRN
} from '@/utils'
import './index.scss'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.')
  })

  const [stored, setStored] = useState('')

  // 演示：类型安全跳转（路径/参数写错编译期即报错）
  const goDetail = () => {
    navigateTo('/pages/detail/index', { id: '1001', name: '张三' })
  }

  // 演示：进入 AI 聊天页（DeepSeek 风格）
  const goChat = () => {
    navigateTo('/pages/chat/index')
  }

  // 演示：进入 NutUI 组件演示页
  const goNutui = () => {
    navigateTo('/pages/nutui-demo/index')
  }

  // 演示：存储读写 + 60s 过期
  const demoStorage = () => {
    setStorage('demo_user', { name: '张三', age: 18 }, 60 * 1000)
    const user = getStorage<{ name: string; age: number }>('demo_user')
    setStored(user ? `姓名=${user.name}，年龄=${user.age}` : '读取失败')
    toastSuccess('已写入并读取')
  }

  // 演示：loading 计数配对 + toast
  const demoLoading = async () => {
    showLoading()
    await sleep(800)
    hideLoading()
    toast('加载完成')
  }

  // 演示：事件总线发布（详情页订阅了该事件）
  const demoEvent = () => {
    emit('cart:updated', { count: 3 })
    toast('已发布 cart:updated 事件')
  }

  return (
    <View className='index'>
      <Text className='env'>
        当前环境：{isWeapp ? '微信小程序' : isH5 ? 'H5' : isRN ? 'App' : '未知'}
      </Text>
      <Button className='btn' onClick={goDetail}>1. 跳转详情页（带参）</Button>
      <Button className='btn' onClick={goChat}>2. 进入 AI 聊天页</Button>
      <Button className='btn' onClick={goNutui}>3. NutUI 组件演示</Button>
      <Button className='btn' onClick={demoStorage}>4. 存储读写（60s 过期）</Button>
      <Button className='btn' onClick={demoLoading}>5. loading + toast</Button>
      <Button className='btn' onClick={demoEvent}>6. 发布事件（详情页接收）</Button>
      {stored ? <Text className='result'>存储读取：{stored}</Text> : null}
    </View>
  )
}
