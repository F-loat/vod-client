<template lang="pug">
.menu
  mu-icon-button.menu-button(icon="menu", @click="open = true")
  mu-drawer(:open="open", :docked="false", @close="open = !open")
    .person-info
      img.headimg(:src="user.avatar ? `/uploads/${user.avatar}` : '/static/img/youngon.gif'")
      .nickname(@click="$store.commit('LOGINBOX', true)")
        span {{user.nickname || user.stuid || '账号登录'}}
        span(v-if="user._id") [{{typeFormat(user.type)}}]
    mu-list
      mu-list-item(title="主页", to="/")
      mu-list-item(title="论坛", :toggleNested="true", :open="false")
        mu-icon(slot="left", value="group")
        mu-list-item(
          slot="nested",
          title="全部",
          to="/forum")
        mu-list-item(
          slot="nested",
          title="待处理",
          to="/forum?type=0")
        mu-list-item(
          slot="nested",
          title="已处理",
          to="/forum?type=1")
        mu-list-item(
          slot="nested",
          title="连载中",
          to="/forum?type=2")
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'main-menu',
  data() {
    return {
      open: false,
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
    ]),
  },
  methods: {
    typeFormat(type) {
      if (type > 9) return '管理员';
      if (type >= 2) return '内测用户';
      return '普通用户';
    },
  },
  watch: {
    $route() {
      this.open = false;
    },
  },
};
</script>

<style lang="stylus" scoped>
.menu-button
  position absolute
  margin-top 1pc
  margin-left 8px
  z-index 999
  color #222

.person-info
  height 160px
  background-image url('~assets/img/snow_square_tiny.png')
  background-size cover
  background-position: center center;
  display flex
  flex-direction column
  justify-content flex-end

.headimg
  width 54px
  height 54px
  border-radius 50%
  margin 1pc

.nickname
 color #e0e0e0
 padding 0 1pc
 line-height 3pc
 font-size 14px
</style>
