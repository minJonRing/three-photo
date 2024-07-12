import { createRouter, createWebHistory } from 'vue-router'
import SceneView from '../views/scene/index.vue'
import HomeView from '../views/home.vue'

const routes = [
  {
    path: '/',
    name: 'Scene',
    component: SceneView
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
