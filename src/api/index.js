import axios from 'axios';
import store from '../store';

const http = axios.create({
  baseURL: '/request',
});

http.interceptors.request.use((config) => {
  const newConfig = config;
  if (localStorage.token) {
    newConfig.headers = { Authorization: `Bearer ${localStorage.token}` };
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

const _video = {
  get: params => http.get('/video', { params }),
  list: params => http.get('/video/list', { params }),
  typed: params => http.get('/video/typed', { params }),
};

const _episode = {
  list: params => http.get('/episode/list', { params }),
};

const _user = {
  get: params => http.get('/user', { params }),
  login: data => http.post('/user/login', data),
  wxoauth: data => http.post('/user/wxoauth', data),
  wxoauthurl: params => http.get('/user/wxoauth/url', { params }),
  logout: params => http.get('/user/logout', { params }),
};

const _type = {
  list: params => http.get('/type/list', { params }),
};

const _topic = {
  get: params => http.get('/topic', { params }),
  post: data => http.post('/topic', data),
  list: params => http.get('/topic/list', { params }),
};

const _comment = {
  post: data => http.post('/comment', data),
  list: params => http.get('/comment/list', { params }),
};

export {
  _video,
  _episode,
  _user,
  _type,
  _topic,
  _comment,
};
