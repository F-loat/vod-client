<template lang="pug">
q-layout(ref="layout", view="hHr LpR lFf", :right-breakpoint="900")
  q-toolbar(slot="header")
    q-btn(flat, @click="$refs.layout.toggleLeft()")
      q-icon(name="menu")
    q-toolbar-title {{$route.meta.title}}
  q-list(slot="left", no-border, link, highlight)
    q-side-link(item, to="/")
      q-item-side(icon="home")
      q-item-main(label="首页")
    q-side-link(item, to="/admin", v-if="user.type === 'admin'")
      q-item-side(icon="dashboard")
      q-item-main(label="管理后台")
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
  QTab
} from 'quasar'

export default {
  name: 'layout-normal',
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
    }
  },
  computed: {
    ...mapState([
      'user'
    ])
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="stylus" scoped>
</style>

