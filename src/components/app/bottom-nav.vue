<template lang="pug">
transition(name="vertSlideUp")
  mu-paper.main-bottom-nav(v-if="show && screen.width <= 480")
    mu-bottom-nav(:value="bottomNav", @change="handleBottom")
      mu-bottom-nav-item(value="/", title="首页", icon="home")
      mu-bottom-nav-item(value="/detection", title="发现", icon="widgets")
      mu-bottom-nav-item(value="/forum", title="论坛", icon="group")
      mu-bottom-nav-item(value="/person", title="我的", icon="person")
  .main-bottom-about(v-if="show && screen.width > 480")
    p Copyright © 2017 天津商业大学阳光网站
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'bottom-nav',
  props: {
    show: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState([
      'screen',
    ]),
    bottomNav() {
      return this.$route.path;
    },
  },
  methods: {
    handleBottom(val) {
      this.$router.replace(val);
    },
  },
};
</script>

<style lang="stylus">
.main-bottom-nav
  position fixed
  bottom 0
  width 100%
  transition all .45s easeOutFunction

.main-bottom-about
  line-height 80px
  text-align center

.vertSlideUp-enter, .vertSlideUp-leave-active
  bottom -56px
</style>
