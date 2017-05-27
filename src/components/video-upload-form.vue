<template lang="pug">
.video-upload-form
  .poster-wrap.pull-left
    mu-paper
      .poster(:style="`background-image: url('${form.poster.imgsrc}')`")
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
  mu-text-field.form-item(
    label="排序值（可选）",
    hintText="请输入排序值",
    :labelFloat="true",
    v-model="form.sort")
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
  .upload-files
    .episodes-wrap
      .episodes-item(v-for="(episode, index) of form.episodes")
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
    mu-raised-button.episode-upload-button(
      label="上传视频",
      icon="cloud_upload",
      @click="sendEpisodes")
</template>

<script>
import lrz from 'lrz';
import { _video, _episode } from '@/api';
import { mapActions } from 'vuex';

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
        return {
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
        };
      },
    },
    videoTypes: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  methods: {
    ...mapActions([
      'showSnackbar',
    ]),
    async choosePoster(url) {
      const poster = url || event.target.files[0];
      if (!poster) return;
      const rst = await lrz(poster, { quality: 0.8 });
      this.form.poster.imgsrc = rst.base64;
      this.form.poster.raw = rst.file;
    },
    chooseEpisode() {
      const episodes = event.target.files;
      const length = episodes.length;
      if (length === 0) return;
      for (let i = 0; i < length; i += 1) {
        if (episodes[i].type.indexOf('video') !== -1) {
          const episode = episodes[i];
          this.form.episodes.push({
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
    async getInfo(next) {
      if (search.title !== this.form.title) {
        search.title = this.form.title;
        search.start = 0;
      }
      if (!next && search.start < 2) return;
      if (!next) search.start -= 2;
      this.$store.commit('PROGRESS', true);
      const info = await _video.get({
        q: search.title,
        start: search.start,
        count: 1,
      });
      this.$store.commit('PROGRESS', false);
      if (!info) return;
      const reg = /(^https:\/\/(.*)\.doubanio.com)/;
      const imguri = info.images.large.replace(reg, '/doubanio');
      this.choosePoster(imguri);
      const form = this.form;
      form.directors = info.directors.map(director => director.name).toString();
      form.performers = info.casts.map(cast => cast.name).toString();
      form.year = info.year;
      form.countries = info.countries.toString();
      form.aka = info.aka.toString();
      form.summary = info.summary;
      search.start += 1;
    },
    async sendEpisodes() {
      /* eslint-disable */
      const episodes = this.form.episodes;
      if (!episodes.length) {
        this.showSnackbar('请先选择文件');
        return;
      }
      for (const episode of episodes) {
        const form = new FormData();
        form.append('episode', episode.raw);
        if (episode.percent === 100) continue;
        const content = await _episode.post(form, {
          onUploadProgress: (event) => {
            const percent = event.loaded / event.total * 100;
            if (percent) episode.percent = percent;
          },
        });
        episode.state = 1;
        episode.path = content;
      }
      /* eslint-enable */
    },
    delEpisode(index) {
      const episode = this.form.episodes[index];
      if (episode.percent !== 0) {
        this.showSnackbar('已上传文件请在视频管理中删除');
        return;
      }
      this.form.episodes.splice(index, 1);
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
