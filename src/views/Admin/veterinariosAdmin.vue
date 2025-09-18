<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const veterinarios = ref([])
const especialidades = ref([])
const loading = ref(false)
const editingVet = ref(null)
const showEditModal = ref(false)
const notification = ref({ message: '', type: '', visible: false })

const formData = ref({
  especialidad_id: '',
  numero_licencia: '',
  anos_experiencia: 0,
  bio: '',
  foto_url: '',
  is_activo: true
})

const fetchVeterinarios = async () => {
  loading.value = true
  try {
    // 1. Cargar veterinarios
    const {  vets, error: vetError } = await supabase
      .from('veterinarios')
      .select('id, usuario_id, especialidad_id, numero_licencia, anos_experiencia, bio, foto_url, is_activo, creado_en')
      .order('creado_en', { ascending: false })
      .limit(100)

    if (vetError) throw vetError

    const veterinariosList = vets || []

    // 2. Cargar especialidades
    const espIds = veterinariosList.length > 0
      ? [...new Set(veterinariosList.map(v => v.especialidad_id))]
      : []

    const {  espData, espError } = await supabase
      .from('especialidades')
      .select('id, nombre')
      .in('id', espIds)
      .eq('is_activa', true)

    if (espError) throw espError

    const espMap = {}
    espData?.forEach(e => { espMap[e.id] = e })

    // 3. Cargar usuarios
    const userIds = veterinariosList.length > 0
      ? [...new Set(veterinariosList.map(v => v.usuario_id))]
      : []

    const {  userData, userError } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, email')
      .in('id', userIds)

    if (userError) throw userError

    const userMap = {}
    userData?.forEach(u => { userMap[u.id] = u })

    // 4. Combinar datos
    veterinarios.value = veterinariosList.map(vet => ({
      ...vet,
      especialidad: espMap[vet.especialidad_id] || { nombre: 'Sin especialidad' },
      usuario: userMap[vet.usuario_id] || { nombre_completo: 'Usuario no encontrado', email: '' }
    }))

    // ✅ DEBUG: Ver qué hay en veterinarios.value
    console.log('🔍 Veterinarios cargados:', veterinarios.value)

    // 5. Cargar especialidades para el select
    const {  allEsp, allEspError } = await supabase
      .from('especialidades')
      .select('id, nombre')
      .eq('is_activa', true)
      .order('nombre')

    if (!allEspError) {
      especialidades.value = allEsp || []
    }

    showNotification('✅ Veterinarios cargados correctamente', 'success')

  } catch (err) {
    console.error('❌ Error al cargar veterinarios:', err.message)
    showNotification('⚠️ Error al cargar veterinarios', 'error')
  } finally {
    loading.value = false
  }
}

const openEditModal = (vet) => {
  editingVet.value = vet
  formData.value = {
    especialidad_id: vet.especialidad_id,
    numero_licencia: vet.numero_licencia || '',
    anos_experiencia: vet.anos_experiencia || 0,
    bio: vet.bio || '',
    foto_url: vet.foto_url || '',
    is_activo: vet.is_activo
  }
  showEditModal.value = true
}

