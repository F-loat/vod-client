<template lang="pug">
#person
  div.headimg-wrap
    img.headimg(:src="user.avatar || '/static/img/youngon.gif'")
    p.nickname(@click="$store.commit('LOGINBOX', true)") {{user.nickname || user.stuid || '账号登录'}}
  mu-list
    mu-list-item(title="播放历史")
      mu-icon(slot="left", value="history")
    mu-list-item(title="我的收藏")
      mu-icon(slot="left", value="favorite")
    mu-list-item(title="个人设置")
      mu-icon(slot="left", value="settings")
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'person',
  mounted() {
    this.$nextTick(() => {
    });
  },
  data() {
    return {
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
    ]),
  },
  methods: {
    ...mapActions([
    ]),
  },
};
</script>

<style lang="stylus">
.headimg-wrap
  height 200px
  padding-top 40px
  text-align center

.headimg
  width 70px
  height 70px
  border-radius 50%

.nickname
  cursor pointer
</style>
