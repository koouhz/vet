<template>
  <div class="dashboard-admin-container">
    <AppSidebar />
    <main class="dashboard-main">

      <!-- Sección de bienvenida -->
      <section class="welcome-section">
        <h1>Panel de Administración</h1>
        <p>Bienvenido, <strong>{{ adminName }}</strong>. Gestiona todo el sistema desde aquí.</p>
      </section>

      <!-- Tarjetas de gestión rápida -->
      <section class="quick-actions">
        <!-- Usuarios -->
        <div class="action-card" @click="navigateTo('UsuarioAdmin')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M20 21C20 19.3431 18.6569 18 17 18H7C5.34315 18 4 19.3431 4 21"
                stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3>Usuarios</h3>
          <p>{{ stats.users }} totales</p>
        </div>

        <!-- Citas -->
        <div class="action-card" @click="navigateTo('CitasAdmin')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M8 2V5" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16 2V5" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3 9H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3 15H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3 21H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3>Citas</h3>
          <p>{{ stats.appointments }} totales</p>
        </div>

        <!-- Veterinarios -->
        <div class="action-card" @click="navigateTo('VeterinariosAdmin')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 8V16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M8 12H16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3>Veterinarios</h3>
          <p>{{ stats.veterinarians }} activos</p>
        </div>

        <!-- Servicios -->
        <div class="action-card" @click="navigateTo('ServiciosAdmin')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 8V16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M8 12H16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3>Servicios</h3>
          <p>{{ stats.services }} activos</p>
        </div>

        <!-- Equipos Médicos -->
        <div class="action-card" @click="navigateTo('EquiposAdmin')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16 11H8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16 15H8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3>Equipos Médicos</h3>
          <p>{{ stats.equipment }} registrados</p>
        </div>

        <!-- Testimonios -->
        <div class="action-card" @click="navigateTo('TestimoniosAdmin')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M8 12L10 14L16 8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3>Testimonios</h3>
          <p>{{ stats.testimonials }} pendientes</p>
        </div>

        <!-- Productos -->
        <div class="action-card" @click="navigateTo('ProductosAdmin')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16 11H8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16 15H8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3>Productos</h3>
          <p>{{ stats.products }} activos</p>
        </div>

        <!-- Configuración -->
        <div class="action-card" @click="navigateTo('ConfiguracionAdmin')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3>Configuración</h3>
          <p>{{ stats.configs }} parámetros</p>
        </div>
      </section>

      <!-- Sección de estadísticas y gráficas -->
      <section class="stats-section">
        <h2>Resumen General</h2>

        <!-- Gráficas principales -->
        <div class="charts-grid">
          <div class="chart-card">
            <h3>Citas por Estado</h3>
            <canvas ref="citasChart" height="200"></canvas>
          </div>

          <div class="chart-card">
            <h3>Distribución de Usuarios</h3>
            <canvas ref="usuariosChart" height="200"></canvas>
          </div>

          <div class="chart-card">
            <h3>Citas - Últimos 7 días</h3>
            <canvas ref="tendenciaChart" height="200"></canvas>
          </div>
        </div>

        <!-- Métricas clave -->
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">{{ stats.totalUsers }}</span>
            <span class="stat-label">Usuarios totales</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.activeAppointments }}</span>
            <span class="stat-label">Citas activas</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.activeVeterinarians }}</span>
            <span class="stat-label">Veterinarios activos</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.activeProducts }}</span>
            <span class="stat-label">Productos activos</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- Refs principales ---
const adminName = ref('')
const stats = ref({
  users: 0,
  appointments: 0,
  veterinarians: 0,
  services: 0,
  equipment: 0,
  testimonials: 0,
  configs: 0,
  products: 0,
  sales: 0,
  totalUsers: 0,
  activeAppointments: 0,
  activeVeterinarians: 0,
  activeServices: 0,
  activeProducts: 0
  // contactMessages y unreadMessages eliminados
})

