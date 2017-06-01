<template lang="pug">
#index
  mu-row(gutter)
    mu-col(width="100", desktop="70")
      mu-paper.carousel-wrap
        flickity(ref="flickity", :options="flickityOptions")
          .carousel-cell(
            v-for="banner of banners",
            :style="{ backgroundImage: `url(${banner})` }")
        .carousel-titles
          .carousel-title 再见，天商
    mu-col(width="100", desktop="30")
      mu-paper.carousel-des
        mu-float-button.search-button(icon="search")
        .carousel-des-content 这四年 我不悔梦无归 时光倒流 故事倒叙 也不肯重来 我只恨时光太匆匆 好像刚刚有心 为你我的故事写下三两笔 下一页 已然是全书 终 我的四年清梦 我的客栈河涧 你我既在山前相见 山后必定重逢 只怕往后山远水远路迢迢 只愿少年你少忧多欢喜 从此望君安
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
import Flickity from 'vue-flickity';
import { _video } from '@/api';
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
      },
      listWidth: 0,
      lists: [],
      banners: [
        '//vod.youngon.com.cn/static/1.jpg',
        '//vod.youngon.com.cn/static/2.jpg',
        '//vod.youngon.com.cn/static/3.jpg',
        '//vod.youngon.com.cn/static/4.jpg',
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
    },
    async getVideo() {
      const content = await _video.typed();
      if (!content) return;
      this.lists = content;
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
    display none

.carousel-des
  display flex
  justify-content center
  align-items center
  position relative
  @media (min-width: 480px)
    height 404px
.carousel-des-content
  padding 1pc
  line-height 1.8
  text-indent 2em

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
