<template>
  <div class="veterinarios-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Veterinarios</h1>
        <p class="subtitle">Gestiona los perfiles de veterinarios del sistema.</p>
        <button @click="openCrearModal" class="btn btn--success">+ Nuevo Veterinario</button>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
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
          <p>Cargando veterinarios...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadVeterinarios" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredVeterinarios.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
            <path d="M8 12L10 14L16 8" />
          </svg>
          <p>No hay veterinarios que coincidan con los filtros.</p>
        </div>

        <div v-else class="veterinarios-grid">
          <div
            v-for="vet in filteredVeterinarios"
            :key="vet.id"
            class="veterinario-card"
          >
            <div class="card-header">
              <h3 class="veterinario-nombre">{{ vet.nombre_completo }}</h3>
              <span class="badge" :class="`badge--${vet.is_activo ? 'activo' : 'inactivo'}`">
                {{ vet.is_activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Especialidad:</span>
                <span class="value">{{ vet.especialidad_nombre || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">{{ vet.email || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Licencia:</span>
                <span class="value">{{ vet.numero_licencia || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Experiencia:</span>
                <span class="value">{{ vet.anos_experiencia ? `${vet.anos_experiencia} años` : '—' }}</span>
              </div>
              <div v-if="vet.bio" class="info-row">
                <span class="label">Bio:</span>
                <span class="value">{{ vet.bio }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button @click="editarVeterinario(vet)" class="btn btn--outline">Editar</button>
              <button
                @click="toggleEstado(vet)"
                class="btn"
                :class="vet.is_activo ? 'btn--danger' : 'btn--success'"
              >
                {{ vet.is_activo ? 'Desactivar' : 'Activar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingVet ? 'Editar Veterinario' : 'Crear Veterinario' }}</h2>
            <button @click="closeModal" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Usuario *</label>
              <select v-model="formVet.usuario_id" class="form-input" required>
                <option value="">Selecciona un usuario</option>
                <option v-for="user in usuariosClientes" :key="user.id" :value="user.id">
                  {{ user.nombre_completo }} ({{ user.email }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Especialidad *</label>
              <select v-model="formVet.especialidad_id" class="form-input" required>
                <option value="">Selecciona una especialidad</option>
                <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">
                  {{ esp.nombre }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Número de licencia</label>
              <input
                v-model="formVet.numero_licencia"
                type="text"
                class="form-input"
                placeholder="Número de licencia"
              />
            </div>
            <div class="form-group">
              <label>Años de experiencia</label>
              <input
                v-model="formVet.anos_experiencia"
                type="number"
                class="form-input"
                placeholder="Años de experiencia"
                min="0"
              />
            </div>
            <div class="form-group">
              <label>Biografía</label>
              <textarea
                v-model="formVet.bio"
                class="form-input textarea"
                placeholder="Biografía profesional"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Estado</label>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="formVet.is_activo"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn btn--outline">Cancelar</button>
            <button @click="guardarVeterinario" class="btn btn--success" :disabled="isProcessing">
              {{ isProcessing ? 'Guardando...' : (editingVet ? 'Actualizar' : 'Crear') }}
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
const rawVeterinarios = ref([])
const selectedActivo = ref('')
const selectedEspecialidad = ref('')

// Listas para filtros y modal
const especialidades = ref([])
const usuariosClientes = ref([])

// Modal
const showModal = ref(false)
const editingVet = ref(null)
const formVet = ref({
  usuario_id: '',
  especialidad_id: '',
  numero_licencia: '',
  anos_experiencia: null,
  bio: '',
  is_activo: true
})

// Handlers
const handleActivoChange = (event) => {
  selectedActivo.value = event.target.value
}

const handleEspecialidadChange = (event) => {
  selectedEspecialidad.value = event.target.value
}

// Veterinarios filtrados
const filteredVeterinarios = computed(() => {
  return rawVeterinarios.value.filter(vet => {
    const matchActivo = selectedActivo.value === '' ||
      (selectedActivo.value === 'true' && vet.is_activo) ||
      (selectedActivo.value === 'false' && !vet.is_activo)
    const matchEspecialidad = !selectedEspecialidad.value || vet.especialidad_id == selectedEspecialidad.value
    return matchActivo && matchEspecialidad
  })
})

// Cargar datos
// Cargar datos
const loadVeterinarios = async () => {
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

    // 2. Cargar usuarios con rol cliente (para asignar como veterinarios)
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, email')
      .eq('rol', 'cliente')
      .eq('is_activo', true)

    if (usuariosError) throw new Error('Error al cargar usuarios')
    usuariosClientes.value = usuariosData

    // 3. Cargar veterinarios con relaciones
    const { data: vetsData, error: vetsError } = await supabase
      .from('veterinarios')
      .select(`
        id,
        usuario_id,
        especialidad_id,
        numero_licencia,
        anos_experiencia,
        bio,
        is_activo,
        especialidades (nombre)
      `)
      .order('id', { ascending: false })

    if (vetsError) {
      console.error('Error al cargar veterinarios:', vetsError)
      throw new Error('Error al cargar veterinarios')
    }

    // 4. Obtener nombres de usuarios
    const usuarioIds = vetsData.map(v => v.usuario_id)
    const usuariosMap = {}
    if (usuarioIds.length > 0) {
      const { data: usuariosVets, error: usuariosVetsError } = await supabase
        .from('usuarios')
        .select('id, nombre_completo, email')
        .in('id', usuarioIds)

      if (usuariosVetsError) throw new Error('Error al cargar datos de usuarios')
      usuariosVets.forEach(u => {
        usuariosMap[u.id] = { nombre: u.nombre_completo, email: u.email }
      })
    }

    // 5. Combinar datos (corregido para leer bien la especialidad)
    rawVeterinarios.value = vetsData.map(vet => ({
      ...vet,
      nombre_completo: usuariosMap[vet.usuario_id]?.nombre || '—',
      email: usuariosMap[vet.usuario_id]?.email || '—',
      especialidad_nombre: vet.especialidades?.nombre || '—' // ✅ CORREGIDO
    }))

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar veterinarios. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Abrir modal crear
const openCrearModal = () => {
  editingVet.value = null
  formVet.value = {
    usuario_id: '',
    especialidad_id: '',
    numero_licencia: '',
    anos_experiencia: null,
    bio: '',
    is_activo: true
  }
  showModal.value = true
}

// Editar veterinario
const editarVeterinario = (vet) => {
  editingVet.value = vet
  formVet.value = { ...vet }
  showModal.value = true
}

// Cerrar modal
const closeModal = () => {
  showModal.value = false
  editingVet.value = null
}

// Guardar veterinario
const guardarVeterinario = async () => {
  if (isProcessing.value) return
  if (!formVet.value.usuario_id || !formVet.value.especialidad_id) {
    alert('Selecciona un usuario y una especialidad')
    return
  }
  isProcessing.value = true

  try {
    let result
    if (editingVet.value) {
      // Actualizar
      const { error: updateError } = await supabase
        .from('veterinarios')
        .update({
          especialidad_id: formVet.value.especialidad_id,
          numero_licencia: formVet.value.numero_licencia,
          anos_experiencia: formVet.value.anos_experiencia,
          bio: formVet.value.bio,
          is_activo: formVet.value.is_activo
        })
        .eq('id', editingVet.value.id)

      if (updateError) throw updateError
    } else {
      // Crear
      const { error: insertError } = await supabase
        .from('veterinarios')
        .insert([{
          usuario_id: formVet.value.usuario_id,
          especialidad_id: formVet.value.especialidad_id,
          numero_licencia: formVet.value.numero_licencia,
          anos_experiencia: formVet.value.anos_experiencia,
          bio: formVet.value.bio,
          is_activo: formVet.value.is_activo
        }])

      if (insertError) throw insertError

      // Actualizar rol del usuario a 'veterinario'
      const { error: updateRolError } = await supabase
        .from('usuarios')
        .update({ rol: 'veterinario' })
        .eq('id', formVet.value.usuario_id)

      if (updateRolError) throw updateRolError
    }

    await loadVeterinarios()
    closeModal()
    alert(editingVet.value ? 'Veterinario actualizado correctamente' : 'Veterinario creado correctamente')

  } catch (err) {
    console.error('Error al guardar veterinario:', err)
    alert('Error al guardar el veterinario. Verifica los datos.')
  } finally {
    isProcessing.value = false
  }
}

// Toggle estado
const toggleEstado = async (vet) => {
  if (!confirm(`¿${vet.is_activo ? 'Desactivar' : 'Activar'} a ${vet.nombre_completo}?`)) return

  try {
    const { error: updateError } = await supabase
      .from('veterinarios')
      .update({ is_activo: !vet.is_activo })
      .eq('id', vet.id)

    if (updateError) throw updateError
    await loadVeterinarios()
  } catch (err) {
    console.error('Error al cambiar estado:', err)
    alert('Error al cambiar el estado del veterinario')
  }
}

onMounted(() => {
  loadVeterinarios()
})
</script>

<style scoped>
/* Estilos coherentes con el dashboard admin */
.veterinarios-admin-container {
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

.veterinarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.veterinario-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.veterinario-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.veterinario-nombre {
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
  min-width: 100px;
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
  .veterinarios-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .veterinario-card {
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
