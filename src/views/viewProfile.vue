}<template>
  <div class="profile-container container">
    <Transition name="toast">
      <div
        v-if="toast.message"
        :class="['toast', toast.type]"
        class="toast"
      >
        {{ toast.message }}
      </div>
    </Transition>

    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <div class="profile-header card">
      <div class="avatar-section">
        <div class="avatar-wrapper" @click="triggerFileInput" v-if="isEditing">
          <img
            :src="userForm.avatar_url || defaultAvatar"
            alt="Avatar del usuario"
            class="avatar"
          />
          <div class="overlay">
            <i class="ph ph-camera"></i>
          </div>
          <input
            type="file"
            ref="fileInput"
            @change="handleAvatarUpload"
            accept="image/*"
            class="file-input"
          />
        </div>
        <img
          :src="userForm.avatar_url || defaultAvatar"
          alt="Avatar del usuario"
          class="avatar-static"
          v-else
        />
        <div class="user-info">
          <h2 class="user-name">{{ userForm.nombre_completo }}</h2>
          <p class="user-role">{{ getRoleLabel(userForm.rol) }}</p>
        </div>

        <div v-if="userForm.rol === 'admin' || userForm.rol === 'veterinario'" class="dashboard-access">
          <router-link
            :to="userForm.rol === 'admin' ? '/dashboard-admin' : '/dashboard-vet'"
            class="btn-dashboard"
          >
            <i :class="userForm.rol === 'admin' ? 'ph ph-chart-bar' : 'ph ph-stethoscope'"></i>
            <span>Dashboard</span>
          </router-link>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div class="profile-tabs" v-show="!isLoading">
        <button
          :class="{ active: activeTab === 'datos' }"
          @click="activeTab = 'datos'"
          class="tab-btn"
        >
          <i class="ph ph-user"></i>
          <span>Personal</span>
        </button>
        <button
          :class="{ active: activeTab === 'mascotas' || activeTab === 'agregar-mascota' }"
          @click="activeTab = 'mascotas'"
          class="tab-btn"
          v-if="userForm.rol === 'cliente'"
        >
          <i class="ph ph-paw-print"></i>
          <span>Mascotas</span>
        </button>
        <button
          :class="{ active: activeTab === 'veterinario' }"
          @click="activeTab = 'veterinario'"
          class="tab-btn"
          v-if="userForm.rol === 'veterinario'"
        >
          <i class="ph ph-stethoscope"></i>
          <span>Profesional</span>
        </button>
        <button
          :class="{ active: activeTab === 'seguridad' }"
          @click="activeTab = 'seguridad'"
          class="tab-btn"
        >
          <i class="ph ph-lock-key"></i>
          <span>Seguridad</span>
        </button>
      </div>
    </Transition>

    <Transition name="slide">
      <div class="profile-content card" v-show="!isLoading">
        <div v-if="activeTab === 'datos'" class="section">
          <div class="section-header">
            <h3><i class="ph ph-user"></i> Información Personal</h3>
            <button @click="toggleEdit" class="btn-primary" :disabled="isUpdating">
              <i :class="isEditing ? 'ph ph-check' : 'ph ph-pencil'"></i>
              {{ isEditing ? 'Guardar' : 'Editar' }}
            </button>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre Completo</label>
              <input
                v-model="userForm.nombre_completo"
                :disabled="!isEditing"
                type="text"
                :class="{ 'editing': isEditing }"
              />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input
                v-model="userForm.email"
                :disabled="!isEditing"
                type="email"
                :class="{ 'editing': isEditing }"
              />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input
                v-model="userForm.telefono"
                :disabled="!isEditing"
                type="tel"
                :class="{ 'editing': isEditing }"
              />
            </div>
            <div class="form-group">
              <label>Dirección</label>
              <input
                v-model="userForm.direccion"
                :disabled="!isEditing"
                type="text"
                :class="{ 'editing': isEditing }"
              />
            </div>
            <div class="form-group">
              <label>Fecha de Nacimiento</label>
              <input
                v-model="userForm.fecha_nacimiento"
                :disabled="!isEditing"
                type="date"
                :class="{ 'editing': isEditing }"
              />
            </div>
            <div class="form-group">
              <label>Género</label>
              <select
                v-model="userForm.genero"
                :disabled="!isEditing"
                :class="{ 'editing': isEditing }"
              >
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
                <option value="prefiero-no-decir">Prefiero no decir</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'mascotas' && userForm.rol === 'cliente'" class="section">
          <div class="section-header">
            <h3><i class="ph ph-paw-print"></i> Mis Mascotas</h3>
            <button @click="isAddingPet = true" class="btn-primary">
              <i class="ph ph-plus"></i> Agregar
            </button>
          </div>
          <div v-if="mascotas.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="ph ph-paw-print"></i>
            </div>
            <h4>Sin mascotas registradas</h4>
            <p>Registra tu primera mascota para comenzar</p>
            <button @click="isAddingPet = true" class="btn-primary">Registrar Mascota</button>
          </div>
          <div v-else class="mascotas-grid">
            <div
              v-for="mascota in mascotas"
              :key="mascota.id"
              class="mascota-card card"
            >
              <img
                :src="mascota.foto_url || defaultPetAvatar"
                :alt="mascota.nombre"
                class="mascota-avatar"
              />
              <div class="mascota-info">
                <h4>{{ mascota.nombre }}</h4>
                <p class="especie">{{ mascota.especie }}{{ mascota.raza ? ` · ${mascota.raza}` : '' }}</p>
                <span class="sexo" :class="mascota.sexo">
                  {{ mascota.sexo }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isAddingPet" class="section">
          <div class="section-header">
            <h3><i class="ph ph-paw-print"></i> Agregar Nueva Mascota</h3>
            <button @click="cancelAddPet" class="btn-secondary">
              <i class="ph ph-arrow-left"></i> Volver
            </button>
          </div>
          <form @submit.prevent="addPet" class="form-grid">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input
                id="nombre"
                v-model="mascotaForm.nombre"
                type="text"
                required
                class="editing"
              />
            </div>
            <div class="form-group">
              <label for="especie">Especie</label>
              <select
                id="especie"
                v-model="mascotaForm.especie"
                required
                class="editing"
              >
                <option value="" disabled>Selecciona una especie</option>
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="conejo">Conejo</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label for="raza">Raza</label>
              <input
                id="raza"
                v-model="mascotaForm.raza"
                type="text"
                class="editing"
              />
            </div>
            <div class="form-group">
              <label for="fecha_nacimiento">Fecha de Nacimiento</label>
              <input
                id="fecha_nacimiento"
                v-model="mascotaForm.fecha_nacimiento"
                type="date"
                class="editing"
              />
            </div>
            <div class="form-group">
              <label for="peso_kg">Peso (kg)</label>
              <input
                id="peso_kg"
                v-model.number="mascotaForm.peso_kg"
                type="number"
                step="0.01"
                class="editing"
              />
            </div>
            <div class="form-group">
              <label for="sexo">Sexo</label>
              <select
                id="sexo"
                v-model="mascotaForm.sexo"
                class="editing"
              >
                <option value="" disabled>Selecciona el sexo</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
                <option value="castrado">Castrado</option>
                <option value="esterilizado">Esterilizado</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label for="alergias">Alergias</label>
              <textarea
                id="alergias"
                v-model="mascotaForm.alergias"
                rows="2"
                class="editing"
              ></textarea>
            </div>
            <div class="form-group full-width">
              <label for="notas_medicas">Notas Médicas</label>
              <textarea
                id="notas_medicas"
                v-model="mascotaForm.notas_medicas"
                rows="4"
                class="editing"
              ></textarea>
            </div>
            <div class="form-group full-width">
              <label for="foto_url">URL de la Foto</label>
              <input
                id="foto_url"
                v-model="mascotaForm.foto_url"
                type="text"
                class="editing"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            <div class="form-group full-width">
              <button type="submit" class="btn-primary" :disabled="isUpdating">
                <i class="ph ph-plus-circle"></i>
                {{ isUpdating ? 'Agregando...' : 'Agregar Mascota' }}
              </button>
            </div>
          </form>
        </div>

        <div v-if="activeTab === 'veterinario' && userForm.rol === 'veterinario'" class="section">
          <div class="section-header">
            <h3><i class="ph ph-stethoscope"></i> Información Profesional</h3>
            <button @click="toggleEditVet" class="btn-primary" :disabled="isUpdating">
              <i :class="isEditingVet ? 'ph ph-check' : 'ph ph-pencil'"></i>
              {{ isEditingVet ? 'Guardar' : 'Editar' }}
            </button>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Especialidad</label>
              <select
                v-model="veterinarioForm.especialidad_id"
                :disabled="!isEditingVet"
                :class="{ 'editing': isEditingVet }"
              >
                <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">
                  {{ esp.nombre }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Número de Licencia</label>
              <input
                v-model="veterinarioForm.numero_licencia"
                :disabled="!isEditingVet"
                type="text"
                :class="{ 'editing': isEditingVet }"
              />
            </div>
            <div class="form-group">
              <label>Años de Experiencia</label>
              <input
                v-model.number="veterinarioForm.anos_experiencia"
                :disabled="!isEditingVet"
                type="number"
                :class="{ 'editing': isEditingVet }"
              />
            </div>
            <div class="form-group full-width">
              <label>Biografía</label>
              <textarea
                v-model="veterinarioForm.bio"
                :disabled="!isEditingVet"
                rows="4"
                :class="{ 'editing': isEditingVet }"
              ></textarea>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'seguridad'" class="section">
          <div class="section-header">
            <h3><i class="ph ph-lock-key"></i> Cambiar Contraseña</h3>
          </div>
          <div class="form-grid security-grid">
            <div class="form-group">
              <label>Contraseña Actual</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="••••••••"
                class="editing"
              />
            </div>
            <div class="form-group">
              <label>Nueva Contraseña</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="••••••••"
                class="editing"
              />
            </div>
            <div class="form-group">
              <label>Confirmar Nueva Contraseña</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="••••••••"
                class="editing"
              />
            </div>
            <div class="form-group full-width">
              <button @click="updatePassword" class="btn-primary btn-security" :disabled="isUpdatingPassword">
                <i class="ph ph-lock-key"></i>
                {{ isUpdatingPassword ? 'Actualizando...' : 'Actualizar Contraseña' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient.js'

const router = useRouter()

// Toast
const toast = ref({
  message: '',
  type: 'success'
})

// Estados
const isLoading = ref(true)
const isUpdating = ref(false)
const activeTab = ref('datos')
const isEditing = ref(false)
const isEditingVet = ref(false)
const isUpdatingPassword = ref(false)
const isAddingPet = ref(false) // Nuevo estado para el formulario de mascota

// Formularios
const userForm = reactive({
  id: '',
  nombre_completo: '',
  email: '',
  telefono: '',
  direccion: '',
  fecha_nacimiento: '',
  genero: '',
  rol: '',
  avatar_url: ''
})

const veterinarioForm = reactive({
  id: null,
  especialidad_id: null,
  numero_licencia: '',
  anos_experiencia: null,
  bio: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const mascotaForm = reactive({
  nombre: '',
  especie: '',
  raza: '',
  fecha_nacimiento: '',
  peso_kg: null,
  sexo: '',
  alergias: '',
  notas_medicas: '',
  foto_url: '', // Ahora es un campo de texto para la URL
})

const mascotas = ref([])
const especialidades = ref([])

// Imágenes por defecto
const defaultAvatar = 'https://placehold.co/120x120/DBEAFE/1D4ED8?text=AV'
const defaultPetAvatar = 'https://placehold.co/80x80/F3F4F6/6B7280?text=🐾'

// Referencia
const fileInput = ref(null)

// Métodos
const showToast = (message, type = 'success') => {
  toast.value = { message, type }
  setTimeout(() => {
    toast.value.message = ''
  }, 3000)
}

const toggleEdit = async () => {
  if (isEditing.value) {
    isUpdating.value = true
    await updateUser()
    isUpdating.value = false
  }
  isEditing.value = !isEditing.value
}

const toggleEditVet = async () => {
  if (isEditingVet.value) {
    isUpdating.value = true
    await updateVeterinario()
    isUpdating.value = false
  }
  isEditingVet.value = !isEditingVet.value
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    isUpdating.value = true;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userForm.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    userForm.avatar_url = publicUrl;

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ avatar_url: publicUrl })
      .eq('id', userForm.id);

    if (updateError) throw updateError;

    showToast('Avatar actualizado correctamente');
  } catch (error) {
    console.error('Error uploading avatar:', error.message);
    showToast('No se pudo actualizar el avatar', 'error');
  } finally {
    isUpdating.value = false;
  }
};

const updateUser = async () => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        nombre_completo: userForm.nombre_completo,
        email: userForm.email,
        telefono: userForm.telefono,
        direccion: userForm.direccion,
        fecha_nacimiento: userForm.fecha_nacimiento,
        genero: userForm.genero,
        avatar_url: userForm.avatar_url,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', userForm.id)

    if (error) throw error

    showToast('Perfil actualizado correctamente')
  } catch (error) {
    console.error('Error updating user:', error.message)
    showToast('Error al actualizar el perfil', 'error')
  }
}

const updateVeterinario = async () => {
  try {
    const { error } = await supabase
      .from('veterinarios')
      .update({
        especialidad_id: veterinarioForm.especialidad_id,
        numero_licencia: veterinarioForm.numero_licencia,
        anos_experiencia: veterinarioForm.anos_experiencia,
        bio: veterinarioForm.bio,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', veterinarioForm.id)

    if (error) throw error

    showToast('Perfil profesional actualizado')
  } catch (error) {
    console.error('Error updating vet profile:', error.message)
    showToast('Error al actualizar el perfil profesional', 'error')
  }
}

const updatePassword = async () => {
  if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
    showToast('Completa todos los campos', 'error')
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast('Las contraseñas no coinciden', 'error')
    return
  }

  isUpdatingPassword.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword
    })

    if (error) throw error

    Object.assign(passwordForm, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    showToast('Contraseña actualizada correctamente')
  } catch (error) {
    console.error('Error updating password:', error.message)
    showToast('Error al actualizar la contraseña', 'error')
  } finally {
    isUpdatingPassword.value = false
  }
}

