<template lang="pug">
q-pull-to-refresh(:handler="refresher")
  .layout-padding
    .log(v-for="log of logs") {{log}}
</template>

<script>
import * as api from '@/api'
import { QPullToRefresh } from 'quasar'

export default {
  name: 'overview',
  components: {
    QPullToRefresh
  },
  data () {
    return {
      logs: []
    }
  },
  activated () {
    this.getLogs()
  },
  methods: {
    async getLogs () {
      const data = await api.indexLog()
      if (!data) return
      this.logs = data.split('\n')
    },
    async refresher (done) {
      await this.getLogs()
      done()
    }
  }
}
</script>

<style lang="styl">
</style>
