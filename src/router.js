import { createRouter, createWebHistory } from 'vue-router'
import { authService } from './servicios/auth'

const routes = [
  { path: '/', redirect: '/inicio' },
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/registro',
    name: 'registro',
    component: () => import('./views/SignInView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/inicio',
    name: 'inicio',
    component: () => import('./views/HomeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/canciones',
    name: 'canciones',
    component: () => import('./views/SongsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/playlists',
    name: 'playlists',
    component: () => import('./views/PlaylistsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/canciones',
    name: 'admin-canciones',
    component: () => import('./views/AdminSongsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/usuarios',
    name: 'admin-usuarios',
    component: () => import('./views/AdminUsersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/inicio' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const isAdmin = authService.isAdmin()

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if ((to.name === 'login' || to.name === 'registro') && isAuthenticated) {
    return next({ name: 'inicio' })
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'inicio' })
  }

  return next()
})

export default router

