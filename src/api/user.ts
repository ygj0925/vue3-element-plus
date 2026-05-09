import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
}

export function loginApi(data: LoginParams) {
  return request<LoginResult>({ url: '/auth/login', method: 'post', data })
}

export function getUserInfoApi() {
  return request<Record<string, unknown>>({ url: '/auth/userinfo', method: 'get' })
}
