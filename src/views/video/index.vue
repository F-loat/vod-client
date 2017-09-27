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
            :style="{ backgroundImage: `url(/assets/${banner.path})` }")
        .carousel-titles
          transition(name="fade", mode="out-in")
            .carousel-title(
              @click="handleBannerClick",
              v-for="(banner, index) of banners",
              :class="{ link: banner.href }",
              v-if="index === selectedIndex",
              :key="index")
              | {{banner.title}}
    mu-col(width="100", tablet="30", desktop="30")
      mu-paper.carousel-des
        mu-text-field.search-input(
          v-model="search",
          ref="search",
          :class="{ active: searchInputVisible }",
          @blur="searchInputVisible = false",
          @keyup.enter.native="handleSearch")
        mu-float-button.search-button(icon="search", @click.native="handleSearchButton")
        transition(name="fade-down", mode="out-in")
          .carousel-des-content(
            @click="handleBannerClick",
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
            router-link.more(:to="'/list/' + (list.type._id || '')") 更多>
        mu-grid-tile(
          :rows="1",
          :cols="1",
          v-for="(video, index) of list.videos",
          v-if="screen.width > 480 ? index < cols : index < cols * 2",
          :key="video._id")
          router-link(:to="`/play/${video._id}`")
            .main-list-item(
              :style="{ backgroundImage: `url(/assets/${video.poster})` }")
          span(slot="title") {{video.title}}
</template>

<script>
import Flickity from '@/components/video/flickity';
import { mapState, mapActions } from 'vuex';
import * as api from '@/api';

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
      search: '',
      searchInputVisible: false,
      selectedIndex: 0,
      listWidth: 0,
      lists: [],
      banners: [],
      types: [],
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
    ]),
    cols() {
      if (this.listWidth <= 480) return 3;
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
      this.getType();
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
    async getVideo(type) {
      const data = await api.indexVideo({
        type: type ? type._id : '',
      });
      if (!data) return;
      this.lists.push({
        type: type || { name: '最新' },
        videos: data.videos,
      });
    },
    async getBanner() {
      const data = await api.indexBanner();
      if (!data) return;
      this.banners = data.banners;
      this.$nextTick(() => this.init());
    },
    async getType() {
      const data = await api.indexType({ type: 'video' });
      if (!data) return;
      this.types = data.types;
      this.types.forEach(type => this.getVideo(type));
    },
    handleSearch() {
      if (!this.search) return;
      this.$router.push(`/list?search=${this.search}`);
      this.search = '';
    },
    handleBannerClick() {
      const index = this.selectedIndex;
      const banner = this.banners[index];
      if (banner.type === 'inside') location.href = banner.href;
      if (banner.type === 'outside') window.open(banner.href);
    },
    handleSearchButton() {
      this.searchInputVisible = !this.searchInputVisible;
      if (this.searchInputVisible) this.$refs.search.focus();
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
  background-position center
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
    top 16px
    right 0
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
  cursor pointer

.search-input
  position absolute
  top -37px
  right 72px
  width 0
  transition all .3s
  &.active
    width 256px

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
