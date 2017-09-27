<template lang="pug">
q-infinite-scroll(ref="infiniteScroll", :handler="loadMore")
  q-btn.create-button(flat, color="primary", @click="addType")
    q-icon(name="add")
  q-data-table(
    :data="types",
    :config="config",
    :columns="columns",
    @refresh="refresher")
    template(slot="selection", scope="props")
      q-btn(flat, color="primary", @click="changeType(props)")
        q-icon(name="edit")
      q-btn(flat, color="primary", @click="deleteType(props)")
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
  Dialog,
  Events
} from 'quasar'

let loading = false

export default {
  name: 'type',
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    QDataTable,
    QBtn,
    QIcon
  },
  data () {
    return {
      types: [],
      total: 0,
      params: {
        page: 1,
        limit: 10,
        type: this.$route.query.q || 'video'
      },
      config: {
        title: '分类列表',
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
    Events.$on('type-tab-change', async (type) => {
      this.params.type = type
      this.getTypes(true)
    })
  },
  methods: {
    async getTypes (init) {
      if (loading) return
      loading = true
      if (init) this.params.page = 1
      const data = await api.indexType(this.params)
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
      await this.getTypes(true)
      done()
    },
    async loadMore (index, done) {
      await this.getTypes()
      done()
    },
    addType () {
      Dialog.create({
        title: '添加分类',
        form: {
          name: {
            type: 'text',
            label: '名称',
            model: ''
          }
        },
        buttons: [
          {
            label: '取消'
          },
          {
            label: '提交',
            handler: async (data) => {
              const type = await api.createType({
                name: data.name,
                type: this.params.type
              })
              if (!type) return
              this.getTypes(true)
            }
          }
        ]
      })
    },
    changeType (props) {
      const type = props.rows[0].data
      Dialog.create({
        title: '修改分类',
        form: {
          name: {
            type: 'text',
            label: '名称',
            model: type.name
          }
        },
        buttons: [
          {
            label: '取消'
          },
          {
            label: '提交',
            handler: async (data) => {
              const rst = await api.updateType(type._id, data)
              if (!rst) return
              this.getTypes(true)
            }
          }
        ]
      })
    },
    deleteType (props) {
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
              const type = props.rows[0].data
              const rst = await api.destroyType(type._id)
              if (!rst) return
              this.getTypes(true)
            }
          }
        ]
      })
    }
  }
}
</script>

<style lang="stylus">
.create-button
  position absolute
  top 8px
  right 70px
</style>
