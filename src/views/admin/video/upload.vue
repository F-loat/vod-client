<template lang="pug">
.page.video-upload
  video-upload-form(
    :form="form",
    :episodes="episodes",
    :videoTypes="videoTypes",
    ref="form")
  mu-float-button.float-button(icon="send", @click="send")
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { VideoUploadForm } from '@/components';
import * as api from '@/api';

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
        poster: '',
      },
      episodes: [],
    };
  },
  computed: {
    ...mapGetters([
      'videoTypes',
    ]),
  },
  methods: {
    ...mapActions([
      'showPopup',
      'showSnackbar',
    ]),
    async send() {
      const { form } = this;
      if (!form.title) {
        this.showSnackbar('请输入视频名称');
        return;
      }
      if (!form.type.length) {
        this.showSnackbar('请选择视频类型');
        return;
      }
      const poster = await api.createFile(form.poster, { type: 'poster' });
      form.poster = poster;
      const rst = await api.createVideo(form);
      if (!rst) return;
      this.showPopup('视频信息已上传');
      await this.sendEpisodes(rst._id);
      this.showPopup('视频上传完成');
      this.$refs.form.reset();
      Object.assign(this.$data, this.$options.data());
    },
    async sendEpisodes(belong) {
      /* eslint-disable */
      const episodes = this.episodes;
      for (const episode of episodes) {
        if (episode.percent === 100) continue;
        const path = await api.createFile(episode.raw, {
          params: { type: 'episode' },
          onUploadProgress(event) {
            const percent = (event.loaded / event.total) * 100;
            if (percent) episode.percent = percent;
          },
        });
        if (!path) return;
        const rst = await api.createEpisode({
          name: episode.name,
          belong,
          path,
        });
        episode.state = 1;
        episode.path = path;
        /* eslint-enable */
      }
    },
  },
};
</script>

<style lang="less" scoped>
</style>
