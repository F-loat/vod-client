import { request } from '@/utils';

const indexBanner = params => request.get('/banners', { params });

const indexVideo = params => request.get('/videos', { params });
const showVideo = (id, params) => request.get(`/videos/${id}`, { params });

const indexEpisode = params => request.get('/episodes', { params });

const showUser = (id, params) => request.get(`/users/${id}`, { params });
const createUser = (data, params) => request.post('/users', data, { params });
const updateUser = (id, data, params) => request.put(`/users/${id}`, data, { params });
const createToken = (data, params) => request.post('/tokens', data, { params });
const destroyToken = params => request.del('/tokens', { params });

const indexType = params => request.get('/types', { params });
const showType = (id, params) => request.get(`/types/${id}`, { params });

const indexTopic = params => request.get('/topics', { params });
const showTopic = (id, params) => request.get(`/topics/${id}`, { params });
const createTopic = data => request.post('/topics', data);

const indexComment = params => request.get('/comments', { params });
const createComment = (data, params) => request.post('/comments', data, { params });

export {
  indexBanner,
  indexVideo,
  showVideo,
  indexEpisode,
  showUser,
  createUser,
  createToken,
  updateUser,
  destroyToken,
  indexType,
  showType,
  indexTopic,
  showTopic,
  createTopic,
  indexComment,
  createComment,
};
