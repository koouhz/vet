<template>
  <div class="dashboard-admin-container">
    <AppSidebar />

    <main class="dashboard-main">
      <!-- Sección de bienvenida -->
      <section class="welcome-section">
        <h1>Panel de Veterinario</h1>
        <p>Bienvenido, <strong>{{ vetName }}</strong>. Gestiona tus citas, pacientes y servicios desde aquí.</p>
      </section>

      <!-- Tarjetas de gestión rápida -->
      <section class="quick-actions">
        <!-- Citas de Hoy -->
        <div class="action-card" @click="navigateTo('MisCitas')">
          <div class="icon-container">
            <!-- Icono -->
          </div>
          <h3>Citas de Hoy</h3>
          <p>{{ stats.todayAppointments }} programadas</p>
        </div>

        <!-- Mis Mascotas -->
        <div class="action-card" @click="navigateTo('MisMascotas')">
          <div class="icon-container"></div>
          <h3>Mis Mascotas</h3>
          <p>{{ stats.myPetsToday }} atendidas hoy</p>
        </div>

        <!-- Mis Servicios -->
        <div class="action-card" @click="navigateTo('MisServicios')">
          <div class="icon-container"></div>
          <h3>Mis Servicios</h3>
          <p>{{ stats.myServices }} activos</p>
        </div>

        <!-- Mi Horario -->
        <div class="action-card" @click="navigateTo('MisHorarios')">
          <div class="icon-container"></div>
          <h3>Mi Horario</h3>
          <p>Ver disponibilidad</p>
        </div>

        <!-- Bitácora Personal -->
        <div class="action-card" @click="navigateTo('BitacoraCitasVet')">
          <div class="icon-container"></div>
          <h3>Bitácora</h3>
          <p>{{ stats.myAudits }} acciones hoy</p>
        </div>
      </section>

      <!-- Sección de estadísticas rápidas -->
      <section class="stats-section">
        <h2>Resumen Clínico - Hoy</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">{{ stats.todayAppointments }}</span>
            <span class="stat-label">Citas programadas</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.completedToday }}</span>
            <span class="stat-label">Citas completadas</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.myPetsToday }}</span>
            <span class="stat-label">Mascotas atendidas</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.emergenciesToday }}</span>
            <span class="stat-label">Emergencias hoy</span>
          </div>
        </div>
      </section>

      <!-- Sección de gráficas -->
      <section class="stats-section">
        <h2>Estadísticas Veterinario</h2>

        <!-- Gráfico 1: Citas últimos 7 días -->
        <div class="chart-container">
          <canvas id="chartCitas7Dias"></canvas>
        </div>

        <!-- Gráfico 2: Mascotas atendidas últimos 7 días -->
        <div class="chart-container">
          <canvas id="chartMascotas7Dias"></canvas>
        </div>

        <!-- Gráfico 3: Servicios activos y emergencias -->
        <div class="chart-container">
          <canvas id="chartServiciosEmergencias"></canvas>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layouts/AppSidebar.vue'
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

// --- Registro de Chart.js ---
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

// --- Router ---
const router = useRouter()

// --- Datos principales ---
const vetName = ref('')
const stats = ref({
  todayAppointments: 0,
  completedToday: 0,
  myPetsToday: 0,
  emergenciesToday: 0,
  myServices: 0,
  myAudits: 0,
  equipment: 0,
  myTestimonials: 0
})

// --- Referencias de canvas para las gráficas ---
const citasChart = ref(null)
const usuariosChart = ref(null)
const tendenciaChart = ref(null)

// --- Función de navegación rápida ---
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

// --- Obtener datos del veterinario logueado ---
const fetchVetData = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: userData, error } = await supabase
    .from('usuarios')
    .select('nombre_completo')
    .eq('id', user.id)
    .single()

  if (!error && userData) {
    vetName.value = userData.nombre_completo.split(' ')[0]
  }
}

