<template lang="pug">
#forum
  mu-refresh-control(
    :refreshing="progress.show",
    :trigger="$el",
    @refresh="getTopics(true)")
  .no-data(v-if="!topics.length")
    mu-icon(
      slot="left",
      value="warning")
    span 没有相关内容
  mu-list.list(v-else)
    mu-list-item(
      :title="topic.title",
      v-for="topic of topics",
      :key="topic._id",
      @click="$router.push(`/forum/${topic._id}`)")
      | 创建于：{{dateFormat(topic.createdAt)}}
      mu-avatar(
        :src="topic.author && topic.author.avatar ? `/uploads/${topic.author.avatar}` : '/static/img/youngon.gif'",
        slot="leftAvatar")
      span(slot="describe", v-if="topic.author")
        | {{topic.author.nickname || topic.author.stuid}}
      //- span(slot="after") (10/20)
  mu-infinite-scroll(
    :scroller="$el",
    :loading="progress.show",
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

  mu-float-button.add-topic(
    icon="add",
    @click="newFormVisible = true")
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
        current: 0,
        total: 1,
      },
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
    this.getTopics();
  },
  methods: {
    ...mapActions([
    ]),
    async getTopics(init) {
      if (init) {
        this.page.current = 1;
      } else {
        this.page.current += 1;
      }
      if (this.page.current > this.page.total) return;
      const limit = this.page.limit;
      this.$store.commit('PROGRESS', true);
      const content = await _topic.list({
        limit,
        page: this.page.current,
      });
      this.$store.commit('PROGRESS', false);
      if (!content) return;
      if (init) {
        this.topics = content.topics;
      } else {
        this.topics = this.topics.concat(content.topics);
      }
      this.page.total = Math.ceil(content.totalCount / limit);
    },
    async sendTopic() {
      if (!this.user._id) {
        this.$store.dispatch('showSnackbar', '登录后可发帖');
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
      });
      this.newFormVisible = false;
      if (!newTopic) return;
      newTopic.author = this.user;
      this.topics.unshift(newTopic);
    },
    dateFormat: date => dateFormat(new Date(date)),
  },
};
</script>

<style lang="stylus">
#forum
  position relative
  height 100%
  overflow auto

.add-topic
  position fixed
  bottom 20px
  right 20px
  @media (max-width: 480px)
    bottom 76px
</style>
