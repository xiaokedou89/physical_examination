import request from '@/utils/request.js'

export function delFile(type, params) {
  return request({
    url: `/file/${type}`,
    method: 'delete',
    params
  })
}

