import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/AppHome.vue')
  },
  {
    path: '/servicios',
    name: 'Servicios',
    component: () => import('../views/Servicios.vue')
  },
  {
    path: '/equipo',
    name: 'Equipo',
    component: () => import('../views/Equipo.vue')
  },
  {
    path: '/contacto',
    name: 'Contacto',
    component: () => import('../views/Contacto.vue')
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('../views/verPerfil.vue'),
    meta: { requiresAuth: true } // <- solo para usuarios logueados
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/loginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/registerView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard para rutas protegidas
router.beforeEach(async (to, from, next) => {
  const user = (await supabase.auth.getUser()).data.user

  if (to.meta.requiresAuth && !user) {
    next({ name: 'Login' }) // Redirige al login si no hay usuario
  } else {
    next()
  }
})

export default router
