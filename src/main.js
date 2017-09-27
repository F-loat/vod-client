import Vue from 'vue'
import Quasar from 'quasar'
import Vuelidate from 'vuelidate'
import 'quasar-extras/material-icons'
import store from './store'
import router from './router'

require(`quasar/dist/quasar.${__THEME}.css`)
require(`quasar/dist/quasar.ie`)
require(`quasar/dist/quasar.ie.${__THEME}.css`)
if (__THEME === 'mat') {
  require('quasar-extras/roboto-font')
}

Vue.config.productionTip = false
Vue.use(Quasar)
Vue.use(Vuelidate)

Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    store,
    router,
    render: h => h(require('./App'))
  })
})
