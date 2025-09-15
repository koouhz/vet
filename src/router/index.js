import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

import PublicLayout from '@/components/layouts/PublicLayout.vue'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'Home', component: () => import('@/views/AppHome.vue') },
      { path: 'servicios', name: 'Servicios', component: () => import('@/views/Servicios.vue') },
      { path: 'equipo', name: 'Equipo', component: () => import('@/views/Equipo.vue') },
      { path: 'contacto', name: 'Contacto', component: () => import('@/views/Contacto.vue') },
      { path: 'login', name: 'Login', component: () => import('@/views/loginView.vue') },
      { path: 'register', name: 'Register', component: () => import('@/views/registerView.vue') }
    ]
  },

  {
    path: '/dashboard-admin',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'DashboardAdmin', component: () => import('@/views/DashboardAdmin.vue') }
    ]
  },
  {
    path: '/dashboard-vet',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'veterinario' },
    children: [
      { path: '', name: 'DashboardVet', component: () => import('@/views/DashboardVet.vue') }
    ]
  },

  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/views/viewProfile.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/usuarios',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'UsuarioAdmin', component: () => import('@/views/Admin/usuarioAdmin.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (to.meta.requiresAuth && !user) return next({ name: 'Login' })
  if (to.meta.role && user) {
    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()
    if (error || userData.rol !== to.meta.role) return next({ name: 'Home' })
  }

  next()
})

export default router
