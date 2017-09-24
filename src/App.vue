<template lang="pug">
#admin
  transition(name="fade", mode="out-in")
    keep-alive
      router-view
  mu-snackbar(
    v-if="snackbar.show",
    :message="snackbar.text",
    action="关闭",
    @actionClick="$store.commit('SNACKBAR', { show: false })")
</template>

<script>
import MaterialImage from 'material-image';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'app',
  computed: {
    ...mapState([
      'snackbar',
      'popup',
    ]),
  },
  mounted() {
    this.getUser();
    this.getTypes();
    if (localStorage.showBg) this.createBg();
  },
  methods: {
    ...mapActions([
      'getTypes',
    ]),
    getUser() {
      const user = sessionStorage.user;
      if (user) this.$store.commit('USER', JSON.parse(user));
    },
    createBg() {
      this.materialBg = new MaterialImage({
        el: this.$parent.$el,
      });
    },
  },
};
</script>

<style lang="less">
@import '~@/styles/index.less';

#admin {
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
}

.fade-enter-active,
.fade-leave-active {
	transition: all .2s ease;
}

.fade-enter,
.fade-leave-active {
	opacity: 0;
}
</style>
