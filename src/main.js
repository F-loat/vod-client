import Vue from 'vue'
import Quasar from 'quasar'
import Vuelidate from 'vuelidate'
import 'quasar-extras/material-icons'
import App from './App'
import store from './store'
import router from './router'

require('./theme/app.' + __THEME + '.styl')
require(`quasar/dist/quasar.ie`)
require(`quasar/dist/quasar.ie.${__THEME}.css`)
if (__THEME === 'mat') {
  require('quasar-extras/roboto-font')
}

Vue.config.productionTip = false
Vue.use(Quasar)
Vue.use(Vuelidate)

if (localStorage.token && !sessionStorage.token) {
  sessionStorage.setItem('token', localStorage.token)
}

Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    store,
    router,
    render: h => h(App)
  })
})
