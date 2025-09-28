<template>
  <div class="citas-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Citas</h1>
        <p class="subtitle">Gestiona todas las citas del sistema.</p>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-item">
          <label for="filter-fecha" class="filter-label">Fecha</label>
          <input
            id="filter-fecha"
            type="date"
            :value="selectedFecha"
            @input="handleFechaInput"
            class="date-input"
          />
        </div>
        <div class="filter-item">
          <label for="filter-estado" class="filter-label">Estado</label>
          <select
            id="filter-estado"
            :value="selectedEstado"
            @change="handleEstadoChange"
            class="status-select"
          >
            <option value="">Todos</option>
            <option value="programada">Programada</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
            <option value="no_asistio">No asistió</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filter-veterinario" class="filter-label">Veterinario</label>
          <select
            id="filter-veterinario"
            :value="selectedVeterinario"
            @change="handleVeterinarioChange"
            class="status-select"
          >
            <option value="">Todos</option>
            <option v-for="vet in veterinarios" :key="vet.id" :value="vet.id">
              {{ vet.nombre }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filter-servicio" class="filter-label">Servicio</label>
          <select
            id="filter-servicio"
            :value="selectedServicio"
            @change="handleServicioChange"
            class="status-select"
          >
            <option value="">Todos</option>
            <option v-for="serv in servicios" :key="serv.id" :value="serv.id">
              {{ serv.titulo }}
            </option>
          </select>
        </div>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando citas...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadCitas" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredCitas.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M8 2V5" /><path d="M16 2V5" />
            <path d="M3 9H21" /><path d="M3 15H21" /><path d="M3 21H21" />
          </svg>
          <p>No hay citas que coincidan con los filtros.</p>
        </div>

        <div v-else class="citas-grid">
          <div
            v-for="cita in filteredCitas"
            :key="cita.id"
            class="cita-card"
          >
            <div class="card-header">
              <div>
                <span class="time">{{ formatTime(cita.hora) }}</span>
                <span class="date">{{ formatDate(cita.fecha) }}</span>
              </div>
              <span class="badge" :class="`badge--${cita.estado}`">
                {{ getEstadoLabel(cita.estado) }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Mascota:</span>
                <span class="value">{{ cita.mascota_nombre || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Dueño:</span>
                <span class="value">{{ cita.usuario_nombre || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Veterinario:</span>
                <span class="value">{{ cita.veterinario_nombre || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Servicio:</span>
                <span class="value">{{ cita.servicio_titulo || '—' }}</span>
              </div>
              <div v-if="cita.observaciones" class="info-row">
                <span class="label">Notas:</span>
                <span class="value">{{ cita.observaciones }}</span>
              </div>
              <div class="info-row">
                <span class="label">Pago:</span>
                <span class="value" :class="`pago--${cita.estado_pago}`">
                  {{ getEstadoPagoLabel(cita.estado_pago) }}
                </span>
              </div>
            </div>

            <div class="card-footer">
              <button
                v-if="cita.estado === 'programada'"
                @click="actualizarEstado(cita.id, 'confirmada')"
                class="btn btn--success"
              >
                Confirmar
              </button>
              <button
                v-if="cita.estado === 'programada' || cita.estado === 'confirmada'"
                @click="actualizarEstado(cita.id, 'cancelada')"
                class="btn btn--danger"
              >
                Cancelar
              </button>
              <button @click="verDetalles(cita.id)" class="btn btn--outline">
                Ver
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layouts/AppSidebar.vue'

const router = useRouter()
const isLoading = ref(false)
const error = ref(null)
const rawCitas = ref([])
const selectedFecha = ref('')
const selectedEstado = ref('')
const selectedVeterinario = ref('')
const selectedServicio = ref('')

// Listas para filtros
const veterinarios = ref([])
const servicios = ref([])

// Handlers
const handleFechaInput = (event) => {
  selectedFecha.value = event.target.value
}

const handleEstadoChange = (event) => {
  selectedEstado.value = event.target.value
}

const handleVeterinarioChange = (event) => {
  selectedVeterinario.value = event.target.value
}

const handleServicioChange = (event) => {
  selectedServicio.value = event.target.value
}

const filteredCitas = computed(() => {
  return rawCitas.value.filter(cita => {
    const matchFecha = !selectedFecha.value || cita.fecha === selectedFecha.value
    const matchEstado = !selectedEstado.value || cita.estado === selectedEstado.value
    const matchVeterinario = !selectedVeterinario.value || cita.veterinario_id == selectedVeterinario.value
    const matchServicio = !selectedServicio.value || cita.servicio_id == selectedServicio.value
    return matchFecha && matchEstado && matchVeterinario && matchServicio
  })
})

const estadoLabels = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_asistio: 'No asistió'
}

const estadoPagoLabels = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  reembolsado: 'Reembolsado',
  fallido: 'Fallido'
}

const getEstadoLabel = (estado) => estadoLabels[estado] || estado
const getEstadoPagoLabel = (estado) => estadoPagoLabels[estado] || estado

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

const formatTime = (timeStr) => {
  if (!timeStr) return '—'
  const [h, m] = timeStr.split(':')
  return `${h}:${m}`
}

// Cargar datos (versión robusta)
const loadCitas = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 1. Cargar veterinarios para filtro
    const { data: vetsData, error: vetsError } = await supabase
      .from('veterinarios')
      .select('id, usuario_id')
      .eq('is_activo', true)

    if (vetsError) throw new Error('Error al cargar veterinarios')

    // Obtener nombres de veterinarios
    const vetUsuarioIds = vetsData.map(v => v.usuario_id)
    const vetNombres = {}
    if (vetUsuarioIds.length > 0) {
      const { data: usuariosVets, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, nombre_completo')
        .in('id', vetUsuarioIds)

      if (usuariosError) throw new Error('Error al cargar nombres de veterinarios')
      usuariosVets.forEach(u => { vetNombres[u.id] = u.nombre_completo })
    }

    veterinarios.value = vetsData.map(v => ({
      id: v.id,
      nombre: vetNombres[v.usuario_id] || 'Veterinario'
    }))

    // 2. Cargar servicios para filtro
    const { data: servsData, error: servsError } = await supabase
      .from('servicios')
      .select('id, titulo')
      .eq('is_activo', true)

    if (servsError) throw new Error('Error al cargar servicios')
    servicios.value = servsData

    // 3. Cargar citas (solo IDs y campos básicos)
    const { data: citasData, error: citasError } = await supabase
      .from('citasmascotas')
      .select('id, fecha, hora, estado, observaciones, estado_pago, mascota_id, usuario_id, veterinario_id, servicio_id')
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false })

    if (citasError) {
      console.error('Error Supabase:', citasError)
      throw new Error('Error al consultar citas')
    }

    if (citasData.length === 0) {
      rawCitas.value = []
      isLoading.value = false
      return
    }

    // 4. Obtener IDs únicos para relaciones
    const mascotaIds = [...new Set(citasData.map(c => c.mascota_id).filter(Boolean))]
    const usuarioIds = [...new Set(citasData.map(c => c.usuario_id).filter(Boolean))]
    const servicioIds = [...new Set(citasData.map(c => c.servicio_id).filter(Boolean))]
    const vetIds = [...new Set(citasData.map(c => c.veterinario_id).filter(Boolean))]

    // 5. Cargar datos relacionados en paralelo
    const [
      mascotasRes,
      usuariosRes,
      serviciosRes,
      vetsRes
    ] = await Promise.all([
      mascotaIds.length > 0
        ? supabase.from('mascotas').select('id, nombre').in('id', mascotaIds)
        : Promise.resolve({ data: [], error: null }),

      usuarioIds.length > 0
        ? supabase.from('usuarios').select('id, nombre_completo').in('id', usuarioIds)
        : Promise.resolve({ data: [], error: null }),

      servicioIds.length > 0
        ? supabase.from('servicios').select('id, titulo').in('id', servicioIds)
        : Promise.resolve({ data: [], error: null }),

      vetIds.length > 0
        ? supabase.from('veterinarios').select('id, usuario_id').in('id', vetIds)
        : Promise.resolve({ data: [], error: null })
    ])

    // Verificar errores
    if (mascotasRes.error) throw new Error('Error al cargar mascotas')
    if (usuariosRes.error) throw new Error('Error al cargar usuarios')
    if (serviciosRes.error) throw new Error('Error al cargar servicios')
    if (vetsRes.error) throw new Error('Error al cargar veterinarios')

    // Crear mapas
    const mascotasMap = {}
    mascotasRes.data.forEach(m => { mascotasMap[m.id] = m.nombre })

    const usuariosMap = {}
    usuariosRes.data.forEach(u => { usuariosMap[u.id] = u.nombre_completo })

    const serviciosMap = {}
    serviciosRes.data.forEach(s => { serviciosMap[s.id] = s.titulo })

    // Obtener nombres de veterinarios
    const vetUsuarioMap = {}
    if (vetsRes.data.length > 0) {
      const vetUserIds = vetsRes.data.map(v => v.usuario_id)
      if (vetUserIds.length > 0) {
        const { data: vetUsuarios, error: vetUserError } = await supabase
          .from('usuarios')
          .select('id, nombre_completo')
          .in('id', vetUserIds)

        if (vetUserError) throw new Error('Error al cargar nombres de veterinarios')
        vetUsuarios.forEach(u => { vetUsuarioMap[u.id] = u.nombre_completo })
      }
    }

    const veterinariosMap = {}
    vetsRes.data.forEach(v => {
      veterinariosMap[v.id] = vetUsuarioMap[v.usuario_id] || 'Veterinario'
    })

    // 6. Combinar datos
    rawCitas.value = citasData.map(cita => ({
      ...cita,
      mascota_nombre: mascotasMap[cita.mascota_id] || null,
      usuario_nombre: usuariosMap[cita.usuario_id] || null,
      servicio_titulo: serviciosMap[cita.servicio_id] || null,
      veterinario_nombre: veterinariosMap[cita.veterinario_id] || null
    }))

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar citas. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

const actualizarEstado = async (citaId, nuevoEstado) => {
  if (!confirm(`¿${nuevoEstado === 'confirmada' ? 'Confirmar' : 'Cancelar'} esta cita?`)) return

  try {
    const { error: updateError } = await supabase
      .from('citasmascotas')
      .update({ estado: nuevoEstado })
      .eq('id', citaId)

    if (updateError) {
      console.error('Error al actualizar:', updateError)
      throw new Error('No se pudo actualizar la cita')
    }

    await loadCitas()
  } catch (err) {
    alert(err.message)
  }
}

const verDetalles = (citaId) => {
  router.push({ name: 'DetalleCitaAdmin', params: { id: citaId } })
}

onMounted(() => {
  loadCitas()
})
</script>

<style scoped>
/* Estilos coherentes con el dashboard admin */
.citas-admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1.5rem;
  }

  .filters-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-item {
    width: 100%;
    min-width: auto;
  }

  .date-input,
  .status-select {
    width: 100%;
  }
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
}

.filters-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 160px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.date-input,
.status-select {
  color: #1e293b;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: white;
  transition: border-color 0.2s;
}

.date-input:focus,
.status-select:focus {
  outline: none;
  border-color: #145a32;
  box-shadow: 0 0 0 3px rgba(20, 90, 50, 0.1);
}

.content-area {
  min-height: 400px;
}

.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #64748b;
  text-align: center;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #145a32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #145a32;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #0f4c28;
}

.citas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.cita-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cita-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.time {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.date {
  font-size: 0.875rem;
  color: #64748b;
  display: block;
  margin-top: 0.25rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge--programada { background: #dbeafe; color: #1d4ed8; }
.badge--confirmada { background: #dcfce7; color: #166534; }
.badge--completada { background: #ede9fe; color: #7c3aed; }
.badge--cancelada { background: #fee2e2; color: #dc2626; }
.badge--no_asistio { background: #ffedd5; color: #ea580c; }

.card-body {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.label {
  font-weight: 600;
  color: #475569;
  min-width: 85px;
}

.value {
  color: #1e293b;
  flex: 1;
}

.pago--pendiente { color: #d97706; font-weight: 600; }
.pago--pagado { color: #166534; font-weight: 600; }
.pago--reembolsado { color: #7c3aed; font-weight: 600; }
.pago--fallido { color: #dc2626; font-weight: 600; }

.card-footer {
  display: flex;
  gap: 0.875rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--success {
  background: #145a32;
  color: white;
}

.btn--success:hover:not(:disabled) {
  background: #0f4c28;
}

.btn--danger {
  background: #dc2626;
  color: white;
}

.btn--danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn--outline {
  background: #f1f5f9;
  color: #1e293b;
}

.btn--outline:hover:not(:disabled) {
  background: #e2e8f0;
}

@media (max-width: 480px) {
  .citas-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .cita-card {
    padding: 1.25rem;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
