<template lang="pug">
#app
  main-menu(v-if="!isAdmin")
  transition(name="fade", mode="out-in")
    keep-alive(:exclude="exclude")
      router-view(:class="{ 'main-body': !isAdmin }")
  copyright(v-if="!isAdmin")
  mu-snackbar(
    v-if="snackbar.show",
    :message="snackbar.text",
    action="关闭",
    @actionClick="$store.commit('SNACKBAR', { show: false })")
</template>

<script>
import MaterialImage from 'material-image';
import querystring from 'query-string';
import { mapState, mapActions } from 'vuex';
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
    isAdmin() {
      return this.$route.path.slice(0, 6) === '/admin';
    },
  },
  mounted() {
    const route = querystring.parse(location.search);
    const ua = navigator.userAgent.toLowerCase();
    const isWeixin = ua.indexOf('micromessenger') !== -1;
    if (route && route.code) {
      this.createTokenByCode(route.code, route.state);
    } else if (sessionStorage.token) {
      this.getUser();
    } else if (isWeixin) {
      const authurl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxcf692473c3e08053&redirect_uri=${location.href}&response_type=code&scope=snsapi_base&state=token#wechat_redirect`;
      location.href = authurl;
    }
    window.addEventListener('resize', () => this.$store.commit('WINDOW'));
    this.getTypes();
  },
  methods: {
    ...mapActions([
      'getTypes',
    ]),
    async createTokenByCode(code, state) {
      if (state === 'info') {
        await api.updateUser('self', { code }, { type: 'code' });
      } else {
        const token = await api.createToken({ code }, { type: 'code' });
        if (token) sessionStorage.setItem('token', token);
      }
      this.$router.replace(this.$route.path);
      if (sessionStorage.token) this.getUser();
    },
    async getUser() {
      const data = await api.showUser('self');
      if (!data) return;
      this.$store.commit('USER', data);
    },
    createBg() {
      this.materialBg = new MaterialImage({
        el: this.$parent.$el,
      });
    },
  },
};
</script>

<style lang="stylus">
@import 'assets/iconfont/iconfont.css'
@import '~@/styles/index.less';
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

#app {
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
}

.fade-enter-active,
.fade-leave-active {
	transition: all .2s ease;
}

.fade-enter,
.fade-leave-active {
	opacity: 0;
}
</style>
