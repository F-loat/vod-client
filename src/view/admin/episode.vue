<template lang="pug">
q-infinite-scroll(ref="infiniteScroll", :handler="loadMore")
  q-data-table(
    :data="episodes",
    :config="config",
    :columns="columns",
    @refresh="refresher")
    template(slot="selection", slot-scope="props")
      q-btn(flat, color="primary", @click="transcodeEpisode(props)")
        q-icon(name="polymer")
      q-btn(flat, color="primary")
        q-icon(name="delete")
  .row.justify-center(v-if="params.page * params.limit < total")
    q-spinner-dots(slot="message", :size="40")
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
  Dialog
} from 'quasar'

let loading = false

export default {
  name: 'Episode',
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    QDataTable,
    QBtn,
    QIcon,
    QUploader
  },
  data () {
    return {
      episodes: [],
      total: 0,
      params: {
        page: 1,
        limit: 10
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
  mounted () {
    this.getEpisodes()
  },
  methods: {
    async getEpisodes (init) {
      if (loading) return
      loading = true
      if (init) this.params.page = 1
      const data = await api.indexEpisode(this.params)
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
      await this.getEpisodes(true)
      done()
    },
    async loadMore (index, done) {
      await this.getEpisodes()
      done()
    },
    async transcodeEpisode (props) {
      Dialog.create({
        title: '转码视频',
        message: '立即开始转码该视频？',
        buttons: [
          {
            label: '取消'
          },
          {
            label: '确定',
            handler: async () => {
              const episode = props.rows[0].data
              const rst = await api.transcodeEpisode(episode._id)
              if (!rst) return
              this.getEpisodes(true)
            }
          }
        ]
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
