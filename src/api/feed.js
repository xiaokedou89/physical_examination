import request from '@/utils/request.js'

// 查询反馈
export function getFeeds(orderId, params) {
  return request({
    url: `/advice/order/${orderId}`,
    method: 'get',
    params
  })
}

// 添加反馈
export function addFeed(data) {
  return request({
    url: '/advice',
    method: 'post',
    data
  })
}

// 修改反馈
export function setFeed(data) {
  return request({
    url: `/advice/${data.id}`,
    method: 'put',
    data
  })
}
