<template lang="pug">
.login(@click.self="changeBackground")
  q-card.login-form(ref="form")
    q-card-title.title 管理后台登录
    q-card-main
      q-input(
        v-model="username",
        float-label="用户名",
        placeholder="校内用户请输入学号")
      q-input(
        type="password",
        v-model="password",
        float-label="密码",
        placeholder="校内用户请输入统一登录平台密码")
    q-card-actions
      q-btn(flat, @click="login") 登录
      q-btn(flat, @click="reset") 重置
</template>

<script>
import MaterialImage from 'material-image'
import * as api from '@/api'
import {
  Toast,
  QCard,
  QCardTitle,
  QCardMain,
  QCardActions,
  QInput,
  QBtn
} from 'quasar'

export default {
  name: 'login',
  components: {
    QCard,
    QCardTitle,
    QCardMain,
    QCardActions,
    QInput,
    QBtn
  },
  data () {
    return {
      username: '',
      password: ''
    }
  },
  mounted () {
    this.createBg()
  },
  methods: {
    createBg () {
      this.materialBg = new MaterialImage({
        el: this.$el
      })
    },
    async login () {
      if (!this.username) {
        Toast.create.negative('请填写账号')
        return
      }
      if (!this.password) {
        Toast.create.negative('请填写密码')
        return
      }
      this.loading = true
      const token = await api.createToken({
        username: this.username,
        password: this.password
      })
      this.loading = false
      if (!token) return
      sessionStorage.setItem('token', token)
      const user = await api.showUser('self')
      if (!user) return
      if (user.type !== 'admin') {
        Toast.create.negative('管理员可用')
        return
      }
      this.$store.commit('USER', user)
      sessionStorage.setItem('user', JSON.stringify(user))
      const { redirect } = this.$route.query
      this.$router.push(redirect || '/')
    },
    reset () {
      Object.assign(this.$data, this.$options.data())
    },
    changeBackground () {
      this.materialBg.protract()
    }
  }
}
</script>

<style lang="stylus" scoped>
.login
  width 100vw
  height 100vh
  display flex
  justify-content center
  align-items center

.login-form
  width 440px
  background-color rgba(255, 255, 255, .86)
  padding 40px 30px
  position relative
  @media(max-width: 480px)
    width 100%
    height 100%
    margin 0

.progress
  position absolute
  bottom 0
  left 0
</style>
