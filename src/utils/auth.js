const TokenKey = 'userToken'

const IdKey = 'userId'

export function getToken() {
  return window.sessionStorage.getItem(TokenKey)
}

export function setToken(token) {
  return window.sessionStorage.setItem(TokenKey, token)
}

export function removeToken() {
  return window.sessionStorage.removeItem(TokenKey)
}

export function getUserId() {
  return window.sessionStorage.getItem(IdKey)
}

export function setUserId(userId) {
  return window.sessionStorage.setItem(IdKey, userId)
}

export function removeUserId() {
  return window.sessionStorage.removeItem(IdKey)
}

