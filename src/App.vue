<template lang="pug">
#q-app
  transition(name="fade", mode="out-in")
    router-view
  q-ajax-bar(size="2px")
</template>

<script>
import { QAjaxBar } from 'quasar'

export default {
  name: 'app',
  components: {
    QAjaxBar
  },
  mounted () {
    this.getUser()
  },
  methods: {
    getUser () {
      const user = sessionStorage.getItem('user')
      if (user) this.$store.commit('USER', JSON.parse(user))
    }
  }
}
</script>

<style lang="stylus" scoped>
#q-app
  width 100vw
</style>
