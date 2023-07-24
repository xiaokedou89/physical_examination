import i18n from '../assets/languages/i18n.js'
// 网络相关配置
export const network = {
  
  globalURL: import.meta.env.VITE_BASE_API,
  // 文件上传拼接路径
  fileUploadURL: 'file/upload/',
  timeout: 15000,
  // 图片和视频的上传限制大小
  staticMaxSize: 500 * 1024 * 1024,
  // 静态资源超时设定
  staticTimeout: 2 * 60 * 1000,
  // 获取资源文件拼接路径
  getFile(type) {
    return `/file/${type}/?filename=`
  },
  getFiles(type) {
    return `file/${type}/?filename=`
  },
  // 静态上传资源拼接路径
  uploadFileURL(type) {
    return `/api/file/upload/${type}`
  }
}

// 默认分页显示条数
export let size = 5;

// 筛选订单状态
export function orderStatus(status) {
  let name = ''
  switch (status){
    case 10: 
      name = i18n.global.t('invalidOrder')
      break
    case 20: 
      name = i18n.global.t('payingOrder')
      break
    case 30: 
      name = i18n.global.t('makingOrder')
      break
    case 40: 
      name = i18n.global.t('finishedOrder')
      break
    case 50: 
      name = i18n.global.t('refundedOrder')
      break
    case 60: 
      name = i18n.global.t('closedOrder')
      break
  }
  return name
}

// 订单状态筛选框数组
export const orderStatusArr = [
  {
    value: -1,
    label: i18n.global.t('allOrder')
  },
  {
    value: 10,
    label: i18n.global.t('invalidOrder')
  },
  {
    value: 20,
    label: i18n.global.t('payingOrder')
  },
  {
    value: 30,
    label: i18n.global.t('makingOrder')
  },
  {
    value: 40,
    label: i18n.global.t('finishedOrder')
  },
  {
    value: 50,
    label: i18n.global.t('refundedOrder')
  },
  {
    value: 60,
    label: i18n.global.t('closedOrder')
  }
]

// 腾讯云获取模型用
export const modelUrl = 'https://model-1304836373.cos.ap-guangzhou.myqcloud.com/'
export const tencentCloudUrl = 'https://png-1304836373.cos.ap-guangzhou.myqcloud.com/'
// 上传模型
export const fileAddresses = 'https://medical.ll3d.com/prod-api/order/record/upload'