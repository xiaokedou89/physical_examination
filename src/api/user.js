import request from '@/utils/request.js'

// 体检中心用户登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 获取当前登录用户的信息
export function getInfo() {
  return request({
    url: '/user/current',
    method: 'get'
  })
}

// 登录用户修改密码
export function setPassword(data) {
  return request({
    url: '/user/current/password',
    method: 'put',
    data
  })
}

// 登录用户更新信息
export function setUserInfo(data) {
  return request({
    url: '/user/current/info',
    method: 'put',
    data
  })
}