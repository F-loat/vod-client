import Vue from 'vue';
import Vuex from 'vuex';
import { _type } from '@/api';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: {},
    types: [],
    screen: {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    },
    showLoginBox: false,
    snackbar: {
      show: false,
      message: '',
      timer: null,
    },
    progress: {
      show: false,
    },
  },
  mutations: {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    USER(state, user = {}) {
      state.user = user;
    },
    TYPES(state, types) {
      state.types = types;
    },
    WINDOW(state) {
      state.screen.width = document.body.clientWidth;
      state.screen.height = document.body.clientHeight;
    },
    LOGINBOX(state, val = !state.showLoginBox) {
      state.showLoginBox = val;
    },
    SNACKBAR(state, snackbar) {
      state.snackbar = snackbar;
    },
    PROGRESS(state, flag) {
      state.progress.show = flag;
    },
  },
  actions: {
    async getTypes({ commit }) {
      const types = await _type.list();
      if (!types) return;
      commit('TYPES', types);
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
