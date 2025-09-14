<template>
  <div class="dashboard-admin-container">
    <AppSidebar />

    <main class="dashboard-main">
      <section class="welcome-section">
        <h1>Panel de Administración</h1>
        <p>Bienvenido, <strong>{{ adminName }}</strong>. Gestiona todo el sistema desde aquí.</p>
      </section>

      <!-- Tarjetas de gestión rápida -->
      <section class="quick-actions">
        <!-- Usuarios -->
        <div class="action-card" @click="navigateTo('/usuarios')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20 21C20 19.3431 18.6569 18 17 18H7C5.34315 18 4 19.3431 4 21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Usuarios</h3>
          <p>{{ stats.users }} totales</p>
        </div>

        <!-- Citas -->
        <div class="action-card" @click="navigateTo('/citas')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V5" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 2V5" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 9H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 15H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 21H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Citas</h3>
          <p>{{ stats.appointments }} totales</p>
        </div>

        <!-- Veterinarios -->
        <div class="action-card" @click="navigateTo('/veterinarios')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12H16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Veterinarios</h3>
          <p>{{ stats.veterinarians }} activos</p>
        </div>

        <!-- Servicios -->
        <div class="action-card" @click="navigateTo('/servicios')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12H16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Servicios</h3>
          <p>{{ stats.services }} activos</p>
        </div>

        <!-- Equipos Médicos -->
        <div class="action-card" @click="navigateTo('/equipos')">
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

        <!-- Testimonios -->
        <div class="action-card" @click="navigateTo('/testimonios')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12L10 14L16 8" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Testimonios</h3>
          <p>{{ stats.testimonials }} pendientes</p>
        </div>

        <!-- Configuración -->
        <div class="action-card" @click="navigateTo('/configuracion')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19.4 15C19.9523 15.6152 20.2845 16.3455 20.3452 17.1C20.4059 17.8545 20.1925 18.5889 19.7462 19.1991C19.2999 19.8093 18.655 20.2509 17.9366 20.4277C17.2182 20.6046 16.4693 20.5014 15.8 20.14C14.2874 19.3326 13.1573 18.0549 12.6293 16.5C12.1013 14.9451 12.2162 13.269 12.9482 11.85C13.6802 10.431 14.9533 9.39837 16.4 9C17.8467 8.60163 19.4425 8.65789 20.8 9.14C22.1575 9.62211 23.1595 10.5076 23.54 11.6C23.9205 12.6924 23.656 13.874 22.84 14.8C22.024 15.726 20.7753 16.2496 19.4 15Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4.6 15C5.15231 15.6152 5.48448 16.3455 5.54518 17.1C5.60588 17.8545 5.39252 18.5889 4.94618 19.1991C4.49984 19.8093 3.85494 20.2509 3.13656 20.4277C2.41819 20.6046 1.66932 20.5014 1 20.14C-0.51264 19.3326 -1.64268 18.0549 -2.17066 16.5C-2.69864 14.9451 -2.58378 13.269 -1.85178 11.85C-1.11979 10.431 0.153339 9.39837 1.6 9C3.04666 8.60163 4.64249 8.65789 6 9.14C7.35751 9.62211 8.35952 10.5076 8.74 11.6C9.12048 12.6924 8.85599 13.874 8.04 14.8C7.224 15.726 5.97527 16.2496 4.6 15Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Configuración</h3>
          <p>{{ stats.configs }} parámetros</p>
        </div>

        <!-- Bitácora -->
        <div class="action-card" @click="navigateTo('/bitacora')">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Bitácora</h3>
          <p>{{ stats.audits }} registros</p>
        </div>
      </section>

      <!-- Estadísticas Generales -->
      <section class="stats-section">
        <h2>Resumen General</h2>
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
            <span class="stat-number">{{ stats.activeServices }}</span>
            <span class="stat-label">Servicios activos</span>
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
const adminName = ref('')
const stats = ref({
  users: 0,
  appointments: 0,
  veterinarians: 0,
  services: 0,
  equipment: 0,
  testimonials: 0,
  configs: 0,
  audits: 0,
  totalUsers: 0,
  activeAppointments: 0,
  activeVeterinarians: 0,
  activeServices: 0,
})

// Obtener nombre del admin logueado
const fetchAdminData = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: userData, error } = await supabase
    .from('usuarios')
    .select('nombre_completo')
    .eq('id', user.id)
    .single()

  if (!error && userData) {
    adminName.value = userData.nombre_completo.split(' ')[0]
  }
}

// Cargar todas las estadísticas desde la BD
const fetchStats = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Usuarios (todos excepto admins)
  const { data: users, error: usersError } = await supabase
    .from('usuarios')
    .select('id')
    .neq('rol', 'admin')
  if (usersError) console.warn('Error al cargar usuarios:', usersError.message)
  stats.value.users = users?.length || 0
  stats.value.totalUsers = users?.length || 0

  // Citas (todas)
  const { data: citas, error: citasError } = await supabase
    .from('citasmascotas')
    .select('id')
  if (citasError) console.warn('Error al cargar citas:', citasError.message)
  stats.value.appointments = citas?.length || 0

  // Veterinarios activos
  const { data: vets, error: vetsError } = await supabase
    .from('veterinarios')
    .select('id')
    .eq('is_activo', true)
  if (vetsError) console.warn('Error al cargar veterinarios:', vetsError.message)
  stats.value.veterinarians = vets?.length || 0
  stats.value.activeVeterinarians = vets?.length || 0

  // Servicios activos
  const { data: servicios, error: servError } = await supabase
    .from('servicios')
    .select('id')
    .eq('is_activo', true)
  if (servError) console.warn('Error al cargar servicios:', servError.message)
  stats.value.services = servicios?.length || 0
  stats.value.activeServices = servicios?.length || 0

  // Equipos médicos
  const { data: equipos, error: eqError } = await supabase
    .from('equiposmedicos')
    .select('id')
  if (eqError) console.warn('Error al cargar equipos:', eqError.message)
  stats.value.equipment = equipos?.length || 0

  // Testimonios pendientes
  const { data: testimonios, error: testError } = await supabase
    .from('testimonios')
    .select('id')
    .eq('publicado', false)
  if (testError) console.warn('Error al cargar testimonios:', testError.message)
  stats.value.testimonials = testimonios?.length || 0

  // Configuraciones del sistema
  const { data: configs, error: configError } = await supabase
    .from('configuracionesistema')
    .select('clave')
  if (configError) console.warn('Error al cargar configuraciones:', configError.message)
  stats.value.configs = configs?.length || 0

  // Bitácora de acciones
  const { data: audits, error: auditError } = await supabase
    .from('bitacoracitas')
    .select('id')
  if (auditError) console.warn('Error al cargar bitácora:', auditError.message)
  stats.value.audits = audits?.length || 0

  // Citas activas
  const { data: citasActivas, error: citasActError } = await supabase
    .from('citasmascotas')
    .select('id')
    .in('estado', ['programada', 'confirmada', 'completada'])
  if (citasActError) console.warn('Error al cargar citas activas:', citasActError.message)
  stats.value.activeAppointments = citasActivas?.length || 0
}

onMounted(async () => {
  await fetchAdminData()
  await fetchStats()
})

// Navegación rápida
const navigateTo = (path) => {
  router.push(path)
}
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

/* Responsive: Ajustar para móvil */
@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 0;
    padding: 1.5rem;
  }
}

/* Welcome Section */
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

/* Quick Actions */
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

/* Stats Section */
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
