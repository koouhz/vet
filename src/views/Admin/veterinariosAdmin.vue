<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// Estado reactivo
const state = ref({
  veterinarios: [],
  especialidades: [],
  usuariosDisponibles: [],
  loading: false,
  searchTerm: ''
})

const modals = ref({
  edit: { show: false, data: null },
  create: { show: false },
  createUser: { show: false }
})

const forms = ref({
  edit: {},
  create: { usuario_id: '', especialidad_id: '', numero_licencia: '', anos_experiencia: 0, bio: '' },
  createUser: { nombre_completo: '', email: '', password: '', especialidad_id: '', numero_licencia: '', anos_experiencia: 0, bio: '' }
})

const errors = ref({})
const notification = ref({ message: '', type: '', visible: false })

// Computed
const filteredVeterinarios = computed(() => {
  if (!state.value.searchTerm) return state.value.veterinarios
  const term = state.value.searchTerm.toLowerCase()
  return state.value.veterinarios.filter(vet =>
    vet.usuario.nombre_completo.toLowerCase().includes(term) ||
    vet.usuario.email.toLowerCase().includes(term) ||
    vet.especialidad.nombre.toLowerCase().includes(term)
  )
})

// Utilidades
const showNotification = (message, type = 'info') => {
  notification.value = { message, type, visible: true }
  setTimeout(() => { notification.value.visible = false }, 3000)
}

const resetForm = (formName) => {
  errors.value = {}
  if (formName === 'create') {
    forms.value.create = { usuario_id: '', especialidad_id: '', numero_licencia: '', anos_experiencia: 0, bio: '' }
  } else if (formName === 'createUser') {
    forms.value.createUser = { nombre_completo: '', email: '', password: '', especialidad_id: '', numero_licencia: '', anos_experiencia: 0, bio: '' }
  }
}

// Validaciones
const validateForm = (formName) => {
  errors.value = {}
  const form = forms.value[formName]

  if (formName === 'createUser') {
    if (!form.nombre_completo) errors.value.nombre_completo = 'Nombre requerido'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errors.value.email = 'Email válido requerido'
    if (!form.password || form.password.length < 6) errors.value.password = 'Mínimo 6 caracteres'
  }

  if (formName !== 'edit' && !form.usuario_id && formName !== 'createUser') {
    errors.value.usuario_id = 'Usuario requerido'
  }

  if (!form.especialidad_id) errors.value.especialidad_id = 'Especialidad requerida'

  return Object.keys(errors.value).length === 0
}

// Cargar datos
const fetchData = async () => {
  state.value.loading = true
  try {
    const [vetsResponse, especialidadesResponse] = await Promise.all([
      supabase
        .from('veterinarios')
        .select(`
          id, usuario_id, especialidad_id, numero_licencia,
          anos_experiencia, bio, foto_url, is_activo, creado_en,
          usuarios:usuario_id(id, nombre_completo, email),
          especialidades:especialidad_id(id, nombre)
        `)
        .order('creado_en', { ascending: false }),
      supabase
        .from('especialidades')
        .select('id, nombre')
        .eq('is_activa', true)
        .order('nombre')
    ])

    if (vetsResponse.error) throw vetsResponse.error
    if (especialidadesResponse.error) throw especialidadesResponse.error

    state.value.veterinarios = (vetsResponse.data || []).map(vet => ({
      ...vet,
      usuario: vet.usuarios || { nombre_completo: 'Usuario no encontrado', email: '' },
      especialidad: vet.especialidades || { nombre: 'Sin especialidad' }
    }))

    state.value.especialidades = especialidadesResponse.data || []
    await fetchUsuariosDisponibles()

    showNotification('Datos cargados correctamente', 'success')
  } catch (error) {
    console.error('Error al cargar datos:', error)
    showNotification('Error al cargar los datos', 'error')
  } finally {
    state.value.loading = false
  }
}

const fetchUsuariosDisponibles = async () => {
  try {
    const [usuariosResponse, vetsResponse] = await Promise.all([
      supabase
        .from('usuarios')
        .select('id, nombre_completo, email')
        .eq('rol', 'veterinario')
        .eq('is_activo', true),
      supabase
        .from('veterinarios')
        .select('usuario_id')
    ])

    const usuariosSinPerfil = usuariosResponse.data?.filter(usuario =>
      !vetsResponse.data?.some(vet => vet.usuario_id === usuario.id)
    ) || []

    state.value.usuariosDisponibles = usuariosSinPerfil
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }
}

