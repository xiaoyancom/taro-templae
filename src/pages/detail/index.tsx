import { View, Text, Button } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import {
  parseQuery,
  navigateBack,
  formatDate,
  formatMoney,
  formatThousands,
  maskPhone,
  fromNow,
  isPhone,
  isEmail,
  on
} from '@/utils'
import './index.scss'

export default function Detail() {
  const [params, setParams] = useState<Record<string, string>>({})
  const [eventMsg, setEventMsg] = useState('')

  useLoad((query) => {
    // 接收首页跳转携带的参数
    setParams(parseQuery(query))
  })

  // 事件订阅演示（on 返回取消订阅函数，useEffect 卸载时自动清理）
  useEffect(() => {
    return on('cart:updated', (payload) => {
      setEventMsg(`收到 cart:updated 事件：数量=${payload.count}`)
    })
  }, [])

  return (
    <View className='detail'>
      <Text className='title'>详情页（工具库演示）</Text>
      <Text className='row'>路由参数：{JSON.stringify(params)}</Text>
      <Text className='row'>日期：{formatDate(Date.now())}</Text>
      <Text className='row'>金额：{formatMoney(1990)} 元</Text>
      <Text className='row'>千分位：{formatThousands(1234567)}</Text>
      <Text className='row'>手机号脱敏：{maskPhone('13812348000')}</Text>
      <Text className='row'>相对时间：{fromNow(Date.now() - 5 * 60 * 1000)}</Text>
      <Text className='row'>校验：手机号 {String(isPhone('13812348000'))} / 邮箱 {String(isEmail('a@b.com'))}</Text>
      <Text className='row event'>{eventMsg || '等待 cart:updated 事件…（回首页点第 4 个按钮）'}</Text>
      <Button className='btn' onClick={() => navigateBack()}>返回首页</Button>
    </View>
  )
}