const saveVet = async () => {
  if (!editingVet.value) return
  try {
    const { error } = await supabase
      .from('veterinarios')
      .update({
        ...formData.value,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', editingVet.value.id)
    if (error) throw error
    showNotification('✅ Veterinario actualizado', 'success')
    showEditModal.value = false
    fetchVeterinarios()
  } catch (err) {
    console.error('❌ Error al guardar:', err.message)
    showNotification('❌ Error al guardar', 'error')
  }
}

const toggleVetStatus = async (vet) => {
  const action = vet.is_activo ? 'desactivar' : 'reactivar'
  const message = `¿Deseas ${action} al Dr. ${vet.usuario.nombre_completo}? ${
    vet.is_activo ? 'No podrá atender citas.' : 'Podrá atender citas nuevamente.'
  }`

  if (!confirm(message)) return

  try {
    const { error } = await supabase
      .from('veterinarios')
      .update({
        is_activo: !vet.is_activo,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', vet.id)
    if (error) throw error

    showNotification(
      action === 'desactivar' ? '🚫 Veterinario desactivado' : '🟢 Veterinario reactivado',
      action === 'desactivar' ? 'warning' : 'success'
    )
    fetchVeterinarios()
  } catch (err) {
    console.error('❌ Error al cambiar estado:', err.message)
    showNotification('❌ Error al cambiar estado', 'error')
  }
}

const showNotification = (message, type) => {
  notification.value = { message, type, visible: true }
  setTimeout(() => { notification.value.visible = false }, 3000)
}

onMounted(() => { fetchVeterinarios() })
</script>

<template>
  <div class="admin-container">
    <!-- Notificación -->
    <div v-if="notification.visible" :class="`notification ${notification.type}`">
      {{ notification.message }}
    </div>

    <!-- Encabezado -->
    <div class="page-header">
      <h1>🩺 Gestión de Veterinarios</h1>
      <p class="subtitle">Administra perfiles, especialidades y estado de los profesionales.</p>
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando lista de veterinarios...</p>
    </div>

    <!-- Lista de veterinarios -->
    <div v-else class="users-grid">
      <!-- ✅ Mensaje si no hay veterinarios -->
      <div v-if="veterinarios.length === 0" class="no-data">
        🚫 No hay veterinarios registrados. Agrega uno desde la consola de Supabase.
      </div>

      <!-- ✅ Lista de veterinarios -->
      <div
        v-for="vet in veterinarios"
        :key="vet.id"
        class="user-card"
        :class="{ 'inactive': !vet.is_activo }"
      >
        <div class="user-initial">
          {{ vet.usuario?.nombre_completo?.charAt(0).toUpperCase() || 'V' }}
        </div>
        <div class="user-details">
          <h3 class="user-name">{{ vet.usuario?.nombre_completo || 'Nombre no disponible' }}</h3>
          <p class="user-email">{{ vet.usuario?.email || 'Email no disponible' }}</p>
          <div class="user-meta">
            <span class="badge" v-if="vet.especialidad">
              {{ vet.especialidad.nombre || 'Sin especialidad' }}
            </span>
            <span v-if="!vet.is_activo" class="badge badge-inactive">Inactivo</span>
          </div>
          <p class="user-license">🆔 Lic: {{ vet.numero_licencia || 'No asignada' }}</p>
          <p class="user-exp">🎓 {{ vet.anos_experiencia || 0 }} años</p>
        </div>
        <div class="user-actions">
          <button @click="openEditModal(vet)" class="btn-icon" title="Editar veterinario">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button
            @click="toggleVetStatus(vet)"
            class="btn-toggle"
            :class="{ 'active': vet.is_activo }"
            :title="vet.is_activo ? 'Desactivar veterinario' : 'Reactivar veterinario'"
          >
            <span v-if="vet.is_activo">🟢 Activo</span>
            <span v-else>🔴 Inactivo</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>✏️ Editar Veterinario</h2>
          <button class="close-btn" @click="showEditModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label>Especialidad</label>
            <div class="select-wrapper">
              <select v-model="formData.especialidad_id" class="fancy-select">
                <option value="">Seleccionar especialidad</option>
                <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">
                  {{ esp.nombre }}
                </option>
              </select>
              <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          <div class="form-row">
            <label>Número de Licencia</label>
            <input v-model="formData.numero_licencia" type="text" />
          </div>
          <div class="form-row">
            <label>Años de Experiencia</label>
            <input v-model="formData.anos_experiencia" type="number" min="0" />
          </div>
          <div class="form-row">
            <label>Biografía</label>
            <textarea v-model="formData.bio" rows="3" placeholder="Descripción profesional..."></textarea>
          </div>
          <div class="form-row">
            <label>URL de Foto</label>
            <input v-model="formData.foto_url" type="url" placeholder="https://ejemplo.com/foto.jpg" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showEditModal = false">Cancelar</button>
          <button class="btn-primary" @click="saveVet">Guardar Cambios</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ✅ ESTILOS COPIADOS DIRECTAMENTE DE TU usuarioAdmin.vue - SIN CAMBIOS */
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #03252b 0%, #0a4a56 100%);
  padding: 2rem;
  color: #e0f7fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-left: calc(2rem + 80px);
  transition: padding-left 0.3s ease;
}

@media (min-width: 1024px) {
  .admin-container {
    padding-left: calc(2rem + 260px);
  }
}

@media (max-width: 1023px) and (min-width: 769px) {
  .admin-container {
    padding-left: calc(2rem + 80px);
  }
}

@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
    padding-left: 1rem;
  }
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #80deea, #4dd0e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.subtitle {
  text-align: center;
  font-size: 1rem;
  opacity: 0.85;
  margin: 0 0 2.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 0;
  color: #b2ebf2;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(128, 222, 234, 0.3);
  border-top: 3px solid #4dd0e1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.user-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(77, 208, 225, 0.15);
  transition: all 0.25s ease;
}

.user-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.08);
}

