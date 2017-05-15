<template lang="pug">
#index
  swiper(:options="swiperOption", ref="banner")
    swiper-slide.slide-item(
      :style="{ height: `${slideHeight}px`, backgroundImage: `url(${banner})` }",
      v-for="(banner, index) of banners",
      :key="index")
    .swiper-pagination(slot="pagination")
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
import { _video } from '@/api';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'index',
  data() {
    return {
      listWidth: 0,
      swiperOption: {
        autoplay: 5000,
        loop: true,
        pagination: '.swiper-pagination',
        paginationClickable: true,
        effect: 'coverflow',
        centeredSlides: true,
        mousewheelControl: true,
        autoplayDisableOnInteraction: false,
      },
      lists: [],
      banners: [
        'https://vod.youngon.com.cn/1.jpg',
        'https://vod.youngon.com.cn/2.jpg',
        'https://vod.youngon.com.cn/3.jpg',
      ],
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
    ]),
    swiper() {
      return this.$refs.banner.swiper;
    },
    cols() {
      return Math.round(this.listWidth / 160);
    },
    cellHeight() {
      return (this.listWidth * 1.4) / this.cols;
    },
    slideHeight() {
      if (this.screen.width > 993) return this.screen.width * 0.4 * 0.56;
      if (this.screen.width > 480) return this.screen.width * 0.28;
      return this.screen.width * 0.56;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.getVideo();
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
      this.swiperAdjust();
    },
    async getVideo() {
      const content = await _video.typed();
      if (!content) return;
      this.lists = content;
    },
    swiperAdjust() {
      const swiper = this.swiper;
      swiper.params.slidesPerView = this.screen.width > 480 ? 2 : 1;
      swiper.reLoop();
      if (this.screen.width > 480) {
        swiper.slideTo(swiper.activeIndex + 1, 0);
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
.mu-grid-tile
  border-radius 2px
  box-shadow 0 1px 6px rgba(0,0,0,.117647), 0 1px 4px rgba(0,0,0,.117647)
</style>

<style lang="stylus" scoped>
.slide-item
  background-color #eee
  background-size cover
  background-position center center
  background-repeat no-repeat
  a
    display  block
    height 100%

.main-list-wrap
  @media (max-width: 1367px) and (min-width: 480px)
    padding-left 5%
    padding-right 5%

.main-list-item
  height 100%
  background-size cover
  background-position center center
  background-repeat no-repeat

@media (min-width: 993px)
  .swiper-container
    margin-top 10px

.more
  color #aaa
</style>