// --- Cargar estadísticas del veterinario ---
const fetchStats = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Obtener ID del veterinario
  const { data: vetData, error: vetError } = await supabase
    .from('veterinarios')
    .select('id')
    .eq('usuario_id', user.id)
    .single()

  if (vetError || !vetData) return
  const vetId = vetData.id
  const today = new Date().toISOString().split('T')[0]

  // --- Citas de hoy ---
  const { data: todayCitas } = await supabase
    .from('citasmascotas')
    .select('id, estado, mascota_id, servicios!inner(categoria)')
    .eq('veterinario_id', vetId)
    .eq('fecha', today)

  if (todayCitas) {
    stats.value.todayAppointments = todayCitas.filter(c => ['programada','confirmada'].includes(c.estado)).length
    stats.value.completedToday = todayCitas.filter(c => c.estado === 'completada').length
    stats.value.emergenciesToday = todayCitas.filter(c => c.servicios?.categoria === 'emergencia').length
    stats.value.myPetsToday = [...new Set(todayCitas.map(c => c.mascota_id))].length
  }

  // --- Mis Servicios Activos ---
  const { count: myServicesCount } = await supabase
    .from('servicios_veterinarios')
    .select('*', { count: 'exact', head: true })
    .eq('veterinario_id', vetId)
    .eq('is_activo', true)
  stats.value.myServices = myServicesCount || 0

  // --- Bitácora personal ---
  const { count: auditsCount } = await supabase
    .from('bitacoracitas')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', user.id)
    .gte('creado_en', `${today}T00:00:00`)
    .lte('creado_en', `${today}T23:59:59`)
  stats.value.myAudits = auditsCount || 0

  // --- Equipos médicos totales ---
  const { count: equiposCount } = await supabase
    .from('equiposmedicos')
    .select('*', { count: 'exact', head: true })
  stats.value.equipment = equiposCount || 0

  // --- Mis testimonios ---
  const { count: testCount } = await supabase
    .from('testimonios')
    .select('*', { count: 'exact', head: true })
    .eq('veterinario_id', vetId)
  stats.value.myTestimonials = testCount || 0
}

// --- Funciones para crear gráficas ---
const createCitasChart = (labels, data) => {
  if (citasChart.value._chartInstance) citasChart.value._chartInstance.destroy()
  const ctx = citasChart.value.getContext('2d')
  const chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Citas Hoy', data, backgroundColor: ['#3b82f6','#10b981','#8b5cf6','#ef4444','#f59e0b'] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  })
  citasChart.value._chartInstance = chart
}

const createUsuariosChart = (labels, data) => {
  if (usuariosChart.value._chartInstance) usuariosChart.value._chartInstance.destroy()
  const ctx = usuariosChart.value.getContext('2d')
  const chart = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: ['#3b82f6','#10b981','#8b5cf6'] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  })
  usuariosChart.value._chartInstance = chart
}

const createTendenciaChart = (labels, data) => {
  if (tendenciaChart.value._chartInstance) tendenciaChart.value._chartInstance.destroy()
  const ctx = tendenciaChart.value.getContext('2d')
  const chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Citas últimos 7 días', data, borderColor: '#145a32', backgroundColor: 'rgba(20,90,50,0.1)', fill: true, tension: 0.3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  })
  tendenciaChart.value._chartInstance = chart
}

// --- Cargar datos de gráficas ---
const loadChartData = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: vetData } = await supabase
    .from('veterinarios')
    .select('id')
    .eq('usuario_id', user.id)
    .single()
  if (!vetData) return
  const vetId = vetData.id

  // --- Citas por estado ---
  const { data: citas } = await supabase.from('citasmascotas').select('estado').eq('veterinario_id', vetId)
  if (citas) {
    const estados = ['programada','confirmada','completada','cancelada','no_asistio']
    const counts = estados.map(e => citas.filter(c => c.estado === e).length)
    createCitasChart(estados, counts)
  }

  // --- Distribución de clientes (solo mascotas atendidas por este vet) ---
  const { data: mascotas } = await supabase.from('citasmascotas').select('mascota_id').eq('veterinario_id', vetId)
  if (mascotas) {
    const uniqueClients = [...new Set(mascotas.map(m => m.mascota_id))].length
    createUsuariosChart(['Clientes únicos'], [uniqueClients])
  }

  // --- Tendencia últimos 7 días ---
  const today = new Date()
  const dates = []
  const dateCounts = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().split('T')[0]
    dates.push(iso)
    dateCounts.push(0)
  }

  const { data: citas7 } = await supabase
    .from('citasmascotas')
    .select('fecha')
    .eq('veterinario_id', vetId)
    .gte('fecha', dates[0])
    .lte('fecha', dates[6])

  if (citas7) {
    citas7.forEach(c => {
      const idx = dates.indexOf(c.fecha)
      if (idx !== -1) dateCounts[idx]++
    })
  }

  const labels = dates.map(d => new Date(d).toLocaleDateString('es-ES', { weekday:'short', day:'numeric' }))
  createTendenciaChart(labels, dateCounts)
}

// --- Mounted / Unmounted ---
onMounted(async () => {
  await fetchVetData()
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
.dashboard-admin-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

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

/* Estilo para gráficas (canvas) */
.chart-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 2.5rem;
  height: 320px; /* Altura fija para cada gráfico */
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Responsive charts */
@media (max-width: 768px) {
  .chart-container {
    height: 280px;
    padding: 1rem;
  }
}
</style>