// --- Obtener datos del admin ---
const fetchAdminData = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: userData, error } = await supabase
    .from('usuarios')
    .select('nombre_completo')
    .eq('id', user.id)
    .single()

  if (!error && userData) {
    adminName.value = userData.nombre_completo.split(' ')[0] || 'Usuario'
  }
}

// --- Cargar estadísticas ---
const fetchStats = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const tables = [
    { name: 'usuarios', statKey: 'users', activeKey: 'totalUsers' },
    { name: 'citasmascotas', statKey: 'appointments', activeKey: 'activeAppointments', activeFilter: ['programada','confirmada'] },
    { name: 'veterinarios', statKey: 'veterinarians', activeKey: 'activeVeterinarians', isActiveCol: 'is_activo' },
    { name: 'servicios', statKey: 'services', activeKey: 'activeServices', isActiveCol: 'is_activo' },
    { name: 'equiposmedicos', statKey: 'equipment' },
    { name: 'testimonios', statKey: 'testimonials', activeFilterCol: 'publicado', activeFilterVal: false },
    { name: 'configuracionesistema', statKey: 'configs' },
    // { name: 'bitacoracitas', statKey: 'audits' }, // Eliminado
    { name: 'productos', statKey: 'products', activeKey: 'activeProducts', isActiveCol: 'is_activo' },
    { name: 'ventas', statKey: 'sales' }
    // { name: 'mensajescontacto', ... } // Eliminado
  ]

  for (let table of tables) {
    try {
      let query = supabase.from(table.name).select('*', { count: 'exact', head: true })

      if (table.activeFilter) query = query.in('estado', table.activeFilter)
      if (table.isActiveCol) query = query.eq(table.isActiveCol, table.isActiveVal !== undefined ? table.isActiveVal : true)
      if (table.activeFilterCol) query = query.eq(table.activeFilterCol, table.activeFilterVal)

      const { count, error } = await query
      if (!error) {
        stats.value[table.statKey] = count || 0
        if (table.activeKey) stats.value[table.activeKey] = count || 0
      }
    } catch (err) {
      console.warn(`Error al cargar ${table.name}:`, err.message)
    }
  }
}

// --- Navegación rápida ---
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

// --- Chart.js ---
import {
  Chart,
  BarController,
  LineController,
  PieController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(
  BarController,
  LineController,
  PieController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
)

// --- Canvas y gráficas ---
const citasChart = ref(null)
const usuariosChart = ref(null)
const tendenciaChart = ref(null)

// --- Funciones para crear gráficas ---
const createCitasChart = (labels, data) => {
  if (citasChart.value._chartInstance) citasChart.value._chartInstance.destroy()
  const ctx = citasChart.value.getContext('2d')
  const numericData = data.map(d => Number(d) || 0)
  const maxData = Math.max(...numericData)
  const chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Número de Citas', data: numericData, backgroundColor: ['#3b82f6','#10b981','#8b5cf6','#ef4444','#f59e0b'], borderWidth: 1 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, suggestedMax: maxData + 2, ticks: { precision: 0 } } } }
  })
  citasChart.value._chartInstance = chart
}

const createUsuariosChart = (labels, data) => {
  if (usuariosChart.value._chartInstance) usuariosChart.value._chartInstance.destroy()
  const ctx = usuariosChart.value.getContext('2d')
  const numericData = data.map(d => Number(d) || 0)
  const chart = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data: numericData, backgroundColor: ['#3b82f6','#10b981','#8b5cf6'], borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  })
  usuariosChart.value._chartInstance = chart
}

const createTendenciaChart = (labels, data) => {
  if (tendenciaChart.value._chartInstance) tendenciaChart.value._chartInstance.destroy()
  const ctx = tendenciaChart.value.getContext('2d')
  const numericData = data.map(d => Number(d) || 0)
  const maxData = Math.max(...numericData)
  const chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Citas por día', data: numericData, borderColor: '#145a32', backgroundColor: 'rgba(20,90,50,0.1)', borderWidth: 2, fill: true, tension: 0.3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, suggestedMax: maxData + 2, ticks: { precision: 0 } } } }
  })
  tendenciaChart.value._chartInstance = chart
}

