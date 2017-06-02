<template lang="pug">
#app
  //- top-bar(:show="showTitle")
  main-menu
  keep-alive
    router-view.main-body
  copyright
  login-box(:show="showLoginBox")
  mu-snackbar(
    v-if="snackbar.show",
    :message="snackbar.text",
    action="关闭",
    @actionClick="$store.commit('SNACKBAR', { show: false })")
</template>

<script>
import querystring from 'query-string';
import { mapState, mapActions } from 'vuex';
import { _user } from '@/api';
import LoginBox from 'components/app/login-box';
import MainMenu from 'components/app/main-menu';
import Copyright from 'components/app/copyright';

export default {
  name: 'base',
  components: {
    LoginBox,
    MainMenu,
    Copyright,
  },
  computed: {
    ...mapState([
      'user',
      'screen',
      'showLoginBox',
      'snackbar',
    ]),
    showBottom() {
      return this.$route.meta.showBottom;
    },
  },
  mounted() {
    const route = querystring.parse(location.search);
    const user = JSON.parse(localStorage.getItem('user'));
    const ua = navigator.userAgent.toLowerCase();
    const isWeixin = ua.indexOf('micromessenger') !== -1;
    if (user) this.$store.commit('USER', user);
    if (route && route.code) {
      this.loginByCode(route.code);
    } else if (localStorage.token) {
      this.getUser();
    } else if (isWeixin) {
      this.getWXOauthUrl();
    }
    this.getTypes();
    window.addEventListener('resize', () => this.$store.commit('WINDOW'));
  },
  methods: {
    ...mapActions([
      'getTypes',
    ]),
    async loginByCode(code) {
      const content = await _user.wxoauth({ code });
      if (!content) return;
      const { user, token } = content;
      this.$store.commit('USER', user);
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      this.$router.replace('/forum');
    },
    async getUser() {
      const content = await _user.get();
      if (!content) return;
      const { user, token } = content;
      this.$store.commit('USER', user);
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    async getWXOauthUrl() {
      const content = await _user.wxoauthurl();
      if (!content) return;
      location.href = content.authurl;
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
  padding-bottom 1pc
  @media (min-width: 480px)
    padding-top 165px
    padding-bottom 80px
    max-width 900px
    box-sizing border-box
    margin 0 auto
</style>