// Acciones de modal
const openEditModal = (veterinario) => {
  forms.value.edit = {
    especialidad_id: veterinario.especialidad_id,
    numero_licencia: veterinario.numero_licencia || '',
    anos_experiencia: veterinario.anos_experiencia || 0,
    bio: veterinario.bio || ''
  }
  modals.value.edit = { show: true, data: veterinario }
  errors.value = {}
}

const openCreateModal = () => {
  resetForm('create')
  modals.value.create.show = true
  fetchUsuariosDisponibles()
}

const openCreateUserModal = () => {
  resetForm('createUser')
  modals.value.createUser.show = true
}

const closeModal = (modalName) => {
  modals.value[modalName].show = false
  errors.value = {}
}

// Operaciones CRUD
const updateVeterinario = async () => {
  if (!validateForm('edit')) return

  try {
    const { error } = await supabase
      .from('veterinarios')
      .update({
        ...forms.value.edit,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', modals.value.edit.data.id)

    if (error) throw error

    showNotification('Veterinario actualizado', 'success')
    closeModal('edit')
    fetchData()
  } catch (error) {
    console.error('Error:', error)
    showNotification('Error al actualizar', 'error')
  }
}

const createVeterinario = async () => {
  if (!validateForm('create')) return

  try {
    const { error } = await supabase
      .from('veterinarios')
      .insert({
        ...forms.value.create,
        is_activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })

    if (error) {
      if (error.code === '23505') {
        showNotification('Este usuario ya tiene un perfil de veterinario', 'warning')
        return
      }
      throw error
    }

    showNotification('Perfil de veterinario creado', 'success')
    closeModal('create')
    fetchData()
  } catch (error) {
    console.error('Error:', error)
    showNotification('Error al crear el perfil', 'error')
  }
}

const createUsuarioVeterinario = async () => {
  if (!validateForm('createUser')) return

  try {
    // Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: forms.value.createUser.email,
      password: forms.value.createUser.password,
      options: {
        data: { nombre_completo: forms.value.createUser.nombre_completo }
      }
    })

    if (authError) throw authError
    if (!authData?.user) throw new Error('No se pudo crear el usuario')

    // Crear registro en usuarios
    const { error: userError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nombre_completo: forms.value.createUser.nombre_completo,
        email: forms.value.createUser.email,
        rol: 'veterinario',
        is_activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })

    if (userError) throw userError

    // Crear perfil de veterinario
    const { error: vetError } = await supabase
      .from('veterinarios')
      .insert({
        usuario_id: authData.user.id,
        especialidad_id: forms.value.createUser.especialidad_id,
        numero_licencia: forms.value.createUser.numero_licencia || null,
        anos_experiencia: forms.value.createUser.anos_experiencia || 0,
        bio: forms.value.createUser.bio || null,
        is_activo: true,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })

    if (vetError) throw vetError

    showNotification('Usuario y perfil creados exitosamente', 'success')
    closeModal('createUser')
    fetchData()
  } catch (error) {
    console.error('Error:', error)
    showNotification('Error al crear usuario y perfil', 'error')
  }
}

