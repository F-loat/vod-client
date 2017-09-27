<template lang="pug">
.page
  mu-refresh-control(
    :refreshing="progress.show",
    :trigger="$el",
    @refresh="getLogs")
  .no-data(v-if="!logs.length")
    mu-icon(
      slot="left",
      value="warning")
    span 没有相关内容
  .logs(v-else)
    .log(v-for="log of logs") {{log}}
</template>

<script>
import * as api from '@/api';
import { mapState } from 'vuex';

export default {
  name: 'overview',
  data() {
    return {
      logs: [],
    };
  },
  computed: {
    ...mapState([
      'progress',
    ]),
  },
  activated() {
    this.getLogs();
  },
  methods: {
    async getLogs() {
      this.$store.commit('PROGRESS', true);
      const content = await api.indexLog();
      this.$store.commit('PROGRESS', false);
      if (!content) return;
      this.logs = content.split('\n');
    },
  },
};
</script>

<style lang="less" scoped>
.logs {
  margin-top: 16px;
}
</style>
