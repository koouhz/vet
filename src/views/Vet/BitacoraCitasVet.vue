<template>
  <div class="bitacora-vet-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Bitácora de Citas</h1>
        <p class="subtitle">Registro de tus acciones en la tabla <code>bitacoracitas</code>.</p>
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
            :max="today"
          />
        </div>
        <div class="filter-item">
          <label for="filter-accion" class="filter-label">Acción</label>
          <select
            id="filter-accion"
            :value="selectedAccion"
            @change="handleAccionChange"
            class="status-select"
          >
            <option value="">Todas</option>
            <option value="creada">Creada</option>
            <option value="actualizada">Actualizada</option>
            <option value="cancelada">Cancelada</option>
            <option value="reprogramada">Reprogramada</option>
            <option value="check_in">Check-in</option>
            <option value="check_out">Check-out</option>
            <option value="pago_realizado">Pago realizado</option>
          </select>
        </div>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando bitácora...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadBitacora" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredBitacora.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" />
            <path d="M14 2V8H20" />
          </svg>
          <p>No hay registros en tu bitácora.</p>
        </div>

        <div v-else class="bitacora-list">
          <div
            v-for="registro in filteredBitacora"
            :key="registro.id"
            class="registro-card"
          >
            <div class="registro-header">
              <span class="accion-badge" :class="`accion--${registro.accion}`">
                {{ getAccionLabel(registro.accion) }}
              </span>
              <span class="fecha">{{ formatDateTime(registro.creado_en) }}</span>
            </div>

            <div class="registro-body">
              <div class="info-row">
                <span class="label">Cita ID:</span>
                <span class="value">{{ registro.cita_id }}</span>
              </div>
              <div v-if="registro.cita_info" class="info-row">
                <span class="label">Cita:</span>
                <span class="value">{{ registro.cita_info }}</span>
              </div>
              <div v-if="registro.valor_anterior" class="info-row cambio">
                <span class="label">Antes:</span>
                <span class="value">{{ formatCambio(registro.valor_anterior) }}</span>
              </div>
              <div v-if="registro.valor_nuevo" class="info-row cambio">
                <span class="label">Después:</span>
                <span class="value">{{ formatCambio(registro.valor_nuevo) }}</span>
              </div>
              <div v-if="registro.ip_address" class="info-row">
                <span class="label">IP:</span>
                <span class="value">{{ registro.ip_address }}</span>
              </div>
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
import AppSidebar from '@/components/layouts/AppSidebar.vue'

// Estado
const isLoading = ref(false)
const error = ref(null)
const rawBitacora = ref([])
const selectedFecha = ref('')
const selectedAccion = ref('')

// Constantes
const today = new Date().toISOString().split('T')[0]

const accionLabels = {
  creada: 'Creada',
  actualizada: 'Actualizada',
  cancelada: 'Cancelada',
  reprogramada: 'Reprogramada',
  check_in: 'Check-in',
  check_out: 'Check-out',
  pago_realizado: 'Pago realizado'
}

// Handlers
const handleFechaInput = (event) => {
  selectedFecha.value = event.target.value
}

const handleAccionChange = (event) => {
  selectedAccion.value = event.target.value
}

// Bitácora filtrada
const filteredBitacora = computed(() => {
  return rawBitacora.value.filter(registro => {
    const matchFecha = !selectedFecha.value ||
      registro.creado_en.startsWith(selectedFecha.value)
    const matchAccion = !selectedAccion.value || registro.accion === selectedAccion.value
    return matchFecha && matchAccion
  })
})

// Formateo
const getAccionLabel = (accion) => {
  return accionLabels[accion] || accion
}

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '—'
  const date = new Date(dateTimeStr)
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCambio = (valor) => {
  if (!valor) return '—'
  if (typeof valor === 'object') {
    try {
      return JSON.stringify(valor, null, 2)
    } catch {
      return String(valor)
    }
  }
  return String(valor)
}

// Cargar bitácora
const loadBitacora = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('No autenticado')
    }

    // 2. Cargar registros de bitácora
    let query = supabase
      .from('bitacoracitas')
      .select(`
        id,
        cita_id,
        accion,
        valor_anterior,
        valor_nuevo,
        ip_address,
        creado_en
      `)
      .eq('usuario_id', user.id)
      .order('creado_en', { ascending: false })

    const { data, error: bitacoraError } = await query

    if (bitacoraError) {
      console.error('Error al cargar bitácora:', bitacoraError)
      throw new Error('Error al cargar la bitácora')
    }

    if (!data || data.length === 0) {
      rawBitacora.value = []
      isLoading.value = false
      return
    }

    // 3. Obtener información de citas
    const citaIds = [...new Set(data.map(r => r.cita_id))]
    const citasMap = {}

    if (citaIds.length > 0) {
      const { data: citasData, error: citasError } = await supabase
        .from('citasmascotas')
        .select('id, fecha, hora, estado')
        .in('id', citaIds)

      if (!citasError && citasData) {
        citasData.forEach(cita => {
          citasMap[cita.id] = `${cita.fecha} ${cita.hora} (${cita.estado})`
        })
      }
    }

    // 4. Combinar datos
    rawBitacora.value = data.map(registro => ({
      ...registro,
      cita_info: citasMap[registro.cita_id] || null
    }))

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar bitácora. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadBitacora()
})
</script>

<style scoped>
/* Estilos idénticos a los anteriores */
.bitacora-vet-container {
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
  margin-top: 0.25rem;
}

.subtitle code {
  background: #f1f5f9;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-family: monospace;
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
  min-width: 180px;
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

.bitacora-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.registro-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.registro-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.registro-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.accion-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
}

.accion--creada { background: #dbeafe; color: #1d4ed8; }
.accion--actualizada { background: #ede9fe; color: #7c3aed; }
.accion--cancelada { background: #fee2e2; color: #dc2626; }
.accion--reprogramada { background: #ffedd5; color: #ea580c; }
.accion--check_in { background: #dcfce7; color: #166534; }
.accion--check_out { background: #dbeafe; color: #1d4ed8; }
.accion--pago_realizado { background: #f3e8ff; color: #7e22ce; }

.fecha {
  font-size: 0.875rem;
  color: #64748b;
  white-space: nowrap;
}

.registro-body {
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
  word-break: break-word;
}

.cambio .value {
  font-family: monospace;
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

@media (max-width: 480px) {
  .registro-card {
    padding: 1.25rem;
  }

  .registro-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .fecha {
    align-self: flex-end;
  }
}
</style>
