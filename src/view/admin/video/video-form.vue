<template lang="pug">
q-modal(ref="modal", maximized)
  q-modal-layout
    template(slot="header")
      q-toolbar
        q-btn(flat, @click="close")
          q-icon(name="keyboard_arrow_left")
        .q-toolbar-title {{title}}
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
          :options="types",
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
        slot
    template(slot="footer")
      q-toolbar.justify-end
        .group
          q-btn(flat, @click="reset") 重置
          q-btn(flat, @click="submit") 提交
</template>

<script>
import lrz from 'lrz'
import { required, minLength } from 'vuelidate/lib/validators'
import { douban } from '@/utils'
import * as api from '@/api'
import {
  QBtn,
  QIcon,
  QModal,
  QModalLayout,
  QToolbar,
  QInput,
  QChipsInput,
  QSelect,
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

export default {
  name: 'video-form',
  components: {
    QBtn,
    QIcon,
    QModal,
    QModalLayout,
    QToolbar,
    QInput,
    QChipsInput,
    QSelect
  },
  props: {
    title: {
      type: String
    }
  },
  data () {
    return {
      types: [],
      form: {
        ...defaultForm
      },
      temp: {
        title: '',
        poster: ''
      }
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
  },
  methods: {
    async open (data) {
      if (data) {
        this.temp.poster = `/assets/${data.poster}`
        Object.assign(this.form, data)
      }
      this.$refs.modal.open()
    },
    close () {
      this.$refs.modal.close()
    },
    validate () {
      this.$v.form.$touch()
      if (this.$v.form.$error) {
        Toast.create('请正确填写表单')
        return false
      }
      if (!this.form.poster) {
        Toast.create('请选择封面图片')
        return false
      }
      return true
    },
    reset () {
      this.temp = {}
      this.$v.$reset()
      Object.assign(this.form, defaultForm)
    },
    async submit () {
      const { form } = this
      if (typeof form.poster !== 'string') {
        form.poster = await api.createFile(form.poster, { type: 'poster' })
      }
      if (!form.poster) return
      this.$emit('submit', form)
    },
    async getTypes () {
      const data = await api.indexType({ type: 'video' })
      if (!data) return
      this.types = data.types.map(type => ({
        value: type._id,
        label: type.name
      }))
    },
    async choosePoster (url) {
      console.log(url)
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
      const reg = /(^https?:\/\/(.*)\.doubanio.com)/
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
    }
  }
}
</script>

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
