import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Textarea } from '@tarojs/components'
import { useMemo, useState } from 'react'
import Icon from '@/components/icon'
import './index.scss'

/**
 * AI 聊天页（参照 DeepSeek 移动端 1:1 复刻）
 * - 样式/图标/色板均提取自 DeepSeek 官方页面实测值
 * - 首页欢迎态：logo + 模式胶囊（快速/专家/识图）+ 输入区
 * - 聊天态：顶部导航 + 消息流 + 输入区 + 免责声明
 * - 历史抽屉：左侧滑出会话列表（汉堡按钮打开）
 * - 当前为本地模拟对话，接入真实接口时替换 send 方法即可
 */

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  /** AI 消息：已阅读网页数（模拟引用来源） */
  pages?: number
}

interface SessionItem {
  id: number
  title: string
  date: string
  messages: ChatMessage[]
}

const MODES = [
  { key: 'quick', label: '快速模式', icon: 'quick' },
  { key: 'expert', label: '专家模式', icon: 'expert' },
  { key: 'vision', label: '识图模式', icon: 'vision' }
] as const

type ModeKey = (typeof MODES)[number]['key']

const AI_REPLIES = [
  '这是一个很好的问题。从目前掌握的信息来看，需要结合具体场景来分析：\n\n1. 明确核心诉求，拆解成可执行的小步骤\n2. 对比现有方案的优缺点\n3. 小范围验证后再推广\n\n如果需要更详细的建议，可以补充说明你的实际场景。',
  '我理解你的需求了。推荐的做法是：\n\n• 先梳理流程，找到最耗时的环节\n• 用自动化脚本或工具替代重复操作\n• 建立反馈机制持续优化\n\n按照这个思路，通常能显著提升效率。',
  '关于这个问题，可以从两个层面看：\n\n**方案层面**：现有成熟方案有 A、B、C 三种，A 适合轻量场景，B 适合高并发，C 是折中方案。\n\n**落地层面**：建议先做最小可行验证，确认效果后再全面铺开，避免资源浪费。'
]

/** 模拟会话数据（参照真实使用场景） */
const SESSIONS: SessionItem[] = [
  {
    id: 1,
    title: 'AI 中台技术选型',
    date: '2026-08',
    messages: [
      { id: 1, role: 'user', content: 'AI 中台技术选型有什么建议？' },
      { id: 2, role: 'assistant', content: 'AI 中台建议从模型接入、任务编排、成本控制三个维度选型：\n\n1. 模型接入层：优先选兼容 OpenAI 协议的网关，切换模型零成本\n2. 任务编排：用工作流引擎串联「意图识别→检索→生成」\n3. 成本控制：按场景分配模型档位，简单任务走轻量模型', pages: 8 }
    ]
  },
  {
    id: 2,
    title: '封装常用工具库',
    date: '2026-08',
    messages: [
      { id: 1, role: 'user', content: '项目里的工具函数怎么组织比较合理？' },
      { id: 2, role: 'assistant', content: '建议按职责拆分模块，统一出口导出：\n\n• navigate / storage / request 这类基础设施\n• format / validate 这类纯函数\n• platform 环境判断单独成模块\n\n保持每个文件职责单一，通过 index.ts 统一对外，调用方无需关心内部结构。', pages: 5 }
    ]
  },
  {
    id: 3,
    title: '多端兼容踩坑记录',
    date: '2026-07',
    messages: [
      { id: 1, role: 'user', content: 'Taro 多端开发有哪些常见坑？' },
      { id: 2, role: 'assistant', content: '高频坑位集中在三处：\n\n1. 样式：小程序不支持部分 CSS 选择器，避免通配符和复杂后代选择器\n2. API 差异：storage、导航等能力各端实现不同，统一封装一层\n3. 环境变量：process.env 在部分端需编译期注入，不要在运行时读取', pages: 12 }
    ]
  }
]

let msgId = 100

