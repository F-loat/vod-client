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
        .author
          mu-avatar(
            :src="topic.creater && topic.creater.avatar ? `/assets/${topic.creater.avatar}` : '/static/img/youngon.gif'")
          .author-info
            strong {{topic.creater.nickname}}
            span {{topic.createdAt | dateFormat}}
          .topic-info {{topic.reply}}/{{topic.visit}}
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
import { mapState, mapActions } from 'vuex';
import { date } from '@/utils';
import * as api from '@/api';

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
    async getTopics(init) {
      if (init) {
        this.page = {
          limit: 10,
          current: 1,
          total: 1,
        };
      }
      if (this.page.current > this.page.total) return;
      const limit = this.page.limit;
      if (init) { this.refreshing = true; } else { this.loading = true; }
      const data = await api.indexTopic({
        limit,
        page: this.page.current,
        type: this.$route.query.type,
      });
      if (init) { this.refreshing = false; } else { this.loading = false; }
      if (!data) return;
      this.topics = data.topics;
      this.page.total = Math.ceil(data.total / limit);
      this.page.current += 1;
    },
    async sendTopic() {
      if (!this.user._id) {
        this.showSnackbar('登录后可发帖');
        this.$router.push('/login');
        return;
      }
      const { title, content } = this.newForm;
      if (!title) {
        this.showSnackbar('请输入标题');
        return;
      }
      await api.createTopic({
        title,
        content,
        type: this.$route.query.type,
      });
      this.newFormVisible = false;
      this.getTopics(true);
    },
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
  position relative
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

.topic-info
  position absolute
  right 1pc
  top auto
  color #999

.add-topic
  position absolute
  bottom -28px
  right 40px
  z-index 9

@media (max-width: 480px)
  .topic
    padding 0.8pc 1pc
  .author
    padding 0 1pc 0.8pc
</style>
