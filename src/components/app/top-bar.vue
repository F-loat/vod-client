<template lang="pug">
transition(name="vertSlideDown")
  mu-appbar.main-title(v-show="show") {{$route.meta.title}}
    mu-icon-button.iconfont.icon-logo(slot="left", @click="goToIndex")
    mu-icon-button(icon="search", @click="toogleSearch()", slot="right")
    mu-text-field.appbar-search-field(@blur="toogleSearch(true)", :class="{ 'hideSearch': screen.width <= 480 && hideSearch}", slot="right", hintText="请输入搜索内容")
    template(v-if="screen.width > 480")
      mu-flat-button(color="white", label="论坛", slot="right", @click="$router.push('/forum')")
      mu-flat-button(color="white", label="个人中心", slot="right", @click="$router.push('/person')")
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'bottom-nav',
  data() {
    return {
      hideSearch: true,
    };
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState([
      'screen',
    ]),
  },
  methods: {
    handleBottom(val) {
      this.$router.replace(val);
    },
    toogleSearch(val = !this.hideSearch) {
      this.hideSearch = val;
    },
    goToIndex() {
      this.$router.push('/');
    },
  },
};
</script>

<style lang="stylus">
.mu-appbar
  z-index 999
  .mu-flat-button
    line-height 64px

.main-title
  position fixed
  top 0
  left 0
  transition all .45s easeOutFunction
  @media (min-width: 1367px)
    padding 0 10%
  .mu-appbar-title
    overflow visible
  .mu-text-field-content
    white-space nowrap

.icon-logo:before
  color #fff

.hideSearch
  width 0
  .mu-text-field-content
    opacity 0

.appbar-search-field
  color #fff
  margin-bottom 0
  transition width .5s
  &.focus-state
    color #fff
  .mu-text-field-hint
    color rgba(255, 255, 255, 0.5)
  .mu-text-field-input
    color #fff
  .mu-text-field-focus-line
    background-color #fff
  .mu-text-field-content
    transition opacity .5s

.vertSlideDown-enter, .vertSlideDown-leave-active
  top -56px
</style>
