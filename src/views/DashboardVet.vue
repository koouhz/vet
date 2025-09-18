<template>
  <div class="dashboard-vet-container">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Contenido principal -->
    <main class="dashboard-main">
      <section class="welcome-section">
        <h1>Panel del Veterinario</h1>
        <p>Bienvenido, <strong>{{ vetName }}</strong>. Aquí puedes gestionar tus citas y pacientes.</p>
      </section>

      <!-- Acciones rápidas -->
      <section class="quick-actions">
        <!-- Mis Citas -->
        <div class="action-card" @click="navigateTo('/mis-citas')">
          <div class="icon-container">
            📅
          </div>
          <h3>Mis Citas</h3>
          <p>{{ stats.myAppointments }} pendientes</p>
        </div>

        <!-- Pacientes -->
        <div class="action-card" @click="navigateTo('/pacientes')">
          <div class="icon-container">
            🐾
          </div>
          <h3>Pacientes</h3>
          <p>{{ stats.patients }} registrados</p>
        </div>

        <!-- Historial Clínico -->
        <div class="action-card" @click="navigateTo('/historial')">
          <div class="icon-container">
            📑
          </div>
          <h3>Historial Clínico</h3>
          <p>{{ stats.histories }} totales</p>
        </div>

        <!-- Servicios que ofrezco -->
        <div class="action-card" @click="navigateTo('/servicios-vet')">
          <div class="icon-container">
            💉
          </div>
          <h3>Mis Servicios</h3>
          <p>{{ stats.myServices }} activos</p>
        </div>
      </section>

      <!-- Resumen general -->
      <section class="stats-section">
        <h2>Resumen General</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">{{ stats.myAppointments }}</span>
            <span class="stat-label">Citas pendientes</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.completedAppointments }}</span>
            <span class="stat-label">Citas completadas</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.patients }}</span>
            <span class="stat-label">Pacientes atendidos</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layouts/AppSidebar.vue'

const router = useRouter()
const vetName = ref('')
const stats = ref({
  myAppointments: 0,
  completedAppointments: 0,
  patients: 0,
  histories: 0,
  myServices: 0
})

// Obtener nombre del veterinario
const fetchVetData = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: vetData, error } = await supabase
    .from('usuarios')
    .select('nombre_completo')
    .eq('id', user.id)
    .single()

  if (!error && vetData) {
    vetName.value = vetData.nombre_completo.split(' ')[0]
  }
}

// Cargar estadísticas del veterinario
const fetchStats = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Mis citas pendientes
  const { data: citasPendientes } = await supabase
    .from('citasmascotas')
    .select('id')
    .eq('id_veterinario', user.id)
    .eq('estado', 'programada')
  stats.value.myAppointments = citasPendientes?.length || 0

  // Mis citas completadas
  const { data: citasCompletadas } = await supabase
    .from('citasmascotas')
    .select('id')
    .eq('id_veterinario', user.id)
    .eq('estado', 'completada')
  stats.value.completedAppointments = citasCompletadas?.length || 0

  // Pacientes atendidos
  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('id')
    .eq('id_veterinario', user.id)
  stats.value.patients = pacientes?.length || 0

  // Historial clínico
  const { data: historiales } = await supabase
    .from('historialclinico')
    .select('id')
    .eq('id_veterinario', user.id)
  stats.value.histories = historiales?.length || 0

  // Servicios propios
  const { data: servicios } = await supabase
    .from('servicios')
    .select('id')
    .eq('id_veterinario', user.id)
    .eq('is_activo', true)
  stats.value.myServices = servicios?.length || 0
}

onMounted(async () => {
  await fetchVetData()
  await fetchStats()
})

const navigateTo = (path) => {
  router.push(path)
}
</script>
<style scoped> .dashboard-admin-container { display: flex; min-height: 100vh; background: #f8fafc; } .dashboard-main { flex: 1; padding: 2.5rem 3rem; overflow-y: auto; margin-left: 240px; transition: margin-left 0.3s ease; } /* Responsive: Ajustar para móvil */ @media (max-width: 768px) { .dashboard-main { margin-left: 0; padding: 1.5rem; } } /* Welcome Section */ .welcome-section { margin-bottom: 2.5rem; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); } .welcome-section h1 { font-size: 2rem; font-weight: 700; color: #1e293b; margin: 0 0 0.75rem 0; line-height: 1.2; } .welcome-section p { font-size: 1.125rem; color: #64748b; margin: 0; } /* Quick Actions */ .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.75rem; margin-bottom: 3.5rem; } .action-card { background: white; border-radius: 12px; padding: 1.75rem; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; border: 1px solid #e2e8f0; } .action-card:hover { transform: translateY(-6px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); border-color: #145a32; } .action-card h3 { margin: 1rem 0 0.5rem; color: #1e293b; font-size: 1.25rem; font-weight: 600; } .action-card p { color: #64748b; font-size: 0.95rem; margin: 0; } .icon-container { width: 64px; height: 64px; background: #ecfdf5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; transition: background-color 0.3s ease; } .action-card:hover .icon-container { background: #d1fae5; } /* Stats Section */ .stats-section { margin-bottom: 3.5rem; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); } .stats-section h2 { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-bottom: 1.75rem; text-align: left; } .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.75rem; text-align: center; } .stat-item { background: #f8fafc; border-radius: 12px; padding: 1.75rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); transition: transform 0.3s ease, box-shadow 0.3s ease; } .stat-item:hover { transform: translateY(-4px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08); } .stat-number { display: block; font-size: 2.25rem; font-weight: 700; color: #145a32; margin-bottom: 0.75rem; } .stat-label { font-size: 1rem; color: #64748b; } </style>