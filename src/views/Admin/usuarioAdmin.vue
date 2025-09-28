<template>
  <div class="usuarios-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Usuarios</h1>
        <p class="subtitle">Gestiona todos los usuarios del sistema.</p>
        <button @click="openCrearModal" class="btn btn--success">+ Nuevo Usuario</button>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-item">
          <label for="filter-rol" class="filter-label">Rol</label>
          <select
            id="filter-rol"
            :value="selectedRol"
            @change="handleRolChange"
            class="status-select"
          >
            <option value="">Todos</option>
            <option value="cliente">Cliente</option>
            <option value="veterinario">Veterinario</option>
            <option value="admin">Admin</option>
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
          <label for="filter-fecha" class="filter-label">Registrado desde</label>
          <input
            id="filter-fecha"
            type="date"
            :value="selectedFecha"
            @input="handleFechaInput"
            class="date-input"
          />
        </div>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadUsuarios" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredUsuarios.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" />
            <path d="M20 21C20 19.3431 18.6569 18 17 18H7C5.34315 18 4 19.3431 4 21" />
          </svg>
          <p>No hay usuarios que coincidan con los filtros.</p>
        </div>

        <div v-else class="usuarios-grid">
          <div
            v-for="usuario in filteredUsuarios"
            :key="usuario.id"
            class="usuario-card"
          >
            <div class="card-header">
              <h3 class="usuario-nombre">{{ usuario.nombre_completo }}</h3>
              <span class="badge" :class="`badge--${usuario.rol}`">
                {{ getRolLabel(usuario.rol) }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">{{ usuario.email || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Teléfono:</span>
                <span class="value">{{ usuario.telefono || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Estado:</span>
                <span class="value">
                  <span class="estado-indicator" :class="{ 'activo': usuario.is_activo }"></span>
                  {{ usuario.is_activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <div class="info-row">
                <span class="label">Registrado:</span>
                <span class="value">{{ formatDate(usuario.fecha_registro) }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button @click="editarUsuario(usuario)" class="btn btn--outline">Editar</button>
              <button
                @click="toggleEstado(usuario)"
                class="btn"
                :class="usuario.is_activo ? 'btn--danger' : 'btn--success'"
              >
                {{ usuario.is_activo ? 'Desactivar' : 'Activar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingUser ? 'Editar Usuario' : 'Crear Usuario' }}</h2>
            <button @click="closeModal" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre completo *</label>
              <input
                v-model="formUsuario.nombre_completo"
                type="text"
                class="form-input"
                placeholder="Nombre completo"
                required
              />
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input
                v-model="formUsuario.email"
                type="email"
                class="form-input"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            <div class="form-group">
              <label>Rol *</label>
              <select v-model="formUsuario.rol" class="form-input" required>
                <option value="cliente">Cliente</option>
                <option value="veterinario">Veterinario</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input
                v-model="formUsuario.telefono"
                type="text"
                class="form-input"
                placeholder="Teléfono"
              />
            </div>
            <div class="form-group">
              <label>Estado</label>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="formUsuario.is_activo"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn btn--outline">Cancelar</button>
            <button @click="guardarUsuario" class="btn btn--success" :disabled="isProcessing">
              {{ isProcessing ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear') }}
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
const rawUsuarios = ref([])
const selectedRol = ref('')
const selectedActivo = ref('')
const selectedFecha = ref('')

// Modal
const showModal = ref(false)
const editingUser = ref(null)
const formUsuario = ref({
  nombre_completo: '',
  email: '',
  rol: 'cliente',
  telefono: '',
  is_activo: true
})

// Handlers
const handleRolChange = (event) => {
  selectedRol.value = event.target.value
}

const handleActivoChange = (event) => {
  selectedActivo.value = event.target.value
}

const handleFechaInput = (event) => {
  selectedFecha.value = event.target.value
}

// Usuarios filtrados
const filteredUsuarios = computed(() => {
  return rawUsuarios.value.filter(usuario => {
    const matchRol = !selectedRol.value || usuario.rol === selectedRol.value
    const matchActivo = selectedActivo.value === '' ||
      (selectedActivo.value === 'true' && usuario.is_activo) ||
      (selectedActivo.value === 'false' && !usuario.is_activo)
    const matchFecha = !selectedFecha.value ||
      new Date(usuario.fecha_registro) >= new Date(selectedFecha.value)
    return matchRol && matchActivo && matchFecha
  })
})

// Formateo
const getRolLabel = (rol) => {
  const labels = { cliente: 'Cliente', veterinario: 'Veterinario', admin: 'Admin' }
  return labels[rol] || rol
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Cargar usuarios
const loadUsuarios = async () => {
  isLoading.value = true
  error.value = null

  try {
    const { data, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, email, telefono, rol, is_activo, fecha_registro')
      .order('fecha_registro', { ascending: false })

    if (usuariosError) {
      console.error('Error al cargar usuarios:', usuariosError)
      throw new Error('Error al cargar usuarios')
    }

    rawUsuarios.value = data

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar usuarios. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Abrir modal crear
const openCrearModal = () => {
  editingUser.value = null
  formUsuario.value = {
    nombre_completo: '',
    email: '',
    rol: 'cliente',
    telefono: '',
    is_activo: true
  }
  showModal.value = true
}

// Editar usuario
const editarUsuario = (usuario) => {
  editingUser.value = usuario
  formUsuario.value = { ...usuario }
  showModal.value = true
}

// Cerrar modal
const closeModal = () => {
  showModal.value = false
  editingUser.value = null
}

// Guardar usuario
const guardarUsuario = async () => {
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    let result
    if (editingUser.value) {
      // Actualizar
      const { error: updateError } = await supabase
        .from('usuarios')
        .update(formUsuario.value)
        .eq('id', editingUser.value.id)

      if (updateError) throw updateError
    } else {
      // Crear
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert([formUsuario.value])

      if (insertError) throw insertError
    }

    await loadUsuarios()
    closeModal()
    alert(editingUser.value ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente')

  } catch (err) {
    console.error('Error al guardar usuario:', err)
    alert('Error al guardar el usuario. Verifica que el email no esté duplicado.')
  } finally {
    isProcessing.value = false
  }
}

// Toggle estado
const toggleEstado = async (usuario) => {
  if (!confirm(`¿${usuario.is_activo ? 'Desactivar' : 'Activar'} a ${usuario.nombre_completo}?`)) return

  try {
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ is_activo: !usuario.is_activo })
      .eq('id', usuario.id)

    if (updateError) throw updateError
    await loadUsuarios()
  } catch (err) {
    console.error('Error al cambiar estado:', err)
    alert('Error al cambiar el estado del usuario')
  }
}

onMounted(() => {
  loadUsuarios()
})
</script>

<style scoped>
/* Estilos coherentes con el dashboard admin */
.usuarios-admin-container {
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

.usuarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.usuario-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.usuario-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.usuario-nombre {
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

.badge--cliente { background: #dbeafe; color: #1d4ed8; }
.badge--veterinario { background: #dcfce7; color: #166534; }
.badge--admin { background: #ede9fe; color: #7c3aed; }

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

.estado-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc2626;
  margin-right: 0.5rem;
}

.estado-indicator.activo {
  background: #16a34a;
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
  .usuarios-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .usuario-card {
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
