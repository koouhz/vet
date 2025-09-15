<template>
  <div class="profile-container">
    <!-- Header del perfil -->
    <header class="profile-header">
      <div class="header-content">
        <div class="user-section">
          <div class="user-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#E0F2FE" stroke-width="2">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <div class="user-info">
            <h1 class="user-name">{{ user.name }}</h1>
            <p class="user-email">{{ user.email }}</p>
            <span class="user-role">{{ roleDisplayName }}</span>
          </div>
        </div>
        <button class="edit-profile-btn" @click="toggleEditMode">
          {{ editMode ? 'Cancelar' : 'Editar Perfil' }}
        </button>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="profile-content">
      <div class="content-grid">
        <!-- Información Personal -->
        <ProfileInfoCard
          :user="user"
          :editableUser="editableUser"
          :editMode="editMode"
          @save="saveProfile"
          @cancel="cancelEdit"
        />

        <!-- Mascotas del Usuario -->
        <PetsCard
          :pets="user.pets"
          @add-pet="showAddPet = true"
        />

        <!-- Historial de Citas -->
        <AppointmentsCard
          :appointments="appointments"
        />
      </div>
    </main>

    <!-- Modal para agregar mascota -->
    <AddPetModal
      v-if="showAddPet"
      @close="showAddPet = false"
      @save="handleAddPet"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// Componentes
const ProfileInfoCard = {
  props: ['user', 'editableUser', 'editMode'],
  emits: ['save', 'cancel'],
  template: `
    <div class="info-card">
      <div class="card-header">
        <h2>Información Personal</h2>
      </div>
      <div class="card-body">
        <div class="info-grid">
          <div class="info-item">
            <label>Nombre completo</label>
            <input
              v-if="editMode"
              v-model="editableUser.name"
              type="text"
              class="form-input"
              placeholder="Tu nombre completo"
            />
            <span v-else class="info-value">{{ user.name }}</span>
          </div>
          <div class="info-item">
            <label>Email</label>
            <input
              v-if="editMode"
              v-model="editableUser.email"
              type="email"
              class="form-input"
              placeholder="Tu email"
            />
            <span v-else class="info-value">{{ user.email }}</span>
          </div>
        </div>
        <div v-if="editMode" class="form-actions">
          <button @click="$emit('save')" class="btn-primary" :disabled="saving">
            <span>{{ saving ? 'Guardando...' : 'Guardar' }}</span>
          </button>
          <button @click="$emit('cancel')" class="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  `
}

const PetsCard = {
  props: ['pets'],
  emits: ['add-pet'],
  template: `
    <div class="info-card">
      <div class="card-header">
        <h2>Mis Mascotas</h2>
        <button @click="$emit('add-pet')" class="btn-small">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Agregar
        </button>
      </div>
      <div class="card-body">
        <p v-if="!pets || pets.length === 0">No hay mascotas registradas.</p>
        <ul v-else class="pet-list">
          <li v-for="pet in pets" :key="pet.id">{{ pet.name }} ({{ pet.species }})</li>
        </ul>
      </div>
    </div>
  `
}

const AppointmentsCard = {
  props: ['appointments'],
  template: `
    <div class="info-card full-width">
      <div class="card-header">
        <h2>Historial de Citas</h2>
      </div>
      <div class="card-body">
        <p v-if="!appointments || appointments.length === 0">No hay citas registradas.</p>
        <ul v-else class="appointment-list">
          <li v-for="appt in appointments" :key="appt.id">{{ appt.date }} - {{ appt.description }}</li>
        </ul>
      </div>
    </div>
  `
}

