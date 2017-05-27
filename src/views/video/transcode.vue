<template lang="pug">
.page
  mu-refresh-control(
    :refreshing="progress.show",
    :trigger="$el",
    @refresh="getEpisodes")
  .no-data(v-if="!episodes.length")
    mu-icon(
      slot="left",
      value="warning")
    span 没有相关内容
  template(v-else)
    .action-buttons
      mu-flat-button(label="转码", @click="transcode")
      mu-flat-button(label="删除")
    mu-table(
      :fixedHeader="true",
      @rowSelection="handleSelete")
      mu-thead
        mu-tr
          mu-th 名称
          mu-th 创建时间
          mu-th 更新时间
          mu-th 创建人
          mu-th 状态
      mu-tbody
        mu-tr(v-for="episode of episodes", :key="episode._id")
          mu-td {{episode.name}}
          mu-td {{dateFormat(episode.createdAt)}}
          mu-td {{dateFormat(episode.updatedAt)}}
          mu-td {{episode.creater.nickname || episode.creater.stuid}}
          mu-td {{stateFormat(episode.state)}}
</template>

<script>
import { mapState } from 'vuex';
import dateFormat from '@/utils/date/format';
import { _episode } from '@/api';

export default {
  name: 'video-transcode',
  data() {
    return {
      episodes: [],
      selectedIndex: '',
    };
  },
  computed: {
    ...mapState([
      'progress',
    ]),
  },
  mounted() {
    this.getEpisodes();
  },
  methods: {
    async getEpisodes() {
      this.$store.commit('PROGRESS', true);
      this.episodes = await _episode.list({
        state: JSON.stringify([0, 1, -1]),
      });
      if (this.episodes) this.$store.dispatch('showPopup', '更新成功');
      this.$store.commit('PROGRESS', false);
    },
    async transcode() {
      const index = this.selectedIndex;
      await _episode.transcode({ _id: this.episodes[index]._id });
    },
    handleSelete(selectedRowsIndex) {
      this.selectedIndex = selectedRowsIndex;
    },
    dateFormat: date => dateFormat(new Date(date)),
    stateFormat: (state) => {
      let result = '';
      switch (state) {
        case 0:
          result = '等待转码';
          break;
        case 1:
          result = '转码中';
          break;
        case -1:
          result = '转码失败';
          break;
        default:
          result = '未知';
      }
      return result;
    },
  },
};
</script>

<style lang="less" scoped>
</style>
