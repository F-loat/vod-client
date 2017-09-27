import { request } from '@/utils';

const indexBanner = params => request.get('/banners', { params });
const createBanner = data => request.post('/banners', data);
const destroyBanner = (id, params) => request.delete(`/banners/${id}`, { params });

const indexVideo = params => request.get('/videos', { params });
const showVideo = (id, params) => request.get(`/videos/${id}`, { params });
const createVideo = data => request.post('/videos', data);
const updateVideo = (id, data) => request.put(`/videos/${id}`, data);
const destroyVideo = (id, params) => request.delete(`/videos/${id}`, { params });

const indexEpisode = params => request.get('/episodes', { params });
const showEpisode = (id, params) => request.get(`/episodes/${id}`, { params });
const createEpisode = data => request.post('/episodes', data);
const transcodeEpisode = (id, params) => request.get(`/episodes/${id}/transcode`, { params });
const updateEpisode = data => request.put('/episodes', data);
const destroyEpisode = (id, params) => request.delete(`/episodes/${id}`, { params });

const indexUser = params => request.get('/users', { params });
const showUser = (id, params) => request.get(`/users/${id}`, { params });
const createUser = (data, params) => request.post('/users', data, { params });
const updateUser = (id, data, params) => request.put(`/users/${id}`, data, { params });
const destroyUser = (id, params) => request.delete(`/users/${id}`, { params });

const createToken = (data, params) => request.post('/tokens', data, { params });
const destroyToken = (id, params) => request.delete(`/tokens/${id}`, { params });

const indexType = params => request.get('/types', { params });
const showType = (id, params) => request.get(`/types/${id}`, { params });
const createType = data => request.post('/types', data);
const updateType = data => request.put('/types', data);
const destroyType = (id, params) => request.delete(`/types/${id}`, { params });

const indexTopic = params => request.get('/topics', { params });
const showTopic = (id, params) => request.get(`/topics/${id}`, { params });
const createTopic = data => request.post('/topics', data);

const indexComment = params => request.get('/comments', { params });
const createComment = (data, params) => request.post('/comments', data, { params });

const indexLog = params => request.get('/logs', { params });
const createFile = (file, config) => {
  const form = new FormData();
  form.append('file', file);
  return request.post('/files', form, config);
};

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
  createUser,
  updateUser,
  destroyUser,
  createToken,
  destroyToken,
  indexType,
  showType,
  createType,
  updateType,
  destroyType,
  indexTopic,
  showTopic,
  createTopic,
  indexComment,
  createComment,
  createFile,
  indexLog,
};
