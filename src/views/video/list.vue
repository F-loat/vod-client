<template lang="pug">
#list
  mu-paper
    .pic {{type && type.name}}
    .tabulation
      mu-grid-list(:cellHeight="cellHeight", :cols="cols", :padding="12" ref="list")
        mu-grid-tile(:rows="1", :cols="1", v-for="(video, index) of videos", :key="index")
          router-link(:to="`/play/${video._id}/1`")
            .main-list-item(:style="{ backgroundImage: `url(/uploads/${video.posterPath})` }")
          span(slot="title") {{video.title}}
</template>

<script>
import { _video } from '@/api';
import { mapState, mapGetters, mapActions } from 'vuex';

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
      type: {},
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
    ]),
    ...mapGetters([
      'videoTypes',
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
      const typeId = this.$route.params.type;
      const content = await _video.list({ type: typeId });
      if (!content) return;
      this.videos = content.videos;
      this.type = this.videoTypes.find(type => type._id === typeId);
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
.pic
  height 240px
  background-image url('~assets/img/bg3.jpg')
  background-size cover
  background-position center center
  font-size 24px
  display flex
  align-items flex-end
  padding 1pc 20px

.main-list-item
  height 100%
  background-size cover
  background-position center center
  background-repeat no-repeat

.tabulation
  padding 16px
  min-height 100%

.tabulation-item
  height 100%
  background-size cover
  background-position center center
  background-repeat no-repeat
</style>
