<template lang="pug">
#video-play.layout-padding
  .shadow-1
    .play-area
      .play-holder(v-show="!ready")
      .dplayer(v-show="ready", ref="player")
    q-tabs
      q-tab(default, slot="title", name="info", label="介绍")
      q-tab(slot="title", name="episodes", label="选集")
      q-tab-pane.video-info.no-border(name="info")
        .video-title
          h2 {{video.title}}
          span(v-if="peerNum") （共{{peerNum}}人与你分享该视频）
        p.video-des 国家：{{String(video.countries || '').replace(',', '/')}}
        p.video-des 导演：{{String(video.directors || '').replace(',', '/')}}
        p.video-des 演员：{{String(video.performers || '').replace(',', '/')}}
        br
        p.video-des 影片简介：
        p.video-des.video-summary {{video.summary}}
      q-tab-pane.no-border(name="episodes")
        .group
          q-btn(
            v-for="(episode, index) of episodes",
            :key="episode._id",
            @click="playEpisode(episode)") {{String(index + 1)}}
            q-tooltip(:offset="[10, 10]") {{episode.name}}
    .comment-area
      .comment-push
        q-input(
          type="textarea",
          float-label="文明评论",
          v-model="comment")
        q-btn(@click="sendComment") 评论
      q-list.comment-list(v-show="comments.length")
        q-item(
          :title="String(comment.creater.nickname)",
          v-for="comment in comments",
          :key="comment._id")
          q-item-side(avatar="comment.creater.avatar ? `/assets/${comment.creater.avatar}` : '/static/img/youngon.gif'")
          q-item-main(:label="comment.content")
          q-item-side(right) {{comment.createdAt}}
</template>

<script>
import WebTorrent from 'webtorrent'
import DPlayer from 'dplayer'
import * as api from '@/api'
import {
  QTabs,
  QTab,
  QTabPane,
  QInput,
  QList,
  QItem,
  QItemSide,
  QItemMain,
  QBtn,
  QTooltip,
  QIcon,
  Toast
} from 'quasar'

export default {
  name: 'video',
  components: {
    QTabs,
    QTab,
    QTabPane,
    QInput,
    QList,
    QItem,
    QItemSide,
    QItemMain,
    QBtn,
    QTooltip,
    QIcon
  },
  data () {
    return {
      ready: false,
      video: {},
      episodes: [],
      comments: [],
      comment: '',
      peerNum: 0
    }
  },
  computed: {
    player () {
      return this.$refs.player.dp
    }
  },
  activated () {
    this.client = new WebTorrent()
    this.$nextTick(() => {
      this.getVideo()
      this.getEpisodes()
      this.getComments()
    })
  },
  deactivated () {
    this.ready = false
    this.video = {}
    this.episodes = []
    this.comments = []
    if (this.client) this.client.destroy()
    if (this.player) this.player.destroy()
  },
  methods: {
    async getVideo () {
      const data = await api.showVideo(this.$route.params.id)
      if (data) this.video = data
    },
    async getEpisodes () {
      const { params } = this.$route
      const data = await api.indexEpisode({
        belong: params.id,
        sort: 'createdAt'
      })
      if (!data) return
      if (!data.episodes.length) {
        Toast.create('视频文件暂未上传')
        return
      }
      this.episodes = data.episodes
      const episodeId = params.episode || this.episodes[0]._id
      const episode = this.episodes.find(item => item._id === episodeId)
      this.playEpisode(episode)
      this.ready = true
    },
    playEpisode (episode) {
      this.dplayer = new DPlayer({
        loop: false,
        screenshot: true,
        theme: '#7e57c2',
        video: {
          url: `${location.origin}/assets/${episode.path}.mp4`
        }
      })
      if ('MediaSource' in window && WebTorrent.WEBRTC_SUPPORT) {
        this.client.add(`${location.origin}/assets/${episode.path}.torrent`, (torrent) => {
          const file = torrent.files.find(f => f.name.endsWith('.mp4'))
          file.renderTo('.dplayer-video', {
            autoplay: false
          })
          torrent.on('wire', (wire) => {
            this.peerNum += 1
            wire.once('close', () => {
              this.peerNum -= 1
            })
          })
        })
      }
      this.$router.replace(`/video/${this.$route.params.id}/${episode._id}`)
    },
    async getComments () {
      const data = await api.indexComment({
        belong: this.$route.params.id
      })
      if (data) this.comments = data.comments
    },
    async sendComment () {
      const { comment } = this
      if (!sessionStorage.token) {
        Toast.create('登录后可评论')
        this.$router.push('/login')
        return
      }
      if (!comment) {
        Toast.create('请输入评论')
        return
      }
      const data = await api.createComment({
        belong: this.$route.params.id,
        content: this.comment
      }, {
        type: 'topic'
      })
      if (!data) return
      this.getComments()
      this.comment = ''
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~dplayer/dist/DPlayer.min.css'

#video-play
  max-width 1000px

.layout-padding
  @media (max-width: 576px)
    padding 0

.play-holder
  width 100%
  max-width 100%
  height 0
  padding-top 56.25%
  border-radius 2px
  overflow hidden
  background-color rgb(0, 0, 0)
  background-image url('/static/img/waiting.png')
  background-size contain
  background-repeat no-repeat
  background-position center
.video-info p
  font-size 14px
.video-title
  display flex
  align-items baseline
  color #453d3d
  line-height 2
  h2
    font-size 22px
    margin 10px 5px
.video-des
  color #453d3d
  margin 0 5px
  line-height 1.6
.video-summary
  text-indent 2em

.comment-area
  padding 0 16px 32px
.comment-list
  margin-top 32px
</style>
