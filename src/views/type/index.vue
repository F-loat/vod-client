<template lang="pug">
.page
  mu-refresh-control(
    :refreshing="progress.show",
    :trigger="$el",
    @refresh="getTypes")
  .no-data(v-if="!currentTypes.length")
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
        mu-menu-item(value="video", title="视频")
        mu-menu-item(value="topic", title="帖子")
      mu-flat-button(label="编辑", @click="handleEdit")
      mu-flat-button(label="删除", @click="delConfirmVisible = true")
    mu-table(
      :fixedHeader="true",
      :multiSelectable="true",
      :enableSelectAll="true",
      @rowSelection="handleSelete")
      mu-thead
        mu-tr
          mu-th 名称
          mu-th 排序值
          mu-th 创建时间
          mu-th 创建人
      mu-tbody
        mu-tr(
          v-for="type of currentTypes",
          :key="type._id")
          mu-td {{type.name}}
          mu-td {{type.sort}}
          mu-td {{dateFormat(type.createdAt)}}
          mu-td {{type.creater.nickname || type.creater.stuid}}

  //- 新增界面
  mu-dialog.new-type(
    :title="`添加${type === 'video' ? '视频' : '帖子'}分类`",
    :open="newFormVisible")
    mu-text-field.form-item(
      label="名称",
      hintText="请输入名称",
      :fullWidth="true",
      :labelFloat="true",
      v-model="newForm.name")
    mu-text-field.form-item(
      label="排序值（可选）",
      :fullWidth="true",
      :labelFloat="true",
      v-model="newForm.sort")
    mu-flat-button(primary, label="创建", @click="newType", slot="actions")
    mu-flat-button(primary, label="取消", @click="newFormVisible = false", slot="actions")

    //- 编辑界面
    mu-dialog.new-type(
      :title="`编辑${type === 'video' ? '视频' : '帖子'}分类`",
      :open="editFormVisible")
      mu-text-field.form-item(
        label="名称",
        hintText="请输入名称",
        :fullWidth="true",
        :labelFloat="true",
        v-model="editForm.name")
      mu-text-field.form-item(
        label="排序值（可选）",
        :fullWidth="true",
        :labelFloat="true",
        v-model="editForm.sort")
      mu-flat-button(primary, label="保存", @click="modifyType", slot="actions")
      mu-flat-button(primary, label="取消", @click="editFormVisible = false", slot="actions")

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
    @click="delType")
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
import { mapState, mapGetters, mapActions } from 'vuex';
import dateFormat from '@/utils/date/format';
import { _type } from '@/api';

export default {
  name: 'type-manage',
  data() {
    return {
      type: 'video',
      newFormVisible: false,
      newForm: {
        name: '',
        sort: '',
      },
      editFormVisible: false,
      editForm: {
        _id: '',
        name: '',
        sort: '',
      },
      delConfirmVisible: false,
      selectedRowsIndex: [],
    };
  },
  computed: {
    ...mapState([
      'user',
      'types',
      'progress',
    ]),
    ...mapGetters([
      'videoTypes',
      'topicTypes',
    ]),
    currentTypes() {
      if (this.type === 'video') return this.videoTypes;
      return this.topicTypes;
    },
  },
  methods: {
    ...mapActions([
      'getTypes',
    ]),
    async newType() {
      const formData = this.newForm;
      const type = await _type.post({
        name: formData.name,
        type: this.type,
        sort: formData.sort,
      });
      if (!type) return;
      this.newFormVisible = false;
      type.creater = this.user;
      const types = this.types.concat([type]);
      this.$store.commit('TYPES', types);
      this.newForm = {
        name: '',
        sort: null,
      };
    },
    async delType() {
      this.delConfirmVisible = false;
      const selectedTypeIds = this.selectedRowsIndex
        .map(index => this.currentTypes[index]._id);
      const result = await _type.delete({
        _id: selectedTypeIds,
      });
      if (!result) return;
      const aliveTypes = this.types.filter(type =>
        !selectedTypeIds.includes(type._id));
      this.$store.commit('TYPES', aliveTypes);
      this.$store.dispatch('showPopup', '删除成功');
    },
    async modifyType() {
      this.editFormVisible = false;
      const editedType = await _type.put(this.editForm);
      if (!editedType) return;
      const allTypes = this.types.map((type) => {
        if (type._id === editedType._id) return editedType;
        return type;
      });
      this.$store.commit('TYPES', allTypes);
      this.$store.dispatch('showPopup', '保存成功');
    },
    handleEdit() {
      const index = this.selectedRowsIndex;
      if (index.length !== 1) {
        this.$store.dispatch('showSnackbar', '请选择一项编辑');
        return;
      }
      const type = this.currentTypes[index[0]];
      this.editForm = {
        _id: type._id,
        name: type.name,
        sort: type.sort,
      };
      this.editFormVisible = true;
    },
    handleTypeChange(value) {
      this.type = value;
    },
    handleSelete(selectedRowsIndex) {
      this.selectedRowsIndex = selectedRowsIndex;
    },
    dateFormat: date => dateFormat(new Date(date)),
  },
};
</script>

<style lang="less" scoped>
</style>
