<template>
  <div class="configuracion-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Configuración del Sistema</h1>
        <p class="subtitle">Gestiona los parámetros de configuración del sistema.</p>
        <button @click="abrirModalCrear" class="btn btn--success">+ Nuevo Parámetro</button>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando configuración...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadConfiguracion" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="configuraciones.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
            <path d="M19.4 15C19.9523 15.6152 20.2845 16.3455 20.3452 17.1C20.4059 17.8545 20.1925 18.5889 19.7462 19.1991C19.2999 19.8093 18.655 20.2509 17.9366 20.4277C17.2182 20.6046 16.4693 20.5014 15.8 20.14C14.2874 19.3326 13.1573 18.0549 12.6293 16.5C12.1013 14.9451 12.2162 13.269 12.9482 11.85C13.6802 10.431 14.9533 9.39837 16.4 9C17.8467 8.60163 19.4425 8.65789 20.8 9.14C22.1575 9.62211 23.1595 10.5076 23.54 11.6C23.9205 12.6924 23.656 13.874 22.84 14.8C22.024 15.726 20.7753 16.2496 19.4 15Z" />
            <path d="M4.6 15C5.15231 15.6152 5.48448 16.3455 5.54518 17.1C5.60588 17.8545 5.39252 18.5889 4.94618 19.1991C4.49984 19.8093 3.85494 20.2509 3.13656 20.4277C2.41819 20.6046 1.66932 20.5014 1 20.14C-0.51264 19.3326 -1.64268 18.0549 -2.17066 16.5C-2.69864 14.9451 -2.58378 13.269 -1.85178 11.85C-1.11979 10.431 0.153339 9.39837 1.6 9C3.04666 8.60163 4.64249 8.65789 6 9.14C7.35751 9.62211 8.35952 10.5076 8.74 11.6C9.12048 12.6924 8.85599 13.874 8.04 14.8C7.224 15.726 5.97527 16.2496 4.6 15Z" />
          </svg>
          <p>No hay parámetros de configuración definidos.</p>
        </div>

        <div v-else class="configuracion-grid">
          <div
            v-for="config in configuraciones"
            :key="config.clave"
            class="configuracion-card"
          >
            <div class="card-header">
              <h3 class="clave">{{ config.clave }}</h3>
              <div class="acciones">
                <button @click="editarConfiguracion(config)" class="btn btn--outline">Editar</button>
                <button @click="eliminarConfiguracion(config.clave)" class="btn btn--delete">Eliminar</button>
              </div>
            </div>

            <div class="card-body">
              <div v-if="config.descripcion" class="info-row">
                <span class="label">Descripción:</span>
                <span class="value">{{ config.descripcion }}</span>
              </div>
              <div class="info-row">
                <span class="label">Valor:</span>
                <pre class="valor-json">{{ formatJSON(config.valor) }}</pre>
              </div>
              <div v-if="config.actualizado_por" class="info-row">
                <span class="label">Actualizado por:</span>
                <span class="value">{{ config.usuario_nombre || '—' }}</span>
              </div>
              <div v-if="config.actualizado_en" class="info-row">
                <span class="label">Fecha:</span>
                <span class="value">{{ formatDate(config.actualizado_en) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      <div v-if="showModal" class="modal-overlay" @click="cerrarModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingConfig ? 'Editar Parámetro' : 'Crear Parámetro' }}</h2>
            <button @click="cerrarModal" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Clave *</label>
              <input
                v-model="formConfig.clave"
                type="text"
                class="form-input"
                placeholder="Nombre único del parámetro"
                :disabled="editingConfig"
                required
              />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea
                v-model="formConfig.descripcion"
                class="form-input textarea"
                placeholder="Descripción del parámetro"
                rows="2"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Valor (JSON) *</label>
              <textarea
                v-model="valorJSON"
                class="form-input textarea json-editor"
                placeholder='{"ejemplo": "valor"}'
                rows="8"
                required
              ></textarea>
              <div v-if="jsonError" class="json-error">
                {{ jsonError }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="cerrarModal" class="btn btn--outline">Cancelar</button>
            <button @click="guardarConfiguracion" class="btn btn--success" :disabled="isProcessing">
              {{ isProcessing ? 'Guardando...' : (editingConfig ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import AppSidebar from '@/components/layouts/AppSidebar.vue'

// Estado
const isLoading = ref(false)
const isProcessing = ref(false)
const error = ref(null)
const configuraciones = ref([])

// Modal
const showModal = ref(false)
const editingConfig = ref(null)
const formConfig = ref({
  clave: '',
  descripcion: '',
  valor: {}
})
const valorJSON = ref('')
const jsonError = ref('')

// Formateo
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatJSON = (obj) => {
  if (typeof obj !== 'object' || obj === null) return String(obj)
  return JSON.stringify(obj, null, 2)
}

// Cargar configuración
const loadConfiguracion = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Cargar configuraciones
    const { data: configData, error: configError } = await supabase
      .from('configuracionesistema')
      .select('clave, valor, descripcion, actualizado_por, actualizado_en')
      .order('clave', { ascending: true })

    if (configError) {
      console.error('Error al cargar configuración:', configError)
      throw new Error('Error al cargar la configuración')
    }

    if (configData.length === 0) {
      configuraciones.value = []
      isLoading.value = false
      return
    }

    // Obtener nombres de usuarios
    const usuarioIds = [...new Set(configData.map(c => c.actualizado_por).filter(Boolean))]
    const usuariosMap = {}

    if (usuarioIds.length > 0) {
      const {  usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, nombre_completo')
        .in('id', usuarioIds)

      if (!usuariosError && usuariosData) {
        usuariosData.forEach(u => { usuariosMap[u.id] = u.nombre_completo })
      }
    }

    // Combinar datos
    configuraciones.value = configData.map(config => ({
      ...config,
      usuario_nombre: usuariosMap[config.actualizado_por] || null
    }))

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar configuración. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Abrir modal crear
const abrirModalCrear = () => {
  editingConfig.value = null
  formConfig.value = {
    clave: '',
    descripcion: '',
    valor: {}
  }
  valorJSON.value = '{}'
  jsonError.value = ''
  showModal.value = true
}

// Editar configuración
const editarConfiguracion = (config) => {
  editingConfig.value = config
  formConfig.value = { ...config }
  valorJSON.value = JSON.stringify(config.valor, null, 2)
  jsonError.value = ''
  showModal.value = true
}

// Cerrar modal
const cerrarModal = () => {
  showModal.value = false
  editingConfig.value = null
  jsonError.value = ''
}

// Validar JSON
const validarJSON = () => {
  try {
    const parsed = JSON.parse(valorJSON.value)
    jsonError.value = ''
    return parsed
  } catch (err) {
    jsonError.value = 'JSON inválido: ' + err.message
    return null
  }
}

// Guardar configuración
const guardarConfiguracion = async () => {
  if (isProcessing.value) return

  const valorValido = validarJSON()
  if (!valorValido) return

  if (!formConfig.value.clave.trim()) {
    alert('La clave es obligatoria')
    return
  }

  isProcessing.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const updateData = {
      clave: formConfig.value.clave,
      valor: valorValido,
      descripcion: formConfig.value.descripcion || null,
      actualizado_por: user.id,
      actualizado_en: new Date().toISOString()
    }

    if (editingConfig.value) {
      // Actualizar
      const { error: updateError } = await supabase
        .from('configuracionesistema')
        .update(updateData)
        .eq('clave', editingConfig.value.clave)

      if (updateError) throw updateError
    } else {
      // Crear
      const { error: insertError } = await supabase
        .from('configuracionesistema')
        .insert([updateData])

      if (insertError) throw insertError
    }

    await loadConfiguracion()
    cerrarModal()
    alert(editingConfig.value ? 'Parámetro actualizado correctamente' : 'Parámetro creado correctamente')

  } catch (err) {
    console.error('Error al guardar configuración:', err)
    alert('Error al guardar el parámetro. Verifica que la clave no esté duplicada.')
  } finally {
    isProcessing.value = false
  }
}

// Eliminar configuración
const eliminarConfiguracion = async (clave) => {
  if (!confirm(`¿Eliminar el parámetro "${clave}"? Esta acción no se puede deshacer.`)) return

  try {
    const { error: deleteError } = await supabase
      .from('configuracionesistema')
      .delete()
      .eq('clave', clave)

    if (deleteError) throw deleteError
    await loadConfiguracion()
    alert('Parámetro eliminado correctamente')

  } catch (err) {
    console.error('Error al eliminar:', err)
    alert('Error al eliminar el parámetro')
  }
}

onMounted(() => {
  loadConfiguracion()
})
</script>

<style scoped>
/* Estilos coherentes con el dashboard admin */
.configuracion-admin-container {
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

.configuracion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.configuracion-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.configuracion-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.clave {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  word-break: break-all;
}

.acciones {
  display: flex;
  gap: 0.5rem;
}

.card-body {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  margin: 0.75rem 0;
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

.valor-json {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
  white-space: pre-wrap;
  border: 1px solid #e2e8f0;
}

.json-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  white-space: nowrap;
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

.btn--delete {
  background: #7f1d1d;
  color: white;
}

.btn--delete:hover:not(:disabled) {
  background: #991b1b;
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
  max-width: 600px;
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

.json-editor {
  font-family: monospace;
  font-size: 0.9rem;
}

.form-input:focus {
  outline: none;
  border-color: #145a32;
  box-shadow: 0 0 0 3px rgba(20, 90, 50, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 480px) {
  .configuracion-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .configuracion-card {
    padding: 1.25rem;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .acciones {
    justify-content: flex-end;
  }

  .btn {
    width: auto;
    padding: 0.5rem 1rem;
  }
}
</style>
