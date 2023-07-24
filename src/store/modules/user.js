import * as sessions from '@/utils/auth.js'
import * as api from '@/api/user.js'
const state = {
  token: sessions.getToken(),
  userId: sessions.getUserId()
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USERID: (state, userId) => {
    state.userId = userId
  }
}

const actions = {
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      api.login({ username: username.trim(), password })
        .then(response => {
          const { data } = response
          commit('SET_TOKEN', `Bearer ${data}`)
          sessions.setToken(`Bearer ${data}`)
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  logout({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      sessions.removeToken()
      resolve()
    })
  }
}

export default {
  state,
  mutations,
  actions
}