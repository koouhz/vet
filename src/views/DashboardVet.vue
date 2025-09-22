<template>
  <div class="dashboard-vet-container">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Contenido principal -->
    <main class="dashboard-main">
      <section class="welcome-section">
        <h1>Panel de Veterinario</h1>
        <p>Bienvenido, <strong>{{ vetName }}</strong>. Gestiona tus citas, pacientes y servicios desde aquí.</p>
      </section>

      <!-- Acciones rápidas para veterinarios -->
      <section class="quick-actions">
        <!-- Citas de Hoy -->
        <div class="action-card" @click="navigateTo('/citas?hoy=true')">
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
        <div class="action-card" @click="navigateTo('/mascotas?mis=true')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8C13.1046 8 14 7.10457 14 6C14 4.89543 13.1046 4 12 4C10.8954 4 10 4.89543 10 6C10 7.10457 10.8954 8 12 8Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18 10C19.1046 10 20 9.10457 20 8C20 6.89543 19.1046 6 18 6C16.8954 6 16 6.89543 16 8C16 9.10457 16.8954 10 18 10Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 10C7.10457 10 8 9.10457 8 8C8 6.89543 7.10457 6 6 6C4.89543 6 4 6.89543 4 8C4 9.10457 4.89543 10 6 10Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 14C15.866 14 19 11.866 19 8H5C5 11.866 8.13401 14 12 14Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 20H21V18C21 15.2386 17.4183 13 12 13C6.58172 13 3 15.2386 3 18V20Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Mis Mascotas</h3>
          <p>{{ stats.myPets }} atendidas</p>
        </div>

        <!-- Servicios que Ofrezco -->
        <div class="action-card" @click="navigateTo('/servicios?mis=true')">
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

        <!-- Horario Disponible -->
        <div class="action-card" @click="navigateTo('/horario')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#145A32" stroke-width="2"/>
              <path d="M12 6V12L16 14" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Mi Horario</h3>
          <p>Ver disponibilidad</p>
        </div>

        <!-- Citas Completadas -->
        <div class="action-card" @click="navigateTo('/citas?estado=completada')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12L10 14L16 8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Citas Completadas</h3>
          <p>{{ stats.completedAppointments }} este mes</p>
        </div>

        <!-- Emergencias -->
        <div class="action-card emergency" @click="navigateTo('/citas?categoria=emergencia')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V16" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12H16" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Emergencias</h3>
          <p>{{ stats.emergencies }} este mes</p>
        </div>

        <!-- Notas Clínicas -->
        <div class="action-card" @click="navigateTo('/mascotas?notas=true')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 20H20V4H4V20Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 8H15" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 12H15" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 16H13" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Notas Clínicas</h3>
          <p>Ver en mascotas</p>
        </div>

        <!-- Próximas Citas -->
        <div class="action-card" @click="navigateTo('/citas?proximas=true')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#145A32" stroke-width="2"/>
            </svg>
          </div>
          <h3>Próximas 3h</h3>
          <p>{{ stats.upcoming }} próximas</p>
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
            <span class="stat-number">{{ stats.myPets }}</span>
            <span class="stat-label">Mascotas atendidas</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.emergencies }}</span>
            <span class="stat-label">Emergencias este mes</span>
          </div>
        </div>
      </section>

      <!-- Próximas Citas -->
      <section class="upcoming-section">
        <h2>Próximas Citas (Próximas 3 horas)</h2>
        <div v-if="upcomingAppointments.length === 0" class="no-data">
          No hay citas programadas en las próximas horas.
        </div>
        <div v-else class="appointments-list">
          <div v-for="cita in upcomingAppointments" :key="cita.id" class="appointment-card">
            <div class="appointment-header">
              <span class="time">{{ formatTime(cita.hora) }}</span>
              <span class="status" :class="cita.estado">{{ cita.estado }}</span>
            </div>
            <div class="appointment-body">
              <h4>{{ cita.mascota_nombre }} ({{ cita.especie }})</h4>
              <p><strong>Dueño:</strong> {{ cita.usuario_nombre }}</p>
              <p><strong>Servicio:</strong> {{ cita.servicio_titulo }}</p>
              <p v-if="cita.observaciones"><strong>Notas:</strong> {{ cita.observaciones }}</p>
            </div>
            <div class="appointment-footer">
              <button @click="openCita(cita.id)" class="btn-primary">Ver Detalles</button>
            </div>
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
  myPets: 0,
  myServices: 0,
  completedAppointments: 0,
  emergencies: 0,
  completedToday: 0,
  upcoming: 0,
})

const upcomingAppointments = ref([])

// Obtener datos del veterinario logueado
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

