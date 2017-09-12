<template lang="pug">
#app
  main-menu
  keep-alive(:exclude="exclude")
    router-view.main-body
  copyright
  mu-snackbar(
    v-if="snackbar.show",
    :message="snackbar.text",
    action="关闭",
    @actionClick="$store.commit('SNACKBAR', { show: false })")
</template>

<script>
import querystring from 'query-string';
import { mapState } from 'vuex';
import MainMenu from '@/components/app/main-menu';
import Copyright from '@/components/app/copyright';
import * as api from '@/api';

export default {
  name: 'base',
  components: {
    MainMenu,
    Copyright,
  },
  data() {
    return {
      exclude: 'play',
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
      'snackbar',
    ]),
  },
  mounted() {
    const route = querystring.parse(location.search);
    const ua = navigator.userAgent.toLowerCase();
    const isWeixin = ua.indexOf('micromessenger') !== -1;
    if (route && route.code) {
      this.createTokenByCode(route.code, route.state);
    } else if (localStorage.token) {
      this.getUser();
    } else if (isWeixin) {
      const authurl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxcf692473c3e08053&redirect_uri=${location.href}&response_type=code&scope=snsapi_base&state=token#wechat_redirect`;
      location.href = authurl;
    }
    window.addEventListener('resize', () => this.$store.commit('WINDOW'));
  },
  methods: {
    async createTokenByCode(code, state) {
      if (state === 'info') {
        await api.updateUser('self', { code }, { type: 'code' });
      } else {
        const token = await api.createToken({ code }, { type: 'code' });
        if (token) localStorage.setItem('token', token);
      }
      this.$router.replace(this.$route.path);
      if (localStorage.token) this.getUser();
    },
    async getUser() {
      const data = await api.showUser('self');
      if (!data) return;
      this.$store.commit('USER', data);
    },
  },
};
</script>

<style lang="stylus">
@import 'assets/iconfont/iconfont.css'
@import './style/'
easeOutFunction = cubic-bezier(0.23, 1, 0.32, 1)
easeInOutFunction = cubic-bezier(0.445, 0.05, 0.55, 0.95)

.main-body
  width 100%
  min-height 100vh
  @media (min-width: 900px)
    padding-top 165px
    padding-bottom 80px
    max-width 900px
    box-sizing border-box
    margin 0 auto
</style>