.inactive {
  opacity: 0.6;
  background: rgba(100, 100, 100, 0.08);
}

.user-initial {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(77, 208, 225, 0.2);
  border: 2px solid #4dd0e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: #4dd0e1;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: #b2ebf2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-license,
.user-exp {
  font-size: 0.85rem;
  color: #80deea;
  margin: 0.25rem 0;
}

.user-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-inactive { background: rgba(176, 190, 197, 0.2); color: #b0bec5; }

.user-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #80deea;
}

.btn-icon:hover {
  background: rgba(128, 222, 234, 0.2);
  transform: scale(1.05);
}

.btn-toggle {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-toggle.active {
  background: rgba(165, 214, 167, 0.2);
  color: #a5d6a7;
}

.btn-toggle:not(.active) {
  background: rgba(255, 138, 128, 0.2);
  color: #ff8a80;
}

.btn-toggle:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: #0a4a56;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(77, 208, 225, 0.3);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #ffffff;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row label {
  font-weight: 600;
  color: #b2ebf2;
  font-size: 0.9rem;
}

.form-row input,
.form-row textarea {
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(77, 208, 225, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 1rem;
  transition: border 0.2s;
}

.form-row input:focus,
.form-row textarea:focus {
  outline: none;
  border-color: #80deea;
  box-shadow: 0 0 0 2px rgba(128, 222, 234, 0.2);
}

.form-row textarea {
  resize: vertical;
  min-height: 80px;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.fancy-select {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(77, 208, 225, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 1rem;
  appearance: none;
  cursor: pointer;
  transition: border 0.2s;
}

.fancy-select option {
  color: #0a4a56;
  background-color: #ffffff;
}

.fancy-select:focus {
  outline: none;
  border-color: #80deea;
  box-shadow: 0 0 0 2px rgba(128, 222, 234, 0.2);
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #80deea;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #4dd0e1, #80deea);
  color: #0277bd;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(77, 208, 225, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.notification {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

.notification.success { background: rgba(165, 214, 167, 0.9); color: #1b5e20; }
.notification.error { background: rgba(255, 138, 128, 0.9); color: #b71c1c; }
.notification.warning { background: rgba(255, 204, 128, 0.9); color: #ef6c00; }

@keyframes slideIn {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ✅ Nuevo estilo: Mensaje "No hay datos" */
.no-data {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 1rem;
  font-size: 1.2rem;
  color: #ff8a80;
  background: rgba(255, 138, 128, 0.1);
  border-radius: 16px;
  border: 1px dashed rgba(255, 138, 128, 0.3);
}

@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
  }

  .users-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .user-card {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .user-actions {
    flex-direction: row;
    justify-content: center;
    margin-left: 0;
    margin-top: 1rem;
  }

  .modal {
    padding: 1.5rem;
    margin: 1rem;
  }
}
</style>