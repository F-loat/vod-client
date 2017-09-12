<template lang="pug">
.menu
  mu-icon-button.menu-button(icon="menu", @click="open = true")
  mu-drawer(:open="open", :docked="false", @close="open = !open")
    .person-info
      img.headimg(:src="user.headimgurl || (user.avatar ? `/assets/${user.avatar}` : '/static/img/youngon.gif')")
      router-link.nickname(v-if="!user._id", to="/login") 账号登录
      .nickname(v-else)
        span(@click="logoutConfirmVisible = true") {{user.nickname}}
        span [{{typeFormat(user.type)}}]
    mu-list
      mu-list-item(title="主页", to="/")
      mu-list-item(title="论坛", :toggleNested="true", :open="false")
        mu-icon(slot="left", value="group")
        //- mu-list-item(
        //-   slot="nested",
        //-   title="全部",
        //-   to="/forum")
        mu-list-item(
          v-for="type of types",
          slot="nested",
          :key="type._id",
          :title="type.name",
          :to="`/forum?type=${type._id}`")
  mu-dialog(
    :open="logoutConfirmVisible",
    title="确认注销？",
    @close="logoutConfirmVisible = false")
    mu-flat-button(
      label="确定",
      slot="actions",
      primary,
      @click="logout")
    mu-flat-button(
      label="取消",
      slot="actions",
      primary,
      @click="logoutConfirmVisible = false")
</template>

<script>
import { mapState } from 'vuex';
import * as api from '@/api';

export default {
  name: 'main-menu',
  data() {
    return {
      open: false,
      types: [],
      logoutConfirmVisible: false,
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
    ]),
  },
  mounted() {
    this.getTypes();
  },
  methods: {
    typeFormat(type) {
      if (type === 'admin') return '管理员';
      return '普通用户';
    },
    async getTypes() {
      const data = await api.indexType({ type: 'topic' });
      if (!data) return;
      this.types = data.types;
    },
    logout() {
      localStorage.removeItem('token');
      this.$store.commit('USER', {});
      this.logoutConfirmVisible = false;
      this.open = false;
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
