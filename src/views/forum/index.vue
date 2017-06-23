<template lang="pug">
#forum
  mu-refresh-control(
    :refreshing="refreshing",
    :trigger="scroller",
    @refresh="getTopics(true)")
  .forum-list
    mu-paper.list
      .pic
        .pic-title 论坛
        mu-float-button.add-topic(
          icon="add",
          @click="newFormVisible = true")
      .list-item(
        v-for="topic of topics",
        :key="topic._id",
        @click="$router.push(`/forum/${topic._id}`)")
        .topic
          .topic-title {{topic.title}}
          .topic-content {{topic.content}}
        .author
          mu-avatar(
            :src="topic.author && topic.author.avatar ? `/uploads/${topic.author.avatar}` : '/static/img/youngon.gif'")
          .author-info
            strong {{topic.author.nickname || topic.author.stuid}}
            span {{dateFormat(topic.createdAt)}}
    mu-infinite-scroll(
      :scroller="scroller",
      :loading="loading",
      @load="getTopics")

    //- 新增界面
    mu-dialog.new-type(
      title="发布帖子",
      :open="newFormVisible")
      mu-text-field.form-item(
        label="标题",
        hintText="请输入标题",
        :fullWidth="true",
        :labelFloat="true",
        v-model="newForm.title")
      mu-text-field(
        label="内容（可选）",
        hintText="请输入帖子内容",
        :multiLine="true",
        :rows="4",
        :rowsMax="6",
        :labelFloat="true",
        :fullWidth ="true",
        v-model="newForm.content")
      mu-flat-button(primary, label="发布", @click="sendTopic", slot="actions")
      mu-flat-button(primary, label="取消", @click="newFormVisible = false", slot="actions")
</template>

<script>
import { _topic } from '@/api';
import { mapState, mapActions } from 'vuex';
import dateFormat from '@/utils/date/format';

export default {
  name: 'forum',
  data() {
    return {
      topics: [],
      newFormVisible: false,
      newForm: {
        title: '',
        content: '',
      },
      page: {
        limit: 10,
        current: 1,
        total: 1,
      },
      loading: false,
      refreshing: false,
      scroller: window,
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
      'progress',
    ]),
  },
  mounted() {
    this.getTopics(true);
  },
  methods: {
    ...mapActions([
    ]),
    async getTopics(init) {
      if (init) {
        this.page = {
          limit: 10,
          current: 1,
          total: 1,
        };
        const limit = this.page.limit;
        this.refreshing = true;
        const content = await _topic.list({
          limit,
          page: this.page.current,
          type: this.$route.query.type,
        });
        this.refreshing = false;
        if (!content) return;
        this.topics = content.topics;
        this.page.total = Math.ceil(content.totalCount / limit);
      } else {
        this.page.current += 1;
        if (this.page.current > this.page.total) return;
        const limit = this.page.limit;
        this.loading = true;
        const content = await _topic.list({
          limit,
          page: this.page.current,
          type: this.$route.query.type,
        });
        this.loading = false;
        if (!content) return;
        this.topics = this.topics.concat(content.topics);
        this.page.total = Math.ceil(content.totalCount / limit);
      }
    },
    async sendTopic() {
      if (!this.user._id) {
        const msg = this.user.nickname ? '绑定学号后可发帖' : '登录后可发帖';
        this.$store.dispatch('showSnackbar', msg);
        return;
      }
      const { title, content } = this.newForm;
      if (!title) {
        this.$store.dispatch('showSnackbar', '请输入标题');
        return;
      }
      const newTopic = await _topic.post({
        title,
        content,
        type: this.$route.query.type,
      });
      this.newFormVisible = false;
      if (!newTopic) return;
      newTopic.author = this.user;
      this.topics.unshift(newTopic);
    },
    dateFormat: date => dateFormat(new Date(date)),
  },
  watch: {
    $route() {
      this.getTopics(true);
    },
  },
};
</script>

<style lang="stylus" scoped>
.pic
  position relative
  height 240px
  background-image url('~assets/img/bg1.jpg')
  background-size cover
  background-position center center
  font-size 24px
  display flex
  align-items flex-end
  padding 1pc 20px

.list-item
  cursor pointer
  border-top 1px solid #eee
  @media (min-width: 480px)
    margin-bottom 1pc

.topic
  padding 1pc 20px
.topic-title
  font-size 18px

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

.add-topic
  position absolute
  bottom -28px
  right 40px
</style>
