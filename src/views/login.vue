<template lang="pug">
.login(@click.self="materialBg.protract")
  mu-paper.login-form(ref="form")
    .title 用户登录
    mu-text-field(
      label="学号",
      hintText="请输入学号",
      :fullWidth="true",
      :labelFloat="true",
      v-model="stuid",
      @keyup.enter.native="login")
    mu-text-field(
      label="密码",
      hintText="请输入密码",
      :fullWidth="true",
      :labelFloat="true",
      v-model="pwd",
      type="password",
      autocomplet="off",
      @keyup.enter.native="login")
    br
    mu-raised-button(
      label="登录",
      :primary="true",
      :fullWidth="true",
      @click="login")
    mu-linear-progress.progress(v-show="loading", :size="2", color="#ff4081")
</template>

<script>
import MaterialImage from 'material-image';
import { _user } from '@/api';
import { mapActions } from 'vuex';

export default {
  name: 'login',
  data() {
    return {
      stuid: '',
      pwd: '',
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
      if (!this.stuid) {
        this.showSnackbar('请填写账号');
        return;
      }
      if (!this.pwd) {
        this.showSnackbar('请填写密码');
        return;
      }
      this.loading = true;
      const content = await _user.login({
        stuid: this.stuid,
        pwd: this.pwd,
      });
      this.loading = false;
      if (!content) return;
      const { user, token } = content;
      if (user.type < 2) {
        this.showSnackbar('限制访问（内测中）');
        return;
      }
      this.$store.commit('USER', user);
      localStorage.setItem('token', token);
      const ua = navigator.userAgent.toLowerCase();
      const isWeixin = ua.indexOf('micromessenger') !== -1;
      if (isWeixin && !user.openid) {
        const rst = await _user.wxoauthurl({ state: 'bind' });
        if (!rst) return;
        location.href = rst.authurl;
      }
      this.$router.replace('/forum');
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