const AddPetModal = {
  emits: ['close', 'save'],
  template: `
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal" @click.stop>
        <h3>Agregar Mascota</h3>
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="newPet.name" type="text" class="form-input" placeholder="Nombre de la mascota" />
        </div>
        <div class="form-group">
          <label>Especie</label>
          <input v-model="newPet.species" type="text" class="form-input" placeholder="Ej. Perro, Gato" />
        </div>
        <div class="modal-actions">
          <button @click="$emit('save', newPet)" class="btn-primary">Guardar</button>
          <button @click="$emit('close')" class="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  setup() {
    return {
      newPet: reactive({ name: '', species: '' })
    }
  }
}

// Estados reactivos
const editMode = ref(false)
const saving = ref(false)
const showAddPet = ref(false)
const user = reactive({
  name: '',
  email: '',
  role: '',
  pets: []
})
const editableUser = reactive({})
const appointments = ref([])

// Mapeo de roles para UX
const roleDisplayName = computed(() => {
  const roles = {
    admin: 'Administrador',
    veterinario: 'Veterinario',
    cliente: 'Cliente'
  }
  return roles[user.role] || user.role
})

// Métodos
const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (!editMode.value) cancelEdit()
}

const copyUserData = () => {
  Object.assign(editableUser, { name: user.name, email: user.email })
}

const saveProfile = async () => {
  saving.value = true
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ nombre_completo: editableUser.name, email: editableUser.email })
      .eq('id', (await supabase.auth.getUser()).data.user.id)
    if (error) throw error
    Object.assign(user, { name: editableUser.name, email: editableUser.email })
    editMode.value = false
  } catch (error) {
    console.error('Error saving profile:', error)
    alert('Error al actualizar el perfil')
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  copyUserData()
  editMode.value = false
}

const handleAddPet = async (newPet) => {
  if (newPet.name && newPet.species) {
    const { error } = await supabase
      .from('pets')
      .insert({ name: newPet.name, species: newPet.species, user_id: (await supabase.auth.getUser()).data.user.id })
    if (!error) {
      user.pets.push({ id: Date.now(), name: newPet.name, species: newPet.species })
      showAddPet.value = false
      newPet.name = ''
      newPet.species = ''
    } else {
      console.error('Error adding pet:', error)
      alert('Error al agregar mascota')
    }
  }
}

// Inicialización
onMounted(async () => {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (authUser) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('nombre_completo, email, rol')
      .eq('id', authUser.id)
      .single()
    if (!error && data) {
      user.name = data.nombre_completo
      user.email = data.email
      user.role = data.rol
      copyUserData()
    }
    // Cargar mascotas
    const { data: petsData } = await supabase
      .from('pets')
      .select('id, name, species')
      .eq('user_id', authUser.id)
    if (petsData) user.pets = petsData
    // Cargar citas (simulado)
    appointments.value = [
      { id: 1, date: '2025-09-15', description: 'Consulta general' },
      { id: 2, date: '2025-09-20', description: 'Vacunación' }
    ]
  }
})

onUnmounted(() => {
  // Limpiar cualquier timeout o suscripción si se implementa
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #03252b 0%, #0a4a56 100%);
  color: #E0F2FE;
  padding: 80px 1rem 2rem;
}

.profile-header {
  position: sticky;
  top: 64px;
  background: linear-gradient(135deg, #03252b 0%, #0a4a56 100%);
  padding: 2rem 0;
  z-index: 10;
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-icon {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  text-align: left;
}

.user-name {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.user-email {
  margin: 0.25rem 0 0.5rem;
  font-size: 1rem;
  opacity: 0.9;
}

.user-role {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
}

.edit-profile-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #E0F2FE;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.edit-profile-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

.profile-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  color: #111827;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-value {
  font-size: 0.95rem;
  color: #111827;
}

.form-input {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #2563eb;
  outline: none;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: #1e40af;
}

.btn-primary:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f9fafb;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.btn-secondary:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.btn-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-small:hover {
  background: #1e40af;
}

.pet-list, .appointment-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pet-list li, .appointment-list li {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.9rem;
}

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

.modal {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
  color: #111827;
}

.modal h3 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .profile-container {
    padding-top: 64px;
  }

  .profile-header {
    top: 56px;
  }

  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-section {
    flex-direction: column;
    text-align: center;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
