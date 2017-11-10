<template lang="pug">
q-modal(ref="modal", :content-css="{minWidth: '80vw', minHeight: '80vh'}")
  q-modal-layout
    q-toolbar(slot="header")
      q-btn(flat, @click="close")
        q-icon(name="keyboard_arrow_left")
      .q-toolbar-title 剧集管理
    .modal-content
      q-btn.create-button(flat, color="primary", @click="$refs.uploadModal.open()")
        q-icon(name="add")
      q-data-table(
        :data="episodes",
        :config="config",
        :columns="columns",
        @refresh="refresher")
      q-modal(
        ref="uploadModal",
        content-css="min-width: 360px; min-height: 400px; border-radius: 4px",
        :content-classes="['column', 'justify-between']")
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
          q-toolbar.justify-end
            q-btn.action-btn(flat, @click="$refs.uploadModal.close()") 取消
            q-btn.action-btn(flat, @click="$refs.uploader.upload()") 提交
    q-toolbar.justify-end(slot="footer")
      q-btn.action-btn(flat, @click="close") 关闭
</template>

<script>
import { date } from '@/utils'
import * as api from '@/api'
import {
  QBtn,
  QIcon,
  QDataTable,
  QModalLayout,
  QToolbar,
  QUploader,
  QModal,
  Toast
} from 'quasar'

export default {
  name: 'episode-list',
  components: {
    QBtn,
    QIcon,
    QDataTable,
    QModalLayout,
    QToolbar,
    QUploader,
    QModal
  },
  data () {
    return {
      video: {},
      episodes: [],
      uploadHeaders: {
        Authorization: `Bearer ${sessionStorage.token}`
      },
      uploadExtensions: '.mp4,.webm,.mkv,.rmvb,rm,avi,wmv,mpeg,mov,flv',
      config: {
        title: '剧集列表',
        refresh: true,
        rowHeight: '50px',
        leftStickyColumns: 1,
        selection: 'single',
        responsive: true
      },
      columns: [
        {
          label: '标题',
          field: 'name'
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
  methods: {
    async open (data) {
      this.video = data
      this.getEpisodes()
      this.$refs.modal.open()
    },
    close () {
      this.$refs.modal.close()
    },
    async refresher (done) {
      await this.getEpisodes()
      done()
    },
    async getEpisodes () {
      const data = await api.indexEpisode({
        belong: this.video._id
      })
      this.episodes = data.episodes
    },
    addEpisode (file, xhr) {
      api.createEpisode({
        name: file.name,
        belong: this.video._id,
        path: xhr.response
      })
    },
    finishUpload () {
      this.$refs.uploader.reset()
      Toast.create('剧集添加成功')
      this.getEpisodes()
    }
  }
}
</script>

<style lang="stylus">
.modal-content .q-uploader-files
  @media (min-width: 768px)
    max-height 360px
    overflow-y scroll
</style>


<style lang="stylus" scoped>
.modal-content
  height 100%
</style>
