<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const veterinarios = ref([])
const especialidades = ref([])
const usuariosVet = ref([])
const loading = ref(false)
const editingVet = ref(null)
const showEditModal = ref(false)
const showCreateModal = ref(false)
const showCreateUserVetModal = ref(false)
const notification = ref({ message: '', type: '', visible: false })

// Formularios
const createForm = ref({
  usuario_id: '',
  especialidad_id: '',
  numero_licencia: '',
  anos_experiencia: 0,
  bio: '',
  foto_url: '',
  is_activo: true
})

const formData = ref({
  especialidad_id: '',
  numero_licencia: '',
  anos_experiencia: 0,
  bio: '',
  foto_url: '',
  is_activo: true
})

const createUserVetForm = ref({
  nombre_completo: '',
  email: '',
  password: '',
  especialidad_id: '',
  numero_licencia: '',
  anos_experiencia: 0,
  bio: '',
  foto_url: ''
})

// Estados de validación
const createErrors = ref({})
const editErrors = ref({})
const createUserVetErrors = ref({})

// Filtros de búsqueda
const searchUsuario = ref('')
const searchEspecialidad = ref('')

const filteredUsuarios = computed(() => {
  if (!searchUsuario.value) return usuariosVet.value
  return usuariosVet.value.filter(u =>
    u.nombre_completo.toLowerCase().includes(searchUsuario.value.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsuario.value.toLowerCase())
  )
})

const filteredEspecialidades = computed(() => {
  if (!searchEspecialidad.value) return especialidades.value
  return especialidades.value.filter(e =>
    e.nombre.toLowerCase().includes(searchEspecialidad.value.toLowerCase())
  )
})

const fetchEspecialidades = async () => {
  try {
    const { data, error } = await supabase
      .from('especialidades')
      .select('id, nombre')
      .eq('is_activa', true)
      .order('nombre')

    console.log('🔍 Especialidades cargadas:', data)

    if (error) throw error
    especialidades.value = data || []
  } catch (err) {
    console.error('❌ Error al cargar especialidades:', err.message)
    especialidades.value = []
  }
}

// Cargar datos
const fetchVeterinarios = async () => {
  loading.value = true
  try {
    const { data: vets, error: vetError } = await supabase
      .from('veterinarios')
      .select('id, usuario_id, especialidad_id, numero_licencia, anos_experiencia, bio, foto_url, is_activo, creado_en')
      .order('creado_en', { ascending: false })

    if (vetError) throw vetError

    const veterinariosList = vets || []

    // Cargar especialidades
    await fetchEspecialidades()

    const espIds = [...new Set(veterinariosList.map(v => v.especialidad_id).filter(Boolean))]
    const { data: espData } = await supabase
      .from('especialidades')
      .select('id, nombre')
      .in('id', espIds.length ? espIds : [0])
      .eq('is_activa', true)

    const espMap = Object.fromEntries(espData?.map(e => [e.id, e]) || [])

    // Cargar usuarios
    const userIds = [...new Set(veterinariosList.map(v => v.usuario_id))]
    const { data: userData } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, email')
      .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000'])

    const userMap = Object.fromEntries(userData?.map(u => [u.id, u]) || [])

    veterinarios.value = veterinariosList.map(vet => ({
      ...vet,
      especialidad: espMap[vet.especialidad_id] || { nombre: 'Sin asignar' },
      usuario: userMap[vet.usuario_id] || { nombre_completo: 'Desconocido', email: '' }
    }))

    await fetchUsuariosVetDisponibles()
    showNotification('✅ Veterinarios cargados', 'success')
  } catch (err) {
    console.error('Error:', err.message)
    showNotification('⚠️ Error al cargar', 'error')
  } finally {
    loading.value = false
  }
}

