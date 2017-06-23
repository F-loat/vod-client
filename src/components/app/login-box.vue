<template lang="pug">
mu-dialog(:open="show", :title="title", @close="handleClose")
  template(v-if="user._id")
    mu-flat-button(slot="actions", primary, @click="logout", label="注销")
    mu-flat-button(slot="actions", primary, @click="handleClose", label="取消")
  template(v-else)
    mu-text-field(v-model="stuid.val", :labelFloat="true", :fullWidth="true", label="学号", hintText="请输入学号", :errorText="stuid.val ? '' : stuid.err")
    br
    mu-text-field(v-model="pwd.val", :labelFloat="true", :fullWidth="true", label="密码", hintText="请输入密码", :errorText="pwd.val ? '' : pwd.err", type="password")
    mu-flat-button(slot="actions", primary, @click="login")
      span.mu-flat-button-label 登录
    mu-flat-button(slot="actions", primary, @click="handleClose", label="取消")
</template>

<script>
import { _user } from '@/api';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'login-box',
  data() {
    return {
      stuid: {
        val: null,
        err: null,
      },
      pwd: {
        val: null,
        err: null,
      },
    };
  },
  props: {
    show: {
      type: Boolean,
    },
  },
  computed: {
    ...mapState([
      'user',
    ]),
    title() {
      return this.user._id ? '确认注销？' : '用户登录';
    },
  },
  methods: {
    ...mapActions([
      'showSnackbar',
    ]),
    async login() {
      const stuid = this.stuid.val;
      const pwd = this.pwd.val;
      if (!stuid) this.stuid.err = '学号还没有填！';
      if (!pwd) this.pwd.err = '密码还没有填！';
      if (!pwd || !stuid) return;
      this.handleClose();
      const content = await _user.login({
        stuid,
        pwd,
      });
      if (!content) return;
      const { user, token } = content;
      if (user.type < 2) {
        this.showSnackbar('限制访问（内测中）');
        return;
      }
      if (user.type <= 9) {
        this.showSnackbar('管理员可用');
        return;
      }
      this.showSnackbar('登录成功');
      this.$store.commit('USER', user);
      localStorage.setItem('token', token);
      const ua = navigator.userAgent.toLowerCase();
      const isWeixin = ua.indexOf('micromessenger') !== -1;
      if (isWeixin && !user.openid) {
        const rst = await _user.wxoauthurl({ state: 'bind' });
        if (!rst) return;
        location.href = rst.authurl;
      }
    },
    async logout() {
      const content = await _user.logout();
      if (!content) return;
      this.showSnackbar('注销成功');
      this.$store.commit('USER', {});
      this.$store.commit('LOGINBOX', false);
      localStorage.removeItem('token');
    },
    handleClose() {
      this.$store.commit('LOGINBOX', false);
      this.stuid = {
        val: null,
        err: null,
      };
      this.pwd = {
        val: null,
        err: null,
      };
    },
  },
};
</script>
