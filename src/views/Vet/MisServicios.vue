<template>
  <div class="servicios-vet-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Mis Servicios</h1>
        <p class="subtitle">Servicios que ofreces según la tabla <code>servicios_veterinarios</code>.</p>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-item">
          <label for="filter-categoria" class="filter-label">Categoría</label>
          <select
            id="filter-categoria"
            :value="selectedCategoria"
            @change="handleCategoriaChange"
            class="status-select"
          >
            <option value="">Todas</option>
            <option value="consulta">Consulta</option>
            <option value="procedimiento">Procedimiento</option>
            <option value="cuidado">Cuidado</option>
            <option value="emergencia">Emergencia</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filter-estado" class="filter-label">Estado</label>
          <select
            id="filter-estado"
            :value="selectedActivo"
            @change="handleActivoChange"
            class="status-select"
          >
            <option value="">Todos</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando servicios...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadServicios" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredServicios.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
            <path d="M12 8V16" />
            <path d="M8 12H16" />
          </svg>
          <p>No ofreces ningún servicio aún.</p>
        </div>

        <div v-else class="servicios-grid">
          <div
            v-for="servicio in filteredServicios"
            :key="servicio.id"
            class="servicio-card"
          >
            <div class="card-header">
              <h3 class="servicio-titulo">{{ servicio.titulo }}</h3>
              <span class="badge" :class="`badge--${servicio.is_activo ? 'activo' : 'inactivo'}`">
                {{ servicio.is_activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Categoría:</span>
                <span class="value">{{ getCategoriaLabel(servicio.categoria) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Duración:</span>
                <span class="value">{{ servicio.duracion_minutos }} min</span>
              </div>
              <div class="info-row">
                <span class="label">Precio:</span>
                <span class="value">{{ formatoMoneda(servicio.precio) }}</span>
              </div>
              <div v-if="servicio.descripcion" class="info-row">
                <span class="label">Descripción:</span>
                <span class="value">{{ servicio.descripcion }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button
                @click="toggleServicio(servicio.id)"
                class="btn"
                :class="servicio.is_activo ? 'btn--danger' : 'btn--success'"
                :disabled="isProcessing"
              >
                {{ servicio.is_activo ? 'Desactivar' : 'Activar' }}
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
import AppSidebar from '@/components/layouts/AppSidebar.vue'

// Estado
const isLoading = ref(false)
const isProcessing = ref(false)
const error = ref(null)
const rawServicios = ref([])
const selectedCategoria = ref('')
const selectedActivo = ref('')

// Categorías
const categoriaLabels = {
  consulta: 'Consulta',
  procedimiento: 'Procedimiento',
  cuidado: 'Cuidado',
  emergencia: 'Emergencia'
}

// Handlers
const handleCategoriaChange = (event) => {
  selectedCategoria.value = event.target.value
}

const handleActivoChange = (event) => {
  selectedActivo.value = event.target.value
}

// Servicios filtrados
const filteredServicios = computed(() => {
  return rawServicios.value.filter(servicio => {
    const matchCategoria = !selectedCategoria.value || servicio.categoria === selectedCategoria.value
    const matchActivo = selectedActivo.value === '' ||
      (selectedActivo.value === 'true' && servicio.is_activo) ||
      (selectedActivo.value === 'false' && !servicio.is_activo)
    return matchCategoria && matchActivo
  })
})

// Formateo
const getCategoriaLabel = (categoria) => {
  return categoriaLabels[categoria] || categoria
}

const formatoMoneda = (valor) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(valor)
}

// Cargar servicios
const loadServicios = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('No autenticado')
    }

    // 2. Obtener veterinario
    const { data: vetData, error: vetError } = await supabase
      .from('veterinarios')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    if (vetError || !vetData) {
      throw new Error('No eres veterinario en el sistema')
    }

    // 3. Obtener IDs de servicios que ofrece
    const { data: serviciosVetData, error: serviciosVetError } = await supabase
      .from('servicios_veterinarios')
      .select('servicio_id, is_activo')
      .eq('veterinario_id', vetData.id)

    if (serviciosVetError) {
      console.error('Error al cargar servicios_veterinarios:', serviciosVetError)
      throw new Error('Error al consultar tus servicios')
    }

    if (!serviciosVetData || serviciosVetData.length === 0) {
      rawServicios.value = []
      isLoading.value = false
      return
    }

    // 4. Obtener IDs únicos de servicios
    const servicioIds = serviciosVetData.map(s => s.servicio_id)
    const activoMap = {}
    serviciosVetData.forEach(s => {
      activoMap[s.servicio_id] = s.is_activo
    })

    // 5. Cargar datos de servicios
    const { data: serviciosData, error: serviciosError } = await supabase
      .from('servicios')
      .select('id, titulo, descripcion, duracion_minutos, precio, categoria, is_activo')
      .in('id', servicioIds)
      .order('titulo', { ascending: true })

    if (serviciosError) {
      console.error('Error al cargar servicios:', serviciosError)
      throw new Error('Error al cargar datos de servicios')
    }

    // 6. Combinar datos
    rawServicios.value = serviciosData.map(s => ({
      ...s,
      is_activo: activoMap[s.id] // Usa el estado de servicios_veterinarios, no el de servicios
    }))

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar servicios. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Toggle servicio
const toggleServicio = async (servicioId) => {
  if (isProcessing.value) return

  const servicio = rawServicios.value.find(s => s.id === servicioId)
  if (!servicio) return

  const nuevoEstado = !servicio.is_activo
  if (!confirm(`¿${nuevoEstado ? 'Activar' : 'Desactivar'} este servicio?`)) return

  isProcessing.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: vetData } = await supabase
      .from('veterinarios')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    // Actualizar en servicios_veterinarios
    const { error: updateError } = await supabase
      .from('servicios_veterinarios')
      .update({ is_activo: nuevoEstado })
      .match({
        veterinario_id: vetData.id,
        servicio_id: servicioId
      })

    if (updateError) {
      console.error('Error al actualizar:', updateError)
      throw new Error('No se pudo actualizar el servicio')
    }

    // Actualizar localmente
    servicio.is_activo = nuevoEstado

  } catch (err) {
    alert(err.message)
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  loadServicios()
})
</script>

<style scoped>
/* Estilos idénticos a los anteriores */
.servicios-vet-container {
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
  min-width: 200px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.status-select {
  color: #1e293b;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: white;
  transition: border-color 0.2s;
}

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

.servicios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.servicio-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.servicio-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.servicio-titulo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge--activo { background: #dcfce7; color: #166534; }
.badge--inactivo { background: #fee2e2; color: #dc2626; }

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
  min-width: 90px;
}

.value {
  color: #1e293b;
  flex: 1;
}

.card-footer {
  display: flex;
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
  background: #16a34a;
  color: white;
}

.btn--success:hover:not(:disabled) {
  background: #15803d;
}

.btn--danger {
  background: #dc2626;
  color: white;
}

.btn--danger:hover:not(:disabled) {
  background: #b91c1c;
}

@media (max-width: 480px) {
  .servicios-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .servicio-card {
    padding: 1.25rem;
  }

  .card-footer {
    justify-content: center;
  }
}
</style>
