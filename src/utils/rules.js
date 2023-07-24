import i18n from '@/assets/languages/i18n.js'

const passwordReg = /^[^\u4e00-\u9fa5]/,
      passwordRegx = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{6,15}$/,
      min = 6,
      max = 15

// 自定义验证规则
export const verifyObj = {
  // 不许中文
  passwordReg: /^[^\u4e00-\u9fa5]/,
  min: 6,
  max: 15,
  // 手机号规则
  phone(rule, value, callback) {
    const mobile = /^[1][3,4,5,7,8][0-9]{9}$/
    if (!mobile.test(value)) {
      return callback(new Error(i18n.global.t('phoneRule')))
    } else {
      callback()
    }
  },
  unphone(rule, value, callback) {
    const mobile = /^[1][3,4,5,7,8][0-9]{9}$/
    if (value === '') {
      callback()
    } else if (!mobile.test(value)) {
      return callback(new Error(i18n.global.t('phoneRule')))
    } else {
      callback()
    }
  },
  // 密码验证规则
  password(rule, value, callback) {
    if (value == undefined || value == null || value == '') {
      return callback(new Error(i18n.global.t('noPasswordRule')))
    } else if (!passwordReg.test(value)) {
      return callback(new Error(i18n.global.t('zhPasswordRule')))
    } else if (value.length < min || value.length > max) {
      return callback(new Error(i18n.global.t('passwordRule')))
    } else {
      callback()
    }
  },
  unPassword(rule, value, callback) {
    if (value == undefined || value == null || value == '') {
      return callback(i18n.global.t('noPasswordRule'))
    } else if (value.length < 5) {
      return callback(new Error(i18n.global.t('lessPasswordRule')))
    } else {
      callback()
    }
  }
}

export const requiredRule = [
  { required: true, message: i18n.global.t('requiredRule'), trigger: ['blur', 'change']}
]

// 账号名规则 --- 必填
export const accountnameRule = [
  { required: true, message: i18n.global.t('accountRule'), trigger: ['blur', 'change'] },
  { min: 4, max: 20, message: i18n.global.t('accountLenthRule'), trigger: ['blur', 'change'] }
]

// 账号名选填
export const unaccountnameRule = [
  { min: 6, max: 15, message: i18n.global.t('unAccountLength'), trigger: ['blur', 'change'] }
]

export const nameRule = [
  { required: true, message: i18n.global.t('nameRule'), trigger: ['blur', 'change'] },
  { min: 2, max: 15, message: i18n.global.t('nameLength'), trigger: ['blur', 'change']}
]

export const unnameRule = [
  { min: 2, max:15, message: i18n.global.t('nameLength'), trigger: ['blur', 'change']}
]

// 手机号
export const phoneRule = [
  { required: true, message: i18n.global.t('phoneRequired'), trigger: ['blur', 'change'] },
  { validator: verifyObj.phone, trigger: ['blur', 'change'] }
]

export const upphoneRule = [
  { validator: verifyObj.phone, trigger: ['blur', 'change'] }
]

export const unphoneRule = [
  { validator: verifyObj.unphone, trigger: ['blur', 'change'] }
]

export const emailRules = [
  { type: 'email', message: i18n.global.t('emailRule'), trigger: ['blur', 'change'] }
]

// 密码
export const passwordRule = [
  { required: true, validator: verifyObj.password, trigger: 'blur' },
  { pattern: passwordRegx, message: i18n.global.t('passwordRule'), trigger: ['blur', 'change'] }
]