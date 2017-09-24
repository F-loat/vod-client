import Vue from 'vue';
import Router from 'vue-router';

import layout from '@/views/layout';
import login from '@/views/login';
import overview from '@/views/overview';

import userList from '@/views/user/list';
import videoList from '@/views/video/list';
import videoUpload from '@/views/video/upload';
import videoTranscode from '@/views/video/transcode';
import bannerList from '@/views/banner/list';
import forumTopic from '@/views/forum/topic';
import typeManage from '@/views/type';

Vue.use(Router);

const routes = [
  {
    path: '/login',
    component: login,
    meta: { hidden: true },
  },
  {
    path: '/',
    component: layout,
    meta: {
      title: '概览',
      icon: 'equalizer',
      leaf: true,
    },
    children: [
      { path: '/', component: overview, meta: { title: '概览' } },
    ],
  },
  {
    path: '/video',
    component: layout,
    meta: {
      title: '视频管理',
      icon: 'movie',
    },
    children: [
      { path: '/video/upload', component: videoUpload, meta: { title: '视频上传' } },
      { path: '/video/list', component: videoList, meta: { title: '视频列表' } },
      { path: '/video/transcode', component: videoTranscode, meta: { title: '转码队列' } },
    ],
  },
  {
    path: '/banner',
    component: layout,
    meta: {
      title: '轮换图管理',
      icon: 'photo',
      leaf: true,
    },
    children: [
      { path: '/banner', component: bannerList, meta: { title: '轮换图列表' } },
    ],
  },
  {
    path: '/user',
    component: layout,
    meta: {
      title: '用户管理',
      icon: 'people',
      leaf: true,
    },
    children: [
      { path: '/user', component: userList, meta: { title: '用户列表' } },
    ],
  },
  {
    path: '/forum',
    component: layout,
    meta: {
      title: '论坛管理',
      icon: 'whatshot',
      leaf: true,
    },
    children: [
      { path: '/forum', component: forumTopic, meta: { title: '帖子列表' } },
    ],
  },
  {
    path: '/type',
    component: layout,
    meta: {
      title: '分类管理',
      icon: 'receipt',
      leaf: true,
    },
    children: [
      { path: '/type', component: typeManage, meta: { title: '分类管理' } },
    ],
  },
];

const router = new Router({
  mode: 'history',
  base: '/admin/',
  routes,
});

router.beforeEach((to, from, next) => {
  const token = sessionStorage.token;
  if (token && to.path === '/login') {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
  if (!token && to.path !== '/login') {
    next({ path: '/login' });
    return;
  }
  next();
});

export default router;
