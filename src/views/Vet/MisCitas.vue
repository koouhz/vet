<template>
  <div class="mis-citas-container">
    <div class="header-section">
      <h1>📅 Mis Citas</h1>
      <div class="filters">
        <select v-model="filtroEstado" @change="filtrarCitas">
          <option value="todas">Todas</option>
          <option value="programada">Programadas</option>
          <option value="confirmada">Confirmadas</option>
          <option value="completada">Completadas</option>
          <option value="cancelada">Canceladas</option>
          <option value="no_asistio">No asistió</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando tus citas...</p>
    </div>

    <div v-else-if="error" class="error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="error-icon">
        <circle cx="12" cy="12" r="10" stroke="#dc2626" stroke-width="2"/>
        <path d="M15 9L9 15" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
        <path d="M9 9L15 15" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p>⚠️ {{ error }}</p>
      <button @click="fetchCitas" class="btn-retry">Reintentar</button>
    </div>

    <div v-else-if="citasFiltradas.length === 0" class="no-citas">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="empty-icon">
        <path d="M8 2V5" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 2V5" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 9H21" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 15H21" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 21H21" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3>¡No hay citas {{ filtroEstado !== 'todas' ? filtroEstado : '' }}!</h3>
      <p>Agenda una nueva cita o cambia el filtro para ver otras.</p>
      <button @click="navigateTo('/dashboard-vet/citas/nueva')" class="btn-primary">
        ➕ Agendar Nueva Cita
      </button>
    </div>

    <div v-else class="citas-list">
      <div v-for="cita in citasFiltradas" :key="cita.id" class="cita-card" :class="cita.estado">
        <div class="cita-header">
          <h3>{{ cita.mascotas?.nombre || 'Sin nombre' }} 🐾</h3>
          <span class="estado-badge">{{ getEstadoLabel(cita.estado) }}</span>
        </div>
        <div class="cita-body">
          <p><strong>📅 Fecha y Hora:</strong> {{ formatDate(cita.fecha) }} - {{ formatTime(cita.hora) }}</p>
          <p><strong>📋 Servicio:</strong> {{ cita.servicios?.titulo || 'No especificado' }}</p>
          <p><strong>👤 Cliente:</strong> {{ cita.usuarios?.nombre_completo || 'No disponible' }}</p>
          <p v-if="cita.observaciones" class="observaciones">
            <strong>📝 Observaciones:</strong> {{ cita.observaciones }}
          </p>
        </div>
        <div class="cita-footer">
          <button @click="verDetalles(cita.id)" class="btn-ver">
            👁️ Ver Detalles
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const citas = ref([])
const loading = ref(true)
const error = ref('')
const filtroEstado = ref('todas')

// Obtener citas del veterinario
const fetchCitas = async () => {
  loading.value = true
  error.value = ''

  try {
    const {  authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      throw new Error('Usuario no autenticado')
    }

    const user = authData.user

    // Obtener ID del veterinario
    const {  vetData, error: vetError } = await supabase
      .from('veterinarios')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    if (vetError) {
      throw new Error('No se encontró tu perfil de veterinario')
    }

    // Obtener todas las citas
    const {  data, error: citasError } = await supabase
      .from('citasmascotas')
      .select(`
        id,
        fecha,
        hora,
        estado,
        observaciones,
        mascota_id,
        servicio_id,
        usuario_id,
        mascotas (nombre),
        servicios (titulo),
        usuarios (nombre_completo)
      `)
      .eq('veterinario_id', vetData.id)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: true })

    if (citasError) {
      throw new Error('Error al cargar citas')
    }

    citas.value = data || []
  } catch (err) {
    error.value = err.message || 'Error desconocido al cargar citas'
    console.error('[MisCitas] Error:', err)
  } finally {
    loading.value = false
  }
}

// Filtrar citas reactivamente
const citasFiltradas = computed(() => {
  if (filtroEstado.value === 'todas') return citas.value
  return citas.value.filter(cita => cita.estado === filtroEstado.value)
})

