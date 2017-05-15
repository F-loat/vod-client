<template lang="pug">
#play
  top-bar(:show="screen.width > 480")
  mu-row
    mu-col.play-area(width="100", tablet="70", desktop="70")
      .play-holder(v-show="!ready")
      .dplayer(v-show="ready", ref="player")
    mu-col.side(width="100", tablet="30", desktop="30")
      mu-tabs(:value="activeTab", @change="handleTabChange")
        mu-tab(value="info", title="介绍")
        mu-tab(
          value="episodes",
          title="选集",
          v-if="episodes.length > 1")
      .side-content(v-if="activeTab === 'info'")
        h2.video-title {{video.title}}
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
  .comment-area
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
        :title="String(comment.commenter.stuid)",
        v-for="comment in comments",
        :key="comment._id")
        mu-avatar(src="/static/img/youngon.gif", slot="leftAvatar")
        span(slot="describe")
          span(style="color: rgba(0, 0, 0, .87)")
            | {{comment.content}}
        mu-icon(value="chat_bubble", slot="right")
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { _video, _episode, _comment } from '@/api';
import TopBar from 'components/app/top-bar';
import DPlayer from 'dplayer';
import Hls from 'hls.js';

window.Hls = Hls;

export default {
  name: 'play',
  components: {
    TopBar,
  },
  data() {
    return {
      ready: false,
      video: {},
      episodes: [],
      comments: [],
      comment: '',
      activeTab: 'info',
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
  activated() {
    this.$nextTick(() => {
      this.getVideo();
      this.getEpisodes();
    });
  },
  deactivated() {
    this.ready = false;
  },
  methods: {
    ...mapActions([
      'showSnackbar',
    ]),
    async getVideo() {
      const content = await _video.get({
        _id: this.$route.params.id,
      });
      if (!content) return;
      this.video = content;
    },
    async getEpisodes() {
      const content = await _episode.list({
        videoId: this.$route.params.id,
      });
      if (!content) return;
      this.episodes = content;
      if (!this.episodes.length) {
        this.showSnackbar('视频文件暂未上传');
        return;
      }
      let episode = this.$route.params.episode - 1;
      if (this.episodes.length <= episode) {
        const id = this.$route.params.id;
        this.$router.replace(`/play/${id}/1`);
        episode = 0;
      }
      this.getComments();
      this.dplayer = new DPlayer({
        loop: false,
        screenshot: false,
        theme: '#7e57c2',
        hotkey: false,
        video: {
          url: `/uploads/${this.episodes[episode].filePath}`,
          pic: '/static/img/waiting.png',
          type: 'auto',
        },
        danmaku: {
          id: this.episodes[episode]._id,
          api: '/request/danmaku',
          token: 'youngon_vod',
          maximum: 1000,
          user: this.user._id || 'youngon',
        },
      });
      this.ready = true;
    },
    switchEpisodes(episode) {
      const route = this.$route;
      this.$router.replace(`/play/${route.params.id}/${episode + 1}`);
      this.dplayer = new DPlayer({
        loop: false,
        screenshot: false,
        theme: '#7e57c2',
        hotkey: false,
        video: {
          url: `/uploads/${this.episodes[episode].filePath}`,
          pic: '/static/img/waiting.png',
          type: 'auto',
        },
        danmaku: {
          id: this.episodes[episode]._id,
          api: '/request/danmaku',
          token: 'youngon_vod',
          maximum: 1000,
          user: this.user._id || 'youngon',
        },
      });
    },
    async getComments() {
      const episodeIndex = this.$route.params.episode - 1;
      const id = this.episodes[episodeIndex]._id;
      const content = await _comment.list({ id });
      if (!content) return;
      this.comments = content;
    },
    async sendComment() {
      const comment = this.comment;
      if (!this.user._id) {
        this.showSnackbar('登录后可评论');
        return;
      }
      if (!comment) {
        this.showSnackbar('请输入评论');
        return;
      }
      const episodeIndex = this.$route.params.episode - 1;
      const id = this.episodes[episodeIndex]._id;
      const newComment = await _comment.post({
        id,
        content: this.comment,
      });
      if (!newComment) return;
      newComment.commenter = this.user;
      this.comments.unshift(newComment);
    },
    handleTabChange(val) {
      this.activeTab = val;
    },
  },
};
</script>

<style lang="stylus" scoped>
@media (max-width: 480px)
  #play
    padding-top 56px
  .play-area
    position fixed
    top 0
  .side
    margin-top 56.25%

#play
  padding-top 64px

.play-area
  z-index 200

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
  padding 10px
  &::-webkit-scrollbar
    display none !important
    width 0 !important
    height 0 !important
    -webkit-appearance none
    opacity 0 !important
.video-title
  color #453d3d
  line-height 2
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
  margin-top 20px

.comment-push
  padding 10px
  text-align right
</style>
