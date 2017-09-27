<template lang="pug">
#topic
  mu-paper
    .pic {{topic.title}}
    .topic-info(v-if="topic.content")
       .topic-content {{topic.content}}
    .author
       mu-avatar(
         :src="topic.creater && topic.creater.avatar ? `/assets/${topic.creater.avatar}` : '/static/img/youngon.gif'")
       .author-info
         strong(v-if="topic.creater")
           | {{topic.creater.nickname}}
         span {{topic.createdAt | dateFormat}}
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
          :title="String(comment.creater.nickname)",
          v-for="comment in comments",
          :key="comment._id")
          mu-avatar(:src="comment.creater.avatar ? `/assets/${comment.creater.avatar}` : '/static/img/youngon.gif'", slot="leftAvatar")
          span(slot="describe")
            span(style="color: rgba(0, 0, 0, .87)")
              | {{comment.content}}
          mu-icon(value="chat_bubble", slot="right")
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { date } from '@/utils';
import * as api from '@/api';

export default {
  name: 'topic',
  data() {
    return {
      topic: {},
      comments: [],
      comment: '',
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
    ]),
  },
  activated() {
    this.getTopic();
    this.getComments();
  },
  filters: {
    dateFormat: (value) => {
      if (!value) return '';
      return date.format(new Date(value));
    },
  },
  methods: {
    ...mapActions([
      'showSnackbar',
    ]),
    async getTopic() {
      const data = await api.showTopic(this.$route.params.id);
      if (!data) return;
      this.topic = data;
    },
    async getComments() {
      const { id } = this.$route.params;
      const data = await api.indexComment({ belong: id });
      if (!data) return;
      this.comments = data.comments;
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
      await api.createComment({
        belong: this.$route.params.id,
        content: this.comment,
      }, {
        type: 'topic',
      });
      this.getComments();
      this.comment = '';
    },
  },
};
</script>

<style lang="stylus" scoped>
.pic
  height 240px
  background-image url('~assets/img/bg2.jpg')
  background-size cover
  background-position center center
  font-size 24px
  display flex
  align-items flex-end
  padding 1pc 20px

.topic-info
  padding 1pc 20px
.topic-content
  padding 1pc 0

.author
  padding 1pc
  display flex
  align-items center
.author-info
  display flex
  flex-direction column
  font-size 13px
  color #757575
  margin-left 1pc
  strong
    font-weight 700

.comment-area
  padding 0 1pc
  margin-top 20px

.comment-list
  padding 1pc 0

.comment-push
  text-align right
</style>
