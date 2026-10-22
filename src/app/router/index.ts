import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        redirect: '/home',
      },
      {
        path: 'home',
        name: 'home',
        component: () => import('../../features/projects/pages/HomePage.vue'),
      },
      {
        path: 'project/:projectId',
        name: 'project',
        component: () => import('../../features/projects/pages/ProjectPage.vue'),
      },
      {
        path: 'project/:projectId/triage',
        name: 'triage',
        component: () => import('../../features/photos/pages/TriagePage.vue'),
      },
      {
        path: 'project/:projectId/review',
        name: 'review',
        component: () => import('../../features/photos/pages/ReviewPage.vue'),
      },
      {
        path: 'project/:projectId/viewer/:photoId',
        name: 'viewer',
        component: () => import('../../features/photos/pages/ViewerPage.vue'),
      },
      {
        path: 'project/:projectId/export',
        name: 'export',
        component: () => import('../../features/reports/pages/ExportPage.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../../features/settings/pages/SettingsPage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  // Garantir que cada página inicia no topo
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
