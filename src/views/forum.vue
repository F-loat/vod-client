<template lang="pug">
#forum
  mu-list
    mu-list-item(
      :title="topic.title",
      v-for="topic of topics",
      :key="topic._id",
      @click="$router.push(`/forum/${topic._id}`)")
      | 创建于：{{dateFormat(topic.createdAt)}}
      mu-avatar(src="/static/img/youngon.gif", slot="leftAvatar")
      span(slot="describe") {{topic.author.stuid}}
      //- span(slot="after") (10/20)

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
    };
  },
  computed: {
    ...mapState([
      'user',
      'screen',
    ]),
  },
  mounted() {
    this.getTopics();
  },
  methods: {
    ...mapActions([
    ]),
    async getTopics() {
      const content = await _topic.list();
      if (!content) return;
      this.topics = content.topics;
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
.add-topic
  position fixed
  bottom 20px
  right 20px
  @media (max-width: 480px)
    bottom 76px
</style>
