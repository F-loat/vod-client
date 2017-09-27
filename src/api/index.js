import { request } from '@/utils'

const indexBanner = params => request.get('/banners', { params })
const createBanner = data => request.post('/banners', data)
const destroyBanner = (id, params) => request.delete(`/banners/${id}`, { params })

const indexVideo = params => request.get('/videos', { params })
const showVideo = (id, params) => request.get(`/videos/${id}`, { params })
const createVideo = data => request.post('/videos', data)
const updateVideo = (id, data) => request.put(`/videos/${id}`, data)
const destroyVideo = (id, params) => request.delete(`/videos/${id}`, { params })

const indexEpisode = params => request.get('/episodes', { params })
const showEpisode = (id, params) => request.get(`/episodes/${id}`, { params })
const createEpisode = data => request.post('/episodes', data)
const transcodeEpisode = (id, params) => request.get(`/episodes/${id}/transcode`, { params })
const updateEpisode = data => request.put('/episodes', data)
const destroyEpisode = (id, params) => request.delete(`/episodes/${id}`, { params })

const indexUser = params => request.get('/users', { params })
const showUser = (id, params) => request.get(`/users/${id}`, { params })
const updateUser = (id, data) => request.put(`/users/${id}`, data)
const destroyUser = (id, params) => request.delete(`/users/${id}`, { params })

const createToken = (data, params) => request.post('/tokens', data, { params })
const destroyToken = (id, params) => request.delete(`/tokens/${id}`, { params })

const indexType = params => request.get('/types', { params })
const createType = data => request.post('/types', data)
const updateType = (id, data) => request.put(`/types/${id}`, data)
const destroyType = (id, params) => request.delete(`/types/${id}`, { params })

const createTopic = data => request.post('/topics', data)
const indexTopic = params => request.get('/topics', { params })
const showTopic = (id, params) => request.get(`/topics/${id}`, { params })
const destroyTopic = (id, params) => request.delete(`/topics/${id}`, { params })

const createComment = data => request.post('/comments', data)
const indexComment = params => request.get('/comments', { params })

const indexLog = params => request.get('/logs', { params })
const createFile = (file, config) => {
  const form = new FormData()
  form.append('file', file)
  return request.post('/files', form, config)
}

export {
  indexBanner,
  createBanner,
  destroyBanner,
  indexVideo,
  showVideo,
  createVideo,
  updateVideo,
  destroyVideo,
  indexEpisode,
  showEpisode,
  createEpisode,
  transcodeEpisode,
  updateEpisode,
  destroyEpisode,
  indexUser,
  showUser,
  updateUser,
  destroyUser,
  createToken,
  destroyToken,
  indexType,
  createType,
  updateType,
  destroyType,
  showTopic,
  createTopic,
  indexTopic,
  destroyTopic,
  createComment,
  indexComment,
  createFile,
  indexLog
}
