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
      mu-flat-button(label="删除", @click="destory")
    mu-table(
      :fixedHeader="true",
      @rowSelection="handleSelete")
      mu-thead
        mu-tr
          mu-th 名称
          mu-th(v-if="screen.width > 480") 创建时间
          mu-th(v-if="screen.width > 480") 更新时间
          mu-th 创建人
          mu-th 状态
      mu-tbody
        mu-tr(v-for="episode of episodes", :key="episode._id")
          mu-td {{episode.name}}
          mu-td(v-if="screen.width > 480") {{episode.createdAt | dateFormat}}
          mu-td(v-if="screen.width > 480") {{episode.updatedAt | dateFormat}}
          mu-td {{episode.creater.nickname || episode.creater.stuid}}
          mu-td {{stateFormat(episode)}}
</template>

<script>
import { mapState } from 'vuex';
import { date } from '@/utils';
import * as api from '@/api';

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
      'screen',
      'progress',
    ]),
  },
  filters: {
    dateFormat(value) {
      if (!value) return '';
      return date.format(new Date(value));
    },
  },
  activated() {
    this.getEpisodes();
  },
  methods: {
    async getEpisodes() {
      const data = await api.indexEpisode({
        state: JSON.stringify([0, 1, -1]),
      });
      if (!data) return;
      this.episodes = await Promise.all(data.episodes.map((episode) => {
        if (episode.state === 1) {
          return api.showEpisode(episode._id, { progress: 1 });
        }
        return episode;
      }));
      this.$store.dispatch('showPopup', '更新成功');
    },
    async transcode() {
      const index = this.selectedIndex;
      await api.transcodeEpisode(this.episodes[index]._id);
      this.getEpisodes();
    },
    async destory() {
      const index = this.selectedIndex;
      await api.destroyEpisode(this.episodes[index]._id);
      this.getEpisodes();
    },
    handleSelete(selectedRowsIndex) {
      this.selectedIndex = selectedRowsIndex;
    },
    stateFormat(episode) {
      let result = '';
      switch (episode.state) {
        case 0:
          result = '等待转码';
          break;
        case 1:
          result = `转码中 ${(episode.progress || 0).toFixed(2)}%`;
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
