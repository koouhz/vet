import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

import PublicLayout from '@/components/layouts/PublicLayout.vue'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'

// Importar el nuevo componente
import ResetPassword from '@/views/resetPassword.vue'

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
      { path: 'agendar-cita', name: 'AgendarCita', component: () => import('@/views/Agendar/AgendarCita.vue') },
      { path: 'productos', name: 'Productos', component: () => import('@/views/ProductosView.vue') },
      { path: 'perfil', name: 'Perfil', component: () => import('@/views/viewProfile.vue') },
      // Añadir la nueva ruta para el restablecimiento de contraseña
      { path: 'reset-password', name: 'ResetPassword', component: ResetPassword },
      { path: 'agendar-cita', name: 'AgendarCita', component: () => import('@/views/Agendar/AgendarCita.vue') } // ← nueva
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
      { path: 'bitacora-citas', name: 'BitacoraCitasVet', component: () => import('@/views/Vet/BitacoraCitasVet.vue') },
      { path: 'equipos-medicos', name: 'EquiposMedicosVet', component: () => import('@/views/Vet/EquiposMedicosVet.vue') },
      { path: 'mis-testimonios', name: 'MisTestimonios', component: () => import('@/views/Vet/MisTestimonios.vue') },
      { path: 'mis-productos', name: 'MisProductos', component: () => import('@/views/Vet/MisProductos.vue') },
      { path: 'mis-servicios', name: 'MisServicios', component: () => import('@/views/Vet/MisServicios.vue') },
      { path: 'mis-horarios', name: 'MisHorarios', component: () => import('@/views/Vet/MisHorarios.vue') }
    ]
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
},
{
  path: '/admin/productos',
  component: DashboardLayout,
  meta: { requiresAuth: true, role: 'admin' },
  children: [
    {
      path: '',
      name: 'ProductosAdmin',
      component: () => import('@/views/Admin/productosAdmin.vue')
    }
  ]
},
{
  path: '/admin/reportes',
  component: DashboardLayout,
  meta: { requiresAuth: true, role: 'admin' },
  children: [
    {
      path: '',
      name: 'ReportesAdmin',
      component: () => import('@/views/Admin/ReportesView.vue')
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
      component: () => import('@/views/Admin/ConfiguracionView.vue')
    }
  ]
},
{
  path: '/admin/mensajes',
  component: DashboardLayout,
  meta: { requiresAuth: true, role: 'admin' },
  children: [
    {
      path: '',
      name: 'MensajesAdmin',
      component: () => import('@/views/Admin/MensajesContactoAdmin.vue')
    }
  ]
},
{
  path: '/admin/bitacora',
  component: DashboardLayout,
  meta: { requiresAuth: true, role: 'admin' },
  children: [
    {
      path: '',
      name: 'BitacoraAdmin',
      component: () => import('@/views/Admin/BitacoraAdmin.vue')
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
