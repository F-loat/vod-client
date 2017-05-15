<template lang="pug">
.page
  mu-refresh-control(
    :refreshing="progress.show",
    :trigger="$el",
    @refresh="getVideos")
  .no-data(v-if="!videos.length")
    mu-icon(
      slot="left",
      value="warning")
    span 没有相关内容
  template(v-else)
    .action-buttons
      mu-dropDown-menu(
        :value="type",
        :autoWidth="true",
        :anchorOrigin="{ vertical: 'bottom', horizontal: 'left' }",
        @change="handleTypeChange")
        mu-menu-item(value="", title="全部分类")
        mu-menu-item(
          v-for="type of videoTypes",
          :value="type._id",
          :title="type.name",
          :key="type._id")
      mu-flat-button(
        label="编辑",
        @click="handleEdit")
      mu-flat-button(
        label="删除",
        @click="delConfirmVisible = true")
      mu-flat-button(
        label="剧集管理",
        @click="handleManage")
      mu-text-field.appbar-search.pull-right(
        icon="search",
        slot="right",
        hintText="请输入搜索内容",
        v-model="page.search",
        @keyup.enter.native="searchVideos")
    mu-table.video-list(
      :fixedHeader="true",
      @rowSelection="handleSelete")
      mu-thead
        mu-tr
          mu-th 名称
          mu-th 导演
          mu-th 主演
          mu-th 年代
          mu-th 国家
          mu-th 关键字
          mu-th 创建人
      mu-tbody
        mu-tr(v-for="video of videos", :key="video._id")
          mu-td {{video.title}}
          mu-td
            span(v-for="director of video.directors") {{director}}
          mu-td {{String(video.performers)}}
          mu-td {{video.year}}
          mu-td {{String(video.countries)}}
          mu-td {{String(video.aka)}}
          mu-td {{video.creater.nickname || video.creater.stuid}}
    mu-pagination.list-pagination(
      :total="page.total",
      :current="page.current",
      :defaultPageSize="page.limit",
      @pageChange="handlePageChange")

  //-  编辑界面
  mu-dialog(
    :class="{ opacity: user.theme && user.theme.showBg }",
    :open="editFormVisible",
    :scrollable="true",
    title="视频信息编辑",
    @close="editFormVisible = false")
    video-upload-form(:form="editForm", :videoTypes="videoTypes")
    mu-flat-button(
    label="保存",
    slot="actions",
    primary,
    @click="modifyVideo")
    mu-flat-button(
    label="取消",
    slot="actions",
    primary,
    @click="editFormVisible = false")

  //- 确认删除对话框
  mu-dialog(
    :class="{ opacity: user.theme && user.theme.showBg }",
    :open="delConfirmVisible",
    title="确认删除？",
    @close="delConfirmVisible = false")
    mu-flat-button(
    label="确定",
    slot="actions",
    primary,
    @click="delVideo")
    mu-flat-button(
    label="取消",
    slot="actions",
    primary,
    @click="delConfirmVisible = false")

  //- 剧集管理界面
  mu-dialog(
    :class="{ opacity: user.theme && user.theme.showBg }",
    :open="episodesManageVisible",
    :scrollable="true",
    title="剧集管理",
    @close="handleManageHidden")
    .no-data(v-if="!episodes.length")
      mu-icon(
        slot="left",
        value="warning")
      span 没有相关内容
    mu-table.episodes-list(
      v-else,
      height="450px",
      :showCheckbox="false")
      mu-thead
        mu-tr
          mu-th 名称
          mu-th 状态
          mu-th 排序值
          mu-th 创建人
          mu-th 操作
      mu-tbody
        mu-tr(v-for="episode of episodes", :key="episode._id")
          mu-td {{episode.name}}
          mu-td {{stateFormat(episode.state)}}
          mu-td {{episode.sort}}
          mu-td {{episode.creater.nickname || episode.creater.stuid}}
          mu-td
            mu-icon-button(icon="edit")
            mu-icon-button(icon="delete")
    mu-flat-button(
    label="完成",
    slot="actions",
    primary,
    @click="handleManageHidden")
    mu-flat-button(
    label="取消",
    slot="actions",
    primary,
    @click="handleManageHidden")
</template>

<script>
import { _video, _episode } from '@/api';
import { mapState, mapGetters, mapActions } from 'vuex';
import VideoUploadForm from '@/components';

