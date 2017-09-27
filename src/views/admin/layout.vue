<template lang="pug">
.layout(:class="{ 'nav-hide': !nav.open }")
  mu-popup(
    position="top",
    :overlay="false",
    :open="popup.show") {{popup.text}}
  mu-drawer.nav(:open="nav.open", :zDepth="0")
    mu-appbar(title="管理后台")
    .drawer-content
      mu-list(:value="$route.path")
        mu-list-item(
          v-for="(route, index) in $router.options.routes",
          v-if="route.path.slice(0, 6) === '/admin' && !route.meta.hidden",
          :key="index",
          :title="route.meta.title",
          :toggleNested="!route.meta.leaf",
          :open="true",
          :value="route.path",
          @click="route.meta.leaf && $router.push(route.path)")
          mu-icon(slot="left", :value="route.meta.icon")
          template(v-if="!route.meta.leaf")
            mu-list-item(
              v-for="(child, index) of route.children",
              :key="index",
              :title="child.meta.title",
              :value="child.path",
              @click="$router.push(child.path)",
              slot="nested")
  .main
    mu-appbar.bar(:title="$route.meta.title")
      mu-icon-button(
        icon="menu",
        iconClass="nav-menu-button",
        slot="left",
        @click="nav.open = !nav.open")
      mu-flat-button(:label="user.nickname", slot="right")
      mu-icon-menu(
        icon="more_vert",
        slot="right",
        :anchorOrigin="{ vertical: 'bottom', horizontal: 'left' }")
        mu-menu-item(title="设置")
        mu-menu-item(title="退出", @click="alert.open = true")
    transition(name="fade-down", mode="out-in")
      keep-alive
        router-view.content
  mu-dialog(
    :class="{ opacity: user.theme && user.theme.showBg }",
    :open="alert.open",
    title="确认退出？",
    @close="alert.open = false")
    mu-flat-button(
      label="确定",
      slot="actions",
      primary,
      @click="logout")
    mu-flat-button(
      label="取消",
      slot="actions",
      primary,
      @click="alert.open = false")
  mu-linear-progress.progress(
    v-show="progress.show",
    :size="3",
    color="#ff4081")
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'layout',
  data() {
    return {
      nav: {
        open: true,
      },
      alert: {
        open: false,
      },
    };
  },
  computed: {
    ...mapState([
      'user',
      'popup',
      'progress',
    ]),
  },
  mounted() {
    this.adjust();
  },
  methods: {
    logout() {
      this.alert.open = false;
      this.$router.push('/login');
    },
    adjust() {
      if (document.body.clientWidth < 900) {
        this.nav.open = false;
      }
    },
  },
  watch: {
    $route() {
      this.adjust();
    },
  },
};
</script>

<style lang="less">
.layout {
  height: 100%;
  overflow: hidden;
  transition: all .45s cubic-bezier(.23, 1, .32, 1);
  padding-left: 256px;
  background-color: rgba(255, 255, 255, .3);
  &.nav-hide {
    padding-left: 0;
    .nav-menu-button {
      transform: rotate(-90deg);
    }
  }
  .nav-menu-button {
    transition: all .45s;
  }
}
</style>

<style lang="less" scoped>
@import '~muse-ui/less/mixins.less';

.drawer-content {
  height: 100%;
  .scrollable();
  .no-scrollbar();
}

.nav {
  width: 256px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, .3);
}

.main {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding-bottom: 24px;
  .scrollable();
  @media (max-width: 480px) {
    padding: 0;
  }
}

.progress {
  position: absolute;
  bottom: 0;
  background-color: transparent;
}
</style>
