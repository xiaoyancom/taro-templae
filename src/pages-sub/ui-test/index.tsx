import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
// UI 分发层全组件功能冒烟测试页（三端共用）
import Button from '@/components/ui/Button'
import Cell from '@/components/ui/Cell'
import CellGroup from '@/components/ui/CellGroup'
import Toast from '@/components/ui/Toast'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import InputNumber from '@/components/ui/InputNumber'
import Switch from '@/components/ui/Switch'
import CheckboxGroup from '@/components/ui/CheckboxGroup'
import RadioGroup from '@/components/ui/RadioGroup'
import Range from '@/components/ui/Range'
import SearchBar from '@/components/ui/SearchBar'
import Segmented from '@/components/ui/Segmented'
import Tag from '@/components/ui/Tag'
import Badge from '@/components/ui/Badge'
import Divider from '@/components/ui/Divider'
import Progress from '@/components/ui/Progress'
import CircleProgress from '@/components/ui/CircleProgress'
import Avatar from '@/components/ui/Avatar'
import AvatarGroup from '@/components/ui/AvatarGroup'
import Price from '@/components/ui/Price'
import Rate from '@/components/ui/Rate'
import Skeleton from '@/components/ui/Skeleton'
import Loading from '@/components/ui/Loading'
import NoticeBar from '@/components/ui/NoticeBar'
import Steps from '@/components/ui/Steps'
import Step from '@/components/ui/Step'
import Card from '@/components/ui/Card'
import Collapse from '@/components/ui/Collapse'
import CollapseItem from '@/components/ui/CollapseItem'
import Tabs from '@/components/ui/Tabs'
import TabPane from '@/components/ui/TabPane'
import NavBar from '@/components/ui/NavBar'
import CalendarCard from '@/components/ui/CalendarCard'
import ResultPage from '@/components/ui/ResultPage'
import Grid from '@/components/ui/Grid'
import GridItem from '@/components/ui/GridItem'
import Uploader from '@/components/ui/Uploader'
import './index.scss'

// 以下组件跨端 props 命名存在差异（RN 端为自定义实现），冒烟页放宽类型
const RangeX = Range as any
const StepsX = Steps as any
const TabsX = Tabs as any
const CircleProgressX = CircleProgress as any
const AvatarX = Avatar as any
const CheckboxGroupX = CheckboxGroup as any
const RadioGroupX = RadioGroup as any
const NoticeBarX = NoticeBar as any
const SkeletonX = Skeleton as any
const GridX = Grid as any
const CalendarCardX = CalendarCard as any
const UploaderX = Uploader as any
const ResultPageX = ResultPage as any
const DialogX = Dialog as any

const Group = ({ title, children }: { title: string; children?: any }) => (
  <View className='ut-group'>
    <Text className='ut-title'>{title}</Text>
    <View className='ut-body'>{children}</View>
  </View>
)

export default function UiTest() {
  const [input, setInput] = useState('')
  const [num, setNum] = useState(3)
  const [sw, setSw] = useState(true)
  const [checks, setChecks] = useState<string[]>(['a'])
  const [radio, setRadio] = useState('b')
  const [rate, setRate] = useState(4)
  const [range, setRange] = useState(30)
  const [seg, setSeg] = useState(0)
  const [toast, setToast] = useState(false)
  const [dialog, setDialog] = useState(false)
  const [tab, setTab] = useState(0)
  const [date, setDate] = useState('')
  const [files, setFiles] = useState<any[]>([])

  return (
    <View className='ut-page'>
      <NavBar title='UI 分发层组件测试' right='v1' />

      <Group title='Button / Tag / Badge / Price / Rate'>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button type='primary'>主要</Button>
          <Button type='success'>成功</Button>
          <Button plain type='primary'>幽灵</Button>
          <Tag type='primary'>标签</Tag>
          <Badge value={9}><View style={{ width: 40, height: 20 }} /></Badge>
          <Price price={199} />
          <Rate value={rate} onChange={setRate} />
        </View>
      </Group>

      <Group title='Cell 列表'>
        <CellGroup title='单元格'>
          <Cell title='标题' description='描述文字' />
          <Cell title='带 extra' extra='›' clickable onClick={() => Taro.showToast({ title: '点击', icon: 'none' })} />
        </CellGroup>
      </Group>

      <Group title='表单输入'>
        <Input value={input} placeholder='请输入' onChange={setInput} />
        <TextArea value={input} placeholder='多行输入' onChange={setInput} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <InputNumber value={num} onChange={(v: any) => setNum(Number(v))} />
          <Switch checked={sw} onChange={(v: any) => setSw(v)} />
        </View>
        <CheckboxGroupX value={checks} options={['a', 'b', 'c']} onChange={setChecks} />
        <RadioGroupX value={radio} options={['a', 'b', 'c']} onChange={setRadio} />
        <RangeX modelValue={range} onChange={setRange} />
        <SearchBar value={input} onChange={setInput} />
        <Segmented value={seg} options={['A', 'B', 'C']} onChange={(v: any) => setSeg(Number(v))} />
      </Group>

      <Group title='反馈弹层'>
        <View style={{ flexDirection: 'row' }}>
          <Button type='primary' onClick={() => setToast(true)}>Toast</Button>
          <Button type='danger' onClick={() => setDialog(true)}>Dialog</Button>
        </View>
        <NoticeBarX text='这是一条通告栏消息 NoticeBar' />
        <Loading>加载中</Loading>
        <SkeletonX rows={2} />
      </Group>

      <Group title='数据展示'>
        <Progress percent={60} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CircleProgressX percent={72} size={60} />
          <View style={{ marginLeft: 12 }}>
            <AvatarX src='' size={36}>A</AvatarX>
            <AvatarGroup><AvatarX size={28} /></AvatarGroup>
          </View>
        </View>
        <Divider content='分割线' />
        <StepsX current={1}>
          <Step title='第一步' />
          <Step title='第二步' />
          <Step title='第三步' />
        </StepsX>
        <Card title='卡片标题' content='卡片内容描述' />
      </Group>

      <Group title='导航'>
        <TabsX value={tab} list={['标签一', '标签二']} onClickTab={(i: any) => setTab(Number(i))}>
          <TabPane>标签一内容</TabPane>
          <TabPane>标签二内容</TabPane>
        </TabsX>
        <Collapse>
          <CollapseItem title='折叠面板'>面板内容</CollapseItem>
        </Collapse>
        <GridX columnNum={3}>
          <GridItem text='格子一' />
          <GridItem text='格子二' />
          <GridItem text='格子三' />
        </GridX>
      </Group>

      <Group title='选择器'>
        <CalendarCardX modelValue={date} onChange={setDate} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <UploaderX fileList={files} maxCount={3} onChange={setFiles} />
        </View>
      </Group>

      <ResultPageX type='success' title='全组件渲染通过' description='若无红屏说明分发层功能正常' />

      <Toast content='Toast 弹出成功' visible={toast} onClose={() => setToast(false)} />
      <DialogX
        visible={dialog}
        title='对话框'
        content='Dialog 分发层功能测试'
        onOk={() => { setDialog(false); Taro.showToast({ title: '已确认', icon: 'none' }) }}
        onClose={() => setDialog(false)}
      />
    </View>
  )
}
