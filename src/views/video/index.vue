<template lang="pug">
#index
  mu-row(gutter)
    mu-col(width="100", tablet="70", desktop="70")
      mu-paper.carousel-wrap
        flickity(
          ref="flickity",
          :options="flickityOptions")
          .carousel-cell(
            v-for="banner of banners",
            :style="{ backgroundImage: `url(/uploads/${banner.filePath})` }")
        .carousel-titles(@click="handleBannerClick")
          transition(name="fade", mode="out-in")
            .carousel-title(
              v-for="(banner, index) of banners",
              :class="{ link: banner.href }",
              v-if="index === selectedIndex",
              :key="index")
              | {{banner.title}}
    mu-col(width="100", tablet="30", desktop="30")
      mu-paper.carousel-des
        mu-float-button.search-button(icon="search")
        transition(name="fade-down", mode="out-in")
          .carousel-des-content(
            v-for="(banner, index) of banners",
            v-if="index === selectedIndex",
            :key="index")
            | {{banner.summary}}
  mu-content-block.main-list-wrap
    mu-grid-list(
      :cellHeight="cellHeight",
      :cols="cols",
      :padding="12",
      ref="list")
      template(
        v-for="(list, index) of lists",
        v-if="list.videos.length")
        mu-sub-header {{list.type.name}}
          span.pull-right(style="font-size: 12px; padding-right: 16px")
            router-link.more(:to="'/list/' + list.type._id") 更多>
        mu-grid-tile(
          :rows="1",
          :cols="1",
          v-for="(video, index) of list.videos",
          v-if="screen.width > 480 ? index < cols : index < cols * 2",
          :key="video._id")
          router-link(:to="`/play/${video._id}/1`")
            .main-list-item(
              :style="{ backgroundImage: `url(/uploads/${video.posterPath})` }")
          span(slot="title") {{video.title}}
</template>

<script>
import Flickity from '@/components/video/flickity';
import { _video, _banner } from '@/api';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'index',
  components: {
    Flickity,
  },
  data() {
    return {
      flickityOptions: {
        initialIndex: 0,
        prevNextButtons: false,
        pageDots: false,
        wrapAround: true,
        // autoPlay: 5000,
      },
      selectedIndex: 0,
      listWidth: 0,
      lists: [],
      banners: [],
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
      this.getVideo();
      this.getBanner();
    });
  },
  activated() {
    this.$nextTick(() => this.init());
  },
  methods: {
    ...mapActions([
    ]),
    init() {
      this.listWidth = this.$refs.list.$el.clientWidth;
      const flickity = this.$refs.flickity;
      flickity.rerender();
      flickity.on('select', () => {
        this.selectedIndex = flickity.flickity.selectedIndex;
      });
    },
    async getVideo() {
      const content = await _video.typed();
      if (!content) return;
      this.lists = content;
    },
    async getBanner() {
      const content = await _banner.list();
      if (!content) return;
      this.banners = content;
      this.$nextTick(() => this.init());
    },
    handleBannerClick() {
      const index = this.selectedIndex;
      const banner = this.banners[index];
      if (banner.type === 0) this.$router.push(banner.href);
      if (banner.type === 1) location.href = banner.href;
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
.mu-grid-tile
  border-radius 2px
  box-shadow 0 1px 6px rgba(0,0,0,.117647), 0 1px 4px rgba(0,0,0,.117647)
</style>

<style lang="stylus" scoped>
.carousel-wrap
  width 100%
  position relative
  overflow hidden
.carousel-cell
  width 100%
  height 340px
  background-size cover
  @media (max-width: 480px)
    height 0
    padding-bottom 56.25%
.carousel-titles
  height 64px
  padding 16px
  display flex
  align-items center
  @media (max-width: 480px)
    position absolute
    bottom 0
    font-size 18px
    height 48px
.carousel-title.link
  cursor pointer

.carousel-des
  display flex
  justify-content center
  align-items center
  position relative
  border-top 1px solid #eee
  border-bottom 1px solid #eee
  min-height 160px
  @media (min-width: 480px)
    height 404px
.carousel-des-content
  padding 1pc
  line-height 1.8

.search-button
  position absolute
  top -28px
  right 28px

.main-list-wrap
  @media (min-width: 480px)
    padding 1pc 0

.main-list-item
  height 100%
  background-size cover
  background-position center center
  background-repeat no-repeat

.more
  color #aaa
</style>
