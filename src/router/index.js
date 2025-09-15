import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

// Layouts
import PublicLayout from '@/components/layouts/PublicLayout.vue'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'

// Rutas
const routes = [
  // === PÚBLICAS ===
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

  // === DASHBOARD ADMIN ===
  {
    path: '/dashboard-admin',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: { name: 'usuarioAdmin' } }, // 👈 Opcional: redirige a usuarios por defecto
      { 
        path: 'usuarios', 
        name: 'usuarioAdmin', 
        component: () => import('@/views/featuresAdmin/usuarioAdmin.vue') 
      }
    ]
  },

  // === DASHBOARD VET ===
  {
    path: '/dashboard-vet',
    component: DashboardLayout,
    meta: { requiresAuth: true, role: 'veterinario' },
    children: [
      { path: '', name: 'DashboardVet', component: () => import('@/views/DashboardVet.vue') }
    ]
  },

  // === PERFIL ===
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/views/verPerfil.vue'),
    meta: { requiresAuth: true }
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
  if (to.meta.requiresAuth && !user) return next({ name: 'Login' })

  // Si la ruta tiene un rol específico y el usuario está logueado, validar su rol
  if (to.meta.role && user) {
    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (error || !userData || userData.rol !== to.meta.role) return next({ name: 'Home' })
  }

  next()
})

export default router