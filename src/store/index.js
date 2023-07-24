import { createStore } from 'vuex'
import getters from './getters'
import home from './modules/home'
import user from './modules/user'

const modules = {
  home,
  user
}


const store = createStore({
  getters,
  modules
})

export default store

