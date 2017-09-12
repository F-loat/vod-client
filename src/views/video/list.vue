<template lang="pug">
#list
  mu-paper
    .pic {{type.name}}
    .tabulation
      mu-grid-list(:cellHeight="cellHeight", :cols="cols", :padding="12" ref="list")
        mu-grid-tile(:rows="1", :cols="1", v-for="(video, index) of videos", :key="index")
          router-link(:to="`/play/${video._id}`")
            .main-list-item(:style="{ backgroundImage: `url(/assets/${video.poster})` }")
          span(slot="title") {{video.title}}
</template>

<script>
import { mapState } from 'vuex';
import * as api from '@/api';

export default {
  name: 'list',
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
    cols() {
      return Math.round(this.listWidth / 160);
    },
    cellHeight() {
      return (this.listWidth * 1.4) / this.cols;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.init();
    });
  },
  activated() {
    this.getType();
    this.getVideos();
  },
  methods: {
    init() {
      this.listWidth = this.$refs.list.$el.clientWidth;
    },
    async getVideos() {
      const { type } = this.$route.params;
      const { search } = this.$route.query;
      const data = await api.indexVideo({
        type: type || '',
        search: search || '',
      });
      if (!data) return;
      this.videos = data.videos;
    },
    async getType() {
      const { type } = this.$route.params;
      const { search } = this.$route.query;
      if (type) {
        this.type = await api.showType(type);
      } else if (search) {
        this.type = { name: '搜索结果' };
      } else {
        this.type = { name: '最新' };
      }
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