export default {
  name: 'video-list',
  components: {
    VideoUploadForm,
  },
  data() {
    return {
      type: '',
      videos: [],
      episodes: [],
      page: {
        current: 1,
        limit: 10,
        total: 10,
        search: '',
      },
      editFormVisible: false,
      editForm: {
        title: '',
        directors: '',
        performers: '',
        year: '',
        countries: '',
        type: [],
        aka: '',
        summary: '',
        poster: {
          imgsrc: '',
        },
        episodes: [],
        sort: '',
      },
      delConfirmVisible: false,
      episodesManageVisible: false,
      selectedVideo: null,
    };
  },
  computed: {
    ...mapState([
      'user',
      'progress',
    ]),
    ...mapGetters([
      'videoTypes',
    ]),
  },
  mounted() {
    this.getVideos();
  },
  methods: {
    ...mapActions([
      'showPopup',
      'showSnackbar',
    ]),
    async getVideos() {
      this.$store.commit('PROGRESS', true);
      const { limit, current, search } = this.page;
      const content = await _video.list({
        type: this.type,
        limit,
        page: current,
        search,
      });
      this.$store.commit('PROGRESS', false);
      if (!content) return;
      this.videos = content.videos;
      this.page.total = content.totalCount;
      this.showPopup('更新成功');
    },
    searchVideos() {
      this.page.current = 1;
      this.getVideos();
    },
    async modifyVideo() {
      const formData = this.editForm;
      const allEpisodeUpload = formData.episodes.every(episode => episode.percent === 100);
      if (!allEpisodeUpload) {
        this.showSnackbar('请先上传视频');
        return;
      }
      if (!formData.title) {
        this.showSnackbar('请输入视频名称');
        return;
      }
      if (!formData.type.length) {
        this.showSnackbar('请选择视频类型');
        return;
      }
      this.editFormVisible = false;
      const form = new FormData();
      const episodes = JSON.stringify(formData.episodes.map(episode => ({
        path: episode.path,
        name: episode.name,
      })));
      const poster = formData.poster.raw;
      if (poster) form.append('poster', poster);
      form.append('_id', this.selectedVideo._id);
      form.append('title', formData.title);
      form.append('directors', formData.directors);
      form.append('performers', formData.performers);
      form.append('year', formData.year);
      form.append('countries', formData.countries);
      form.append('episodes', episodes);
      form.append('type', formData.type);
      form.append('aka', formData.aka);
      form.append('summary', formData.summary);
      form.append('sort', formData.sort);
      const res = await _video.put(form);
      if (!res) return;
      Object.assign(this.$data.editForm, this.$options.data().editForm);
      this.showPopup('信息保存成功');
    },
    async delVideo() {
      this.delConfirmVisible = false;
      const result = await _video.delete({
        _id: this.selectedVideo._id,
      });
      if (!result) return;
      this.showPopup('删除成功');
    },
    handleSelete(selectedRowsIndex) {
      this.selectedVideo = this.videos[selectedRowsIndex];
    },
    handleTypeChange(value) {
      this.type = value;
      this.getVideos();
    },
    handleEdit() {
      if (!this.selectedVideo) {
        this.showSnackbar('请先选择一项内容');
        return;
      }
      const video = this.selectedVideo;
      this.editForm = {
        title: video.title,
        directors: video.directors.toString(),
        performers: video.performers.toString(),
        year: video.year,
        countries: video.countries.toString(),
        type: video.type,
        aka: video.aka.toString(),
        summary: video.summary,
        poster: {
          imgsrc: `/uploads/${video.posterPath}`,
        },
        episodes: [],
        sort: video.sort,
      };
      this.editFormVisible = true;
    },
    async handleManage() {
      const video = this.selectedVideo;
      if (!video) {
        this.showSnackbar('请先选择一项内容');
        return;
      }
      this.episodesManageVisible = true;
      const episodes = await _episode.list({ videoId: video._id });
      if (!episodes) return;
      this.episodes = episodes;
    },
    handleManageHidden() {
      this.episodesManageVisible = false;
      this.episodes = [];
    },
    handlePageChange(page) {
      this.page.current = page;
      this.getVideos();
    },
    stateFormat: (state) => {
      let result = '';
      switch (state) {
        case 0:
          result = '等待转码';
          break;
        case 1:
          result = '转码中';
          break;
        case 2:
          result = '已转码';
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
.video-list {
  min-height: 536px;
}

.no-data {
  min-height: 450px;
}

.edit-form {
  width: 80%;
}
</style>