// Formatear fecha
const formatDate = (dateStr) => {
  if (!dateStr) return 'Fecha no disponible'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Formatear hora
const formatTime = (timeStr) => {
  if (!timeStr) return 'Hora no disponible'
  const [hours, minutes] = timeStr.split(':')
  return `${hours}:${minutes}`
}

// Etiquetas amigables para estados
const getEstadoLabel = (estado) => {
  const labels = {
    programada: 'Programada',
    confirmada: 'Confirmada',
    completada: 'Completada',
    cancelada: 'Cancelada',
    no_asistio: 'No Asistió'
  }
  return labels[estado] || estado
}

// Navegar a detalles
const verDetalles = (citaId) => {
  router.push(`/dashboard-vet/citas/${citaId}`)
}

// Navegar a otras rutas
const navigateTo = (path) => {
  router.push(path)
}

// Método redundante (computed ya lo hace), pero lo dejamos por si quieres lógica adicional
const filtrarCitas = () => {
  // Puedes agregar lógica extra aquí si lo necesitas
}

onMounted(() => {
  fetchCitas()
})
</script>

<style scoped>
.mis-citas-container {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
  margin-left: 240px; /* Para sidebar */
  transition: margin-left 0.3s ease;
}

/* Responsive para sidebar colapsado o móvil */
@media (max-width: 1024px) {
  .mis-citas-container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .mis-citas-container {
    padding: 1.5rem 1rem;
  }
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-section h1 {
  font-size: 2rem;
  color: #1e293b;
  margin: 0;
  font-weight: 700;
  line-height: 1.2;
}

.filters select {
  padding: 0.6rem 1.2rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.filters select:focus {
  outline: none;
  border-color: #145a32;
  box-shadow: 0 2px 6px rgba(20, 90, 50, 0.2);
}

.loading,
.error,
.no-citas {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin: 2rem auto;
  max-width: 600px;
}

.loading p,
.error p,
.no-citas p {
  font-size: 1.1rem;
  color: #64748b;
  margin: 1rem 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f4f6;
  border-top: 5px solid #145a32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  margin: 0 auto 1.5rem;
  display: block;
  color: #94a3b8;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.error-icon {
  margin-bottom: 1rem;
}

.error p {
  color: #dc2626;
  font-weight: 600;
  font-size: 1.2rem;
}

.btn-retry {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.btn-retry:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0,0,0,0.15);
}

.citas-list {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  margin-bottom: 2rem;
}

.cita-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-left: 5px solid #cbd5e1;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cita-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

/* Colores por estado */
.cita-card.programada { border-left-color: #3b82f6; }
.cita-card.confirmada { border-left-color: #10b981; }
.cita-card.completada { border-left-color: #8b5cf6; }
.cita-card.cancelada { border-left-color: #ef4444; }
.cita-card.no_asistio { border-left-color: #f59e0b; }

.cita-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.cita-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.3;
}

.estado-badge {
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #e2e8f0;
  color: #475569;
  text-transform: capitalize;
  border: 1px solid #cbd5e1;
}

.cita-card.programada .estado-badge { background: #dbeafe; color: #1d4ed8; border-color: #bfdbfe; }
.cita-card.confirmada .estado-badge { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
.cita-card.completada .estado-badge { background: #ede9fe; color: #6d28d9; border-color: #ddd6fe; }
.cita-card.cancelada .estado-badge { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
.cita-card.no_asistio .estado-badge { background: #fef3c7; color: #d97706; border-color: #fde68a; }

.cita-body p {
  margin: 0.5rem 0;
  color: #475569;
  font-size: 1rem;
  line-height: 1.6;
}

.observaciones {
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  font-style: italic;
  border-left: 4px solid #3b82f6;
  font-size: 0.95rem;
}

.cita-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.btn-ver {
  background: #145a32;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.btn-ver:hover {
  background: #0f4c28;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0,0,0,0.15);
}

.btn-primary {
  background: #145a32;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.btn-primary:hover {
  background: #0f4c28;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.15);
}

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filters select {
    width: 100%;
    max-width: 300px;
    margin: 1rem auto 0;
  }

  .citas-list {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .cita-card {
    padding: 1.5rem;
  }

  .header-section h1 {
    font-size: 1.75rem;
  }

  .cita-header h3 {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .mis-citas-container {
    padding: 1rem;
  }

  .btn-ver,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .cita-footer {
    justify-content: center;
  }
}
</style>