const fetchUsuariosVetDisponibles = async () => {
  try {
    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, email')
      .eq('rol', 'veterinario')
      .eq('is_activo', true)

    const { data: vetsExistentes } = await supabase
      .from('veterinarios')
      .select('usuario_id')

    const vetIds = vetsExistentes?.map(v => v.usuario_id) || []
    usuariosVet.value = usuarios?.filter(u => !vetIds.includes(u.id)) || []
  } catch (err) {
    console.error('Error:', err.message)
    usuariosVet.value = []
  }
}

// Validación
const validateCreate = () => {
  createErrors.value = {}
  if (!createForm.value.usuario_id) createErrors.value.usuario_id = 'Requerido'
  if (!createForm.value.especialidad_id) createErrors.value.especialidad_id = 'Requerido'
}

const validateEdit = () => {
  editErrors.value = {}
  if (!formData.value.especialidad_id) editErrors.value.especialidad_id = 'Requerido'
}

const validateCreateUserVet = () => {
  createUserVetErrors.value = {}
  if (!createUserVetForm.value.nombre_completo) createUserVetErrors.value.nombre_completo = 'Requerido'
  if (!createUserVetForm.value.email) createUserVetErrors.value.email = 'Requerido'
  if (!createUserVetForm.value.password) createUserVetErrors.value.password = 'Requerido'
  if (!createUserVetForm.value.especialidad_id) createUserVetErrors.value.especialidad_id = 'Requerido'
}

// Acciones
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

const openCreateModal = () => {
  createForm.value = { usuario_id: '', especialidad_id: '', numero_licencia: '', anos_experiencia: 0, bio: '', foto_url: '', is_activo: true }
  searchUsuario.value = ''
  searchEspecialidad.value = ''
  showCreateModal.value = true
  fetchUsuariosVetDisponibles()
  fetchEspecialidades()
}

const openCreateUserVetModal = () => {
  createUserVetForm.value = { nombre_completo: '', email: '', password: '', especialidad_id: '', numero_licencia: '', anos_experiencia: 0, bio: '', foto_url: '' }
  searchEspecialidad.value = ''
  showCreateUserVetModal.value = true
  fetchEspecialidades()
}

const saveVet = async () => {
  validateEdit()
  if (Object.keys(editErrors.value).length > 0) return

  try {
    const { error } = await supabase
      .from('veterinarios')
      .update({
        ...formData.value,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', editingVet.value.id)

    if (error) throw error
    showNotification('✅ Actualizado', 'success')
    showEditModal.value = false
    fetchVeterinarios()
  } catch (err) {
    showNotification('❌ Error al guardar', 'error')
  }
}

const createVet = async () => {
  validateCreate()
  if (Object.keys(createErrors.value).length > 0) return

  try {
    const { error } = await supabase
      .from('veterinarios')
      .insert({
        ...createForm.value,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })

    if (error) {
      if (error.code === '23505') {
        showNotification('⚠️ Ya existe perfil para este usuario', 'error')
      } else {
        throw error
      }
      return
    }

    showNotification('✅ Veterinario creado', 'success')
    showCreateModal.value = false
    fetchVeterinarios()
  } catch (err) {
    showNotification('❌ Error al crear', 'error')
  }
}

const createUsuarioVeterinario = async () => {
  validateCreateUserVet()
  if (Object.keys(createUserVetErrors.value).length > 0) return

  try {
    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: createUserVetForm.value.email,
      password: createUserVetForm.value.password,
      options: {
        data: {
          nombre_completo: createUserVetForm.value.nombre_completo
        }
      }
    })

    if (authError) throw authError
    if (!authData?.user) throw new Error('No se creó el usuario')

    // 2. Insertar en tabla usuarios
    const { error: userError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nombre_completo: createUserVetForm.value.nombre_completo,
        email: createUserVetForm.value.email,
        rol: 'veterinario',
        is_activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })

    if (userError) throw userError

    // 3. Crear perfil de veterinario
    const { error: vetError } = await supabase
      .from('veterinarios')
      .insert({
        usuario_id: authData.user.id,
        especialidad_id: createUserVetForm.value.especialidad_id,
        numero_licencia: createUserVetForm.value.numero_licencia || null,
        anos_experiencia: createUserVetForm.value.anos_experiencia || 0,
        bio: createUserVetForm.value.bio || null,
        foto_url: createUserVetForm.value.foto_url || null,
        is_activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })

    if (vetError) throw vetError

    showNotification('✅ Usuario y perfil creados', 'success')
    showCreateUserVetModal.value = false
    fetchVeterinarios()
  } catch (err) {
    console.error('Error completo:', err)
    showNotification('❌ Error al crear usuario', 'error')
  }
}

