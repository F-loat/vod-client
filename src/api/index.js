import axios from 'axios';
import store from '../store';

const http = axios.create({
  baseURL: '/request',
});

http.interceptors.request.use((config) => {
  const newConfig = config;
  if (sessionStorage.token) {
    newConfig.headers = { Authorization: `Bearer ${sessionStorage.token}` };
  }
  return newConfig;
}, (err) => {
  store.dispatch('showSnackbar', err.message);
});

http.interceptors.response.use((res) => {
  if (res.data.state === 1) return res.data.content;
  const msg = res.data.msg;
  if (msg) store.dispatch('showSnackbar', msg);
  return false;
}, (err) => {
  const res = err.response;
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
  }
  const msg = res.data.msg;
  if (msg) store.dispatch('showSnackbar', msg);
  return false;
});

const _banner = {
  post: data => http.post('/banner', data),
  delete: params => http.delete('/banner', { params }),
  list: params => http.get('/banner/list', { params }),
};

const _video = {
  get: async (params) => {
    try {
      const search = await axios
        .get('/douban/search', { params });
      const subjects = search.data.subjects;
      if (!subjects || !subjects[0]) return false;
      const info = await axios
        .get(`/douban/subject/${subjects[0].id}`);
      return info.data;
    } catch (err) {
      const msg = err.response.data.msg;
      if (msg) store.dispatch('showSnackbar', msg);
      return false;
    }
  },
  post: data => http.post('/video', data),
  put: data => http.put('/video', data),
  delete: params => http.delete('/video', { params }),
  list: params => http.get('/video/list', { params }),
};

const _episode = {
  post: (data, config) => http.post('/episode', data, config),
  transcode: data => http.post('/episode/transcoding', data),
  list: params => http.get('/episode/list', { params }),
};

const _user = {
  login: data => http.post('/user/login', data),
  logout: params => http.get('/user/logout', { params }),
  put: data => http.put('/user', data),
  delete: params => http.delete('/user', { params }),
  list: params => http.get('/user/list', { params }),
};

const _type = {
  post: data => http.post('/type', data),
  put: data => http.put('/type', data),
  delete: params => http.delete('/type', { params }),
  list: params => http.get('/type/list', { params }),
};

const _log = {
  list: params => http.get('/log/list', { params }),
};

export {
  _banner,
  _video,
  _episode,
  _user,
  _type,
  _log,
};
