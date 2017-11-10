import axios from 'axios'
import { Toast } from 'quasar'
import router from '@/router'

const request = axios.create({
  baseURL: '/api'
})

request.interceptors.request.use((config) => {
  const { token } = sessionStorage
  if (token) {
    Object.assign(config, {
      headers: { Authorization: `Bearer ${token}` }
    })
  }
  return config
}, (err) => {
  Toast.create.negative(err.message)
})

request.interceptors.response.use((res) => {
  const token = res.headers['set-authorization']
  if (token) sessionStorage.setItem('token', token)
  return res.data
}, (err) => {
  const res = err.response
  Toast.create.negative(res.data || err.message)
  if (res.status === 403 || res.status === 401) router.push('/login')
  return null
})

export default request
