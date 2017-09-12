import axios from 'axios';
import store from '../store';

const request = axios.create({
  baseURL: '/request',
});

request.interceptors.request.use((config) => {
  const { token } = localStorage;
  if (token) {
    Object.assign(config, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  return config;
}, (err) => {
  store.dispatch('showSnackbar', err.message);
});

request.interceptors.response.use((res) => {
  const token = res.headers['set-authorization'];
  if (token) localStorage.setItem('token', token);
  return res.data;
}, (err) => {
  const res = err.response;
  store.dispatch('showSnackbar', res.data || err.message);
  return null;
});

export default request;
