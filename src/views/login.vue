<template lang="pug">
.login(@click.self="materialBg.protract")
  mu-paper.login-form(ref="form")
    .title 用户登录
    mu-text-field(
      label="用户名",
      hintText="校内用户请输入学号",
      :fullWidth="true",
      :labelFloat="true",
      v-model="username",
      @keyup.enter.native="login")
    mu-text-field(
      label="密码",
      hintText="校内用户请输入统一登录平台密码",
      :fullWidth="true",
      :labelFloat="true",
      v-model="password",
      type="password",
      autocomplet="off",
      @keyup.enter.native="login")
    br
    mu-raised-button(
      label="登录/注册",
      :primary="true",
      :fullWidth="true",
      @click="login")
    mu-linear-progress.progress(v-show="loading", :size="2", color="#ff4081")
</template>

<script>
import MaterialImage from 'material-image';
import { mapActions } from 'vuex';
import * as api from '@/api';

export default {
  name: 'login',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
    };
  },
  activated() {
    this.createBg();
  },
  deactivated() {
    this.materialBg.destroy();
  },
  methods: {
    ...mapActions([
      'showSnackbar',
    ]),
    async login() {
      if (!this.username) {
        this.showSnackbar('请填写用户名');
        return;
      }
      if (!this.password) {
        this.showSnackbar('请填写密码');
        return;
      }
      this.loading = true;
      const token = await api.createToken({
        username: this.username,
        password: this.password,
      });
      let user;
      if (token) {
        localStorage.setItem('token', token);
        user = await api.showUser('self');
      } else {
        this.showSnackbar('注册用户中');
        user = await api.createUser({
          username: this.username,
          password: this.password,
          insider: true,
        });
      }
      this.loading = false;
      if (!user) return;
      const ua = navigator.userAgent.toLowerCase();
      const isWeixin = ua.indexOf('micromessenger') !== -1;
      const { redirect } = this.$route.query;
      if (!user.openid && isWeixin) {
        const authurl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxcf692473c3e08053&redirect_uri=${location.origin}${redirect || ''}&response_type=code&scope=snsapi_base&state=info#wechat_redirect`;
        location.href = authurl;
      }
      this.$store.commit('USER', user);
      this.showSnackbar(token ? '登录成功' : '注册成功，已自动登录');
      this.$router.replace(redirect || '/');
    },
    createBg() {
      this.materialBg = new MaterialImage({
        el: this.$parent.$el,
      });
    },
  },
};
</script>

<style lang="stylus" scoped>
.login
  width 100%
  display flex
  justify-content center
  align-items center
  @media (max-width: 480px)
    margin-bottom -1pc
    box-sizing content-box

.login-form
  width 440px
  background-color rgba(255, 255, 255, .92)
  padding 60px
  z-index 999
  position relative
  display flex
  justify-content center
  flex-direction column
  @media (max-width: 480px)
    width 100%
    height 100vh
    margin 0

.title
  margin-bottom 5px

.progress
  position absolute
  bottom 0
  left 0
</style>
