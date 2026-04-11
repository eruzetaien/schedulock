import { createRouter, createWebHashHistory } from 'vue-router'

import HomePage from '@/pages/HomePage.vue'
import SubmitPage from '@/pages/SubmitPage.vue'
import UnlockPage from '@/pages/UnlockPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/lock', component: SubmitPage },
  { path: '/unlock', component: UnlockPage }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router