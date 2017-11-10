<template lang="pug">
q-infinite-scroll(ref="infiniteScroll", :handler="loadMore")
  q-data-table(
    :data="users",
    :config="config",
    :columns="columns",
    @refresh="refresher")
    template(slot="selection", slot-scope="props")
      q-btn(flat, color="primary")
        q-icon(name="block")
      q-btn(flat, color="primary", @click="changeUser(props)")
        q-icon(name="edit")
      q-btn(flat, color="primary", @click="deleteUser(props)")
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
  name: 'user',
  components: {
    QInfiniteScroll,
    QSpinnerDots,
    QDataTable,
    QBtn,
    QIcon
  },
  data () {
    return {
      users: [],
      total: 0,
      params: {
        page: 1,
        limit: 10
      },
      config: {
        title: '用户列表',
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
          label: '昵称',
          field: 'nickname'
        },
        {
          label: '类型',
          field: 'type',
          format (value) {
            if (value === 'admin') return '管理员'
            if (value === 'normal') return '普通用户'
            return '未知'
          }
        },
        {
          label: '注册时间',
          field: 'createdAt',
          format: value => date.format(value)
        }
      ]
    }
  },
  mounted () {
    this.getUsers()
  },
  methods: {
    async getUsers (init) {
      if (loading) return
      loading = true
      if (init) this.params.page = 1
      const data = await api.indexUser(this.params)
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
      await this.getUsers(true)
      done()
    },
    async loadMore (index, done) {
      await this.getUsers()
      done()
    },
    changeUser (props) {
      const user = props.rows[0].data
      Dialog.create({
        title: '修改用户类型',
        form: {
          type: {
            type: 'radio',
            model: user.type,
            items: [
              { label: '普通用户', value: 'normal' },
              { label: '管理员', value: 'admin' }
            ]
          }
        },
        buttons: [
          {
            label: '取消'
          },
          {
            label: '提交',
            handler: async (data) => {
              const rst = await api.updateUser(user._id, data)
              if (!rst) return
              this.getUsers(true)
            }
          }
        ]
      })
    },
    deleteUser (props) {
      Dialog.create({
        title: '确认删除',
        message: '将删除与该用户相关的所有内容！',
        buttons: [
          {
            label: '取消'
          },
          {
            label: '确定',
            handler: async () => {
              const user = props.rows[0].data
              const rst = await api.destroyUser(user._id)
              if (!rst) return
              this.getUsers(true)
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
