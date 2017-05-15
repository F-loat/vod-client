import Vue from 'vue';
import MuseUI from 'muse-ui';
import AwesomeSwiper from 'vue-awesome-swiper';
import 'muse-ui/dist/muse-ui.css';
import 'material-design-icons/iconfont/material-icons.css';
import store from './store';
import router from './router';
import App from './App';

Vue.use(MuseUI);
Vue.use(AwesomeSwiper);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});
