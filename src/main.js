import { createApp } from 'vue'
import elementPlus from 'element-plus'
import zh from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import store from './store/index'
import i18n from './assets/languages/i18n'
import 'normalize.css/normalize.css'
import '@/styles/index.scss'

const elementPlusLang = {
  zh,
  en
}

function getLocale() {
  let locale = zh
  if (sessionStorage.getItem('lang')) {
    locale = elementPlusLang[sessionStorage.getItem('lang')]
  }
  return locale
}

const app = createApp(App);

app.use(elementPlus, {
  locale: getLocale()
});
app.use(router);
app.use(store);
app.use(i18n);
app.mount('#app');