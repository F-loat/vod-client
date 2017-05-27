<template lang="pug">
.page.login(@click.self="changeBackground")
  mu-paper.login-form(ref="form")
    .title 管理后台登录
    mu-text-field(
      label="账号",
      hintText="请输入账号",
      :fullWidth="true",
      :labelFloat="true",
      v-model="stuid",
      @keyup.enter.native="login")
    mu-text-field(
      label="密码",
      hintText="请输入密码",
      type="password",
      :labelFloat="true",
      :fullWidth="true",
      autocomplet="off",
      v-model="pwd",
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
import { _user } from '@/api';

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
    this.$parent.createBg();
  },
  methods: {
    async login() {
      if (!this.stuid) {
        this.$store.dispatch('showSnackbar', '请填写账号');
        return;
      }
      if (!this.pwd) {
        this.$store.dispatch('showSnackbar', '请填写密码');
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
      if (user.type <= 9) {
        this.$store.dispatch('showSnackbar', '管理员可用');
        return;
      }
      if (token) sessionStorage.setItem('token', token);
      if (!user.theme || !user.theme.showBg) {
        this.$parent.materialBg.destroy();
      }
      this.$store.commit('USER', user);
      this.$router.push({ path: '/' });
    },
    changeBackground() {
      this.$parent.materialBg.protract();
    },
  },
};
</script>

<style lang="less" scoped>
.page {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form {
  width: 440px;
  background-color: rgba(255, 255, 255, .92);
  padding: 60px;
  z-index: 999;
  position: relative;
  display: flex;
  justify-content: center;
  flex-direction: column;
  @media (max-width: 480px) {
    width: 100%;
    height: 100%;
    margin: 0;
  }
}

.title {
  margin-bottom: 5px;
}

.progress {
  position: absolute;
  bottom: 0;
  left: 0;
}
</style>
