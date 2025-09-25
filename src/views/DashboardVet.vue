<template>
  <div class="dashboard-admin-container">
    <AppSidebar />

    <main class="dashboard-main">
      <section class="welcome-section">
        <h1>Panel de Veterinario</h1>
        <p>Bienvenido, <strong>{{ vetName }}</strong>. Gestiona tus citas, pacientes y servicios desde aquí.</p>
      </section>

      <!-- Tarjetas de gestión rápida -->
      <section class="quick-actions">
        <!-- Citas de Hoy -->
        <div class="action-card" @click="navigateTo('MisCitasVet')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V5" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 2V5" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 9H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 15H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 21H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Citas de Hoy</h3>
          <p>{{ stats.todayAppointments }} programadas</p>
        </div>

        <!-- Mis Mascotas -->
        <div class="action-card" @click="navigateTo('MisMascotasVet')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8.5 14.5L10 16L15.5 10.5" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Mis Mascotas</h3>
          <p>{{ stats.myPetsToday }} atendidas hoy</p>
        </div>

        <!-- Mis Servicios -->
        <div class="action-card" @click="navigateTo('MisServiciosVet')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12H16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Mis Servicios</h3>
          <p>{{ stats.myServices }} activos</p>
        </div>

        <!-- Mi Horario -->
        <div class="action-card" @click="navigateTo('MisHorariosVet')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Mi Horario</h3>
          <p>Ver disponibilidad</p>
        </div>

        <!-- Bitácora Personal -->
        <div class="action-card" @click="navigateTo('BitacoraCitasVet')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Bitácora</h3>
          <p>{{ stats.myAudits }} acciones hoy</p>
        </div>

        <!-- Equipos Médicos -->
        <div class="action-card" @click="navigateTo('EquiposMedicosVet')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 11H8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 15H8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Equipos Médicos</h3>
          <p>{{ stats.equipment }} registrados</p>
        </div>

        <!-- Testimonios (solo los suyos) -->
        <div class="action-card" @click="navigateTo('TestimoniosVet')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12L10 14L16 8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Testimonios</h3>
          <p>{{ stats.myTestimonials }} recibidos</p>
        </div>

        <!-- Productos (acceso a catálogo) -->
        <div class="action-card" @click="navigateTo('ProductosVet')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 11H8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 15H8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Productos</h3>
          <p>Ver catálogo</p>
        </div>
      </section>

      <!-- Estadísticas Clínicas -->
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
  todayAppointments: 0,
  myPetsToday: 0,
  myServices: 0,
  completedToday: 0,
  emergenciesToday: 0,
  myAudits: 0,
  equipment: 0,
  myTestimonials: 0,
})

// Obtener nombre del veterinario logueado
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

// Cargar todas las estadísticas desde la BD
const fetchStats = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Obtener ID del veterinario
  const { data: vetData, error: vetError } = await supabase
    .from('veterinarios')
    .select('id')
    .eq('usuario_id', user.id)
    .single()

  if (vetError || !vetData) {
    console.warn('No se encontró perfil de veterinario')
    return
  }

  const vetId = vetData.id
  const today = new Date().toISOString().split('T')[0]

  // === Citas de hoy ===
  const { data: todayCitas, error: citasError } = await supabase
    .from('citasmascotas')
    .select(`
      id,
      estado,
      mascota_id,
      servicio_id,
      servicios!inner(categoria)
    `)
    .eq('veterinario_id', vetId)
    .eq('fecha', today)

  if (!citasError && todayCitas) {
    stats.value.todayAppointments = todayCitas.filter(c => ['programada', 'confirmada'].includes(c.estado)).length
    stats.value.completedToday = todayCitas.filter(c => c.estado === 'completada').length
    stats.value.emergenciesToday = todayCitas.filter(c => c.servicios?.categoria === 'emergencia').length

    const uniqueMascotas = [...new Set(todayCitas.map(c => c.mascota_id))]
    stats.value.myPetsToday = uniqueMascotas.length
  }

  // === Mis Servicios Activos ===
  const { count: myServicesCount, error: servicesError } = await supabase
    .from('servicios_veterinarios')
    .select('*', { count: 'exact', head: true })
    .eq('veterinario_id', vetId)
    .eq('is_activo', true)

  stats.value.myServices = myServicesCount || 0

  // === Bitácora personal del día ===
  const { count: auditsCount, error: auditError } = await supabase
    .from('bitacoracitas')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', user.id)
    .gte('creado_en', `${today}T00:00:00`)
    .lte('creado_en', `${today}T23:59:59`)

  stats.value.myAudits = auditsCount || 0

  // === Equipos médicos (totales, como en admin) ===
  const { count: equiposCount, error: eqError } = await supabase
    .from('equiposmedicos')
    .select('*', { count: 'exact', head: true })

  stats.value.equipment = equiposCount || 0

  // === Mis Testimonios ===
  const { count: testCount, error: testError } = await supabase
    .from('testimonios')
    .select('*', { count: 'exact', head: true })
    .eq('veterinario_id', vetId) // Asumiendo que en tu app los testimonios se vinculan al veterinario

  // Si tu tabla `testimonios` NO tiene `veterinario_id`, comenta la línea anterior y usa esta:
  // .eq('usuario_id', user.id) // si el testimonio es del propio veterinario como cliente (poco probable)

  stats.value.myTestimonials = testCount || 0
}

onMounted(async () => {
  await fetchVetData()
  await fetchStats()
})

// Navegación rápida por nombre de ruta
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}
</script>

<!-- Estilos idénticos al Dashboard Admin -->
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.welcome-section h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
}

.welcome-section p {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
}

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  border: 1px solid #e2e8f0;
}

.action-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
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

.stats-section {
  margin-bottom: 3.5rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
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
</style>