export default function Chat() {
  const [mode, setMode] = useState<ModeKey>('quick')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [deepThink, setDeepThink] = useState(false)
  const [smartSearch, setSmartSearch] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [sessions] = useState(SESSIONS)
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
  const [sending, setSending] = useState(false)

  const statusBarHeight = useMemo(() => {
    try {
      return Taro.getSystemInfoSync().statusBarHeight || 0
    } catch {
      return 0
    }
  }, [])

  const modeLabel = MODES.find((m) => m.key === mode)?.label ?? '快速模式'

  /** 发送消息：追加用户消息，延迟模拟 AI 回复 */
  const send = () => {
    const text = input.trim()
    if (!text || sending) return
    const userMsg: ChatMessage = { id: ++msgId, role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setSending(true)

    // 模拟 AI 回复（接入真实接口时替换为请求调用）
    setTimeout(() => {
      const reply: ChatMessage = {
        id: ++msgId,
        role: 'assistant',
        content: AI_REPLIES[(++msgId) % AI_REPLIES.length],
        pages: Math.floor(Math.random() * 10) + 3
      }
      setMessages([...nextMessages, reply])
      setSending(false)
    }, 1200)
  }

  /** 新建会话：清空消息回欢迎态 */
  const newChat = () => {
    setMessages([])
    setActiveSessionId(null)
    setShowHistory(false)
  }

  /** 打开历史会话 */
  const openSession = (session: SessionItem) => {
    setMessages(session.messages.map((m) => ({ ...m })))
    setActiveSessionId(session.id)
    setShowHistory(false)
  }

  /** 首页模式胶囊点击 */
  const switchMode = (key: ModeKey) => {
    setMode(key)
  }

  return (
    <View className='chat-page'>
      {/* 顶部导航（自定义导航，兼容状态栏高度） */}
      <View className='chat-nav' style={{ paddingTop: `${statusBarHeight}px` }}>
        <View className='nav-left'>
          <View className='nav-icon-btn' onClick={() => setShowHistory(true)}>
            <Icon name='menu' size={44} color='#0F1115' />
          </View>
          {messages.length > 0 && (
            <Text className='nav-title'>{activeSessionId ? sessions.find((s) => s.id === activeSessionId)?.title : 'AI 助手'}</Text>
          )}
        </View>
        <View className='nav-right'>
          <View className='nav-icon-btn' onClick={newChat}>
            <Icon name='plus' size={44} color='#0F1115' />
          </View>
        </View>
      </View>

      {/* 消息区 / 欢迎态 */}
      {messages.length === 0 ? (
        <View className='welcome'>
          <View className='welcome-head'>
            <Icon name='logo' size={56} color='#3964FE' />
            <Text className='welcome-title'>使用{modeLabel}开始对话</Text>
          </View>
          <View className='mode-group'>
            {MODES.map((m) => (
              <View
                key={m.key}
                className={`mode-item ${mode === m.key ? 'active' : ''}`}
                onClick={() => switchMode(m.key)}
              >
                <Icon name={m.icon} size={28} color={mode === m.key ? '#3964FE' : '#0F1115'} />
                <Text>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <ScrollView className='chat-body' scrollY scrollIntoView={`msg-${messages[messages.length - 1].id}`}>
          <View className='msg-list'>
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <View key={msg.id} className='msg-item msg-user'>
                  <View className='bubble'>{msg.content}</View>
                </View>
              ) : (
                <View key={msg.id} id={`msg-${msg.id}`} className='msg-item msg-ai'>
                  <View className='ai-header'>
                    <Icon name='search' size={26} color='#61666B' />
                    <Text>已阅读 {msg.pages} 个网页</Text>
                    {deepThink && <Text className='ai-pages'>深度思考</Text>}
                  </View>
                  <Text className='ai-content'>{msg.content}</Text>
                  <View className='ai-actions'>
                    <View className='act-item'>
                      <Icon name='share' size={32} color='#8A9099' />
                    </View>
                    <View className='act-item'>
                      <Icon name='refresh' size={32} color='#8A9099' />
                    </View>
                    <View className='act-item'>
                      <Icon name='thumbsUp' size={32} color='#8A9099' />
                    </View>
                    <View className='act-item'>
                      <Icon name='thumbsDown' size={32} color='#8A9099' />
                    </View>
                    <View className='act-item'>
                      <Icon name='dots' size={32} color='#8A9099' />
                    </View>
                    <View className='act-pages'>{msg.pages} 个网页</View>
                  </View>
                </View>
              )
            )}
          </View>
        </ScrollView>
      )}

      {/* 底部输入区（开关胶囊在输入框内部左侧，对齐真实 DeepSeek） */}
      <View className='chat-footer'>
        <View className='composer'>
          <View className={`comp-toggle ${deepThink ? 'on' : ''}`} onClick={() => setDeepThink(!deepThink)}>
            <Icon name='deep' size={28} color={deepThink ? '#3964FE' : '#61666B'} />
            <Text>深度思考</Text>
          </View>
          <View className={`comp-toggle ${smartSearch ? 'on' : ''}`} onClick={() => setSmartSearch(!smartSearch)}>
            <Icon name='search' size={28} color={smartSearch ? '#3964FE' : '#61666B'} />
            <Text>智能搜索</Text>
          </View>
          <Textarea
            className='input-textarea'
            value={input}
            placeholder='给 DeepSeek 发送消息'
            placeholderStyle='color: #A6ABB1'
            autoHeight
            maxlength={2000}
            onInput={(e) => setInput(e.detail.value)}
            onConfirm={send}
            confirmType='send'
          />
          <View className='attach-btn' onClick={() => Taro.showToast({ title: '附件功能待接入', icon: 'none' })}>
            <Icon name='attach' size={40} color='#61666B' />
          </View>
          <View className='send-btn' onClick={send}>
            <Icon name='send' size={34} color='#FFFFFF' />
          </View>
        </View>
        <Text className='disclaimer'>内容由 AI 生成，请仔细甄别</Text>
      </View>

      {/* 历史会话抽屉 */}
      {showHistory && (
        <View className='drawer-mask' onClick={() => setShowHistory(false)} />
      )}
      {showHistory && (
        <View className='drawer'>
          <View className='drawer-header'>
            <View className='drawer-logo'>
              <Icon name='logo' size={40} color='#3964FE' />
              <Text>deepseek</Text>
            </View>
            <View className='drawer-tools'>
              <View className='tool'>
                <Icon name='search' size={36} color='#61666B' />
              </View>
              <View className='tool'>
                <Icon name='grid' size={36} color='#61666B' />
              </View>
            </View>
          </View>
          <View className='new-chat-btn' onClick={newChat}>
            <Icon name='plus' size={34} color='#3964FE' />
            <Text>开启新对话</Text>
          </View>
          <ScrollView className='drawer-list' scrollY>
            <Text className='group'>30 天内</Text>
            {sessions.map((s) => (
              <View
                key={s.id}
                className={`session-item ${activeSessionId === s.id ? 'active' : ''}`}
                onClick={() => openSession(s)}
              >
                <Text className='session-title'>{s.title}</Text>
              </View>
            ))}
          </ScrollView>
          <View className='drawer-user'>
            <View className='avatar'>Y</View>
            <Text className='user-email'>y****2@yeah.net</Text>
            <View className='more'>
              <Icon name='dots' size={36} color='#8A9099' />
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
