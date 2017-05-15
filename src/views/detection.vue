<template lang="pug">
#detection
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'detection',
  mounted() {
    this.$nextTick(() => {
    });
  },
  data() {
    return {
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
    ]),
  },
  methods: {
    ...mapActions([
    ]),
  },
};
</script>

<style lang="stylus">
</style>
