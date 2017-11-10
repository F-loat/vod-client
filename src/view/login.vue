<template lang="pug">
#login(@click.self="changeBackground")
  q-transition(
    appear,
    enter="bounceInLeft",
    leave="bounceOutRight")
    q-card.form-wrap(v-if="mode === 'login'", key="login")
      q-card-title
        span.title 用户登录
        span.subtitle(@click="mode = 'regist'") （注册）
      q-card-main
        q-input(
          v-model="loginForm.username",
          float-label="账号",
          placeholder="请输入用户名/邮箱",
          @blur="$v.loginForm.username.$touch",
          @keyup.enter="login",
          :error="$v.loginForm.username.$error")
        q-input(
          type="password",
          v-model="loginForm.password",
          float-label="密码",
          placeholder="请输入密码",
          @blur="$v.loginForm.password.$touch",
          @keyup.enter="login",
          :error="$v.loginForm.password.$error")
        q-checkbox(v-model="remember", label="自动登录")
      q-card-actions.group
        q-btn.full-width(color="primary", @click="login") 登录
        q-btn.full-width(color="primary", @click="reset") 重置
    q-card.form-wrap(v-else, key="regist")
      q-card-title
        span.title 用户注册
        span.subtitle(@click="mode = 'login'") （登录）
      q-card-main
        q-input(
          v-model="registForm.username",
          float-label="账号",
          placeholder="请输入用户名/邮箱",
          @blur="$v.registForm.username.$touch",
          @keyup.enter="regist",
          :error="$v.registForm.username.$error")
        q-input(
          type="password",
          v-model="registForm.password",
          float-label="密码",
          placeholder="请输入密码",
          @blur="$v.registForm.password.$touch",
          @keyup.enter="regist",
          :error="$v.registForm.password.$error")
        q-input(
          v-model="registForm.email",
          float-label="邮箱",
          placeholder="请输入邮箱",
          @blur="$v.registForm.email.$touch",
          @keyup.enter="regist",
          :error="$v.registForm.email.$error")
      q-card-actions.group
        q-btn.full-width(color="primary", @click="regist") 注册
        q-btn.full-width(color="primary", @click="reset") 重置
</template>

<script>
import MaterialImage from 'material-image'
import { required, email } from 'vuelidate/lib/validators'
import {
  Toast,
  QTransition,
  QCard,
  QCardTitle,
  QCardMain,
  QCardActions,
  QInput,
  QCheckbox,
  QBtn
} from 'quasar'
import * as api from '@/api'

export default {
  name: 'login',
  components: {
    QTransition,
    QCard,
    QCardTitle,
    QCardMain,
    QCardActions,
    QInput,
    QCheckbox,
    QBtn
  },
  data () {
    return {
      mode: 'login',
      loginForm: {
        username: '',
        password: ''
      },
      registForm: {
        username: '',
        password: '',
        email: ''
      },
      remember: false
    }
  },
  validations: {
    loginForm: {
      username: {required},
      password: {required}
    },
    registForm: {
      username: {required},
      password: {required},
      email: {required, email}
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
      this.$v.loginForm.$touch()
      if (this.$v.loginForm.$error) {
        Toast.create('请正确填写表单')
        return
      }
      const token = await api.createToken(this.loginForm)
      if (!token) return
      sessionStorage.setItem('token', token)
      if (this.remember) localStorage.setItem('token', token)
      await this.getUser()
      this.$router.push(this.$route.query.redirect || '/')
    },
    async regist () {
      this.$v.registForm.$touch()
      if (this.$v.registForm.$error) {
        Toast.create('请正确填写表单')
        return
      }
      const user = await api.createUser(this.registForm)
      if (!user) return
      Toast.create('注册成功，请登录')
      this.loginForm.username = this.registForm.username
      this.loginForm.password = this.registForm.password
      this.mode = 'login'
    },
    async getUser () {
      const user = await api.showUser('self')
      if (!user) return
      this.$store.commit('USER', user)
      sessionStorage.setItem('user', JSON.stringify(user))
    },
    reset () {
      this.loginForm = {
        username: '',
        password: ''
      }
      this.registForm = {
        username: '',
        password: '',
        email: ''
      }
    },
    changeBackground () {
      this.materialBg.protract()
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~quasar-extras/animate/bounceInLeft.css';
@import '~quasar-extras/animate/bounceOutRight.css';

#login
  width 100vw
  height 100vh
  display flex
  justify-content center
  align-items center

.form-wrap
  width 440px
  padding 40px 30px 30px
  margin 0
  position absolute
  background-color rgba(255, 255, 255, .86)
  @media(max-width: 480px)
    box-shadow none
    width 100vw
    height 100vh

.subtitle
  font-size 14px
  cursor pointer
  color #666
</style>
