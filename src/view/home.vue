<template lang="pug">
#home
  .row.sm-gutter(style="padding: 8px")
    .col-12.col-sm-9
        q-carousel.shadow-1.banner-height(infinite, dots)
          .carousel-item(
            slot="slide",
            v-for="banner of banners",
            :style="{ backgroundImage: `url(/assets/${banner.path})` }")
    .col-3.gt-xs
      .shadow-1.banner-height lalala
  .video-list
    router-link.video-item(v-for="video of videos", :key="video._id", :to="`/video/${video._id}`")
      q-card(inline)
        q-card-media
          img(:src="`/assets/${video.poster}`")
          q-card-title(slot="overlay") {{video.title}}
</template>

<script>
import {
  QCarousel,
  QCard,
  QCardMedia,
  QCardTitle
} from 'quasar'
import * as api from '@/api'

export default {
  name: 'app',
  components: {
    QCarousel,
    QCard,
    QCardMedia,
    QCardTitle
  },
  data () {
    return {
      lists: [],
      banners: [],
      videos: []
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.getVideo()
      this.getBanner()
    })
  },
  methods: {
    async getVideo () {
      const data = await api.indexVideo()
      if (!data) return
      this.videos = data.videos
    },
    async getBanner () {
      const data = await api.indexBanner()
      if (!data) return
      this.banners = data.banners
    }
  }
}
</script>

<style lang="stylus">
#home .carousel-item
  background-position center center
  background-size cover
  background-repeat no-repeat
</style>

<style lang="stylus" scoped>
#home
  max-width 1100px
  padding 1.5rem 2rem
  margin 0 auto
  @media (max-width: 576px)
    padding 0
.banner-height
  height 360px
  @media (max-width: 992px)
    height 320px
  @media (max-width: 768px)
    height 220px
.video-list
  column-count 5
  column-gap 0
  @media (max-width: 992px)
    column-count 4
  @media (max-width: 768px)
    column-count 3
  @media (max-width: 576px)
    column-count 2
  a
    display inline-block
.video-item
  break-inside avoid
  box-sizing border-box
</style>