// Cargar estadísticas y citas del día
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

  // === Citas de hoy ===
  const today = new Date().toISOString().split('T')[0]
  const { data: todayCitas, error: citasError } = await supabase
    .from('citasmascotas')
    .select(`
      id,
      fecha,
      hora,
      estado,
      observaciones,
      servicio_id,
      mascota_id,
      usuario_id,
      servicios(titulo, categoria),
      mascotas(nombre, especie),
      usuarios(nombre_completo)
    `)
    .eq('veterinario_id', vetId)
    .eq('fecha', today)
    .order('hora', { ascending: true })

  if (citasError) {
    console.warn('Error al cargar citas:', citasError.message)
  } else {
    const citas = todayCitas || []
    stats.value.todayAppointments = citas.filter(c => c.estado === 'programada' || c.estado === 'confirmada').length
    stats.value.completedToday = citas.filter(c => c.estado === 'completada').length

    // Filtrar próximas 3 horas
    const now = new Date()
    const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000)
    upcomingAppointments.value = citas
      .filter(c => {
        const citaTime = new Date(`${c.fecha}T${c.hora}`)
        return citaTime >= now && citaTime <= threeHoursLater
      })
      .map(c => ({
        ...c,
        mascota_nombre: c.mascotas?.nombre || 'N/A',
        especie: c.mascotas?.especie || 'N/A',
        usuario_nombre: c.usuarios?.nombre_completo || 'N/A',
        servicio_titulo: c.servicios?.titulo || 'N/A',
      }))
    stats.value.upcoming = upcomingAppointments.value.length
  }

  // === Mascotas atendidas (únicas) ===
  const { data: mascotasData, error: mascotasError } = await supabase
    .from('citasmascotas')
    .select('mascota_id')
    .eq('veterinario_id', vetId)
    .not('mascota_id', 'is', null)

  if (!mascotasError && mascotasData) {
    const uniqueMascotas = [...new Set(mascotasData.map(m => m.mascota_id))]
    stats.value.myPets = uniqueMascotas.length
  }

  // === Mis Servicios Activos ===
  const { data: myServices, error: servicesError } = await supabase
    .from('servicios_veterinarios')
    .select('servicio_id')
    .eq('veterinario_id', vetId)
    .eq('is_activo', true)

  if (!servicesError && myServices) {
    stats.value.myServices = myServices.length
  }

  // === Citas completadas este mes ===
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const { data: completedThisMonth, error: completedError } = await supabase
    .from('citasmascotas')
    .select('id')
    .eq('veterinario_id', vetId)
    .gte('fecha', startOfMonth)
    .eq('estado', 'completada')

  if (!completedError) {
    stats.value.completedAppointments = completedThisMonth?.length || 0
  }

  // === Emergencias este mes ===
  const { data: emergenciesThisMonth, error: emergenciesError } = await supabase
    .from('citasmascotas')
    .select('id')
    .eq('veterinario_id', vetId)
    .gte('fecha', startOfMonth)
    .contains('servicios.categoria', 'emergencia')

  if (!emergenciesError) {
    stats.value.emergencies = emergenciesThisMonth?.length || 0
  }
}

// Formatear hora
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  return `${hours}:${minutes}`
}

// Abrir cita
const openCita = (citaId) => {
  router.push(`/citas/${citaId}`)
}

onMounted(async () => {
  await fetchVetData()
  await fetchStats()
})

// Navegación rápida
const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.dashboard-vet-container {
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
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.action-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #145a32;
}

.action-card.emergency {
  border-color: #dc2626;
}

.action-card.emergency:hover {
  border-color: #b91c1c;
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

.action-card.emergency .icon-container {
  background: #fee2e2;
}

.action-card.emergency:hover .icon-container {
  background: #fecaca;
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
  transition: transform 0.3s ease;
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

.upcoming-section {
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.upcoming-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.no-data {
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 2rem;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  background: #fff;
  transition: box-shadow 0.3s ease;
}

.appointment-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.time {
  font-weight: 700;
  font-size: 1.25rem;
  color: #1e293b;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status.programada { background: #e0f2fe; color: #0369a1; }
.status.confirmada { background: #dcfce7; color: #166534; }
.status.completada { background: #f3e8ff; color: #7e22ce; }
.status.cancelada { background: #fee2e2; color: #dc2626; }
.status.no_asistio { background: #fef3c7; color: #d97706; }

.appointment-body h4 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1.125rem;
}

.appointment-body p {
  margin: 0.25rem 0;
  color: #475569;
  font-size: 0.95rem;
}

.appointment-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: #145a32;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #0f4c28;
}
</style>
