<template lang="pug">
.video-upload-form
  .poster-wrap.pull-left
    mu-paper
      .poster(:style="`background-image: url('${poster || form.poster}')`")
    mu-flat-button(label="选取封面")
      input.poster-choose-button(
        type="file",
        accept="image/jpg,image/jpeg,image/png",
        @change="choosePoster()")
  mu-text-field.form-item(
    label="视频名称",
    hintText="请输入视频名称",
    :labelFloat="true",
    v-model="form.title",
    @keyup.enter.native="getInfo(true)",
    @keyup.esc.native="getInfo(false)")
  mu-select-field.type-choose(
    label="视频类型",
    v-model="form.type",
    multiple,
    :labelFloat="true")
    mu-menu-item(
      v-for="type of videoTypes",
      :value="type._id",
      :title="type.name",
      :key="type._id")
  br
  mu-text-field.form-item(
    label="导演",
    hintText="请输入导演",
    :labelFloat="true",
    v-model="form.directors")
  mu-text-field.form-item(
    label="主演",
    hintText="请输入主演",
    :labelFloat="true",
    v-model="form.performers")
  br
  mu-text-field.form-item(
    label="年代",
    hintText="请输入年代",
    :labelFloat="true",
    v-model="form.year")
  mu-text-field.form-item(
    label="国家",
    hintText="请输入国家",
    :labelFloat="true",
    v-model="form.countries")
  br
  mu-text-field.form-item(
    label="关键字",
    hintText="请输入关键字",
    :labelFloat="true",
    v-model="form.aka")
  br
  mu-text-field(
    label="描述",
    hintText="请输入视频描述",
    :multiLine="true",
    :rows="4",
    :rowsMax="6",
    :labelFloat="true",
    :fullWidth ="true",
    v-model="form.summary")
  .upload-files(v-if="showUploader")
    .episodes-wrap
      .episodes-item(v-for="(episode, index) of episodes")
        .episode-info
          .episode-info-text
            .episode-name {{episode.raw.name}}
            .episode-persent {{episode.percent.toFixed(2)}}%
          mu-linear-progress(
            mode="determinate",
            :value="episode.percent")
        mu-icon-button(icon="delete", @click="delEpisode(index)")
    mu-raised-button(label="选取视频", icon="folder", primary)
      input.episode-choose-button(
        type="file",
        :multiple="true",
        accept="video/*",
        @change="chooseEpisode()")
</template>

<script>
import lrz from 'lrz';
import { mapActions } from 'vuex';
import { douban } from '@/utils';

const search = {
  title: '',
  start: 0,
};

export default {
  name: 'video-upload-form',
  props: {
    form: {
      type: Object,
      default() {
        return {};
      },
    },
    episodes: {
      type: Array,
      default() {
        return [];
      },
    },
    videoTypes: {
      type: Array,
      default() {
        return [];
      },
    },
    showUploader: {
      type: Boolean,
      default() {
        return true;
      },
    },
  },
  data() {
    return {
      poster: '',
    };
  },
  methods: {
    ...mapActions([
      'showSnackbar',
    ]),
    async choosePoster(url) {
      const poster = url || event.target.files[0];
      if (!poster) return;
      const rst = await lrz(poster, { quality: 0.8 });
      this.poster = rst.base64;
      this.form.poster = rst.file;
    },
    chooseEpisode() {
      const episodes = event.target.files;
      const length = episodes.length;
      if (length === 0) return;
      for (let i = 0; i < length; i += 1) {
        if (episodes[i].type.indexOf('video') !== -1) {
          const episode = episodes[i];
          this.episodes.push({
            name: episode.name,
            raw: episode,
            percent: 0,
            state: 0,
          });
        } else {
          this.showSnackbar('请上传视频文件');
        }
      }
    },
    delEpisode(index) {
      const episode = this.episodes[index];
      if (episode.percent !== 0) {
        this.showSnackbar('已上传文件请在视频管理中删除');
        return;
      }
      this.episodes.splice(index, 1);
    },
    async getInfo(next) {
      if (search.title !== this.form.title) {
        search.title = this.form.title;
        search.start = 0;
      }
      if (!next && search.start < 2) return;
      if (!next) search.start -= 2;
      const info = await douban.show({
        q: search.title,
        start: search.start,
        count: 1,
      });
      if (!info) return;
      const reg = /(^https:\/\/(.*)\.doubanio.com)/;
      const imguri = info.images.large.replace(reg, '/doubanio');
      this.choosePoster(imguri);
      info.directors = info.directors.map(director => director.name);
      info.performers = info.casts.map(cast => cast.name);
      info.title = this.form.title;
      Object.assign(this.form, info);
      search.start += 1;
    },
    reset() {
      Object.assign(this.$data, this.$options.data());
    },
  },
};
</script>

<style lang="less">
.video-upload-form {
  .mu-flat-button .mu-flat-button-label {
    color: rgba(0, 0, 0, .38);
  }
}
</style>

<style lang="less">
.video-upload-form {
  background-color: rgba(255, 255, 255, .3);
  padding: 20px 50px;
}

.form-item {
  margin-right: 40px;
}

.poster-wrap {
  margin-top: 30px;
  margin-right: 40px;
  text-align: center;
}

.poster {
  width: 180px;
  height: 240px;
  margin-bottom: 10px;
  background-color: rgba(0, 0, 0, .1);
  background-size: cover;
  background-position: center;
}

.poster-choose-button {
  width: 180px;
  position: absolute;
  left: -50%;
  top: 0;
  bottom: 0;
  opacity: 0;
}

.type-choose {
  vertical-align: bottom;
}

.episodes-item {
  margin-bottom: 20px;
  display: flex;
}
.episode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.episode-info-text {
  display: flex;
  justify-content: space-between;
}
.episode-choose-button {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  opacity: 0;
}
.episode-upload-button {
  vertical-align: top;
  margin-left: 20px;
}
</style>
