import axios from 'axios'
import { ElMessage } from 'element-plus'
import { network } from '@/utils/global.js'
import { getToken } from '@/utils/auth.js'
import store from '@/store/index'



const service = axios.create({
  baseURL: network.globalURL,
  timeout: network.timeout
})

service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['authorization'] = getToken()
    }
    return config
  },
  error => {
    console.log('request is wrong!')
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 20000) {
      if (res.code === 20004) {
        return res
      }
      // ElMessage({
      //   message: res.message || 'Error',
      //   type: 'error',
      //   duration: 1500
      // })
      // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {

      // }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    ElMessage({
      message: error,
      type: 'error',
      duration: 1500
    })
    return Promise.reject(error)
  }
)

export default service