// --- Cargar datos de gráficas ---
const loadChartData = async () => {
  try {
    // Citas por estado
    const { data: citasPorEstado } = await supabase.from('citasmascotas').select('estado')
    if (citasPorEstado) {
      const estados = ['programada','confirmada','completada','cancelada','no_asistio']
      const counts = estados.map(e => citasPorEstado.filter(c => c.estado === e).length)
      createCitasChart(estados, counts)
    }

    // Distribución de usuarios por rol
    const { data: usuariosPorRol } = await supabase.from('usuarios').select('rol')
    if (usuariosPorRol) {
      const roles = ['cliente','veterinario','admin']
      const counts = roles.map(r => usuariosPorRol.filter(u => u.rol === r).length)
      createUsuariosChart(roles, counts)
    }

    // Tendencia últimos 7 días
    const today = new Date()
    const dates = []
    const dateCounts = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
      dateCounts.push(0)
    }

    const { data: citasTendencia } = await supabase
      .from('citasmascotas')
      .select('fecha')
      .gte('fecha', dates[0])
      .lte('fecha', dates[6])

    if (citasTendencia) {
      citasTendencia.forEach(cita => {
        const index = dates.indexOf(cita.fecha)
        if (index !== -1) dateCounts[index]++
      })
    }

    createTendenciaChart(dates.map(d => new Date(d).toLocaleDateString('es-ES', { weekday:'short', day:'numeric' })), dateCounts)
  } catch (error) {
    console.error('Error cargando datos de gráficas:', error)
  }
}

// --- Mounted / Unmounted ---
onMounted(async () => {
  await fetchAdminData()
  await fetchStats()
  await loadChartData()
})

onUnmounted(() => {
  if (citasChart.value?._chartInstance) citasChart.value._chartInstance.destroy()
  if (usuariosChart.value?._chartInstance) usuariosChart.value._chartInstance.destroy()
  if (tendenciaChart.value?._chartInstance) tendenciaChart.value._chartInstance.destroy()
})
</script>

<style scoped>
/* Contenedor principal del dashboard */
.dashboard-admin-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc; /* Fondo claro */
}

/* Contenido principal */
.dashboard-main {
  flex: 1;
  padding: 2.5rem 3rem;
  overflow-y: auto;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
}

@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 0;
    padding: 1.5rem;
  }
}

/* Sección de bienvenida */
.welcome-section {
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.welcome-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}

.welcome-section p {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
}

/* Grid para tarjetas rápidas */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.75rem;
  margin-bottom: 3.5rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  border: 1px solid #e2e8f0;
}

.action-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  border-color: #145a32;
}

.action-card h3 {
  margin: 1rem 0 0.5rem;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.action-card p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.icon-container {
  width: 64px;
  height: 64px;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  transition: background-color 0.3s ease;
}

.action-card:hover .icon-container {
  background: #d1fae5;
}

/* Sección de estadísticas */
.stats-section {
  margin-bottom: 3.5rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stats-section h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.75rem;
  text-align: left;
}

/* Grid de estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.75rem;
  text-align: center;
}

.stat-item {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}

.stat-number {
  display: block;
  font-size: 2.25rem;
  font-weight: 700;
  color: #145a32;
  margin-bottom: 0.75rem;
}

.stat-label {
  font-size: 1rem;
  color: #64748b;
}

/* Grid para gráficas */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.75rem;
  margin-bottom: 2.5rem;
}

.chart-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-card h3 {
  font-size: 1.2rem;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: center;
}

/* Canvas para gráficas */
.chart-card canvas {
  flex-grow: 1;
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 768px) {
  .chart-card {
    height: 280px;
    padding: 1rem;
  }
}
</style>