import axios from 'axios';
import store from '../store';

const request = axios.create({
  baseURL: '/request',
});

request.interceptors.request.use((config) => {
  store.commit('PROGRESS', true);
  const { token } = sessionStorage;
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
  store.commit('PROGRESS', false);
  const token = res.headers['set-authorization'];
  if (token) sessionStorage.setItem('token', token);
  return res.data;
}, (err) => {
  store.commit('PROGRESS', false);
  const res = err.response;
  store.dispatch('showSnackbar', res.data || err.message);
  return null;
});

export default request;
