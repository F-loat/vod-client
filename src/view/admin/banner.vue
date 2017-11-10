<template lang="pug">
q-infinite-scroll(ref="infiniteScroll", :handler="loadMore")
  q-btn.create-button(flat, color="primary", @click="$refs.formModal.open()")
    q-icon(name="add")
  q-data-table(
    :data="banners",
    :config="config",
    :columns="columns",
    @refresh="refresher")
    template(slot="selection", slot-scope="props")
      q-btn(flat, color="primary", @click="deleteBanner(props)")
        q-icon(name="delete")
  .row.justify-center(v-if="params.page * params.limit < total")
    q-spinner-dots(slot="message", :size="40")

  q-modal(ref="formModal", content-css="min-width: 360px; border-radius: 4px")
    q-uploader(
      url="/api/files",
      :headers="uploadHeaders",
      extensions=".gif,.jpg,.jpeg,.png",
      float-label="轮换图",
      @uploaded="handleUpload")
    .group
      q-input(
        v-model="form.title",
        placeholder="请输入标题",
        float-label="标题",
        :error="$v.form.title.$error",
        @blur="$v.form.title.$touch")
      q-input(
        v-model="form.summary",
        placeholder="请输入描述",
        float-label="描述",
        :error="$v.form.summary.$error",
        @blur="$v.form.summary.$touch")
      q-input(
        type="url",
        v-model="form.href",
        placeholder="请输入跳转地址",
        float-label="跳转地址")
      span 跳转类型
      q-radio(v-model="form.type", val="inside", label="站内链接")
      q-radio(v-model="form.type", val="outside", label="站外链接", style="margin-left: 10px")
    .group.pull-right
      q-btn(flat, @click="$refs.formModal.close()") 取消
      q-btn(flat, @click="addBanner") 提交
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { date } from '@/utils'
import * as api from '@/api'
import {
  QInfiniteScroll,
  QSpinnerDots,
  QDataTable,
  QBtn,
  QIcon,
  QInput,
  QModal,
  QUploader,
  QRadio,
  Dialog,
  Toast
} from 'quasar'

let loading = false

export default {
  name: 'banner',
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    QDataTable,
    QBtn,
    QIcon,
    QInput,
    QModal,
    QRadio,
    QUploader
  },
  data () {
    return {
      banners: [],
      total: 0,
      params: {
        page: 1,
        limit: 10
      },
      form: {
        title: '',
        summary: '',
        path: '',
        type: 'inside',
        href: ''
      },
      uploadHeaders: {
        Authorization: `Bearer ${sessionStorage.token}`
      },
      config: {
        title: '轮换图列表',
        refresh: true,
        rowHeight: '50px',
        leftStickyColumns: 1,
        selection: 'single',
        labels: {
          search: '搜索'
        }
      },
      columns: [
        {
          label: '标题',
          field: 'title'
        },
        {
          label: '描述',
          field: 'summary'
        },
        {
          label: '创建人',
          field: 'creater',
          format: value => value.nickname
        },
        {
          label: '创建时间',
          field: 'createdAt',
          format: value => date.format(value)
        }
      ]
    }
  },
  validations: {
    form: {
      title: { required },
      summary: { required }
    }
  },
  mounted () {
    this.getBanners()
  },
  methods: {
    async getBanners (init) {
      if (loading) return
      loading = true
      if (init) this.params.page = 1
      const data = await api.indexBanner(this.params)
      loading = false
      if (!data) return
      Object.assign(this, data)
      this.params.page += 1
      const { page, limit } = this.params
      if (page * limit >= this.total) {
        this.$refs.infiniteScroll.stop()
      }
    },
    async refresher (done) {
      await this.getBanners(true)
      done()
    },
    async loadMore (index, done) {
      await this.getBanners()
      done()
    },
    handleUpload (file, xhr) {
      this.form.path = xhr.response
    },
    async addBanner () {
      const { form } = this
      if (!form.path) {
        Toast.create('请先上传图片')
        return
      }
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        Toast.create('请正确填写表单')
        return
      }
      const rst = await api.createBanner(form)
      if (!rst) return
      this.$refs.formModal.close()
      this.getBanners(true)
    },
    async deleteBanner (props) {
      Dialog.create({
        title: '确认删除',
        message: '该操作不可撤销！',
        buttons: [
          {
            label: '取消'
          },
          {
            label: '确定',
            handler: async () => {
              const banner = props.rows[0].data
              const rst = await api.destroyBanner(banner._id)
              if (!rst) return
              this.getBanners(true)
            }
          }
        ]
      })
    }
  }
}
</script>

<style lang="stylus">
.q-uploader-files
  min-height auto

.create-button
  position absolute
  top 8px
  right 70px
</style>