const toggleVetStatus = async (veterinario) => {
  const action = veterinario.is_activo ? 'desactivar' : 'activar'
  if (!confirm(`¿Confirmas que deseas ${action} a ${veterinario.usuario.nombre_completo}?`)) return

  try {
    const { error } = await supabase
      .from('veterinarios')
      .update({
        is_activo: !veterinario.is_activo,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', veterinario.id)

    if (error) throw error

    const message = veterinario.is_activo ? 'Veterinario desactivado' : 'Veterinario activado'
    showNotification(message, 'success')
    fetchData()
  } catch (error) {
    console.error('Error:', error)
    showNotification('Error al cambiar el estado', 'error')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="container">
    <!-- Notification -->
    <Transition name="notification">
      <div
        v-if="notification.visible"
        :class="['notification', `notification--${notification.type}`]"
      >
        {{ notification.message }}
      </div>
    </Transition>

    <!-- Header -->
    <header class="header">
      <div class="header__content">
        <h1 class="header__title">Veterinarios</h1>
        <p class="header__subtitle">Gestiona los perfiles profesionales</p>
      </div>

      <!-- Search -->
      <div class="search">
        <input
          v-model="state.searchTerm"
          type="text"
          placeholder="Buscar veterinario..."
          class="search__input"
        />
        <svg class="search__icon" viewBox="0 0 20 20">
          <path d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" />
        </svg>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="state.loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando veterinarios...</p>
    </div>

    <!-- Content -->
    <main v-else class="main">
      <!-- Empty State -->
      <div v-if="filteredVeterinarios.length === 0" class="empty">
        <div class="empty__icon">🩺</div>
        <h3 class="empty__title">
          {{ state.searchTerm ? 'No se encontraron veterinarios' : 'No hay veterinarios registrados' }}
        </h3>
        <p class="empty__text">
          {{ state.searchTerm ? 'Prueba con otros términos de búsqueda' : 'Comienza agregando tu primer veterinario' }}
        </p>
      </div>

      <!-- Cards Grid -->
      <div v-else class="grid">
        <article
          v-for="vet in filteredVeterinarios"
          :key="vet.id"
          :class="['card', { 'card--inactive': !vet.is_activo }]"
        >
          <div class="card__header">
            <div class="avatar">
              {{ vet.usuario.nombre_completo.charAt(0).toUpperCase() }}
            </div>
            <div :class="['status', { 'status--active': vet.is_activo }]"></div>
          </div>

          <div class="card__body">
            <h3 class="card__name">{{ vet.usuario.nombre_completo }}</h3>
            <p class="card__email">{{ vet.usuario.email }}</p>

            <div class="card__meta">
              <span class="badge">{{ vet.especialidad.nombre }}</span>
              <span v-if="vet.numero_licencia" class="license">
                Lic: {{ vet.numero_licencia }}
              </span>
            </div>

            <p class="card__experience">{{ vet.anos_experiencia }} años de experiencia</p>
          </div>

          <div class="card__actions">
            <button
              @click="openEditModal(vet)"
              class="btn btn--icon"
              title="Editar veterinario"
            >
              <svg viewBox="0 0 20 20">
                <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
              </svg>
            </button>
            <button
              @click="toggleVetStatus(vet)"
              :class="['btn', 'btn--toggle', { 'btn--active': vet.is_activo }]"
              :title="vet.is_activo ? 'Desactivar' : 'Activar'"
            >
              {{ vet.is_activo ? '●' : '○' }}
            </button>
          </div>
        </article>
      </div>
    </main>

    <!-- FAB Actions -->
    <div class="fab-group">
      <button @click="openCreateModal" class="fab fab--secondary" title="Asignar perfil">
        <svg viewBox="0 0 20 20">
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
      </button>
      <button @click="openCreateUserModal" class="fab fab--primary" title="Crear veterinario">
        <svg viewBox="0 0 20 20">
          <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
        </svg>
      </button>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="modals.edit.show" class="modal-overlay" @click.self="closeModal('edit')">
        <div class="modal">
          <div class="modal__header">
            <h2>Editar Veterinario</h2>
            <button @click="closeModal('edit')" class="modal__close">×</button>
          </div>

          <form @submit.prevent="updateVeterinario" class="modal__form">
            <div class="field">
              <label class="field__label">Especialidad</label>
              <select v-model="forms.edit.especialidad_id" :class="['field__input', { 'field__input--error': errors.especialidad_id }]">
                <option value="">Seleccionar especialidad</option>
                <option v-for="esp in state.especialidades" :key="esp.id" :value="esp.id">
                  {{ esp.nombre }}
                </option>
              </select>
              <div v-if="errors.especialidad_id" class="field__error">{{ errors.especialidad_id }}</div>
            </div>

            <div class="field">
              <label class="field__label">Número de licencia</label>
              <input v-model="forms.edit.numero_licencia" type="text" class="field__input" placeholder="Opcional" />
            </div>

            <div class="field">
              <label class="field__label">Años de experiencia</label>
              <input v-model.number="forms.edit.anos_experiencia" type="number" min="0" class="field__input" />
            </div>

            <div class="field">
              <label class="field__label">Biografía</label>
              <textarea v-model="forms.edit.bio" class="field__input field__textarea" placeholder="Descripción profesional (opcional)"></textarea>
            </div>

            <div class="modal__actions">
              <button type="button" @click="closeModal('edit')" class="btn btn--secondary">Cancelar</button>
              <button type="submit" class="btn btn--primary">Guardar cambios</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Create Profile Modal -->
    <Teleport to="body">
      <div v-if="modals.create.show" class="modal-overlay" @click.self="closeModal('create')">
        <div class="modal">
          <div class="modal__header">
            <h2>Asignar Perfil</h2>
            <button @click="closeModal('create')" class="modal__close">×</button>
          </div>

          <form @submit.prevent="createVeterinario" class="modal__form">
            <div class="field">
              <label class="field__label">Usuario</label>
              <select v-model="forms.create.usuario_id" :class="['field__input', { 'field__input--error': errors.usuario_id }]">
                <option value="">Seleccionar usuario</option>
                <option v-for="user in state.usuariosDisponibles" :key="user.id" :value="user.id">
                  {{ user.nombre_completo }} ({{ user.email }})
                </option>
              </select>
              <div v-if="errors.usuario_id" class="field__error">{{ errors.usuario_id }}</div>
            </div>

            <div class="field">
              <label class="field__label">Especialidad</label>
              <select v-model="forms.create.especialidad_id" :class="['field__input', { 'field__input--error': errors.especialidad_id }]">
                <option value="">Seleccionar especialidad</option>
                <option v-for="esp in state.especialidades" :key="esp.id" :value="esp.id">
                  {{ esp.nombre }}
                </option>
              </select>
              <div v-if="errors.especialidad_id" class="field__error">{{ errors.especialidad_id }}</div>
            </div>

            <div class="field">
              <label class="field__label">Número de licencia</label>
              <input v-model="forms.create.numero_licencia" type="text" class="field__input" placeholder="Opcional" />
            </div>

            <div class="field">
              <label class="field__label">Años de experiencia</label>
              <input v-model.number="forms.create.anos_experiencia" type="number" min="0" class="field__input" />
            </div>

            <div class="field">
              <label class="field__label">Biografía</label>
              <textarea v-model="forms.create.bio" class="field__input field__textarea" placeholder="Descripción profesional (opcional)"></textarea>
            </div>

            <div class="modal__actions">
              <button type="button" @click="closeModal('create')" class="btn btn--secondary">Cancelar</button>
              <button type="submit" class="btn btn--primary">Crear perfil</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Create User Modal -->
    <Teleport to="body">
      <div v-if="modals.createUser.show" class="modal-overlay" @click.self="closeModal('createUser')">
        <div class="modal">
          <div class="modal__header">
            <h2>Nuevo Veterinario</h2>
            <button @click="closeModal('createUser')" class="modal__close">×</button>
          </div>

          <form @submit.prevent="createUsuarioVeterinario" class="modal__form">
            <div class="field">
              <label class="field__label">Nombre completo</label>
              <input v-model="forms.createUser.nombre_completo" type="text" :class="['field__input', { 'field__input--error': errors.nombre_completo }]" placeholder="Nombre y apellidos" />
              <div v-if="errors.nombre_completo" class="field__error">{{ errors.nombre_completo }}</div>
            </div>

            <div class="field">
              <label class="field__label">Email</label>
              <input v-model="forms.createUser.email" type="email" :class="['field__input', { 'field__input--error': errors.email }]" placeholder="correo@ejemplo.com" />
              <div v-if="errors.email" class="field__error">{{ errors.email }}</div>
            </div>

            <div class="field">
              <label class="field__label">Contraseña</label>
              <input v-model="forms.createUser.password" type="password" :class="['field__input', { 'field__input--error': errors.password }]" placeholder="Mínimo 6 caracteres" />
              <div v-if="errors.password" class="field__error">{{ errors.password }}</div>
            </div>

            <div class="field">
              <label class="field__label">Especialidad</label>
              <select v-model="forms.createUser.especialidad_id" :class="['field__input', { 'field__input--error': errors.especialidad_id }]">
                <option value="">Seleccionar especialidad</option>
                <option v-for="esp in state.especialidades" :key="esp.id" :value="esp.id">
                  {{ esp.nombre }}
                </option>
              </select>
              <div v-if="errors.especialidad_id" class="field__error">{{ errors.especialidad_id }}</div>
            </div>

            <div class="field">
              <label class="field__label">Número de licencia</label>
              <input v-model="forms.createUser.numero_licencia" type="text" class="field__input" placeholder="Opcional" />
            </div>

            <div class="field">
              <label class="field__label">Años de experiencia</label>
              <input v-model.number="forms.createUser.anos_experiencia" type="number" min="0" class="field__input" />
            </div>

            <div class="field">
              <label class="field__label">Biografía</label>
              <textarea v-model="forms.createUser.bio" class="field__input field__textarea" placeholder="Descripción profesional (opcional)"></textarea>
            </div>

            <div class="modal__actions">
              <button type="button" @click="closeModal('createUser')" class="btn btn--secondary">Cancelar</button>
              <button type="submit" class="btn btn--primary">Crear veterinario</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Variables CSS */
:root {
  --color-primary: #0ea5e9;
  --color-primary-dark: #0284c7;
  --color-secondary: #8b5cf6;
  --color-secondary-dark: #7c3aed;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-bg: #f8fafc;
  --color-white: #ffffff;
  --radius: 12px;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
  --transition: all 0.2s ease;
}

/* Layout */
.container {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.header__content {
  text-align: center;
}

.header__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.header__subtitle {
  color: var(--color-text-muted);
  margin: 0;
}

/* Search */
.search {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.search__input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-white);
  transition: var(--transition);
}

.search__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.search__icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--color-text-muted);
  fill: currentColor;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 0;
  color: var(--color-text-muted);
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
}

.empty__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.empty__text {
  margin: 0;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Card */
.card {
  background: var(--color-white);
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  transition: var(--transition);
  box-shadow: var(--shadow);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card--inactive {
  opacity: 0.6;
  border-color: #fca5a5;
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
}

.status {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #fca5a5;
}

.status--active {
  background: var(--color-success);
}

.card__body {
  margin-bottom: 1rem;
}

.card__name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.25rem;
}

.card__email {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin: 0 0 0.75rem;
}

.card__meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.badge {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: var(--color-white);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.license {
  background: #f1f5f9;
  color: var(--color-text-muted);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: monospace;
}

.card__experience {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.card__actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Buttons */
.btn {
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-white);
  padding: 0.75rem 1.5rem;
}

.btn--primary:hover {
  background: var(--color-primary-dark);
}

.btn--secondary {
  background: #f1f5f9;
  color: var(--color-text-muted);
  padding: 0.75rem 1.5rem;
}

.btn--secondary:hover {
  background: #e2e8f0;
  color: var(--color-text);
}

.btn--icon {
  width: 2rem;
  height: 2rem;
  background: #f8fafc;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.btn--icon:hover {
  background: #e2e8f0;
  color: var(--color-text);
}

.btn--icon svg {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.btn--toggle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #fee2e2;
  color: var(--color-error);
  font-size: 0.75rem;
  border: 1px solid #fecaca;
}

.btn--toggle.btn--active {
  background: #dcfce7;
  color: var(--color-success);
  border-color: #bbf7d0;
}

/* FAB */
.fab-group {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 100;
}

.fab {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab svg {
  width: 1.5rem;
  height: 1.5rem;
  fill: currentColor;
}

.fab--primary {
  background: var(--color-primary);
  color: var(--color-white);
}

.fab--primary:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.fab--secondary {
  background: var(--color-secondary);
  color: var(--color-white);
}

.fab--secondary:hover {
  background: var(--color-secondary-dark);
  transform: scale(1.05);
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
  padding: 1rem;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--color-white);
  border-radius: var(--radius);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.modal__header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.modal__close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-muted);
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: var(--transition);
}

.modal__close:hover {
  background: #f1f5f9;
  color: var(--color-text);
}

.modal__form {
  padding: 1.5rem;
}

.modal__actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

/* Form Fields */
.field {
  margin-bottom: 1.25rem;
}

.field__label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.875rem;
}

.field__input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  transition: var(--transition);
  background: var(--color-white);
}

.field__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.field__input--error {
  border-color: var(--color-error);
}

.field__input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.field__textarea {
  min-height: 5rem;
  resize: vertical;
  font-family: inherit;
}

.field__error {
  color: var(--color-error);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Notifications */
.notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  z-index: 2000;
  backdrop-filter: blur(8px);
}

.notification--success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.notification--error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.notification--warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

/* Transitions */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header {
    gap: 1rem;
  }

  .header__title {
    font-size: 1.75rem;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card {
    padding: 1rem;
  }

  .fab-group {
    bottom: 1rem;
    right: 1rem;
  }

  .fab {
    width: 3rem;
    height: 3rem;
  }

  .fab svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .modal {
    margin: 1rem;
    max-width: none;
  }

  .modal__header,
  .modal__form {
    padding: 1rem;
  }

  .modal__actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.875rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .search {
    max-width: none;
  }

  .card__actions {
    justify-content: space-between;
  }

  .card__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
