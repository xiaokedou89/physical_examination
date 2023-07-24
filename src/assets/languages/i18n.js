import { createI18n } from 'vue-i18n'
import messages from './index'

function getLang() {
  let lang = 'zh'
  if (sessionStorage.getItem('lang')) {
    lang = sessionStorage.getItem('lang')
  }
  return lang
}

const i18n = createI18n({
  messages,
  globalInjection: true,
  fallbackLocale: 'ch',
  legacy: false,
  locale: getLang()
})

export default i18n