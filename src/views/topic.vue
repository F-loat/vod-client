<template lang="pug">
#topic
  .topic-info
    h2 {{topic.title}}
    p {{topic.content}}
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
import { _topic, _comment } from '@/api';

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
  methods: {
    ...mapActions([
      'showSnackbar',
    ]),
    async getTopic() {
      const topic = await _topic.get({
        id: this.$route.params.id,
      });
      if (!topic) return;
      this.topic = topic;
    },
    async getComments() {
      const id = this.$route.params.id;
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
      const newComment = await _comment.post({
        id: this.$route.params.id,
        content: this.comment,
      });
      if (!newComment) return;
      newComment.commenter = this.user;
      this.comments.unshift(newComment);
    },
  },
};
</script>

<style lang="stylus">
.topic-info
  padding 10px 20px

.comment-area
  margin-top 20px

.comment-push
  padding 10px
  text-align right
</style>
