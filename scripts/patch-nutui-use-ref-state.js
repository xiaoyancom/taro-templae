// NutUI useRefState 稳定化补丁（幂等）
// 问题：updateState 每次渲染创建新函数 → Swipe 的 setActionWidth(useCallback 依赖 updateState) 每次渲染新
//      → useLayoutEffect([leftId, rightId, setActionWidth]) 依赖每次渲染变化 → 反复测量 → setState → 无限渲染循环
// 修复：updateState 用 useCallback([], ) 稳定化（setState 与 ref 均稳定，行为不变，仅消除引用变化）
// 用法: node scripts/patch-nutui-use-ref-state.js
const fs = require('fs')
const path = require('path')

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@nutui',
  'nutui-react-taro',
  'dist',
  'es',
  'hooks',
  'use-ref-state.js'
)

if (!fs.existsSync(target)) {
  console.error('NOT FOUND:', target)
  process.exit(1)
}

let src = fs.readFileSync(target, 'utf8')
let changed = false

// 1) import 行加 useCallback
const importFrom = 'import { useRef, useState } from "react";'
const importTo = 'import { useRef, useState, useCallback } from "react";'
if (src.includes(importFrom)) {
  src = src.replace(importFrom, importTo)
  changed = true
}

// 2) updateState 定义稳定化（两种写法都处理）
const plainFn = 'var updateState = function(p) {\n        ref.current = p;\n        setState(p);\n    };'
const stableFn = 'var updateState = useCallback(function(p) {\n        ref.current = p;\n        setState(p);\n    }, []);'
if (src.includes(plainFn)) {
  src = src.replace(plainFn, stableFn)
  changed = true
}

fs.writeFileSync(target, src, 'utf8')
if (changed) {
  console.log('useRefState 稳定化补丁已应用:', target)
} else {
  console.log('useRefState 补丁已存在或格式不匹配，跳过')
}
