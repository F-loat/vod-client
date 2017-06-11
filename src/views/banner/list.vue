<template lang="pug">
.page
  mu-refresh-control(
    :refreshing="progress.show",
    :trigger="$el",
    @refresh="getBanner")
  .no-data(v-if="!banners.length")
    mu-icon(
      slot="left",
      value="warning")
    span 没有相关内容
  template(v-else)
    .action-buttons
      mu-flat-button(label="编辑", @click="handleEdit")
      mu-flat-button(label="禁用", @click="delConfirmVisible = true")
      mu-text-field.appbar-search.pull-right(icon="search", slot="right", hintText="请输入搜索内容")
    mu-table.banner-list(
      :fixedHeader="true",
      :multiSelectable="true",
      :enableSelectAll="true",
      @rowSelection="handleSelete")
      mu-thead
        mu-tr
          mu-th 轮换图标题
          mu-th 创建时间
          mu-th 轮换图类型
      mu-tbody
        mu-tr(v-for="banner of banners", :key="banner._id")
          mu-td {{banner.title}}
          mu-td {{dateFormat(banner.createdAt)}}
          mu-td {{typeFormat(banner.type)}}

  //- 新增界面
  mu-dialog.new-type(
    title="新增轮换图",
    :open="newFormVisible")
    .banner-wrap.pull-left
      mu-paper
        .banner(:style="`background-image: url('${newForm.banner.imgsrc}')`")
      mu-flat-button(label="选取轮换图")
        input.banner-choose-button(
          type="file",
          accept="image/jpg,image/jpeg,image/png",
          @change="chooseBanner()")
    mu-text-field.form-item(
      label="标题",
      hintText="请输入标题",
      :labelFloat="true",
      v-model="newForm.title")
    mu-select-field.type-choose(
      label="跳转类型",
      v-model="editForm.type",
      :labelFloat="true")
      mu-menu-item(:value="0", title="站内视频")
      mu-menu-item(:value="1", title="外链")
    mu-text-field.form-item(
      label="跳转地址",
      hintText="请输入跳转地址",
      :labelFloat="true",
      v-model="newForm.href")
    mu-text-field.form-item(
      label="描述",
      :fullWidth="true",
      hintText="请输入描述",
      :labelFloat="true",
      v-model="newForm.summary")
    mu-text-field.form-item(
      label="排序值（可选）",
      :fullWidth="true",
      :labelFloat="true",
      v-model="newForm.sort")
    mu-flat-button(primary, label="创建", @click="newBanner", slot="actions")
    mu-flat-button(primary, label="取消", @click="newFormVisible = false", slot="actions")

  //- 编辑界面
  mu-dialog.new-type(
    title="编辑轮换图信息",
    :open="editFormVisible")
    mu-select-field.type-choose(
      label="用户类型",
      v-model="editForm.type",
      :labelFloat="true")
      mu-menu-item(:value="0", title="普通用户")
      mu-menu-item(:value="2", title="内测用户")
      mu-menu-item(:value="10", title="管理员")
    mu-flat-button(primary, label="保存", @click="modifyBanner", slot="actions")
    mu-flat-button(primary, label="取消", @click="editFormVisible = false", slot="actions")

  //- 确认删除对话框
  mu-dialog(
    :class="{ opacity: user.theme && user.theme.showBg }",
    :open="delConfirmVisible",
    title="确认禁用？",
    @close="delConfirmVisible = false")
    mu-flat-button(
    label="确定",
    slot="actions",
    primary,
    @click="delBanner")
    mu-flat-button(
    label="取消",
    slot="actions",
    primary,
    @click="delConfirmVisible = false")

  //- 新建按钮
  mu-float-button.float-button(
    icon="add",
    @click="newFormVisible = true")
</template>

<script>
import lrz from 'lrz';
import dateFormat from '@/utils/date/format';
import { _banner } from '@/api';
import { mapState } from 'vuex';

export default {
  name: 'banner-list',
  data() {
    return {
      banners: [],
      delConfirmVisible: false,
      selectedRowsIndex: [],
      newFormVisible: false,
      newForm: {
        title: '',
        summary: '',
        banner: {
          imgsrc: '',
        },
        type: 0,
        href: '',
        sort: '',
      },
      editFormVisible: false,
      editForm: {
        _id: '',
        title: '',
        summary: '',
        banner: {
          imgsrc: '',
        },
        type: 0,
        href: '',
        sort: '',
      },
    };
  },
  computed: {
    ...mapState([
      'user',
      'progress',
    ]),
  },
  mounted() {
    this.getBanner();
  },
  methods: {
    async getBanner() {
      this.$store.commit('PROGRESS', true);
      const content = await _banner.list();
      this.$store.commit('PROGRESS', false);
      if (!content) return;
      this.banners = content;
    },
    async chooseBanner() {
      const banner = event.target.files[0];
      if (!banner) return;
      const rst = await lrz(banner, { quality: 0.8 });
      this.newForm.banner.imgsrc = rst.base64;
      this.newForm.banner.raw = rst.file;
    },
    async newBanner() {
      const formData = this.newForm;
      if (!formData.banner.raw) {
        this.$store.dispatch('showSnackbar', '请选取轮换图');
        return;
      }
      if (!formData.title) {
        this.$store.dispatch('showSnackbar', '请输入标题');
        return;
      }
      if (!formData.summary) {
        this.$store.dispatch('showSnackbar', '请输入描述');
        return;
      }
      if (!formData.href) {
        this.$store.dispatch('showSnackbar', '请输入跳转地址');
        return;
      }
      const form = new FormData();
      form.append('title', formData.title);
      form.append('summary', formData.summary);
      form.append('banner', formData.banner.raw);
      form.append('type', formData.type);
      form.append('href', formData.href);
      form.append('sort', formData.sort);
      const banner = await _banner.post(form);
      if (!banner) return;
      this.newFormVisible = false;
      banner.creater = this.user;
      this.banners = this.banners.concat([banner]);
      const initData = this.$options.data();
      Object.assign(this.newForm, initData.newForm);
    },
    async delBanner() {
      this.delConfirmVisible = false;
      const selectedUserIds = this.selectedRowsIndex
        .map(index => this.banners[index]._id);
      const result = await _banner.delete({
        _id: selectedUserIds,
      });
      if (!result) return;
      this.banners = this.banners.filter(banner =>
        !selectedUserIds.includes(banner._id));
      this.$store.dispatch('showPopup', '禁用成功');
    },
    async modifyBanner() {
      // this.editFormVisible = false;
      // const editedUser = await _user.put(this.editForm);
      // if (!editedUser) return;
      // this.users = this.users.map((user) => {
      //   if (user._id === editedUser._id) return editedUser;
      //   return user;
      // });
      // const initData = this.$options.data();
      // Object.assign(this.editForm, initData.editForm);
      // this.$store.dispatch('showPopup', '保存成功');
    },
    handleSelete(selectedRowsIndex) {
      this.selectedRowsIndex = selectedRowsIndex;
    },
    handleEdit() {
      const index = this.selectedRowsIndex;
      if (index.length !== 1) {
        this.$store.dispatch('showSnackbar', '请选择一项编辑');
        return;
      }
      this.editForm = this.banners[index[0]];
      this.editFormVisible = true;
    },
    dateFormat: date => dateFormat(new Date(date)),
    typeFormat(type) {
      if (type === 0) return '站内视频';
      if (type === 1) return '外链';
      return '未知';
    },
  },
};
</script>

<style lang="less" scoped>
.banner-list {
  min-height: 536px;
}
.form-item {
  margin-right: 40px;
}

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
