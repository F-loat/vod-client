<template lang="pug">
#app
  top-bar(:show="showTitle")
  keep-alive
    router-view.main-body(:class="{ 'main-no-top': !showTitle, 'main-no-bottom': !showBottom }")
  bottom-nav(:show="showBottom")
  login-box(:show="showLoginBox")
  mu-snackbar(
    v-if="snackbar.show",
    :message="snackbar.text",
    action="关闭",
    @actionClick="$store.commit('SNACKBAR', { show: false })")
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { _user } from '@/api';
import TopBar from 'components/app/top-bar';
import BottomNav from 'components/app/bottom-nav';
import LoginBox from 'components/app/login-box';

export default {
  name: 'base',
  components: {
    TopBar,
    BottomNav,
    LoginBox,
  },
  computed: {
    ...mapState([
      'user',
      'screen',
      'showLoginBox',
      'snackbar',
    ]),
    showTitle() {
      return this.$route.meta.showTitle;
    },
    showBottom() {
      return this.$route.meta.showBottom;
    },
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) this.$store.commit('USER', user);
    this.getUser();
    this.getTypes();
    window.addEventListener('resize', () => this.$store.commit('WINDOW'));
  },
  methods: {
    ...mapActions([
      'getTypes',
    ]),
    async getUser() {
      const content = await _user.get();
      if (!content) return;
      const { user, token } = content;
      this.$store.commit('USER', user);
      if (token) localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
  },
};
</script>

<style lang="stylus">
@import 'assets/iconfont/iconfont.css'
@import './style/'
easeOutFunction = cubic-bezier(0.23, 1, 0.32, 1)
easeInOutFunction = cubic-bezier(0.445, 0.05, 0.55, 0.95)

#app
  height 100%

.main-body
  @media (min-width: 480px)
    padding-top 64px
    min-height 90vh
  @media (max-width: 480px)
    padding-top 56px
    padding-bottom 56px
    overflow auto
    overflow-x hidden
    overflow-y scroll
  @media (min-width: 1367px)
    padding-left 10%
    padding-right 10%
    margin 0 auto

.main-no-top
  padding-top 0

.main-no-bottom
  padding-bottom 0
</style>
