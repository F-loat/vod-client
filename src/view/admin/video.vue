<template lang="pug">
q-infinite-scroll(ref="infiniteScroll", :handler="loadMore")
  q-btn.create-button(flat, color="primary", @click="$refs.formModal.open()")
    q-icon(name="add")
  q-data-table(
    :data="videos",
    :config="config",
    :columns="columns",
    @refresh="refresher")
    template(slot="selection", scope="props")
      q-btn(flat, color="primary", @click="changeVideo(props)")
        q-icon(name="edit")
      q-btn(flat, color="primary", @click="deleteVideo(props)")
        q-icon(name="delete")
  .row.justify-center(v-if="params.page * params.limit < total")
    q-spinner-dots(slot="message", :size="40")

  q-modal(ref="formModal", maximized)
    q-modal-layout
      q-toolbar(slot="header")
        q-btn(flat, @click="$refs.formModal.close()")
          q-icon(name="keyboard_arrow_left")
        .q-toolbar-title 新增视频
      .layout-padding
        .poster-wrap.pull-left
          .poster.shadow-2(:style="`background-image: url('${temp.poster}')`")
          q-btn(flat) 选取封面
            input.poster-choose-button(
              type="file",
              accept="image/jpg,image/jpeg,image/png",
              @change="choosePoster()")
        .group
          q-input(
            v-model="form.title",
            placeholder="请输入标题",
            float-label="标题",
            :suffix="temp.title",
            :error="$v.form.title.$error",
            :after="temp.title ? [{ icon: 'done', handler () { form.title = temp.title; temp.title = '' } }] : []",
            @blur="$v.form.title.$touch",
            @keyup.enter="getInfo(true)",
            @keyup.esc="getInfo(false)")
          q-select(
            multiple,
            v-model="form.type",
            float-label="类型",
            :options="typeOptions",
            :error="$v.form.type.$error",
            @blur="$v.form.type.$touch")
          q-chips-input(
            v-model="form.directors",
            placeholder="请输入导演",
            float-label="导演")
          q-chips-input(
            v-model="form.performers",
            placeholder="请输入主演",
            float-label="主演")
          q-input(
            v-model="form.year",
            placeholder="请输入年代",
            float-label="年代")
          q-chips-input(
            v-model="form.countries",
            placeholder="请输入国家",
            float-label="国家")
          q-chips-input(
            v-model="form.aka",
            placeholder="请输入关键字",
            float-label="关键字")
          q-input(
            type="textarea",
            v-model="form.summary",
            placeholder="请输入描述",
            float-label="描述")
        q-uploader(
          ref="uploader",
          multiple,
          hide-upload-button,
          url="/request/files",
          :headers="uploadHeaders",
          extensions=".mp4,.webm,.mkv,.rmvb,rm,avi,wmv,mpeg,mov,flv",
          float-label="剧集",
          @uploaded="addEpisode",
          @finish="reset(true)")
      q-toolbar.justify-end(slot="footer")
        .group
          q-btn(flat, @click="reset(false)") 重置
          q-btn(flat, @click="addVideo") 提交
</template>

<script>
import lrz from 'lrz'
import { required, minLength } from 'vuelidate/lib/validators'
import { date, douban } from '@/utils'
import * as api from '@/api'
import {
  QInfiniteScroll,
  QSpinnerDots,
  QDataTable,
  QBtn,
  QIcon,
  QModal,
  QModalLayout,
  QToolbar,
  QInput,
  QChipsInput,
  QSelect,
  QUploader,
  Dialog,
  Toast
} from 'quasar'

const search = {
  title: '',
  start: 0
}
const defaultForm = {
  title: '',
  directors: [],
  performers: [],
  year: '',
  countries: [],
  type: [],
  aka: [],
  summary: '',
  poster: ''
}
let loading = false

