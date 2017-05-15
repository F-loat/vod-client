import Vue from 'vue';
import VueRouter from 'vue-router';

const forum = import('@/views/forum');
const index = import('@/views/index');
const list = import('@/views/list');
const login = import('@/views/login');
const person = import('@/views/person');
const play = import('@/views/play');
const topic = import('@/views/topic');
const notFound = import('@/views/404');

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: () => index,
    meta: {
      title: '视频点播',
      showTitle: true,
      showBottom: true,
    },
  },
  {
    path: '/detection',
    component: () => list,
    meta: {
      title: '发现',
      showTitle: true,
      showBottom: true,
    },
  },
  {
    path: '/forum',
    component: () => forum,
    meta: {
      title: '论坛',
      showTitle: true,
      showBottom: true,
    },
  },
  {
    path: '/forum/:id',
    component: () => topic,
    meta: {
      title: '帖子详情',
      showTitle: true,
      showBottom: false,
    },
  },
  {
    path: '/person',
    component: () => person,
    meta: {
      title: '我的',
      showTitle: true,
      showBottom: true,
    },
  },
  {
    path: '/list/:type',
    component: () => list,
    meta: {
      title: '视频列表',
      showTitle: true,
      showBottom: false,
    },
  },
  {
    path: '/play/:id/:episode',
    component: () => play,
    meta: {
      title: '视频播放',
      showTitle: false,
      showBottom: false,
    },
  },
  {
    path: '/login',
    component: () => login,
    meta: {
      title: '用户登录',
      showTitle: false,
      showBottom: false,
    },
  },
  {
    path: '/404',
    component: () => notFound,
    meta: {
      title: '页面走丢了',
      showTitle: true,
      showBottom: true,
    },
  },
  {
    path: '*',
    redirect: '/404',
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { x: 0, y: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const token = localStorage.token;
  if (token && to.path === '/login') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  if (!token && to.path !== '/login') {
    next({ path: '/login' });
    return;
  }
  next();
});

export default router;
