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
      { path: 'register', name: 'Register', component: () => import('@/views/registerView.vue') },
      { path: 'agendar-cita', name: 'AgendarCita', component: () => import('@/views/Agendar/AgendarCita.vue') }
    ]
  },

  // Dashboard Admin
  {
    path: '/dashboard-admin',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'DashboardAdmin', component: () => import('@/views/DashboardAdmin.vue') }
    ]
  },

  // Dashboard Veterinario
  {
    path: '/dashboard-vet',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'veterinario' },
    children: [
      { path: '', name: 'DashboardVet', component: () => import('@/views/DashboardVet.vue') },
      { path: 'mis-citas', name: 'MisCitas', component: () => import('@/views/Vet/MisCitas.vue') },
      { path: 'mis-mascotas', name: 'MisMascotas', component: () => import('@/views/Vet/MisMascotas.vue') },
      { path: 'mis-servicios', name: 'MisServicios', component: () => import('@/views/Vet/MisServicios.vue') },
      { path: 'mis-horarios', name: 'MisHorarios', component: () => import('@/views/Vet/MisHorarios.vue') },
      {
        path: 'horario/editar',
        name: 'EditarHorario',
        component: () => import('@/components/features/EditarHorario.vue')
      }
    ]
  },

  // Perfil
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/views/viewProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/usuarios',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'UsuarioAdmin', component: () => import('@/views/Admin/usuarioAdmin.vue') }
    ]
  },
  {
    path: '/veterinarios',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'VeterinariosAdmin', component: () => import('@/views/Admin/veterinariosAdmin.vue') }
    ]
  },
  {
    path: '/admin/citas',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'CitasAdmin', component: () => import('@/views/Admin/citasAdmin.vue') }
    ]
  },
  {
    path: '/admin/servicios',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', name: 'ServiciosAdmin', component: () => import('@/views/Admin/serviciosAdmin.vue') }
    ]
  },
  {
  path: '/admin/equipos',
  component: DashboardLayout,
  meta: { requiresAuth: true, role: 'admin' },
  children: [
    {
      path: '',
      name: 'EquiposAdmin',
      component: () => import('@/views/Admin/equiposAdmin.vue')
    }
  ]
},
{
  path: '/admin/testimonios',
  component: DashboardLayout,
  meta: { requiresAuth: true, role: 'admin' },
  children: [
    {
      path: '',
      name: 'TestimoniosAdmin',
      component: () => import('@/views/Admin/testimoniosAdmin.vue')
    }
  ]
},
{
  path: '/admin/configuracion',
  component: DashboardLayout,
  meta: { requiresAuth: true, role: 'admin' },
  children: [
    {
      path: '',
      name: 'ConfiguracionAdmin',
      component: () => import('@/views/Admin/configuracionAdmin.vue')
    }
  ]
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Middleware de autenticación y roles
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
