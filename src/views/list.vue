<template lang="pug">
#list
  .tabulation
    mu-grid-list(:cellHeight="cellHeight", :cols="cols", :padding="12" ref="list")
      mu-grid-tile(:rows="1", :cols="1", v-for="(video, index) of videos", :key="index")
        router-link(:to="`/play/${video._id}/1`")
          .main-list-item(:style="{ backgroundImage: `url(/uploads/${video.posterPath})` }")
        span(slot="title") {{video.title}}
</template>

<script>
import { _video } from '@/api';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'list',
  mounted() {
    this.$nextTick(() => {
      this.init();
      this.getVideos();
    });
  },
  data() {
    return {
      listWidth: 0,
      videos: [],
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
    ]),
    cols() {
      return Math.round(this.listWidth / 160);
    },
    cellHeight() {
      return (this.listWidth * 1.4) / this.cols;
    },
  },
  methods: {
    ...mapActions([
    ]),
    init() {
      this.listWidth = this.$refs.list.$el.clientWidth;
    },
    async getVideos() {
      const content = await _video.list({
        type: this.$route.params.type,
      });
      if (!content) return;
      this.videos = content.videos;
    },
  },
  watch: {
    'screen.width': function adjust() {
      this.init();
    },
  },
};
</script>

<style lang="stylus">
.main-list-item
  height 100%
  background-size cover
  background-position center center
  background-repeat no-repeat

.tabulation
  padding 16px

.tabulation-item
  height 100%
  background-size cover
  background-position center center
  background-repeat no-repeat
</style>
