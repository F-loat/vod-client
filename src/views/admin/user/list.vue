<template lang="pug">
.page
  mu-refresh-control(
    :refreshing="progress.show",
    :trigger="$el",
    @refresh="getUsers")
  .no-data(v-if="!users.length")
    mu-icon(
      slot="left",
      value="warning")
    span 没有相关内容
  template(v-else)
    .action-buttons
      mu-flat-button(label="编辑", @click="handleEdit")
      mu-flat-button(label="禁用", @click="forbid")
      mu-text-field.appbar-search.pull-right(icon="search", slot="right", hintText="请输入搜索内容")
    mu-table.user-list(
      :fixedHeader="true",
      :multiSelectable="true",
      :enableSelectAll="true",
      @rowSelection="handleSelete")
      mu-thead
        mu-tr
          mu-th 用户名
          mu-th 注册时间
          mu-th 最近登录时间
          mu-th 用户类型
      mu-tbody
        mu-tr(v-for="user of users", :key="user._id")
          mu-td {{user.username}}
          mu-td {{user.createdAt | dateFormat}}
          mu-td {{user.lastLoginAt | dateFormat}}
          mu-td {{typeFormat(user.type)}}
    mu-pagination.list-pagination(
      :total="page.total",
      :current="page.current",
      :defaultPageSize="page.limit",
      @pageChange="handlePageChange")

  //- 编辑界面
  mu-dialog.new-type(
    title="编辑用户信息",
    :open="editFormVisible")
    mu-select-field.type-choose(
      label="用户类型",
      v-model="editForm.type",
      :labelFloat="true")
      mu-menu-item(value="normal", title="普通用户")
      mu-menu-item(value="admin", title="管理员")
    mu-flat-button(
      primary,
      label="保存",
      @click="modifyUser",
      slot="actions")
    mu-flat-button(
      primary,
      label="取消", @click="editFormVisible = false", slot="actions")
</template>

<script>
import { mapState } from 'vuex';
import { date } from '@/utils';
import * as api from '@/api';

export default {
  name: 'user-list',
  data() {
    return {
      users: [],
      page: {
        current: 1,
        limit: 10,
        total: 10,
      },
      delConfirmVisible: false,
      selectedRowsIndex: [],
      editFormVisible: false,
      editForm: {
        _id: '',
        type: 0,
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
  },
  mounted() {
    this.getUsers();
  },
  methods: {
    async getUsers() {
      this.$store.commit('PROGRESS', true);
      const data = await api.indexUser({
        limit: this.page.limit,
        page: this.page.current,
      });
      this.$store.commit('PROGRESS', false);
      if (!data) return;
      this.users = data.users;
      this.page.total = data.total;
    },
    async modifyUser() {
      this.editFormVisible = false;
      const editedUser = await api.updateUser(this.editForm);
      if (!editedUser) return;
      this.users = this.users.map((user) => {
        if (user._id === editedUser._id) return editedUser;
        return user;
      });
      this.$store.dispatch('showPopup', '保存成功');
    },
    async forbid() {
      this.delConfirmVisible = false;
      const selectedUserIds = this.selectedRowsIndex
        .map(index => this.users[index]._id);
      const result = await api.destroyUser({
        _id: selectedUserIds,
      });
      if (!result) return;
      this.users = this.users.filter(user =>
        !selectedUserIds.includes(user._id));
      this.$store.dispatch('showPopup', '禁用成功');
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
      const user = this.users[index[0]];
      this.editForm = {
        _id: user._id,
        type: user.type,
      };
      this.editFormVisible = true;
    },
    typeFormat(type) {
      if (type === 'admin') return '管理员';
      if (type === 'normal') return '普通用户';
      return '未知';
    },
    handlePageChange(page) {
      this.page.current = page;
      this.getUsers();
    },
  },
};
</script>

<style lang="less" scoped>
.user-list {
  min-height: 536px;
}
</style>
