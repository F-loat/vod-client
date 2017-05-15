import Vue from 'vue';
import Vuex from 'vuex';
import { _user, _type } from '@/api';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: {},
    types: [],
    snackbar: {
      show: false,
      text: '',
      timer: null,
    },
    popup: {
      show: false,
      text: '',
      timer: null,
    },
    progress: {
      show: false,
    },
  },
  mutations: {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    USER(state, user) {
      state.user = user;
      if (user._id) {
        sessionStorage.setItem('user', JSON.stringify(user));
      } else {
        _user.logout();
        sessionStorage.removeItem('user');
      }
    },
    TYPES(state, types) {
      state.types = types;
    },
    SNACKBAR(state, snackbar) {
      state.snackbar = snackbar;
    },
    POPUP(state, popup) {
      state.popup = popup;
    },
    PROGRESS(state, flag) {
      state.progress.show = flag;
    },
  },
  actions: {
    async getTypes({ commit, dispatch }) {
      commit('PROGRESS', true);
      const types = await _type.list();
      commit('PROGRESS', false);
      if (!types) return;
      commit('TYPES', types);
      dispatch('showPopup', '更新成功');
    },
    showPopup({ commit, state }, text) {
      const timer = state.popup.timer;
      if (timer) clearTimeout(timer);
      const popup = {
        text,
        show: true,
        timer: setTimeout(() => {
          commit('POPUP', { show: false });
        }, 2000),
      };
      commit('POPUP', popup);
    },
    showSnackbar({ commit, state }, text) {
      const timer = state.snackbar.timer;
      if (timer) clearTimeout(timer);
      const snackbar = {
        text,
        show: true,
        timer: setTimeout(() => {
          commit('SNACKBAR', { show: false });
        }, 2000),
      };
      commit('SNACKBAR', snackbar);
    },
  },
  getters: {
    videoTypes: state => state.types.filter(type => type.type === 'video'),
    topicTypes: state => state.types.filter(type => type.type === 'topic'),
  },
  strict: process.env.NODE_ENV !== 'production',
});

export default store;
