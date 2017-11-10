import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  // mode: 'history',
  routes: [
    {
      path: '/',
      name: 'layout-normal',
      component: () => import('@/layout/normal'),
      redirect: '/home',
      children: [
        { path: '/home', component: () => import('@/view/home'), meta: { title: '首页' } },
        { path: '/video/:id/:episode?', component: () => import('@/view/video'), meta: { title: '视频详情' } }
      ]
    },
    {
      path: '/admin',
      name: 'layout-admin',
      component: () => import('@/layout/admin'),
      redirect: '/admin/overview',
      children: [
        { path: '/admin/overview', component: () => import('@/view/admin'), meta: { title: '概览', icon: 'equalizer' } },
        { path: '/admin/video', component: () => import('@/view/admin/video'), meta: { title: '视频管理', icon: 'movie' } },
        { path: '/admin/episode', component: () => import('@/view/admin/episode'), meta: { title: '剧集管理', icon: 'theaters' } },
        { path: '/admin/banner', component: () => import('@/view/admin/banner'), meta: { title: '轮换图管理', icon: 'photo' } },
        { path: '/admin/user', component: () => import('@/view/admin/user'), meta: { title: '用户管理', icon: 'people' } },
        { path: '/admin/forum', component: () => import('@/view/admin/forum'), meta: { title: '论坛管理', icon: 'whatshot' } },
        {
          name: 'type',
          path: '/admin/type',
          component: () => import('@/view/admin/type'),
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
    { path: '/login', component: () => import('@/view/login') },
    { path: '*', component: () => import('@/component/Error404') }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    localStorage.clear()
    sessionStorage.clear()
    if (!to.query.redirect) {
      return next({
        path: '/login',
        query: {
          redirect: from.path === '/login' ? '/' : from.fullPath
        }
      })
    }
  }
  return next()
})

export default router
