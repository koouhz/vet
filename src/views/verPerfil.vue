<template>
  <div class="perfil-container">
    <!-- Header del perfil -->
    <div class="perfil-header">
      <div class="header-content">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img
              :src="user.avatar"
              :alt="`Avatar de ${user.name}`"
              class="user-avatar"
              @error="handleAvatarError"
            />
            <button class="avatar-edit-btn" @click="showAvatarUpload = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          </div>
          <div class="user-info">
            <h1 class="user-name">{{ user.name }}</h1>
            <p class="user-email">{{ user.email }}</p>
            <span class="user-role">{{ user.role }}</span>
          </div>
        </div>

        <button class="edit-profile-btn" @click="editMode = !editMode">
          {{ editMode ? 'Cancelar' : 'Editar Perfil' }}
        </button>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="perfil-content">
      <div class="content-grid">

        <!-- Información Personal -->
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
                  placeholder="tu@email.com"
                />
                <span v-else class="info-value">{{ user.email }}</span>
              </div>

              <div class="info-item">
                <label>Teléfono</label>
                <input
                  v-if="editMode"
                  v-model="editableUser.phone"
                  type="tel"
                  class="form-input"
                  placeholder="+591 XXXXXXXX"
                />
                <span v-else class="info-value">{{ user.phone || 'No especificado' }}</span>
              </div>

              <div class="info-item">
                <label>Dirección</label>
                <input
                  v-if="editMode"
                  v-model="editableUser.address"
                  type="text"
                  class="form-input"
                  placeholder="Tu dirección"
                />
                <span v-else class="info-value">{{ user.address || 'No especificado' }}</span>
              </div>

              <div class="info-item">
                <label>Fecha de nacimiento</label>
                <input
                  v-if="editMode"
                  v-model="editableUser.birthDate"
                  type="date"
                  class="form-input"
                />
                <span v-else class="info-value">{{ formatDate(user.birthDate) || 'No especificado' }}</span>
              </div>

              <div class="info-item">
                <label>Género</label>
                <select
                  v-if="editMode"
                  v-model="editableUser.gender"
                  class="form-select"
                >
                  <option value="">Seleccionar</option>
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero-no-decir">Prefiero no decir</option>
                </select>
                <span v-else class="info-value">{{ user.gender || 'No especificado' }}</span>
              </div>
            </div>

            <!-- Botones de acción -->
            <div v-if="editMode" class="form-actions">
              <button @click="saveProfile" class="btn-primary">
                <span v-if="!saving">Guardar Cambios</span>
                <span v-else>Guardando...</span>
              </button>
              <button @click="cancelEdit" class="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>

        <!-- Mascotas del Usuario -->
        <div class="info-card">
          <div class="card-header">
            <h2>Mis Mascotas</h2>
            <button @click="showAddPet = true" class="btn-small">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Agregar
            </button>
          </div>
          <div class="card-body">
            <div v-if="user.pets && user.pets.length > 0" class="pets-grid">
              <div v-for="pet in user.pets" :key="pet.id" class="pet-card">
                <div class="pet-avatar">
                  <img :src="pet.photo" :alt="pet.name" @error="handlePetPhotoError">
                </div>
                <div class="pet-info">
                  <h3>{{ pet.name }}</h3>
                  <p>{{ pet.species }} • {{ pet.breed }}</p>
                  <span class="pet-age">{{ calculateAge(pet.birthDate) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M4.5 12.5C7 10 10 8.5 12 8.5s5 1.5 7.5 4c-.68.68-1.6 1-2.5 1s-1.82-.32-2.5-1c-.68.68-1.6 1-2.5 1s-1.82-.32-2.5-1c-.68.68-1.6 1-2.5 1s-1.82-.32-2.5-1z"/>
              </svg>
              <p>Aún no has registrado ninguna mascota</p>
              <button @click="showAddPet = true" class="btn-outline">
                Agregar mi primera mascota
              </button>
            </div>
          </div>
        </div>

        <!-- Historial de Citas -->
        <div class="info-card full-width">
          <div class="card-header">
            <h2>Historial de Citas</h2>
          </div>
          <div class="card-body">
            <div v-if="appointments && appointments.length > 0" class="appointments-list">
              <div v-for="appointment in appointments" :key="appointment.id" class="appointment-item">
                <div class="appointment-date">
                  <span class="date">{{ formatDate(appointment.date) }}</span>
                  <span class="time">{{ appointment.time }}</span>
                </div>
                <div class="appointment-info">
                  <h4>{{ appointment.service }}</h4>
                  <p>{{ appointment.veterinarian }}</p>
                  <p class="appointment-pet">Mascota: {{ appointment.petName }}</p>
                </div>
                <div class="appointment-status">
                  <span :class="`status ${appointment.status}`">
                    {{ getStatusText(appointment.status) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <p>No tienes citas programadas</p>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal para cambiar avatar -->
    <div v-if="showAvatarUpload" class="modal-overlay" @click="showAvatarUpload = false">
      <div class="modal" @click.stop>
        <h3>Cambiar foto de perfil</h3>
        <input type="file" accept="image/*" @change="handleAvatarUpload" ref="avatarInput">
        <div class="modal-actions">
          <button @click="showAvatarUpload = false" class="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// Estados reactivos
const editMode = ref(false)
const saving = ref(false)
const showAvatarUpload = ref(false)
const showAddPet = ref(false)
const avatarInput = ref(null)

// Datos del usuario
const user = reactive({
  id: 1,
  name: 'Ariana González',
  email: 'ariana@email.com',
  phone: '+591 70123456',
  address: 'Zona Sur, La Paz, Bolivia',
  birthDate: '1995-08-15',
  gender: 'femenino',
  role: 'Cliente',
  avatar: 'https://i.pravatar.cc/150?img=1',
  joinDate: '2024-01-15',
  pets: [
    {
      id: 1,
      name: 'Luna',
      species: 'Perro',
      breed: 'Labrador',
      birthDate: '2020-03-10',
      photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Milo',
      species: 'Gato',
      breed: 'Siamés',
      birthDate: '2019-07-22',
      photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=face'
    }
  ]
})

// Datos editables (copia para edición)
const editableUser = reactive({})

// Historial de citas
const appointments = ref([
  {
    id: 1,
    date: '2024-12-10',
    time: '10:30',
    service: 'Consulta general',
    veterinarian: 'Dr. García',
    petName: 'Luna',
    status: 'completed'
  },
  {
    id: 2,
    date: '2024-11-25',
    time: '14:00',
    service: 'Vacunación',
    veterinarian: 'Dra. Morales',
    petName: 'Milo',
    status: 'completed'
  },
  {
    id: 3,
    date: '2024-12-20',
    time: '09:00',
    service: 'Control mensual',
    veterinarian: 'Dr. García',
    petName: 'Luna',
    status: 'scheduled'
  }
])

// Métodos
const copyUserData = () => {
  Object.assign(editableUser, { ...user })
}

const saveProfile = async () => {
  saving.value = true

  // Simular llamada a API
  await new Promise(resolve => setTimeout(resolve, 1500))

  Object.assign(user, { ...editableUser })
  editMode.value = false
  saving.value = false

  // Aquí iría la lógica para enviar a la API
  alert('Perfil actualizado correctamente')
}

const cancelEdit = () => {
  editMode.value = false
  copyUserData() // Restaurar datos originales
}

const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age === 1 ? '1 año' : `${age} años`
}

const getStatusText = (status) => {
  const statusMap = {
    'completed': 'Completada',
    'scheduled': 'Programada',
    'cancelled': 'Cancelada'
  }
  return statusMap[status] || status
}

const handleAvatarError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOTlhM2FmIj48cGF0aCBkPSJNMTIgMTJjMi43IDAgNC44LTIuMSA0LjgtNC44UzE0LjcgMi40IDEyIDIuNCA3LjIgNC41IDcuMiA3LjIgOS4zIDEyIDEyIDEyem0wIDIuNGMtMy4yIDAtOS42IDEuNi05LjYgNC44djIuNGgxOS4ydi0yLjRjMC0zLjItNi40LTQuOC05LjYtNC44eiIvPjwvc3ZnPg=='
}

const handlePetPhotoError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzk5YTNhZiI+PHBhdGggZD0iTTQuNSAxMi41QzcgMTAgMTAgOC41IDEyIDguNXM1IDEuNSA3LjUgNGMtLjY4LjY4LTEuNiAxLTIuNSAxcy0xLjgyLS4zMi0yLjUtMWMtLjY4LjY4LTEuNiAxLTIuNSAxcy0xLjgyLS4zMi0yLjUtMWMtLjY4LjY4LTEuNiAxLTIuNSAxcy0xLjgyLS4zMi0yLjUtMXoiLz48L3N2Zz4K'
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      user.avatar = e.target.result
      showAvatarUpload.value = false
    }
    reader.readAsDataURL(file)
  }
}

