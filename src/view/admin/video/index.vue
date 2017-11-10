<template lang="pug">
q-infinite-scroll(ref="infiniteScroll", :handler="loadMore")
  q-btn.create-button(flat, color="primary", @click="$refs.addForm.open()")
    q-icon(name="add")
  q-data-table(
    :data="videos",
    :config="config",
    :columns="columns",
    @refresh="refresher")
    template(slot="selection", slot-scope="props")
      q-btn(flat, color="primary", @click="showEpisodeList(props)")
        q-icon(name="view_list")
      q-btn(flat, color="primary", @click="showEditForm(props)")
        q-icon(name="edit")
      q-btn(flat, color="primary", @click="deleteVideo(props)")
        q-icon(name="delete")
  .row.justify-center(v-if="params.page * params.limit < total")
    q-spinner-dots(slot="message", :size="40")
  episode-list(ref="episodeList")
  video-form(
    ref="addForm",
    title="新增视频",
    @submit="addVideo")
    q-uploader(
      ref="uploader",
      multiple,
      hide-upload-button,
      url="/api/files",
      :headers="uploadHeaders",
      :extensions="uploadExtensions",
      float-label="剧集",
      @uploaded="addEpisode",
      @finish="finishUpload")
  video-form(
    ref="editForm",
    title="编辑视频",
    @submit="changeVideo")
</template>

<script>
import { date } from '@/utils'
import * as api from '@/api'
import {
  QInfiniteScroll,
  QSpinnerDots,
  QDataTable,
  QBtn,
  QIcon,
  QUploader,
  Dialog,
  Toast
} from 'quasar'
import episodeList from './episode-list'
import videoForm from './video-form'

let loading = false

export default {
  name: 'video',
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    QDataTable,
    QBtn,
    QIcon,
    QUploader,
    episodeList,
    videoForm
  },
  data () {
    return {
      videos: [],
      total: 0,
      params: {
        page: 1,
        limit: 10
      },
      uploadHeaders: {
        Authorization: `Bearer ${sessionStorage.token}`
      },
      uploadExtensions: '.mp4,.webm,.mkv,.rmvb,rm,avi,wmv,mpeg,mov,flv',
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
  mounted () {
    this.getVideos()
  },
  methods: {
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
    async addVideo (form) {
      if (!this.$refs.addForm.validate()) return
      const rst = await api.createVideo(form)
      if (!rst) return
      this._id = rst._id
      if (this.$refs.uploader.files.length) {
        this.$refs.uploader.upload()
      } else {
        this.finishUpload()
      }
    },
    addEpisode (file, xhr) {
      api.createEpisode({
        name: file.name,
        belong: this._id,
        path: xhr.response
      })
    },
    finishUpload () {
      this.$refs.addForm.reset()
      this.$refs.uploader.reset()
      Toast.create('视频信息保存成功')
      this.getVideos(true)
    },
    showEpisodeList (props) {
      this.$refs.episodeList.open(props.rows[0].data)
    },
    showEditForm (props) {
      this.$refs.editForm.open(props.rows[0].data)
    },
    async changeVideo (form) {
      if (!this.$refs.editForm.validate()) return
      const rst = await api.updateVideo(form._id, form)
      if (!rst) return
      this.$refs.editForm.reset()
      Toast.create('视频信息修改成功')
      this.getVideos(true)
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
</style>
