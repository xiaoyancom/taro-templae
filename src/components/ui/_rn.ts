// RN 专属实现文件（_impl/*.tsx、index.rn.tsx）专用的组件包装：
// 类型放宽为 any，允许直接使用 RN 风格样式（paddingHorizontal、style 数组等），
// 运行时仍是 @tarojs/components 组件（RN 端由 components-rn 实现）。
// 仅被 .rn 编译链引用，不会进入微信/H5 产物。
import * as TaroComponents from '@tarojs/components'

export const View: any = TaroComponents.View
export const Text: any = TaroComponents.Text
export const Image: any = TaroComponents.Image
export const Video: any = TaroComponents.Video
export const Input: any = TaroComponents.Input
export const Textarea: any = TaroComponents.Textarea
export const TaroImage: any = TaroComponents.Image
export const TaroVideo: any = TaroComponents.Video
