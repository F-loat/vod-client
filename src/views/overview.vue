<template lang="pug">
.page
  .no-data
    mu-icon(
      slot="left",
      value="warning")
    span 没有相关内容
</template>

<script>
export default {
  name: 'overview',
  data() {
    return {
    };
  },
};
</script>

<style lang="less" scoped>
</style>
