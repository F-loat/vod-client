<template lang="pug">
q-layout(ref="layout", view="lHr LpR lFf", :right-breakpoint="900")
  q-toolbar(slot="header")
    q-btn(flat, @click="$refs.layout.toggleLeft()")
      q-icon(name="menu")
    q-toolbar-title {{$route.meta.title}}
    q-btn(flat) {{user.nickname}}
    q-btn(flat)
      q-icon(name="more_vert")
      q-popover(ref="popover")
        q-list(item-separator, link, style="min-width: 100px")
          q-item(to="/") 前台界面
          q-item(to="/login") 退出
  template(slot="navigation", v-if="$route.meta.tabs")
    q-tabs
      q-tab(
        slot="title",
        v-for="(tab, index) of $route.meta.tabs",
        :key="index",
        :default="index === 0",
        :label="tab.label",
        :icon="tab.icon",
        @select="emitEvent(`${$route.name}-tab-change`, tab.type)")
  q-list(slot="left", no-border, link, highlight)
    q-list-header 管理后台
    q-side-link(
      item,
      v-for="(route, index) of routes",
      :key="index",
      :to="route.path",
      v-if="!route.hidden")
      q-item-side(:icon="route.meta.icon")
      q-item-main(:label="route.meta.title")
  transition(name="fade-down", mode="out-in")
    keep-alive
      router-view
  q-fixed-position(corner="bottom-right", :offset="[18, 18]")
    q-btn.animate-pop(
      v-back-to-top.animate="{ offset: 200, duration: 200 }"
      round,
      color="primary",
      icon="keyboard_arrow_up")
</template>

<script>
import { mapState } from 'vuex'
import {
  QLayout,
  QList,
  QListHeader,
  QSideLink,
  QItem,
  QItemSide,
  QItemMain,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
  QPopover,
  QFixedPosition,
  BackToTop,
  QTabs,
  QTab,
  Events
} from 'quasar'

export default {
  name: 'layout-admin',
  directives: {
    BackToTop
  },
  components: {
    QLayout,
    QList,
    QListHeader,
    QSideLink,
    QItem,
    QItemSide,
    QItemMain,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QPopover,
    QFixedPosition,
    QTabs,
    QTab
  },
  data () {
    return {
      routes: []
    }
  },
  computed: {
    ...mapState([
      'user'
    ])
  },
  mounted () {
    const currentRoute = this.$router.options.routes.find(route =>
      route.name === 'layout-admin')
    this.routes = currentRoute.children
  },
  methods: {
    emitEvent (eventName, params) {
      Events.$emit(eventName, params)
    }
  }
}
</script>

<style lang="stylus" scoped>
.fade-down-enter-active,
.fade-down-leave-active
  transition all .4s ease

.fade-down-enter,
.fade-down-leave-active
  opacity 0
  transform translate(0, 50px)
</style>