const loadUserData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) throw error
    if (!userData) {
      console.warn('Usuario no encontrado en la base de datos')
      router.push('/login')
      return
    }

    Object.assign(userForm, userData)

    if (userData.rol === 'veterinario') {
      const { data: vetData } = await supabase
        .from('veterinarios')
        .select('*')
        .eq('usuario_id', user.id)
        .single()

      if (vetData) Object.assign(veterinarioForm, vetData)

      const { data: espData } = await supabase
        .from('especialidades')
        .select('id, nombre')
        .eq('is_activa', true)

      especialidades.value = espData || []
    }

    if (userData.rol === 'cliente') {
      const { data } = await supabase
        .from('mascotas')
        .select('*')
        .eq('usuario_id', userForm.id)
        .eq('is_activa', true)
        .order('nombre', { ascending: true })

      mascotas.value = data || []
    }
  } catch (error) {
    console.error('Error loading user ', error.message)
    showToast('Error al cargar los datos del perfil', 'error')
  } finally {
    isLoading.value = false
  }
}

const addPet = async () => {
  // Validación básica del formulario
  if (!mascotaForm.nombre || !mascotaForm.especie) {
    showToast('El nombre y la especie son obligatorios', 'error');
    return;
  }

  isUpdating.value = true;

  try {
    // 1. Insertar la nueva mascota en la base de datos
    const { error } = await supabase
      .from('mascotas')
      .insert({
        usuario_id: userForm.id,
        nombre: mascotaForm.nombre,
        especie: mascotaForm.especie,
        raza: mascotaForm.raza,
        fecha_nacimiento: mascotaForm.fecha_nacimiento || null,
        peso_kg: mascotaForm.peso_kg || null,
        sexo: mascotaForm.sexo || null,
        alergias: mascotaForm.alergias || null,
        notas_medicas: mascotaForm.notas_medicas || null,
        foto_url: mascotaForm.foto_url || null,
        is_activa: true
      });

    if (error) throw error;

    showToast('Mascota agregada correctamente');
    isAddingPet.value = false; // Ocultar el formulario
    resetMascotaForm(); // Limpiar el formulario
    await loadUserData(); // Recargar la lista de mascotas
  } catch (error) {
    console.error('Error adding pet:', error.message);
    showToast('Error al agregar la mascota', 'error');
  } finally {
    isUpdating.value = false;
  }
};

