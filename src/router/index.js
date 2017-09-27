import Vue from 'vue';
import Router from 'vue-router';

import login from '@/views/login';
import layout from '@/views/admin/layout';
import overview from '@/views/admin/overview';

import userList from '@/views/admin/user/list';
import videoList from '@/views/admin/video/list';
import videoUpload from '@/views/admin/video/upload';
import videoTranscode from '@/views/admin/video/transcode';
import bannerList from '@/views/admin/banner/list';
import forumTopic from '@/views/admin/forum/topic';
import typeManage from '@/views/admin/type';

Vue.use(Router);

const routes = [
  {
    path: '/login',
    component: login,
    meta: { hidden: true },
  },
  {
    path: '/admin',
    component: layout,
    alias: '/',
    meta: {
      title: '概览',
      icon: 'equalizer',
      leaf: true,
    },
    children: [
      { path: '/admin', component: overview, meta: { title: '概览' } },
    ],
  },
  {
    path: '/admin/video',
    component: layout,
    meta: {
      title: '视频管理',
      icon: 'movie',
    },
    children: [
      { path: '/admin/video/upload', component: videoUpload, meta: { title: '视频上传' } },
      { path: '/admin/video/list', component: videoList, meta: { title: '视频列表' } },
      { path: '/admin/video/transcode', component: videoTranscode, meta: { title: '转码队列' } },
    ],
  },
  {
    path: '/admin/banner',
    component: layout,
    meta: {
      title: '轮换图管理',
      icon: 'photo',
      leaf: true,
    },
    children: [
      { path: '/admin/banner', component: bannerList, meta: { title: '轮换图列表' } },
    ],
  },
  {
    path: '/admin/user',
    component: layout,
    meta: {
      title: '用户管理',
      icon: 'people',
      leaf: true,
    },
    children: [
      { path: '/admin/user', component: userList, meta: { title: '用户列表' } },
    ],
  },
  {
    path: '/admin/forum',
    component: layout,
    meta: {
      title: '论坛管理',
      icon: 'whatshot',
      leaf: true,
    },
    children: [
      { path: '/admin/forum', component: forumTopic, meta: { title: '帖子列表' } },
    ],
  },
  {
    path: '/admin/type',
    component: layout,
    meta: {
      title: '分类管理',
      icon: 'receipt',
      leaf: true,
    },
    children: [
      { path: '/admin/type', component: typeManage, meta: { title: '分类管理' } },
    ],
  },
];

const router = new Router({
  mode: 'history',
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
