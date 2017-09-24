import axios from 'axios';
import store from '../store';

async function show(params) {
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
}

export default {
  show,
};
