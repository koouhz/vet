<template>
  <div class="mensajes-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Mensajes de Contacto</h1>
        <p class="subtitle">Gestiona los mensajes de contacto de clientes.</p>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-item">
          <label for="filter-leido" class="filter-label">Estado</label>
          <select
            id="filter-leido"
            :value="selectedLeido"
            @change="handleLeidoChange"
            class="status-select"
          >
            <option value="">Todos</option>
            <option value="false">No leídos</option>
            <option value="true">Leídos</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filter-prioridad" class="filter-label">Prioridad</label>
          <select
            id="filter-prioridad"
            :value="selectedPrioridad"
            @change="handlePrioridadChange"
            class="status-select"
          >
            <option value="">Todas</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filter-asignado" class="filter-label">Asignado a</label>
          <select
            id="filter-asignado"
            :value="selectedAsignado"
            @change="handleAsignadoChange"
            class="status-select"
          >
            <option value="">Cualquiera</option>
            <option value="none">Sin asignar</option>
            <option v-for="user in administradores" :key="user.id" :value="user.id">
              {{ user.nombre_completo }}
            </option>
          </select>
        </div>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando mensajes...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadMensajes" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredMensajes.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" />
            <path d="M2 6L12 13L22 6" />
          </svg>
          <p>No hay mensajes que coincidan con los filtros.</p>
        </div>

        <div v-else class="mensajes-grid">
          <div
            v-for="mensaje in filteredMensajes"
            :key="mensaje.id"
            class="mensaje-card"
            :class="{ 'no-leido': !mensaje.leido, 'prioridad-urgente': mensaje.prioridad === 'urgente', 'prioridad-alta': mensaje.prioridad === 'alta' }"
          >
            <div class="card-header">
              <div class="cliente-info">
                <h3 class="cliente-nombre">{{ mensaje.nombre }}</h3>
                <span class="email">{{ mensaje.email }}</span>
                <span v-if="mensaje.telefono" class="telefono">{{ mensaje.telefono }}</span>
              </div>
              <div class="estado-badges">
                <span class="badge" :class="`badge--${mensaje.leido ? 'leido' : 'no-leido'}`">
                  {{ mensaje.leido ? 'Leído' : 'No leído' }}
                </span>
                <span class="badge" :class="`badge--prioridad-${mensaje.prioridad}`">
                  {{ getPrioridadLabel(mensaje.prioridad) }}
                </span>
              </div>
            </div>

            <div class="card-body">
              <div v-if="mensaje.asunto" class="info-row">
                <span class="label">Asunto:</span>
                <span class="value">{{ mensaje.asunto }}</span>
              </div>
              <div v-if="mensaje.nombre_mascota" class="info-row">
                <span class="label">Mascota:</span>
                <span class="value">{{ mensaje.nombre_mascota }}</span>
              </div>
              <div class="mensaje-contenido">
                <span class="label">Mensaje:</span>
                <p class="contenido">{{ mensaje.mensaje }}</p>
              </div>
              <div v-if="mensaje.respuesta" class="respuesta">
                <span class="label">Respuesta:</span>
                <p class="contenido">{{ mensaje.respuesta }}</p>
                <div v-if="mensaje.respondido_en" class="fecha-respuesta">
                  Respondido: {{ formatDate(mensaje.respondido_en) }}
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="acciones">
                <button
                  v-if="!mensaje.leido"
                  @click="marcarLeido(mensaje.id)"
                  class="btn btn--success"
                >
                  Marcar leído
                </button>
                <button
                  v-if="!mensaje.respuesta"
                  @click="abrirModalResponder(mensaje)"
                  class="btn btn--outline"
                >
                  Responder
                </button>
                <button
                  v-if="mensaje.asignado_a"
                  @click="desasignarMensaje(mensaje.id)"
                  class="btn btn--warning"
                >
                  Desasignar
                </button>
                <button
                  v-else
                  @click="abrirModalAsignar(mensaje)"
                  class="btn btn--assign"
                >
                  Asignar
                </button>
                <button @click="eliminarMensaje(mensaje.id)" class="btn btn--delete">
                  Eliminar
                </button>
              </div>
              <div class="fecha">
                <span class="label">Recibido:</span>
                <span class="value">{{ formatDate(mensaje.creado_en) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Responder -->
      <div v-if="showResponderModal" class="modal-overlay" @click="cerrarModalResponder">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Responder a {{ mensajeSeleccionado?.nombre }}</h2>
            <button @click="cerrarModalResponder" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Respuesta *</label>
              <textarea
                v-model="respuestaTexto"
                class="form-input textarea"
                placeholder="Escribe tu respuesta..."
                rows="4"
                required
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="cerrarModalResponder" class="btn btn--outline">Cancelar</button>
            <button @click="responderMensaje" class="btn btn--success" :disabled="isProcessing">
              {{ isProcessing ? 'Enviando...' : 'Enviar respuesta' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Asignar -->
      <div v-if="showAsignarModal" class="modal-overlay" @click="cerrarModalAsignar">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Asignar mensaje</h2>
            <button @click="cerrarModalAsignar" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Asignar a *</label>
              <select v-model="usuarioAsignado" class="form-input" required>
                <option value="">Selecciona un administrador</option>
                <option v-for="user in administradores" :key="user.id" :value="user.id">
                  {{ user.nombre_completo }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="cerrarModalAsignar" class="btn btn--outline">Cancelar</button>
            <button @click="asignarMensaje" class="btn btn--success" :disabled="isProcessing">
              {{ isProcessing ? 'Asignando...' : 'Asignar' }}
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
const rawMensajes = ref([])
const selectedLeido = ref('')
const selectedPrioridad = ref('')
const selectedAsignado = ref('')

// Listas para filtros
const administradores = ref([])

// Modales
const showResponderModal = ref(false)
const showAsignarModal = ref(false)
const mensajeSeleccionado = ref(null)
const respuestaTexto = ref('')
const usuarioAsignado = ref('')

// Handlers
const handleLeidoChange = (event) => {
  selectedLeido.value = event.target.value
}

const handlePrioridadChange = (event) => {
  selectedPrioridad.value = event.target.value
}

const handleAsignadoChange = (event) => {
  selectedAsignado.value = event.target.value
}

// Mensajes filtrados
const filteredMensajes = computed(() => {
  return rawMensajes.value.filter(mensaje => {
    const matchLeido = selectedLeido.value === '' ||
      (selectedLeido.value === 'true' && mensaje.leido) ||
      (selectedLeido.value === 'false' && !mensaje.leido)

    const matchPrioridad = !selectedPrioridad.value || mensaje.prioridad === selectedPrioridad.value

    let matchAsignado = true
    if (selectedAsignado.value === 'none') {
      matchAsignado = !mensaje.asignado_a
    } else if (selectedAsignado.value) {
      matchAsignado = mensaje.asignado_a === selectedAsignado.value
    }

    return matchLeido && matchPrioridad && matchAsignado
  })
})

// Etiquetas
const prioridadLabels = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente'
}

// Formateo
const getPrioridadLabel = (prioridad) => prioridadLabels[prioridad] || prioridad

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

// Cargar mensajes
const loadMensajes = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Cargar administradores para asignación
    const { data: adminsData, error: adminsError } = await supabase
      .from('usuarios')
      .select('id, nombre_completo')
      .eq('rol', 'admin')
      .eq('is_activo', true)

    if (adminsError) throw new Error('Error al cargar administradores')
    administradores.value = adminsData

    // Cargar mensajes
    const { data, error: mensajesError } = await supabase
      .from('mensajescontacto')
      .select('*')
      .order('creado_en', { ascending: false })

    if (mensajesError) {
      console.error('Error al cargar mensajes:', mensajesError)
      throw new Error('Error al cargar mensajes')
    }

    rawMensajes.value = data

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar mensajes. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Marcar como leído
const marcarLeido = async (mensajeId) => {
  try {
    const { error: updateError } = await supabase
      .from('mensajescontacto')
      .update({ leido: true })
      .eq('id', mensajeId)

    if (updateError) throw updateError
    await loadMensajes()
  } catch (err) {
    console.error('Error al marcar como leído:', err)
    alert('Error al actualizar el mensaje')
  }
}

// Abrir modal responder
const abrirModalResponder = (mensaje) => {
  mensajeSeleccionado.value = mensaje
  respuestaTexto.value = ''
  showResponderModal.value = true
}

// Cerrar modal responder
const cerrarModalResponder = () => {
  showResponderModal.value = false
  mensajeSeleccionado.value = null
  respuestaTexto.value = ''
}

// Responder mensaje
const responderMensaje = async () => {
  if (isProcessing.value) return
  if (!respuestaTexto.value.trim()) {
    alert('La respuesta no puede estar vacía')
    return
  }
  isProcessing.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { error: updateError } = await supabase
      .from('mensajescontacto')
      .update({
        respuesta: respuestaTexto.value,
        respondido_en: new Date().toISOString(),
        leido: true,
        asignado_a: user.id
      })
      .eq('id', mensajeSeleccionado.value.id)

    if (updateError) throw updateError
    await loadMensajes()
    cerrarModalResponder()
    alert('Respuesta enviada correctamente')

  } catch (err) {
    console.error('Error al responder:', err)
    alert('Error al enviar la respuesta')
  } finally {
    isProcessing.value = false
  }
}

// Abrir modal asignar
const abrirModalAsignar = (mensaje) => {
  mensajeSeleccionado.value = mensaje
  usuarioAsignado.value = ''
  showAsignarModal.value = true
}

// Cerrar modal asignar
const cerrarModalAsignar = () => {
  showAsignarModal.value = false
  mensajeSeleccionado.value = null
  usuarioAsignado.value = ''
}

// Asignar mensaje
const asignarMensaje = async () => {
  if (isProcessing.value) return
  if (!usuarioAsignado.value) {
    alert('Selecciona un administrador')
    return
  }
  isProcessing.value = true

  try {
    const { error: updateError } = await supabase
      .from('mensajescontacto')
      .update({ asignado_a: usuarioAsignado.value })
      .eq('id', mensajeSeleccionado.value.id)

    if (updateError) throw updateError
    await loadMensajes()
    cerrarModalAsignar()
    alert('Mensaje asignado correctamente')

  } catch (err) {
    console.error('Error al asignar:', err)
    alert('Error al asignar el mensaje')
  } finally {
    isProcessing.value = false
  }
}

// Desasignar mensaje
const desasignarMensaje = async (mensajeId) => {
  if (!confirm('¿Desasignar este mensaje?')) return

  try {
    const { error: updateError } = await supabase
      .from('mensajescontacto')
      .update({ asignado_a: null })
      .eq('id', mensajeId)

    if (updateError) throw updateError
    await loadMensajes()
  } catch (err) {
    console.error('Error al desasignar:', err)
    alert('Error al desasignar el mensaje')
  }
}

// Eliminar mensaje
const eliminarMensaje = async (mensajeId) => {
  if (!confirm('¿Eliminar permanentemente este mensaje?')) return

  try {
    const { error: deleteError } = await supabase
      .from('mensajescontacto')
      .delete()
      .eq('id', mensajeId)

    if (deleteError) throw deleteError
    await loadMensajes()
    alert('Mensaje eliminado correctamente')

  } catch (err) {
    console.error('Error al eliminar:', err)
    alert('Error al eliminar el mensaje')
  }
}

onMounted(() => {
  loadMensajes()
})
</script>

<style scoped>
/* Estilos coherentes con el dashboard admin */
.mensajes-admin-container {
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

  .status-select {
    width: 100%;
  }
}

.page-header {
  margin-bottom: 2rem;
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

.status-select {
  color: #1e293b;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: white;
  transition: border-color 0.2s;
}

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

.mensajes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.mensaje-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.mensaje-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.mensaje-card.no-leido {
  border-left: 4px solid #145a32;
  background: #f0fdf4;
}

.mensaje-card.prioridad-urgente {
  border-left: 4px solid #dc2626;
}

.mensaje-card.prioridad-alta {
  border-left: 4px solid #f59e0b;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.cliente-info {
  flex: 1;
  min-width: 0;
}

.cliente-nombre {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.email, .telefono {
  display: block;
  font-size: 0.875rem;
  color: #64748b;
}

.telefono {
  margin-top: 0.25rem;
}

.estado-badges {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge--leido { background: #dcfce7; color: #166534; }
.badge--no-leido { background: #ffedd5; color: #ea580c; }
.badge--prioridad-baja { background: #dbeafe; color: #1d4ed8; }
.badge--prioridad-media { background: #e0e7ff; color: #4338ca; }
.badge--prioridad-alta { background: #ffedd5; color: #ea580c; }
.badge--prioridad-urgente { background: #fee2e2; color: #dc2626; }

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
  min-width: 80px;
}

.value {
  color: #1e293b;
  flex: 1;
}

.mensaje-contenido, .respuesta {
  margin: 0.75rem 0;
}

.contenido {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1e293b;
  margin: 0.25rem 0 0 0;
  white-space: pre-wrap;
}

.fecha-respuesta {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.acciones {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.fecha {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
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

.btn--success {
  background: #145a32;
  color: white;
}

.btn--success:hover:not(:disabled) {
  background: #0f4c28;
}

.btn--outline {
  background: #f1f5f9;
  color: #1e293b;
}

.btn--outline:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn--warning {
  background: #d97706;
  color: white;
}

.btn--warning:hover:not(:disabled) {
  background: #b45309;
}

.btn--assign {
  background: #7c3aed;
  color: white;
}

.btn--assign:hover:not(:disabled) {
  background: #6d28d9;
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

.textarea {
  resize: vertical;
  min-height: 120px;
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
  .mensajes-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .mensaje-card {
    padding: 1.25rem;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .estado-badges {
    align-items: flex-start;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .acciones {
    justify-content: center;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
