<template>
  <div class="servicios-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Servicios</h1>
        <p class="subtitle">Gestiona el catálogo de servicios del sistema.</p>
        <button @click="openCrearModal" class="btn btn--success">+ Nuevo Servicio</button>
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
        <div class="filter-item">
          <label for="filter-especialidad" class="filter-label">Especialidad</label>
          <select
            id="filter-especialidad"
            :value="selectedEspecialidad"
            @change="handleEspecialidadChange"
            class="status-select"
          >
            <option value="">Todas</option>
            <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">
              {{ esp.nombre }}
            </option>
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
          <p>No hay servicios que coincidan con los filtros.</p>
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
                <span class="label">Especialidad:</span>
                <span class="value">{{ servicio.especialidad_nombre || 'General' }}</span>
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
              <button @click="editarServicio(servicio)" class="btn btn--outline">Editar</button>
              <button
                @click="toggleEstado(servicio)"
                class="btn"
                :class="servicio.is_activo ? 'btn--danger' : 'btn--success'"
              >
                {{ servicio.is_activo ? 'Desactivar' : 'Activar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingServicio ? 'Editar Servicio' : 'Crear Servicio' }}</h2>
            <button @click="closeModal" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Título *</label>
              <input
                v-model="formServicio.titulo"
                type="text"
                class="form-input"
                placeholder="Título del servicio"
                required
              />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea
                v-model="formServicio.descripcion"
                class="form-input textarea"
                placeholder="Descripción del servicio"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Categoría *</label>
              <select v-model="formServicio.categoria" class="form-input" required>
                <option value="consulta">Consulta</option>
                <option value="procedimiento">Procedimiento</option>
                <option value="cuidado">Cuidado</option>
                <option value="emergencia">Emergencia</option>
              </select>
            </div>
            <div class="form-group">
              <label>Especialidad</label>
              <select v-model="formServicio.especialidad_id" class="form-input">
                <option value="">General (sin especialidad)</option>
                <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">
                  {{ esp.nombre }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Duración (minutos) *</label>
              <input
                v-model="formServicio.duracion_minutos"
                type="number"
                class="form-input"
                placeholder="Duración en minutos"
                min="1"
                required
              />
            </div>
            <div class="form-group">
              <label>Precio ($) *</label>
                <input
                v-model="formServicio.precio"
                type="number"
                class="form-input"
                placeholder="Precio del servicio"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-group">
              <label>Estado</label>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="formServicio.is_activo"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn btn--outline">Cancelar</button>
            <button @click="guardarServicio" class="btn btn--success" :disabled="isProcessing">
              {{ isProcessing ? 'Guardando...' : (editingServicio ? 'Actualizar' : 'Crear') }}
            </button>
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
const selectedEspecialidad = ref('')

// Listas para filtros
const especialidades = ref([])

// Modal
const showModal = ref(false)
const editingServicio = ref(null)
const formServicio = ref({
  titulo: '',
  descripcion: '',
  categoria: 'consulta',
  especialidad_id: null,
  duracion_minutos: 30,
  precio: 0,
  is_activo: true
})

// Handlers
const handleCategoriaChange = (event) => {
  selectedCategoria.value = event.target.value
}

const handleActivoChange = (event) => {
  selectedActivo.value = event.target.value
}

const handleEspecialidadChange = (event) => {
  selectedEspecialidad.value = event.target.value
}

// Servicios filtrados
const filteredServicios = computed(() => {
  return rawServicios.value.filter(servicio => {
    const matchCategoria = !selectedCategoria.value || servicio.categoria === selectedCategoria.value
    const matchActivo = selectedActivo.value === '' ||
      (selectedActivo.value === 'true' && servicio.is_activo) ||
      (selectedActivo.value === 'false' && !servicio.is_activo)
    const matchEspecialidad = !selectedEspecialidad.value || servicio.especialidad_id == selectedEspecialidad.value
    return matchCategoria && matchActivo && matchEspecialidad
  })
})

// Formateo
const getCategoriaLabel = (categoria) => {
  const labels = {
    consulta: 'Consulta',
    procedimiento: 'Procedimiento',
    cuidado: 'Cuidado',
    emergencia: 'Emergencia'
  }
  return labels[categoria] || categoria
}

const formatoMoneda = (valor) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(valor)
}

// Cargar datos
const loadServicios = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 1. Cargar especialidades
    const { data: espData, error: espError } = await supabase
      .from('especialidades')
      .select('id, nombre')
      .eq('is_activa', true)

    if (espError) throw new Error('Error al cargar especialidades')
    especialidades.value = espData

    // 2. Cargar servicios con relaciones
    const { data: servsData, error: servsError } = await supabase
      .from('servicios')
      .select(`
        id,
        titulo,
        descripcion,
        categoria,
        duracion_minutos,
        precio,
        is_activo,
        especialidad_id,
        especialidades (nombre)
      `)
      .order('titulo', { ascending: true })

    if (servsError) {
      console.error('Error al cargar servicios:', servsError)
      throw new Error('Error al cargar servicios')
    }

    // 3. Combinar datos
    rawServicios.value = servsData.map(serv => ({
      ...serv,
      especialidad_nombre: serv.especialidades?.[0]?.nombre || null
    }))

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar servicios. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Abrir modal crear
const openCrearModal = () => {
  editingServicio.value = null
  formServicio.value = {
    titulo: '',
    descripcion: '',
    categoria: 'consulta',
    especialidad_id: null,
    duracion_minutos: 30,
    precio: 0,
    is_activo: true
  }
  showModal.value = true
}

// Editar servicio
const editarServicio = (servicio) => {
  editingServicio.value = servicio
  formServicio.value = { ...servicio }
  showModal.value = true
}

// Cerrar modal
const closeModal = () => {
  showModal.value = false
  editingServicio.value = null
}

// Guardar servicio
const guardarServicio = async () => {
  if (isProcessing.value) return
  if (!formServicio.value.titulo || !formServicio.value.duracion_minutos || formServicio.value.precio === null) {
    alert('Completa todos los campos obligatorios')
    return
  }
  isProcessing.value = true

  try {
    let result
    if (editingServicio.value) {
      // Actualizar
      const updateData = {
        titulo: formServicio.value.titulo,
        descripcion: formServicio.value.descripcion,
        categoria: formServicio.value.categoria,
        especialidad_id: formServicio.value.especialidad_id || null,
        duracion_minutos: formServicio.value.duracion_minutos,
        precio: formServicio.value.precio,
        is_activo: formServicio.value.is_activo
      }

      const { error: updateError } = await supabase
        .from('servicios')
        .update(updateData)
        .eq('id', editingServicio.value.id)

      if (updateError) throw updateError
    } else {
      // Crear
      const { error: insertError } = await supabase
        .from('servicios')
        .insert([{
          titulo: formServicio.value.titulo,
          descripcion: formServicio.value.descripcion,
          categoria: formServicio.value.categoria,
          especialidad_id: formServicio.value.especialidad_id || null,
          duracion_minutos: formServicio.value.duracion_minutos,
          precio: formServicio.value.precio,
          is_activo: formServicio.value.is_activo
        }])

      if (insertError) throw insertError
    }

    await loadServicios()
    closeModal()
    alert(editingServicio.value ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente')

  } catch (err) {
    console.error('Error al guardar servicio:', err)
    alert('Error al guardar el servicio. Verifica los datos.')
  } finally {
    isProcessing.value = false
  }
}

// Toggle estado
const toggleEstado = async (servicio) => {
  if (!confirm(`¿${servicio.is_activo ? 'Desactivar' : 'Activar'} "${servicio.titulo}"?`)) return

  try {
    const { error: updateError } = await supabase
      .from('servicios')
      .update({ is_activo: !servicio.is_activo })
      .eq('id', servicio.id)

    if (updateError) throw updateError
    await loadServicios()
  } catch (err) {
    console.error('Error al cambiar estado:', err)
    alert('Error al cambiar el estado del servicio')
  }
}

onMounted(() => {
  loadServicios()
})
</script>

<style scoped>
/* Estilos coherentes con el dashboard admin */
.servicios-admin-container {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
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

.btn--success {
  background: #145a32;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn--success:hover {
  background: #0f4c28;
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

.btn--outline {
  background: #f1f5f9;
  color: #1e293b;
}

.btn--outline:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn--danger {
  background: #dc2626;
  color: white;
}

.btn--danger:hover:not(:disabled) {
  background: #b91c1c;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #94a3b8;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1e293b;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.form-input:focus {
  outline: none;
  border-color: #145a32;
  box-shadow: 0 0 0 3px rgba(20, 90, 50, 0.1);
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #145a32;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
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
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