export default {
  name: 'video',
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    QDataTable,
    QBtn,
    QIcon,
    QModal,
    QModalLayout,
    QToolbar,
    QInput,
    QChipsInput,
    QSelect,
    QUploader
  },
  data () {
    return {
      videos: [],
      total: 0,
      typeOptions: [],
      params: {
        page: 1,
        limit: 10
      },
      form: {
        ...defaultForm
      },
      temp: {
        title: '',
        poster: ''
      },
      uploadHeaders: {
        Authorization: `Bearer ${sessionStorage.token}`
      },
      config: {
        title: '视频列表',
        refresh: true,
        rowHeight: '50px',
        leftStickyColumns: 1,
        selection: 'single',
        responsive: true,
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
          label: '创建人',
          field: 'creater',
          format: value => String(value.map(person => person.nickname))
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
      type: { required, minLength: minLength(1) }
    }
  },
  mounted () {
    this.getTypes()
    this.getVideos()
  },
  methods: {
    async getTypes () {
      const data = await api.indexType({ type: 'video' })
      if (!data) return
      this.typeOptions = data.types.map(type => ({
        value: type._id,
        label: type.name
      }))
    },
    async getVideos (init) {
      if (loading) return
      loading = true
      if (init) this.params.page = 1
      const data = await api.indexVideo(this.params)
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
      await this.getVideos(true)
      done()
    },
    async loadMore (index, done) {
      await this.getVideos()
      done()
    },
    async choosePoster (url) {
      const poster = url || event.target.files[0]
      if (!poster) return
      const rst = await lrz(poster, { quality: 0.8 })
      this.form.poster = rst.file
      this.temp.poster = rst.base64
    },
    async getInfo (next) {
      if (search.title !== this.form.title) {
        search.title = this.form.title
        search.start = 0
      }
      if (!next && search.start < 2) return
      if (!next) search.start -= 2
      const info = await douban.show({
        q: search.title,
        start: search.start,
        count: 1
      })
      if (!info) return
      const reg = /(^https:\/\/(.*)\.doubanio.com)/
      const imguri = info.images.large.replace(reg, '/doubanio')
      this.choosePoster(imguri)
      info.directors = info.directors.map(director => director.name)
      info.performers = info.casts.map(cast => cast.name)
      this.temp.title = info.title
      info.title = this.form.title
      Object.keys(this.form).forEach(key => {
        if (info[key]) this.form[key] = info[key]
      })
      search.start += 1
    },
    async addVideo () {
      const { form } = this
      if (!form.poster) {
        Toast.create('请选择封面图片')
        return
      }
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        Toast.create('请正确填写表单')
        return
      }
      form.poster = await api.createFile(form.poster, { type: 'poster' })
      if (!form.poster) return
      const rst = await api.createVideo(form)
      if (!rst) return
      this._id = rst._id
      if (this.$refs.uploader.files.length) {
        Toast.create('视频信息提交成功')
        this.$refs.uploader.upload()
      } else {
        this.reset(true)
      }
    },
    addEpisode (file, xhr) {
      api.createEpisode({
        name: file.name,
        belong: this._id,
        path: xhr.response
      })
    },
    changeVideo (props) {
      console.log(props)
    },
    async deleteVideo (props) {
      Dialog.create({
        title: '确认删除',
        message: '将删除与该视频相关的所有内容！',
        buttons: [
          {
            label: '取消'
          },
          {
            label: '确定',
            handler: async () => {
              const video = props.rows[0].data
              const rst = await api.destroyVideo(video._id)
              if (!rst) return
              this.getVideos(true)
            }
          }
        ]
      })
    },
    reset (complete) {
      this.temp = {}
      this.$refs.uploader.reset()
      this.$v.$reset()
      Object.assign(this.form, defaultForm)
      if (complete) Toast.create.positive('所有信息提交完成')
    }
  }
}
</script>

<style lang="stylus">
.q-uploader
  min-width 240px
.q-uploader-files
  min-height auto

.create-button
  position absolute
  top 8px
  right 70px
</style>

<style lang="stylus" scoped>
.poster-wrap
  margin-right 20px
  text-align center

.poster
  width 180px
  height 240px
  margin-bottom 10px
  background-color rgba(0, 0, 0, .1)
  background-size cover
  background-position center
  @media(max-width: 480px)
    width 120px
    height 160px

.poster-choose-button
  width 180px
  position absolute
  left -50%
  top 0
  bottom 0
  opacity 0
</style>