const resetMascotaForm = () => {
  Object.assign(mascotaForm, {
    nombre: '',
    especie: '',
    raza: '',
    fecha_nacimiento: '',
    peso_kg: null,
    sexo: '',
    alergias: '',
    notas_medicas: '',
    foto_url: '',
  });
};

const cancelAddPet = () => {
  isAddingPet.value = false;
  resetMascotaForm();
};

const getRoleLabel = (rol) => {
  const roles = {
    cliente: 'Cliente',
    veterinario: 'Veterinario',
    admin: 'Administrador'
  }
  return roles[rol] || rol
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
/* --- Solo estilos específicos del componente --- */

.profile-container {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(240, 249, 249, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Header */
.profile-header {
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}

.avatar,
.avatar-static {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 128, 150, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar:hover {
  border-color: var(--color-accent);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 128, 150, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  font-size: 1.5rem;
}

.avatar-wrapper:hover .overlay {
  opacity: 1;
}

.file-input {
  display: none;
}

.user-info {
  text-align: center;
}

.user-name {
  font-size: 2.2rem;
  font-weight: 400;
  color: var(--color-text);
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

.user-role {
  font-size: 1.1rem;
  color: var(--color-accent);
  font-weight: 400;
  background: rgba(0, 128, 150, 0.1);
  padding: 0.5rem 1.2rem;
  border-radius: var(--radius);
  border: 1px solid rgba(0, 128, 150, 0.2);
  display: inline-block;
}

/* Dashboard Button */
.dashboard-access {
  margin-top: 1.5rem;
}

.btn-dashboard {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--color-accent);
  text-decoration: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  letter-spacing: -0.1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-dashboard:hover {
  background: rgba(0, 128, 150, 0.1);
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

/* Tabs */
.profile-tabs {
  display: flex;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.75rem;
  border-radius: var(--radius);
  margin-bottom: 2.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: calc(var(--radius) - 2px);
  font-weight: 400;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
  flex: 1;
  justify-content: center;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.tab-btn.active {
  background: rgba(0, 128, 150, 0.15);
  color: var(--color-accent);
  border-color: var(--color-accent);
  transform: translateY(-1px);
}

.tab-btn span {
  display: none;
}

@media (min-width: 640px) {
  .tab-btn span {
    display: inline;
  }
}

/* Content */
.profile-content {
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.section-header h3 {
  font-size: 1.8rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text);
  font-weight: 400;
}

.btn-security {
  width: 100%;
  justify-content: center;
  padding: 0.9rem;
}

/* Forms */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.security-grid {
  max-width: 500px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  font-weight: 400;
  color: var(--color-gray);
  font-size: 1rem;
}

input.editing,
textarea.editing,
select.editing {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 2px solid var(--color-border);
}

input.editing:focus,
textarea.editing:focus,
select.editing:focus {
  border-bottom-color: var(--color-accent);
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--color-gray);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  letter-spacing: -0.1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--color-text);
  color: var(--color-text);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--color-gray);
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  border: 1px solid var(--color-border);
}

.empty-icon i {
  font-size: 2rem;
  color: var(--color-gray);
}

.empty-state h4 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.3;
}

.empty-state p {
  margin: 0 0 2rem;
  color: var(--color-gray);
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Mascotas Grid */
.mascotas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.mascota-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mascota-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 128, 150, 0.15);
  border-color: var(--color-accent);
}

.mascota-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mascota-card:hover .mascota-avatar {
  border-color: var(--color-accent);
}

.mascota-info h4 {
  margin: 0 0 0.5rem;
  color: var(--color-text);
  font-weight: 400;
  font-size: 1.3rem;
  line-height: 1.3;
}

.especie {
  font-size: 1rem;
  color: var(--color-gray);
  margin: 0 0 0.75rem;
  line-height: 1.5;
}

.sexo {
  font-size: 0.9rem;
  font-weight: 400;
  padding: 0.35rem 0.75rem;
  border-radius: calc(var(--radius) - 4px);
  display: inline-block;
  margin: 0;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.05);
}

.sexo.macho {
  background: rgba(238, 77, 77, 0.1);
  color: #ee4d4d;
  border-color: rgba(238, 77, 77, 0.3);
}

.sexo.hembra {
  background: rgba(187, 107, 217, 0.1);
  color: #bb6bd9;
  border-color: rgba(187, 107, 217, 0.3);
}

.sexo.castrado,
.sexo.esterilizado {
  background: rgba(0, 128, 150, 0.1);
  color: var(--color-accent);
  border-color: rgba(0, 128, 150, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    padding: 1.5rem;
  }

  .profile-header,
  .profile-content {
    padding: 1.8rem;
  }

  .form-grid,
  .mascotas-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .avatar,
  .avatar-static {
    width: 90px;
    height: 90px;
  }

  .user-name {
    font-size: 1.8rem;
  }

  .profile-tabs {
    flex-direction: column;
    gap: 6px;
    padding: 0.5rem;
  }

  .tab-btn {
    padding: 0.75rem;
    font-size: 0.95rem;
    justify-content: center;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .section-header h3 {
    font-size: 1.5rem;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }
  
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .mascota-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .mascota-avatar {
    width: 90px;
    height: 90px;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-header,
  .profile-content {
    padding: 1.5rem;
  }

  .user-name {
    font-size: 1.6rem;
  }

  .tab-btn span {
    display: none;
  }

  .form-grid {
    gap: 1.25rem;
  }
}

/* Toast */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  color: white;
  font-weight: 400;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toast.success {
  background: #10b981;
}

.toast.error {
  background: #ef4444;
}
</style>