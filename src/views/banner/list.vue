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
      mu-flat-button(icon="edit", label="编辑", @click="handleEdit")
      mu-flat-button(icon="delete", label="删除", @click="delConfirmVisible = true")
      mu-text-field.appbar-search.pull-right(icon="search", slot="right", hintText="请输入搜索内容")
    mu-table.banner-list(@rowSelection="handleSelect")
      mu-thead
        mu-tr
          mu-th 轮换图标题
          mu-th 创建时间
          mu-th 轮换图类型
      mu-tbody
        mu-tr(v-for="banner of banners", :key="banner._id")
          mu-td {{banner.title}}
          mu-td {{banner.createdAt | dateFormat}}
          mu-td {{banner.type | typeFormat}}

  //- 新增界面
  mu-dialog.new-type(
    title="新增轮换图",
    :open="newFormVisible")
    banner-form(ref="createForm", :form="form")
    mu-flat-button(
      primary,
      label="创建",
      @click="newBanner",
      slot="actions")
    mu-flat-button(
      primary,
      label="取消",
      @click="newFormVisible = false",
      slot="actions")

  //- 编辑界面
  mu-dialog.new-type(
    title="编辑轮换图信息",
    :open="editFormVisible")
    banner-form(ref="editForm", :form="form")
    mu-flat-button(
      primary,
      label="保存",
      @click="modifyBanner",
      slot="actions")
    mu-flat-button(
      primary,
      label="取消",
      @click="editFormVisible = false",
      slot="actions")

  //- 确认删除对话框
  mu-dialog(
    :open="delConfirmVisible",
    title="确认删除？",
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
    @click="handleNewButton")
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { BannerForm } from '@/components';
import { date } from '@/utils';
import * as api from '@/api';

export default {
  name: 'banner-list',
  components: {
    BannerForm,
  },
  data() {
    return {
      banners: [],
      selectedIndex: null,
      newFormVisible: false,
      editFormVisible: false,
      delConfirmVisible: false,
      form: {
        title: '',
        summary: '',
        path: '',
        type: 'inside',
        href: '',
      },
    };
  },
  computed: {
    ...mapState([
      'user',
      'progress',
    ]),
  },
  filters: {
    dateFormat(value) {
      if (!value) return '';
      return date.format(new Date(value));
    },
    typeFormat(value) {
      if (value === 'inside') return '站内视频';
      if (value === 'outside') return '外链';
      return '未知';
    },
  },
  mounted() {
    this.getBanner();
  },
  methods: {
    ...mapActions([
      'showSnackbar',
    ]),
    async getBanner() {
      const data = await api.indexBanner();
      if (!data) return;
      this.banners = data.banners;
    },
    async newBanner() {
      const msg = this.$refs.createForm.validate();
      if (msg) {
        this.showSnackbar(msg);
        return;
      }
      const { form } = this;
      const filePath = await api.createFile(form.path, { type: 'banner' });
      if (!filePath) return;
      form.path = filePath;
      const banner = await api.createBanner(form);
      if (!banner) return;
      this.newFormVisible = false;
      this.getBanner();
    },
    async modifyBanner() {
      const msg = this.$refs.editForm.validate();
      if (msg) {
        this.showSnackbar(msg);
        return;
      }
      this.editFormVisible = true;
      console.log(typeof this.form.path);
      this.editFormVisible = false;
    },
    async delBanner() {
      this.delConfirmVisible = false;
      const index = this.selectedIndex;
      const data = await api.destroyBanner(this.banners[index]._id);
      if (!data) return;
      this.getBanner();
      this.$store.dispatch('showPopup', '删除成功');
    },
    handleSelect(index) {
      this.selectedIndex = index;
    },
    handleEdit() {
      const index = this.selectedIndex;
      if (index === null) {
        this.showSnackbar('请选择一项编辑');
        return;
      }
      Object.assign(this.form, this.banners[index]);
      this.editFormVisible = true;
    },
    handleNewButton() {
      const initData = this.$options.data();
      Object.assign(this.form, initData.form);
      this.newFormVisible = true;
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
</style>
