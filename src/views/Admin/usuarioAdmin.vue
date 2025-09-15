<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const usuarios = ref([])
const loading = ref(false)
const editingUser = ref(null)
const showEditModal = ref(false)
const notification = ref({ message: '', type: '', visible: false })

const formData = ref({
  nombre_completo: '',
  email: '',
  telefono: '',
  direccion: '',
  rol: 'cliente',
})

const fetchUsuarios = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nombre_completo', { ascending: true })
    if (error) throw error
    usuarios.value = data || []
  } catch {
    showNotification('⚠️ Error al cargar usuarios', 'error')
  } finally {
    loading.value = false
  }
}

const openEditModal = (usuario) => {
  editingUser.value = usuario
  formData.value = {
    nombre_completo: usuario.nombre_completo,
    email: usuario.email,
    telefono: usuario.telefono || '',
    direccion: usuario.direccion || '',
    rol: usuario.rol,
  }
  showEditModal.value = true
}

const saveUser = async () => {
  if (!editingUser.value) return
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        ...formData.value,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', editingUser.value.id)
    if (error) throw error
    showNotification('✅ Usuario actualizado', 'success')
    showEditModal.value = false
    fetchUsuarios()
  } catch {
    showNotification('❌ Error al guardar', 'error')
  }
}

const toggleUserStatus = async (usuario) => {
  const action = usuario.is_activo ? 'desactivar' : 'reactivar'
  const message = `¿Deseas ${action} a ${usuario.nombre_completo}? ${
    usuario.is_activo ? 'No podrá iniciar sesión.' : 'Tendrá acceso nuevamente.'
  }`

  if (!confirm(message)) return

  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        is_activo: !usuario.is_activo,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', usuario.id)
    if (error) throw error

    showNotification(
      action === 'desactivar' ? '🚫 Usuario desactivado' : '🟢 Usuario reactivado',
      action === 'desactivar' ? 'warning' : 'success'
    )
    fetchUsuarios()
  } catch {
    showNotification('❌ Error al cambiar estado', 'error')
  }
}

const showNotification = (message, type) => {
  notification.value = { message, type, visible: true }
  setTimeout(() => { notification.value.visible = false }, 3000)
}

onMounted(() => { fetchUsuarios() })
</script>

<template>
  <div class="admin-container">
    <!-- Notificación (fixed, no se ve afectada por sidebar) -->
    <div v-if="notification.visible" :class="`notification ${notification.type}`">
      {{ notification.message }}
    </div>

    <!-- Encabezado -->
    <div class="page-header">
      <h1>👥 Gestión de Usuarios</h1>
      <p class="subtitle">Administra perfiles, roles y accesos del sistema.</p>
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando lista de usuarios...</p>
    </div>

    <!-- Lista de usuarios -->
    <div v-else class="users-grid">
      <div
        v-for="usuario in usuarios"
        :key="usuario.id"
        class="user-card"
        :class="{ 'inactive': !usuario.is_activo }"
      >
        <div class="user-initial">
          {{ usuario.nombre_completo.charAt(0).toUpperCase() }}
        </div>
        <div class="user-details">
          <h3 class="user-name">{{ usuario.nombre_completo }}</h3>
          <p class="user-email">{{ usuario.email }}</p>
          <div class="user-meta">
            <span class="badge" :class="`badge-${usuario.rol}`">
              {{ { cliente: 'Cliente', veterinario: 'Veterinario', admin: 'Administrador' }[usuario.rol] }}
            </span>
            <span v-if="!usuario.is_activo" class="badge badge-inactive">Inactivo</span>
          </div>
        </div>
        <div class="user-actions">
          <button @click="openEditModal(usuario)" class="btn-icon" title="Editar usuario">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button
            @click="toggleUserStatus(usuario)"
            class="btn-toggle"
            :class="{ 'active': usuario.is_activo }"
            :title="usuario.is_activo ? 'Desactivar usuario' : 'Reactivar usuario'"
          >
            <span v-if="usuario.is_activo">🟢 Activo</span>
            <span v-else>🔴 Inactivo</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>✏️ Editar Usuario</h2>
          <button class="close-btn" @click="showEditModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label>Nombre Completo</label>
            <input v-model="formData.nombre_completo" type="text" required />
          </div>
          <div class="form-row">
            <label>Email</label>
            <input v-model="formData.email" type="email" required />
          </div>
          <div class="form-row">
            <label>Teléfono</label>
            <input v-model="formData.telefono" type="tel" />
          </div>
          <div class="form-row">
            <label>Dirección</label>
            <input v-model="formData.direccion" type="text" />
          </div>
          <div class="form-row">
            <label>Rol del usuario</label>
            <div class="select-wrapper">
              <select v-model="formData.rol" class="fancy-select">
                <option value="cliente">👤 Cliente</option>
                <option value="veterinario">🩺 Veterinario</option>
                <option value="admin">👑 Administrador</option>
              </select>
              <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showEditModal = false">Cancelar</button>
          <button class="btn-primary" @click="saveUser">Guardar Cambios</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ✅ Ajuste principal: Contenedor con padding condicional para sidebar */
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #03252b 0%, #0a4a56 100%);
  padding: 2rem;
  color: #e0f7fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  /* ✅ Padding responsivo para sidebar */
  padding-left: calc(2rem + 80px); /* espacio para sidebar colapsado */
  transition: padding-left 0.3s ease;
}

/* ✅ Desktop: sidebar expandido (260px) */
@media (min-width: 1024px) {
  .admin-container {
    padding-left: calc(2rem + 260px);
  }
}

/* ✅ Tablet: sidebar colapsado (80px) */
@media (max-width: 1023px) and (min-width: 769px) {
  .admin-container {
    padding-left: calc(2rem + 80px);
  }
}

/* ✅ Móvil: sin sidebar o overlay, padding normal */
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

.badge-cliente { background: rgba(129, 212, 250, 0.2); color: #81d4fa; }
.badge-veterinario { background: rgba(165, 214, 167, 0.2); color: #a5d6a7; }
.badge-admin { background: rgba(255, 204, 128, 0.2); color: #ffcc80; }
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

/* Modal */
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

.form-row input {
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(77, 208, 225, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 1rem;
  transition: border 0.2s;
}

.form-row input:focus {
  outline: none;
  border-color: #80deea;
  box-shadow: 0 0 0 2px rgba(128, 222, 234, 0.2);
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

/* Notificación (fixed, no depende del contenedor) */
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

/* ✅ Responsive final */
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
