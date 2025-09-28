<template>
  <div class="equipos-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Equipos Médicos</h1>
        <p class="subtitle">Gestiona el inventario de equipos médicos del sistema.</p>
        <button @click="openCrearModal" class="btn btn--success">+ Nuevo Equipo</button>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-item">
          <label for="filter-tipo" class="filter-label">Tipo</label>
          <select
            id="filter-tipo"
            :value="selectedTipo"
            @change="handleTipoChange"
            class="status-select"
          >
            <option value="">Todos</option>
            <option value="diagnostico">Diagnóstico</option>
            <option value="cirugia">Cirugía</option>
            <option value="laboratorio">Laboratorio</option>
            <option value="cuidado">Cuidado</option>
          </select>
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
            <option value="activo">Activo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera_de_servicio">Fuera de servicio</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando equipos...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadEquipos" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredEquipos.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" />
            <path d="M16 11H8" />
            <path d="M16 15H8" />
          </svg>
          <p>No hay equipos que coincidan con los filtros.</p>
        </div>

        <div v-else class="equipos-grid">
          <div
            v-for="equipo in filteredEquipos"
            :key="equipo.id"
            class="equipo-card"
            :class="{ 'equipo-mantenimiento': equipo.estado === 'mantenimiento', 'equipo-fuera': equipo.estado === 'fuera_de_servicio' }"
          >
            <div class="card-header">
              <h3 class="equipo-nombre">{{ equipo.nombre }}</h3>
              <span class="badge" :class="`badge--${equipo.estado}`">
                {{ getEstadoLabel(equipo.estado) }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Tipo:</span>
                <span class="value">{{ getTipoLabel(equipo.tipo) }}</span>
              </div>
              <div v-if="equipo.marca" class="info-row">
                <span class="label">Marca:</span>
                <span class="value">{{ equipo.marca }}</span>
              </div>
              <div v-if="equipo.modelo" class="info-row">
                <span class="label">Modelo:</span>
                <span class="value">{{ equipo.modelo }}</span>
              </div>
              <div v-if="equipo.numero_serie" class="info-row">
                <span class="label">N° Serie:</span>
                <span class="value">{{ equipo.numero_serie }}</span>
              </div>
              <div v-if="equipo.fecha_compra" class="info-row">
                <span class="label">Compra:</span>
                <span class="value">{{ formatDate(equipo.fecha_compra) }}</span>
              </div>
              <div v-if="equipo.garantia_expira" class="info-row">
                <span class="label">Garantía:</span>
                <span class="value">{{ formatDate(equipo.garantia_expira) }}</span>
              </div>
              <div v-if="equipo.ubicacion" class="info-row">
                <span class="label">Ubicación:</span>
                <span class="value">{{ equipo.ubicacion }}</span>
              </div>
              <div v-if="equipo.notas" class="info-row">
                <span class="label">Notas:</span>
                <span class="value">{{ equipo.notas }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button @click="editarEquipo(equipo)" class="btn btn--outline">Editar</button>
              <button
                @click="cambiarEstado(equipo)"
                class="btn btn--success"
              >
                Cambiar estado
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingEquipo ? 'Editar Equipo' : 'Crear Equipo' }}</h2>
            <button @click="closeModal" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre *</label>
              <input
                v-model="formEquipo.nombre"
                type="text"
                class="form-input"
                placeholder="Nombre del equipo"
                required
              />
            </div>
            <div class="form-group">
              <label>Tipo *</label>
              <select v-model="formEquipo.tipo" class="form-input" required>
                <option value="diagnostico">Diagnóstico</option>
                <option value="cirugia">Cirugía</option>
                <option value="laboratorio">Laboratorio</option>
                <option value="cuidado">Cuidado</option>
              </select>
            </div>
            <div class="form-group">
              <label>Marca</label>
              <input
                v-model="formEquipo.marca"
                type="text"
                class="form-input"
                placeholder="Marca del equipo"
              />
            </div>
            <div class="form-group">
              <label>Modelo</label>
              <input
                v-model="formEquipo.modelo"
                type="text"
                class="form-input"
                placeholder="Modelo del equipo"
              />
            </div>
            <div class="form-group">
              <label>Número de serie</label>
              <input
                v-model="formEquipo.numero_serie"
                type="text"
                class="form-input"
                placeholder="Número de serie único"
              />
            </div>
            <div class="form-group">
              <label>Fecha de compra</label>
              <input
                v-model="formEquipo.fecha_compra"
                type="date"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Garantía expira</label>
              <input
                v-model="formEquipo.garantia_expira"
                type="date"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Ubicación</label>
              <input
                v-model="formEquipo.ubicacion"
                type="text"
                class="form-input"
                placeholder="Ubicación física"
              />
            </div>
            <div class="form-group">
              <label>Estado *</label>
              <select v-model="formEquipo.estado" class="form-input" required>
                <option value="activo">Activo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="fuera_de_servicio">Fuera de servicio</option>
                <option value="archivado">Archivado</option>
              </select>
            </div>
            <div class="form-group">
              <label>Notas</label>
              <textarea
                v-model="formEquipo.notas"
                class="form-input textarea"
                placeholder="Notas adicionales"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn btn--outline">Cancelar</button>
            <button @click="guardarEquipo" class="btn btn--success" :disabled="isProcessing">
              {{ isProcessing ? 'Guardando...' : (editingEquipo ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Cambiar Estado -->
      <div v-if="showEstadoModal" class="modal-overlay" @click="closeEstadoModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Cambiar Estado</h2>
            <button @click="closeEstadoModal" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p>Cambiar estado de <strong>{{ equipoSeleccionado?.nombre }}</strong></p>
            <div class="form-group">
              <label>Nuevo estado *</label>
              <select v-model="nuevoEstado" class="form-input" required>
                <option value="activo">Activo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="fuera_de_servicio">Fuera de servicio</option>
                <option value="archivado">Archivado</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeEstadoModal" class="btn btn--outline">Cancelar</button>
            <button @click="actualizarEstado" class="btn btn--success" :disabled="isProcessing">
              {{ isProcessing ? 'Actualizando...' : 'Actualizar' }}
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
const rawEquipos = ref([])
const selectedTipo = ref('')
const selectedEstado = ref('')

// Modal crear/editar
const showModal = ref(false)
const editingEquipo = ref(null)
const formEquipo = ref({
  nombre: '',
  tipo: 'diagnostico',
  marca: '',
  modelo: '',
  numero_serie: '',
  fecha_compra: '',
  garantia_expira: '',
  ubicacion: '',
  estado: 'activo',
  notas: ''
})

// Modal cambiar estado
const showEstadoModal = ref(false)
const equipoSeleccionado = ref(null)
const nuevoEstado = ref('activo')

// Handlers
const handleTipoChange = (event) => {
  selectedTipo.value = event.target.value
}

const handleEstadoChange = (event) => {
  selectedEstado.value = event.target.value
}

// Equipos filtrados
const filteredEquipos = computed(() => {
  return rawEquipos.value.filter(equipo => {
    const matchTipo = !selectedTipo.value || equipo.tipo === selectedTipo.value
    const matchEstado = !selectedEstado.value || equipo.estado === selectedEstado.value
    return matchTipo && matchEstado
  })
})

// Etiquetas
const tipoLabels = {
  diagnostico: 'Diagnóstico',
  cirugia: 'Cirugía',
  laboratorio: 'Laboratorio',
  cuidado: 'Cuidado'
}

const estadoLabels = {
  activo: 'Activo',
  mantenimiento: 'Mantenimiento',
  fuera_de_servicio: 'Fuera de servicio',
  archivado: 'Archivado'
}

// Formateo
const getTipoLabel = (tipo) => tipoLabels[tipo] || tipo
const getEstadoLabel = (estado) => estadoLabels[estado] || estado

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Cargar equipos
const loadEquipos = async () => {
  isLoading.value = true
  error.value = null

  try {
    const { data, error: equiposError } = await supabase
      .from('equiposmedicos')
      .select('*')
      .order('nombre', { ascending: true })

    if (equiposError) {
      console.error('Error al cargar equipos:', equiposError)
      throw new Error('Error al cargar equipos')
    }

    rawEquipos.value = data

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar equipos. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Abrir modal crear
const openCrearModal = () => {
  editingEquipo.value = null
  formEquipo.value = {
    nombre: '',
    tipo: 'diagnostico',
    marca: '',
    modelo: '',
    numero_serie: '',
    fecha_compra: '',
    garantia_expira: '',
    ubicacion: '',
    estado: 'activo',
    notas: ''
  }
  showModal.value = true
}

// Editar equipo
const editarEquipo = (equipo) => {
  editingEquipo.value = equipo
  formEquipo.value = { ...equipo }
  showModal.value = true
}

// Cerrar modal crear/editar
const closeModal = () => {
  showModal.value = false
  editingEquipo.value = null
}

// Guardar equipo
const guardarEquipo = async () => {
  if (isProcessing.value) return
  if (!formEquipo.value.nombre) {
    alert('El nombre es obligatorio')
    return
  }
  isProcessing.value = true

  try {
    if (editingEquipo.value) {
      // Actualizar
      const { error: updateError } = await supabase
        .from('equiposmedicos')
        .update(formEquipo.value)
        .eq('id', editingEquipo.value.id)

      if (updateError) throw updateError
    } else {
      // Crear
      const { error: insertError } = await supabase
        .from('equiposmedicos')
        .insert([formEquipo.value])

      if (insertError) throw insertError
    }

    await loadEquipos()
    closeModal()
    alert(editingEquipo.value ? 'Equipo actualizado correctamente' : 'Equipo creado correctamente')

  } catch (err) {
    console.error('Error al guardar equipo:', err)
    alert('Error al guardar el equipo. Verifica los datos.')
  } finally {
    isProcessing.value = false
  }
}

// Abrir modal cambiar estado
const cambiarEstado = (equipo) => {
  equipoSeleccionado.value = equipo
  nuevoEstado.value = equipo.estado
  showEstadoModal.value = true
}

// Cerrar modal cambiar estado
const closeEstadoModal = () => {
  showEstadoModal.value = false
  equipoSeleccionado.value = null
}

// Actualizar estado
const actualizarEstado = async () => {
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    const { error: updateError } = await supabase
      .from('equiposmedicos')
      .update({ estado: nuevoEstado.value })
      .eq('id', equipoSeleccionado.value.id)

    if (updateError) throw updateError
    await loadEquipos()
    closeEstadoModal()
    alert('Estado actualizado correctamente')

  } catch (err) {
    console.error('Error al actualizar estado:', err)
    alert('Error al actualizar el estado')
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  loadEquipos()
})
</script>

<style scoped>
/* Estilos coherentes con el dashboard admin */
.equipos-admin-container {
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

.equipos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.equipo-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.equipo-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.equipo-card.equipo-mantenimiento {
  border-left: 4px solid #f59e0b;
}

.equipo-card.equipo-fuera {
  border-left: 4px solid #ef4444;
  opacity: 0.8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.equipo-nombre {
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
.badge--mantenimiento { background: #ffedd5; color: #ea580c; }
.badge--fuera_de_servicio { background: #fee2e2; color: #dc2626; }
.badge--archivado { background: #e2e8f0; color: #475569; }

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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 480px) {
  .equipos-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .equipo-card {
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
