import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
// UI 组件统一从分发层取（微信/H5 端透传 NutUI，RN 端用基础组件实现）。
// 用深路径按需引入：避免 barrel 全量导出把未使用的组件打进 dev 包
// （生产模式 webpack tree-shaking 会自动剔除，两种写法产物一致）
import Button from '@/components/ui/Button'
import Cell from '@/components/ui/Cell'
import Toast from '@/components/ui/Toast'
import './index.scss'

/**
 * NutUI React Taro 3.x 组件演示页（精简版）
 * - 展示 @nutui/nutui-react-taro 3.0.20 的 Button / Cell 两个基础组件用法
 * - 参考：https://nutui.jd.com/taro/react/3x/#/zh-CN/component/
 */
export default function NutuiDemo() {
  const [loading, setLoading] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  const handleCellClick = (title: string) => {
    Taro.showToast({ title: `点击了「${title}」`, icon: 'none' })
  }

  const showToast = () => {
    setToastVisible(true)
  }

  return (
    <View className='nutui-demo'>
      <View className='demo-header'>
        <Text className='demo-header-title'>NutUI React Taro</Text>
        <Text className='demo-header-sub'>@nutui/nutui-react-taro 3.0.20 组件演示</Text>
      </View>

      {/* 按钮 Button */}
      <View className='demo-section-title'>按钮 Button</View>
      <View className='demo-card'>
        <View className='demo-row'>
          <Button type='primary'>主要按钮</Button>
          <Button type='success'>成功按钮</Button>
        </View>
        <View className='demo-row'>
          <Button type='danger'>危险按钮</Button>
          <Button type='warning'>警告按钮</Button>
        </View>
        <View className='demo-row'>
          <Button plain type='primary'>幽灵按钮</Button>
          <Button disabled type='primary'>禁用按钮</Button>
        </View>
        <View className='demo-row'>
          <Button loading={loading} type='primary' onClick={() => setLoading(!loading)}>
            切换 loading
          </Button>
          <Button shape='round' type='primary' onClick={showToast}>
            弹出 Toast
          </Button>
        </View>
        <View className='demo-row'>
          <Button block type='primary'>通栏按钮</Button>
        </View>
      </View>

      {/* 单元格 Cell */}
      <View className='demo-section-title'>单元格 Cell</View>
      <View className='demo-card'>
        <Cell.Group>
          <Cell title='单元格' description='描述文字' />
          <Cell title='带描述' description='支持 description 与 extra 扩展' extra='描述文字' />
          <Cell title='点击测试' clickable extra='›' onClick={() => handleCellClick('点击测试')} />
        </Cell.Group>
      </View>

      <Toast content='NutUI 3.x 演示' visible={toastVisible} onClose={() => setToastVisible(false)} />
    </View>
  )
}
