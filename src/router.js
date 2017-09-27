import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

function load (type, component) {
  return () => import(`@/${type}/${component}.vue`)
}

export default new VueRouter({
  // mode: 'history',
  beforeEach (to, from, next) {
    if (to.path === '/login') {
      sessionStorage.removeItem('token')
      if (!to.query.redirect) {
        return next({
          path: '/login',
          query: {
            redirect: from.fullPath
          }
        })
      }
    }
    return next()
  },
  routes: [
    {
      path: '/admin',
      alias: '/',
      name: 'layout-admin',
      component: load('layout', 'admin'),
      redirect: '/admin/overview',
      children: [
        { path: '/admin/overview', component: load('view', 'admin/index'), meta: { title: '概览', icon: 'equalizer' } },
        { path: '/admin/video', component: load('view', 'admin/video'), meta: { title: '视频管理', icon: 'movie' } },
        { path: '/admin/banner', component: load('view', 'admin/banner'), meta: { title: '轮换图管理', icon: 'photo' } },
        { path: '/admin/user', component: load('view', 'admin/user'), meta: { title: '用户管理', icon: 'people' } },
        { path: '/admin/forum', component: load('view', 'admin/forum'), meta: { title: '论坛管理', icon: 'whatshot' } },
        {
          name: 'type',
          path: '/admin/type',
          component: load('view', 'admin/type'),
          meta: {
            title: '分类管理',
            icon: 'receipt',
            tabs: [{
              type: 'video',
              label: '视频',
              icon: ''
            }, {
              type: 'topic',
              label: '论坛',
              icon: ''
            }]
          }
        }
      ]
    },
    { path: '/login', component: load('view', 'login') },
    { path: '*', component: load('component', 'Error404') }
  ]
})
