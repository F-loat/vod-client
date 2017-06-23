<template lang="pug">
.menu
  mu-icon-button.menu-button(icon="menu", @click="open = true")
  mu-drawer(:open="open", :docked="false", @close="open = !open")
    .person-info
      img.headimg(:src="user.headimgurl || (user.avatar ? `/uploads/${user.avatar}` : '/static/img/youngon.gif')")
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
          v-for="type of topicTypes",
          slot="nested",
          :key="type._id",
          :title="type.name",
          :to="`/forum?type=${type._id}`")
</template>

<script>
import { mapState, mapGetters } from 'vuex';

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
    ...mapGetters([
      'topicTypes',
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
  top 1pc
  left 8px
  z-index 9
  color #222
  @media (min-width: 480px)
    position fixed

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
