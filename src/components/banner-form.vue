<template lang="pug">
.banner-form
  .banner-wrap.pull-left
    mu-paper
      .banner(:style="{ backgroundImage: `url('${imgsrc}')` }")
    mu-flat-button(label="选取轮换图")
      input.banner-choose-button(
        type="file",
        accept="image/jpg,image/jpeg,image/png",
        @change="chooseBanner")
  mu-text-field.form-item(
    label="标题",
    hintText="请输入标题",
    :labelFloat="true",
    v-model="form.title")
  mu-select-field.type-choose(
    label="跳转类型",
    v-model="form.type",
    :labelFloat="true")
    mu-menu-item(value="inside", title="站内视频")
    mu-menu-item(value="outside", title="外链")
  mu-text-field.form-item(
    label="跳转地址",
    hintText="请输入跳转地址",
    :labelFloat="true",
    v-model="form.href")
  mu-text-field.form-item(
    label="描述",
    :fullWidth="true",
    hintText="请输入描述",
    :labelFloat="true",
    v-model="form.summary")
</template>

<script>
import lrz from 'lrz';

export default {
  name: 'banner-form',
  props: {
    form: {
      type: Object,
      default() {
        return {
          title: '',
          summary: '',
          path: '',
          type: 'inside',
          href: '',
        };
      },
    },
  },
  data() {
    return {
      imgsrc: this.form.path,
    };
  },
  methods: {
    validate() {
      const { path, title, summary, href } = this.form;
      if (!path) return '请选取轮换图';
      if (!title) return '请输入标题';
      if (!summary) return '请输入描述';
      if (!href) return '请输入跳转地址';
      return null;
    },
    async chooseBanner() {
      const banner = event.target.files[0];
      if (!banner) return;
      const rst = await lrz(banner, { quality: 0.8 });
      this.imgsrc = rst.base64;
      this.form.path = rst.file;
    },
  },
};
</script>

<style lang="less">
.banner-wrap {
  margin-top: 30px;
  margin-right: 40px;
  text-align: center;
}
.banner {
  width: 360px;
  height: 202.5px;
  margin-bottom: 10px;
  background-color: rgba(0, 0, 0, .1);
  background-size: cover;
  background-position: center;
}
.banner-choose-button {
  width: 180px;
  position: absolute;
  left: -50%;
  top: 0;
  bottom: 0;
  opacity: 0;
}
</style>
