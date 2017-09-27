<template lang="pug">
#play
  mu-paper
    .play-area
      .play-holder(v-show="!ready")
      .dplayer(v-show="ready", ref="player")
    .side
      mu-tabs(
        :value="activeTab",
        @change="handleTabChange",
        v-if="episodes.length > 1")
        mu-tab(value="info", title="介绍")
        mu-tab(
          value="episodes",
          title="选集")
      .side-content(v-if="activeTab === 'info'")
        .video-title
          h2 {{video.title}}
          span(v-if="peerNum") （共{{peerNum}}人与你分享该视频）
        p.video-des 国家：{{String(video.countries || '').replace(',', '/')}}
        p.video-des 导演：{{String(video.directors || '').replace(',', '/')}}
        p.video-des 演员：{{String(video.performers || '').replace(',', '/')}}
        br
        p.video-des 影片简介：
        p.video-des.video-summary {{video.summary}}
      .side-content(
        v-if="activeTab === 'episodes' && episodes.length > 1")
        mu-flat-button(
          v-for="(episode, index) of episodes",
          :key="episode._id",
          :label="String(index + 1)",
          @click="switchEpisodes(index)")
    .comment-area(v-show="episodes.length")
      .comment-push
        mu-text-field(
          hintText="文明评论",
          :multiLine="true",
          :fullWidth="true",
          :rows="3",
          :rowsMax="6",
          v-model="comment")
        mu-raised-button(
          label="评论",
          primary,
          @click="sendComment")
      mu-list.comment-list
        mu-list-item(
          :title="String(comment.creater.nickname)",
          v-for="comment in comments",
          :key="comment._id")
          mu-avatar(
            :src="comment.creater.avatar ? `/assets/${comment.creater.avatar}` : '/static/img/youngon.gif'",
            slot="leftAvatar")
          span(slot="describe")
            span(style="color: rgba(0, 0, 0, .87)")
              | {{comment.content}}
          mu-icon(value="chat_bubble", slot="right")
</template>

<script>
import { mapState, mapActions } from 'vuex';
import WebTorrent from 'webtorrent';
import DPlayer from 'dplayer';
import * as api from '@/api';

export default {
  name: 'play',
  data() {
    return {
      ready: false,
      video: {},
      episodes: [],
      comments: [],
      comment: '',
      activeTab: 'info',
      peerNum: 0,
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
    ]),
    player() {
      return this.$refs.player.dp;
    },
  },
  mounted() {
    this.client = new WebTorrent();
    this.$nextTick(() => {
      this.getVideo();
      this.getEpisodes();
    });
  },
  beforeDestroy() {
    this.client.destroy();
  },
  methods: {
    ...mapActions([
      'showSnackbar',
    ]),
    async getVideo() {
      const data = await api.showVideo(this.$route.params.id);
      if (!data) return;
      this.video = data;
    },
    async getEpisodes() {
      const { params } = this.$route;
      const data = await api.indexEpisode({
        belong: params.id,
      });
      if (!data) return;
      if (!data.episodes.length) {
        this.showSnackbar('视频文件暂未上传');
        return;
      }
      this.episodes = data.episodes;
      let episodeId = params.episode;
      if (!episodeId) {
        episodeId = this.episodes[0]._id;
        this.$router.replace(`/play/${params.id}/${episodeId}`);
      }
      const episode = this.episodes.find(item => item._id === episodeId);
      if ('MediaSource' in window) {
        this.dplayer = new DPlayer({
          loop: false,
          screenshot: true,
          theme: '#7e57c2',
        });
        this.client.add(`${location.origin}/assets/${episode.path}.torrent`, (torrent) => {
          const file = torrent.files.find(f => f.name.endsWith('.mp4'));
          file.renderTo('.dplayer-video');
          torrent.on('wire', (wire) => {
            this.peerNum += 1;
            wire.once('close', () => {
              this.peerNum -= 1;
            });
          });
        });
      } else {
        this.dplayer = new DPlayer({
          loop: false,
          screenshot: true,
          theme: '#7e57c2',
          video: {
            url: `${location.origin}/assets/${episode.path}.mp4`,
          },
        });
      }
      this.ready = true;
      this.getComments();
    },
    switchEpisodes(index) {
      const { _id, path, state } = this.episodes[index];
      this.dplayer.switchVideo({
        url: `/assets/${path}${state === 2 ? '/index.m3u8' : ''}`,
        pic: '/static/img/waiting.png',
        type: 'auto',
      });
      this.$router.replace(`/play/${this.$route.params.id}/${_id}`);
    },
    async getComments() {
      const data = await api.indexComment({
        belong: this.$route.params.id,
      });
      if (!data) return;
      this.comments = data.comments;
    },
    async sendComment() {
      const { comment } = this;
      if (!this.user._id) {
        this.showSnackbar('登录后可评论');
        this.$router.push('/login');
        return;
      }
      if (!comment) {
        this.showSnackbar('请输入评论');
        return;
      }
      const data = await api.createComment({
        belong: this.$route.params.id,
        content: this.comment,
      }, {
        type: 'topic',
      });
      if (!data) return;
      this.getComments();
      this.comment = '';
    },
    handleTabChange(val) {
      this.activeTab = val;
    },
  },
};
</script>

<style lang="stylus" scoped>
@import '~dplayer/dist/DPlayer.min.css'

@media (max-width: 480px)
  #play
    padding-top 0
  .play-area
    position fixed
    top 0
  .side
    margin-top 56.25%

.play-area
  z-index 200
  width 100%

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

.side-content
  overflow auto
  padding 1pc
  &::-webkit-scrollbar
    display none !important
    width 0 !important
    height 0 !important
    -webkit-appearance none
    opacity 0 !important
.video-title
  display flex
  align-items baseline
  color #453d3d
  line-height 2
  h2
    margin 10px 5px 0
.video-des
  color #453d3d
  margin 0 5px
  line-height 1.6
.video-summary
  text-indent 2em

.mu-tabs
  background-color #474a4f
.mu-tab-link-highlight
  background-color #ff5252

.comment-area
  padding 0 1pc
  margin-top 20px

.comment-list
  padding 1pc 0

.comment-push
  text-align right
</style>
