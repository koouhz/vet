<template>
  <div class="profile-container">
    <!-- Header del perfil -->
    <header class="profile-header">
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

    <!-- Modal para cambiar avatar -->
    <AvatarUploadModal
      v-if="showAvatarUpload"
      @close="showAvatarUpload = false"
      @upload="handleAvatarUpload"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

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
          <!-- Resto de campos -->
        </div>
        <div v-if="editMode" class="form-actions">
          <button @click="$emit('save')" class="btn-primary">
            <span>Guardar Cambios</span>
          </button>
          <button @click="$emit('cancel')" class="btn-secondary">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `
};

const PetsCard = {
  props: ['pets'],
  emits: ['add-pet'],
  template: `
    <div class="info-card">
      <div class="card-header">
        <h2>Mis Mascotas</h2>
        <button @click="$emit('add-pet')" class="btn-small">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Agregar
        </button>
      </div>
      <div class="card-body">
        <!-- Contenido de mascotas -->
      </div>
    </div>
  `
};

const AppointmentsCard = {
  props: ['appointments'],
  template: `
    <div class="info-card full-width">
      <div class="card-header">
        <h2>Historial de Citas</h2>
      </div>
      <div class="card-body">
        <!-- Contenido de citas -->
      </div>
    </div>
  `
};

const AvatarUploadModal = {
  emits: ['close', 'upload'],
  template: `
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal" @click.stop>
        <h3>Cambiar foto de perfil</h3>
        <input type="file" accept="image/*" @change="$emit('upload', $event)" ref="fileInput">
        <div class="modal-actions">
          <button @click="$emit('close')" class="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  `
};

// Estados reactivos
const editMode = ref(false);
const saving = ref(false);
const showAvatarUpload = ref(false);
const showAddPet = ref(false);
const user = reactive({ /* ... (datos del usuario) */ });
const editableUser = reactive({});
const appointments = ref([ /* ... (citas) */ ]);

// Métodos
const toggleEditMode = () => {
  editMode.value = !editMode.value;
  if (!editMode.value) cancelEdit();
};

const copyUserData = () => {
  Object.assign(editableUser, { ...user });
};

const saveProfile = async () => {
  saving.value = true;
  await new Promise(resolve => setTimeout(resolve, 1500));
  Object.assign(user, { ...editableUser });
  editMode.value = false;
  saving.value = false;
  alert('Perfil actualizado correctamente');
};

const cancelEdit = () => {
  copyUserData();
};

const handleAvatarUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      user.avatar = e.target.result;
      showAvatarUpload.value = false;
    };
    reader.readAsDataURL(file);
  }
};

// Inicialización
onMounted(() => {
  copyUserData();
});
</script>

<style scoped>
:root {
  --primary-color: #4f46e5;
  --secondary-color: #1e40af;
  --background-gradient: linear-gradient(135deg, #03252b 0%, #0a4a56 100%);
  --text-light: #f9fafb;
  --text-dark: #111827;
  --gray-light: #f3f4f6;
  --gray-medium: #e5e7eb;
  --gray-dark: #374151;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --border-radius: 12px;
}

.profile-container {
  min-height: 100vh;
  background: var(--background-gradient);
  color: var(--text-light);
  padding-top: 64px;
}

.profile-header {
  padding: 3rem 0 2rem;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
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
  background-color: var(--primary-color);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.profile-content {
  max-width: 1200px;
  margin: -2rem auto 0;
  padding: 0 2rem 3rem;
  position: relative;
  z-index: 1;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.info-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  color: var(--text-dark);
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--gray-medium);
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.card-body {
  padding: 2rem;
}

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
  color: var(--gray-dark);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input, .form-select {
  border: 1px solid var(--gray-medium);
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background-color: var(--gray-light);
  color: var(--gray-dark);
  border: 1px solid var(--gray-medium);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

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
  border-radius: var(--border-radius);
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  color: var(--text-dark);
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
