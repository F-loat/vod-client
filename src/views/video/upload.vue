<template lang="pug">
.page.video-upload
  video-upload-form(:form="form", :videoTypes="videoTypes")
  mu-float-button.float-button(icon="send", @click="send")
</template>

<script>
import { mapGetters } from 'vuex';
import { _video } from '@/api';
import VideoUploadForm from '@/components';

export default {
  name: 'video-upload',
  components: {
    VideoUploadForm,
  },
  data() {
    return {
      form: {
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
    };
  },
  computed: {
    ...mapGetters([
      'videoTypes',
    ]),
  },
  methods: {
    async send() {
      const formData = this.form;
      const allEpisodeUpload = formData.episodes.every(episode => episode.percent === 100);
      if (!allEpisodeUpload) {
        this.$store.dispatch('showSnackbar', '请先上传视频');
        return;
      }
      if (!formData.title) {
        this.$store.dispatch('showSnackbar', '请输入视频名称');
        return;
      }
      if (!formData.type.length) {
        this.$store.dispatch('showSnackbar', '请选择视频类型');
        return;
      }
      const form = new FormData();
      const episodes = JSON.stringify(formData.episodes.map(episode => ({
        path: episode.path,
        name: episode.name,
      })));
      form.append('poster', formData.poster.raw);
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
      const res = await _video.post(form);
      if (!res) return;
      this.$store.dispatch('showPopup', '视频保存成功');
      Object.assign(this.$data, this.$options.data());
    },
  },
};
</script>

<style lang="less" scoped>
</style>
