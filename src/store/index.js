import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: {},
    screen: {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    },
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
    WINDOW(state) {
      state.screen.width = document.body.clientWidth;
      state.screen.height = document.body.clientHeight;
    },
    SNACKBAR(state, snackbar) {
      state.snackbar = snackbar;
    },
    PROGRESS(state, flag) {
      state.progress.show = flag;
    },
  },
  actions: {
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
  strict: process.env.NODE_ENV !== 'production',
});

export default store;