const toggleVetStatus = async (vet) => {
  if (!confirm(`¿${vet.is_activo ? 'Desactivar' : 'Activar'} a ${vet.usuario.nombre_completo}?`)) return

  try {
    const { error } = await supabase
      .from('veterinarios')
      .update({
        is_activo: !vet.is_activo,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', vet.id)

    if (error) throw error
    showNotification(vet.is_activo ? '🚫 Desactivado' : '🟢 Activado', vet.is_activo ? 'warning' : 'success')
    fetchVeterinarios()
  } catch (err) {
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

    <!-- Header -->
    <div class="page-header">
      <h1>🩺 Veterinarios</h1>
      <p class="subtitle">Gestiona perfiles profesionales</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- Lista -->
    <div v-else>
      <div v-if="veterinarios.length === 0" class="empty-state">
        <div>🩺 No hay veterinarios registrados</div>
      </div>

      <div class="grid">
        <div
          v-for="vet in veterinarios"
          :key="vet.id"
          class="card"
          :class="{ inactive: !vet.is_activo }"
        >
          <div class="card-header">
            <div class="avatar">{{ vet.usuario.nombre_completo.charAt(0).toUpperCase() }}</div>
            <div class="status" :class="{ active: vet.is_activo }"></div>
          </div>
          <div class="card-body">
            <h3 class="name">{{ vet.usuario.nombre_completo }}</h3>
            <p class="email">{{ vet.usuario.email }}</p>
            <div class="meta">
              <span class="badge">{{ vet.especialidad.nombre }}</span>
              <span v-if="vet.numero_licencia" class="licencia">Lic: {{ vet.numero_licencia }}</span>
            </div>
            <p class="exp">{{ vet.anos_experiencia }} años de experiencia</p>
          </div>
          <div class="card-footer">
            <button @click="openEditModal(vet)" class="btn-icon" title="Editar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
            <button
              @click="toggleVetStatus(vet)"
              class="btn-toggle"
              :class="{ active: vet.is_activo }"
              :title="vet.is_activo ? 'Desactivar' : 'Activar'"
            >
              {{ vet.is_activo ? '🟢' : '🔴' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón flotante de acción -->
    <div class="fab-container">
      <button class="fab" @click="showCreateModal = true" title="Asignar a usuario existente">➕</button>
      <button class="fab secondary" @click="showCreateUserVetModal = true" title="Crear nuevo usuario + perfil">🧑‍⚕️</button>
    </div>

    <!-- Modal: Editar -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>✏️ Editar Veterinario</h2>
          <button @click="showEditModal = false" class="close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Especialidad</label>
            <div class="select-wrapper">
              <select v-model="formData.especialidad_id" @blur="validateEdit" class="fancy-select" :class="{ error: editErrors.especialidad_id }">
                <option value="">Seleccionar</option>
                <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">{{ esp.nombre }}</option>
              </select>
              <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div v-if="editErrors.especialidad_id" class="error-text">{{ editErrors.especialidad_id }}</div>
          </div>
          <div class="form-group">
            <label>Licencia</label>
            <input v-model="formData.numero_licencia" class="input" placeholder="Número de licencia">
          </div>
          <div class="form-group">
            <label>Años de experiencia</label>
            <input v-model.number="formData.anos_experiencia" type="number" min="0" class="input">
          </div>
          <div class="form-group">
            <label>Biografía</label>
            <textarea v-model="formData.bio" class="input textarea" placeholder="Breve descripción..."></textarea>
          </div>
          <div class="form-group">
            <label>URL de foto</label>
            <input v-model="formData.foto_url" type="url" class="input" placeholder="https://ejemplo.com/foto.jpg">
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showEditModal = false" class="btn-secondary">Cancelar</button>
          <button @click="saveVet" class="btn-primary">Guardar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Crear (asignar a usuario existente) -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>➕ Asignar Perfil</h2>
          <button @click="showCreateModal = false" class="close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Usuario</label>
            <input v-model="searchUsuario" class="input" placeholder="Buscar usuario..." @input="validateCreate">
            <div class="select-wrapper">
              <select v-model="createForm.usuario_id" @blur="validateCreate" class="fancy-select" :class="{ error: createErrors.usuario_id }">
                <option value="">Seleccionar</option>
                <option v-for="user in filteredUsuarios" :key="user.id" :value="user.id">
                  {{ user.nombre_completo }} ({{ user.email }})
                </option>
              </select>
              <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div v-if="createErrors.usuario_id" class="error-text">{{ createErrors.usuario_id }}</div>
          </div>
          <div class="form-group">
            <label>Especialidad</label>
            <input v-model="searchEspecialidad" class="input" placeholder="Buscar especialidad..." @input="validateCreate">
            <div class="select-wrapper">
              <select v-model="createForm.especialidad_id" @blur="validateCreate" class="fancy-select" :class="{ error: createErrors.especialidad_id }">
                <option value="">Seleccionar</option>
                <option v-for="esp in filteredEspecialidades" :key="esp.id" :value="esp.id">{{ esp.nombre }}</option>
              </select>
              <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div v-if="createErrors.especialidad_id" class="error-text">{{ createErrors.especialidad_id }}</div>
          </div>
          <div class="form-group">
            <label>Licencia</label>
            <input v-model="createForm.numero_licencia" class="input" placeholder="Número de licencia">
          </div>
          <div class="form-group">
            <label>Años de experiencia</label>
            <input v-model.number="createForm.anos_experiencia" type="number" min="0" class="input">
          </div>
          <div class="form-group">
            <label>Biografía</label>
            <textarea v-model="createForm.bio" class="input textarea" placeholder="Breve descripción..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCreateModal = false" class="btn-secondary">Cancelar</button>
          <button @click="createVet" class="btn-primary">Crear Perfil</button>
        </div>
      </div>
    </div>

    <!-- Modal: Crear Usuario + Veterinario -->
    <div v-if="showCreateUserVetModal" class="modal-overlay" @click.self="showCreateUserVetModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>🧑‍⚕️ Nuevo Veterinario</h2>
          <button @click="showCreateUserVetModal = false" class="close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre completo</label>
            <input v-model="createUserVetForm.nombre_completo" @blur="validateCreateUserVet" class="input" :class="{ error: createUserVetErrors.nombre_completo }" placeholder="Nombre y apellido">
            <div v-if="createUserVetErrors.nombre_completo" class="error-text">{{ createUserVetErrors.nombre_completo }}</div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="createUserVetForm.email" @blur="validateCreateUserVet" type="email" class="input" :class="{ error: createUserVetErrors.email }" placeholder="usuario@ejemplo.com">
            <div v-if="createUserVetErrors.email" class="error-text">{{ createUserVetErrors.email }}</div>
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input v-model="createUserVetForm.password" @blur="validateCreateUserVet" type="password" class="input" :class="{ error: createUserVetErrors.password }" placeholder="••••••••">
            <div v-if="createUserVetErrors.password" class="error-text">{{ createUserVetErrors.password }}</div>
          </div>
          <div class="form-group">
            <label>Especialidad</label>
            <input v-model="searchEspecialidad" class="input" placeholder="Buscar especialidad..." @input="validateCreateUserVet">
            <div class="select-wrapper">
              <select v-model="createUserVetForm.especialidad_id" @blur="validateCreateUserVet" class="fancy-select" :class="{ error: createUserVetErrors.especialidad_id }">
                <option value="">Seleccionar</option>
                <option v-for="esp in filteredEspecialidades" :key="esp.id" :value="esp.id">{{ esp.nombre }}</option>
              </select>
              <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div v-if="createUserVetErrors.especialidad_id" class="error-text">{{ createUserVetErrors.especialidad_id }}</div>
          </div>
          <div class="form-group">
            <label>Número de licencia</label>
            <input v-model="createUserVetForm.numero_licencia" class="input" placeholder="Número de licencia">
          </div>
          <div class="form-group">
            <label>Años de experiencia</label>
            <input v-model.number="createUserVetForm.anos_experiencia" type="number" min="0" class="input">
          </div>
          <div class="form-group">
            <label>Biografía</label>
            <textarea v-model="createUserVetForm.bio" class="input textarea" placeholder="Breve descripción profesional..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showCreateUserVetModal = false" class="btn-secondary">Cancelar</button>
          <button @click="createUsuarioVeterinario" class="btn-primary">Crear Usuario + Perfil</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  padding-left: calc(1.5rem + 240px) !important;
  padding-right: 1.5rem;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
}

/* ✅ Estilo para el select */
.select-wrapper {
  position: relative;
  width: 100%;
  overflow: visible;
}

.fancy-select {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(77, 208, 225, 0.3);
  /* Cambia estas dos líneas: */
  background: white; /* Usa un fondo blanco sólido */
  color: #334155; /* Usa un color de texto oscuro y legible */
  font-size: 1rem;
  appearance: none;
  cursor: pointer;
  transition: border 0.2s;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #80deea;
  width: 16px;
  height: 16px;
  z-index: 2;
}

@media (max-width: 768px) {
  .admin-container {
    padding-left: 1rem !important;
    padding-right: 1rem;
  }
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem;
}

.subtitle {
  color: #64748b;
  margin: 0;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #0ea5e9;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
  font-size: 1.1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 1.25rem;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.inactive {
  opacity: 0.6;
  border-color: #fca5a5;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fca5a5;
}

.status.active {
  background: #86efac;
}

.card-body h3.name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem;
}

.card-body .email {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
}

.meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.badge {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.licencia {
  background: #f3f4f6;
  color: #4b5563;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.card-body .exp {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-toggle {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-toggle.active {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #16a34a;
}

.btn-toggle:not(.active) {
  background: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;
}

.fab-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-end;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #0ea5e9;
  color: white;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  cursor: pointer;
  transition: all 0.2s;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
}

.fab.secondary {
  background: #8b5cf6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.fab.secondary:hover {
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close:hover {
  background: #f1f5f9;
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
  font-weight: 500;
  color: #334155;
  font-size: 0.9rem;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border 0.2s;
}

.input:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
}

.input.error {
  border-color: #ef4444;
}

.textarea {
  min-height: 80px;
  resize: vertical;
}

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #0ea5e9;
  color: white;
}

.btn-primary:hover {
  background: #0284c7;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  animation: slideIn 0.3s ease;
}

.notification.success { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
.notification.error { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
.notification.warning { background: #ffedd5; color: #ea580c; border: 1px solid #fed7aa; }

@keyframes slideIn {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card {
    padding: 1rem;
  }

  .fab-container {
    bottom: 1.5rem;
    right: 1.5rem;
  }

  .fab {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  .modal {
    margin: 1rem;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .card-footer {
    justify-content: space-between;
  }

  .btn-toggle {
    font-size: 1rem;
  }
}
</style>