/// <reference types="node" />
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import AppList from '../views/AppList.vue'
import ChatGPT from '../views/ChatGPT.vue'
import GPTApps from '../views/GPTApps.vue'


const routes: Array<RouteRecordRaw> = [
  {
    path: '/chat/:appName',
    name: 'ChatGPT',
    component: ChatGPT,
  },
  {
    path: '/clonegpt/:appName',
    name: 'CloneGPT',
    component: GPTApps,
  },
  {
    path: '/',
    name: 'applist',
    component: AppList,
    
  },
  {
    path: '/addgpt',
    name: 'AddGPT',
    component: GPTApps,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})


export default router
