import Vue from 'vue';
import VueRouter from 'vue-router';

const index = () => import('@/views/video');
const list = () => import('@/views/video/list');
const play = () => import('@/views/video/play');
const forum = () => import('@/views/forum');
const topic = () => import('@/views/forum/detail');
const login = () => import('@/views/login');
const notFound = () => import('@/views/404');

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: index,
  },
  {
    path: '/detection',
    component: list,
  },
  {
    path: '/forum',
    component: forum,
  },
  {
    path: '/forum/:id',
    component: topic,
  },
  {
    path: '/list/:type',
    component: list,
  },
  {
    path: '/play/:id/:episode',
    component: play,
  },
  {
    path: '/login',
    component: login,
  },
  {
    path: '*',
    component: notFound,
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
