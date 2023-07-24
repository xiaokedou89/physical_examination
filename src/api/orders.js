import request from '@/utils/request.js'

// 获取订单列表
export function getOrders(params) {
  return request({
    url: '/order',
    method: 'get',
    params
  })
}

// 查询单个订单
export function getOrder(orderId) {
  return request({
    url: `/order/${orderId}`,
    method: 'get'
  })
}

// 下单
export function placeOrder(data) {
  return request({
    url: '/order',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 修改订单
export function setOrder(data) {
  return request({
    url: `/order/${data.id}`,
    method: 'put',
    data
  })
}
