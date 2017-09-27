<template lang="pug">
q-infinite-scroll(ref="infiniteScroll", :handler="loadMore")
  q-data-table(
    :data="topics",
    :config="config",
    :columns="columns",
    @refresh="refresher")
    template(slot="selection", scope="props")
      q-btn(flat, color="primary", @click="deleteTopic(props)")
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
  Dialog
} from 'quasar'

let loading = false

export default {
  name: 'forum',
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    QDataTable,
    QBtn,
    QIcon
  },
  data () {
    return {
      topics: [],
      total: 0,
      params: {
        page: 1,
        limit: 10
      },
      config: {
        title: '帖子列表',
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
          label: '发帖人',
          field: 'creater',
          format: value => value.nickname
        },
        {
          label: '标题',
          field: 'title'
        },
        {
          label: '浏览量',
          field: 'visit'
        },
        {
          label: '回复量',
          field: 'reply'
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
    this.getTopics()
  },
  methods: {
    async getTopics (init) {
      if (loading) return
      loading = true
      if (init) this.params.page = 1
      const data = await api.indexTopic(this.params)
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
      await this.getTopics(true)
      done()
    },
    async loadMore (index, done) {
      await this.getTopics()
      done()
    },
    deleteTopic (props) {
      Dialog.create({
        title: '确认删除',
        message: '将删除与该帖子相关的所有内容！',
        buttons: [
          {
            label: '取消'
          },
          {
            label: '确定',
            handler: async () => {
              const topic = props.rows[0].data
              const rst = await api.destroyTopic(topic._id)
              if (!rst) return
              this.getTopics(true)
            }
          }
        ]
      })
    }
  }
}
</script>

<style lang="styl">

</style>
