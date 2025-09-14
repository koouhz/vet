import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const routes = [
  // === PÚBLICAS ===
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

  // === PRIVADAS (requieren autenticación) ===
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('../views/verPerfil.vue'),
    meta: { requiresAuth: true }
  },

  // === DASHBOARDS (para roles específicos) ===
  {
    path: '/dashboard-admin',
    name: 'DashboardAdmin',
    component: () => import('@/views/DashboardAdmin.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/dashboard-vet',
    name: 'DashboardVet',
    component: () => import('@/views/DashboardVet.vue'),
    meta: { requiresAuth: true, role: 'veterinario' }
  },

  // === SESIÓN ===
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

// Middleware global: protege rutas y valida rol
router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()

  // Si la ruta requiere autenticación y no hay usuario → redirigir a login
  if (to.meta.requiresAuth && !user) {
    return next({ name: 'Login' })
  }

  // Si la ruta tiene un rol específico y el usuario está logueado, validar su rol
  if (to.meta.role && user) {
    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (error || userData.rol !== to.meta.role) {
      // Si no tiene el rol correcto, redirigir a home (no permitir acceso)
      return next({ name: 'Home' })
    }
  }

  // Permitir acceso si pasa todas las validaciones
  next()
})

export default router