// Inicialización
onMounted(() => {
  copyUserData()
})
</script>

<style scoped>
.perfil-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding-top: 64px; /* Compensar navbar fijo */
}

/* Header del perfil */
.perfil-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-wrapper {
  position: relative;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: #4f46e5;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.avatar-edit-btn:hover {
  background-color: #3730a3;
  transform: scale(1.1);
}

.user-info h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.user-email {
  margin: 0.5rem 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.user-role {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.edit-profile-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.edit-profile-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Contenido principal */
.perfil-content {
  max-width: 1200px;
  margin: -2rem auto 0;
  padding: 0 2rem 3rem;
  position: relative;
  z-index: 1;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.info-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.info-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.card-body {
  padding: 2rem;
}

/* Formulario */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-value {
  color: #6b7280;
  padding: 0.75rem 0;
}

.form-input,
.form-select {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

/* Botones */
.btn-primary {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: #3730a3;
}

.btn-secondary {
  background-color: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #f3f4f6;
}

.btn-small {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-outline {
  background-color: transparent;
  color: #4f46e5;
  border: 2px solid #4f46e5;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background-color: #4f46e5;
  color: white;
}

/* Mascotas */
.pets-grid {
  display: grid;
  gap: 1rem;
}

.pet-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.pet-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pet-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.pet-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.pet-info p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.pet-age {
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Citas */
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-item {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.appointment-date {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.appointment-date .date {
  font-weight: 600;
  color: #111827;
}

.appointment-date .time {
  font-size: 0.875rem;
  color: #6b7280;
}

.appointment-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.appointment-info p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.appointment-pet {
  font-weight: 500;
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status.scheduled {
  background-color: #dbeafe;
  color: #1e40af;
}

.status.cancelled {
  background-color: #fee2e2;
  color: #dc2626;
}

/* Estados vacíos */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state svg {
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
}

.modal h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal input[type="file"] {
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .appointment-item {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .perfil-content {
    padding: 0 1rem 3rem;
  }
}
</style>
