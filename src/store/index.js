import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: {}
  },
  mutations: {
    USER (state, user) {
      state.user = user
    }
  },
  actions: {
  },
  strict: process.env.NODE_ENV !== 'production'
})

export default store
