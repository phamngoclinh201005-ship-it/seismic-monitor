import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import QuakeDetailView from '@/views/QuakeDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/quake/:id',
      name: 'quake-detail',
      component: QuakeDetailView,
    },
  ],
})

export default router