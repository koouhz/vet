<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// Estados
const citas = ref([])
const veterinarios = ref([])
const servicios = ref([])
const especialidades = ref([])
const loading = ref(false)
const editingCita = ref(null)
const showEditModal = ref(false)
const notification = ref({ message: '', type: '', visible: false })
const stats = ref({
  total: 0,
  programadas: 0,
  confirmadas: 0,
  completadas: 0,
  canceladas: 0,
  no_asistio: 0,
  especialidadMasUsada: '',
  citasPorMes: []
})

// Filtros
const filtroEstado = ref('todas')
const filtroVeterinario = ref('todos')
const filtroServicio = ref('todos')
const searchCliente = ref('')

// Cargar datos
const fetchCitas = async () => {
  loading.value = true
  try {
    const {  data, error } = await supabase
      .from('citasmascotas')
      .select(`
        id,
        fecha,
        hora,
        estado,
        observaciones,
        estado_pago,
        metodo_pago,
        creado_en,
        usuario_id,
        mascota_id,
        veterinario_id,
        servicio_id,
        creada_por,
        usuario:usuarios!citasmascotas_usuario_id_fkey ( nombre_completo, email ),
        mascota:mascotas ( nombre, especie ),
        veterinario:veterinarios ( id, usuario_id ),
        servicio:servicios ( id, titulo ),
        vet_usuario: veterinarios!inner(usuario:usuarios!veterinarios_usuario_id_fkey ( nombre_completo )),
        especialidad_vet: veterinarios!inner(especialidad:especialidades ( nombre )),
        especialidad_serv: servicios!inner(especialidad:especialidades ( nombre ))
      `)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: true })

    if (error) throw error

    citas.value = (data || []).map(cita => ({
      ...cita,
      usuario: cita.usuario || { nombre_completo: 'Usuario no encontrado', email: '' },
      mascota: cita.mascota || { nombre: 'Mascota no encontrada', especie: 'Desconocida' },
      veterinario: {
        ...cita.veterinario,
        nombre: cita.vet_usuario?.usuario?.nombre_completo || 'Veterinario no encontrado'
      },
      servicio: cita.servicio || { titulo: 'Servicio no encontrado' },
      especialidad_vet: cita.especialidad_vet || { nombre: 'Sin especialidad' },
      especialidad_serv: cita.especialidad_serv || { nombre: 'Sin especialidad' }
    }))

    await fetchEstadisticas()
    await fetchCatalogos()
    showNotification('✅ Citas cargadas correctamente', 'success')
  } catch (err) {
    console.error('❌ Error al cargar citas:', err.message)
    showNotification('⚠️ Error al cargar citas', 'error')
  } finally {
    loading.value = false
  }
}

const fetchEstadisticas = async () => {
  try {
    // Estadísticas básicas
    const {  statsData, error: statsError } = await supabase
      .from('citasmascotas')
      .select('estado')
    if (statsError) throw statsError

    const estados = statsData.reduce((acc, cita) => {
      acc[cita.estado] = (acc[cita.estado] || 0) + 1
      return acc
    }, {})

    // Especialidad más usada (placeholder)
    const espMasUsada = 'General'

    // Citas por mes (placeholder)
    const citasPorMes = [
      { mes: 'Ene', total: 15 },
      { mes: 'Feb', total: 20 },
      { mes: 'Mar', total: 18 }
    ]

    stats.value = {
      total: statsData.length,
      programadas: estados.programada || 0,
      confirmadas: estados.confirmada || 0,
      completadas: estados.completada || 0,
      canceladas: estados.cancelada || 0,
      no_asistio: estados.no_asistio || 0,
      especialidadMasUsada: espMasUsada,
      citasPorMes: citasPorMes
    }
  } catch (err) {
    console.error('Error al cargar estadísticas:', err.message)
  }
}

const fetchCatalogos = async () => {
  try {
    // Veterinarios activos
    const {  vets, error: vetError } = await supabase
      .from('veterinarios')
      .select('id, usuario_id')
      .eq('is_activo', true)
    if (!vetError) {
      const userIds = vets.map(v => v.usuario_id)
      const {  users, userError } = await supabase
        .from('usuarios')
        .select('id, nombre_completo')
        .in('id', userIds)
      if (!userError) {
        veterinarios.value = vets.map(v => ({
          ...v,
          nombre: users.find(u => u.id === v.usuario_id)?.nombre_completo || 'Sin nombre'
        }))
      }
    }

    // Servicios activos
    const {  servs, error: servError } = await supabase
      .from('servicios')
      .select('id, titulo, especialidad_id')
      .eq('is_activo', true)
    if (!servError) servicios.value = servs

    // Especialidades activas
    const {  esp, error: espError } = await supabase
      .from('especialidades')
      .select('id, nombre')
      .eq('is_activa', true)
    if (!espError) especialidades.value = esp
  } catch (err) {
    console.error('Error al cargar catálogos:', err.message)
  }
}

// Filtro computado
const filteredCitas = computed(() => {
  return citas.value.filter(cita => {
    if (filtroEstado.value !== 'todas' && cita.estado !== filtroEstado.value) return false
    if (filtroVeterinario.value !== 'todos' && cita.veterinario.id.toString() !== filtroVeterinario.value) return false
    if (filtroServicio.value !== 'todos' && cita.servicio.id.toString() !== filtroServicio.value) return false
    if (searchCliente.value && !cita.usuario.nombre_completo.toLowerCase().includes(searchCliente.value.toLowerCase())) return false
    return true
  })
})

// Acciones
const openEditModal = (cita) => {
  editingCita.value = { ...cita }
  showEditModal.value = true
}

const saveCita = async () => {
  if (!editingCita.value) return
  try {
    const { error } = await supabase
      .from('citasmascotas')
      .update({
        veterinario_id: editingCita.value.veterinario.id,
        servicio_id: editingCita.value.servicio.id,
        fecha: editingCita.value.fecha,
        hora: editingCita.value.hora,
        estado: editingCita.value.estado,
        observaciones: editingCita.value.observaciones,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', editingCita.value.id)

    if (error) throw error
    showNotification('✅ Cita actualizada', 'success')
    showEditModal.value = false
    fetchCitas()
  } catch (err) {
    console.error('Error al guardar cita:', err.message)
    showNotification('❌ Error al guardar', 'error')
  }
}

const cancelarCita = async (cita) => {
  if (!confirm(`¿Cancelar cita de ${cita.usuario.nombre_completo} para ${cita.mascota.nombre}?`)) return
  try {
    const { error } = await supabase
      .from('citasmascotas')
      .update({
        estado: 'cancelada',
        actualizado_en: new Date().toISOString()
      })
      .eq('id', cita.id)
    if (error) throw error
    showNotification('🚫 Cita cancelada', 'warning')
    fetchCitas()
  } catch (err) {
    showNotification('❌ Error al cancelar', 'error')
  }
}

const completarCita = async (cita) => {
  if (!confirm(`¿Marcar como completada la cita de ${cita.usuario.nombre_completo}?`)) return
  try {
    const { error } = await supabase
      .from('citasmascotas')
      .update({
        estado: 'completada',
        actualizado_en: new Date().toISOString()
      })
      .eq('id', cita.id)
    if (error) throw error
    showNotification('✅ Cita completada', 'success')
    fetchCitas()
  } catch (err) {
    showNotification('❌ Error al completar', 'error')
  }
}

// Notificación
const showNotification = (message, type) => {
  notification.value = { message, type, visible: true }
  setTimeout(() => { notification.value.visible = false }, 3000)
}

// Hooks
onMounted(() => { fetchCitas() })
</script>

<template>
  <div class="admin-container">
    <!-- Notificación -->
    <div v-if="notification.visible" :class="`notification ${notification.type}`">
      {{ notification.message }}
    </div>

    <!-- Header -->
    <div class="page-header">
      <h1>📅 Gestión de Citas</h1>
      <p class="subtitle">Administra, reprograma y analiza las citas del sistema.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando citas...</p>
    </div>

    <!-- Estadísticas -->
    <div v-else class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">Total Citas</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">{{ stats.completadas }}</div>
        <div class="stat-label">Completadas</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">{{ stats.canceladas }}</div>
        <div class="stat-label">Canceladas</div>
      </div>
      <div class="stat-card info">
        <div class="stat-value">{{ stats.especialidadMasUsada || 'N/A' }}</div>
        <div class="stat-label">Especialidad más usada</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-container">
      <div class="filter-group">
        <label>Estado</label>
        <select v-model="filtroEstado" class="fancy-select">
          <option value="todas">Todas</option>
          <option value="programada">Programada</option>
          <option value="confirmada">Confirmada</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
          <option value="no_asistio">No asistió</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Veterinario</label>
        <select v-model="filtroVeterinario" class="fancy-select">
          <option value="todos">Todos</option>
          <option v-for="vet in veterinarios" :key="vet.id" :value="vet.id">
            {{ vet.nombre }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Servicio</label>
        <select v-model="filtroServicio" class="fancy-select">
          <option value="todos">Todos</option>
          <option v-for="serv in servicios" :key="serv.id" :value="serv.id">
            {{ serv.titulo }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Cliente</label>
        <input v-model="searchCliente" type="text" placeholder="Buscar cliente..." class="search-input" />
      </div>
    </div>

    <!-- Lista de citas -->
    <div class="citas-grid">
      <div v-if="filteredCitas.length === 0" class="no-data">
        🗓️ No hay citas que coincidan con los filtros.
      </div>
      <div
        v-for="cita in filteredCitas"
        :key="cita.id"
        class="cita-card"
        :class="{ 'estado-programada': cita.estado === 'programada', 'estado-confirmada': cita.estado === 'confirmada', 'estado-completada': cita.estado === 'completada', 'estado-cancelada': cita.estado === 'cancelada' }"
      >
        <div class="cita-header">
          <div class="cita-estado">
            <span :class="`badge estado-${cita.estado}`">
              {{ cita.estado }}
            </span>
          </div>
          <div class="cita-fecha">
            {{ new Date(cita.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) }}
            <br>
            <strong>{{ cita.hora }}</strong>
          </div>
        </div>
        <div class="cita-body">
          <h3 class="cita-cliente">{{ cita.usuario.nombre_completo }}</h3>
          <p class="cita-mascota">🐾 {{ cita.mascota.nombre }} ({{ cita.mascota.especie }})</p>
          <p class="cita-servicio">🩺 {{ cita.servicio.titulo }}</p>
          <p class="cita-vet">👨‍⚕️ Dr. {{ cita.veterinario.nombre }}</p>
          <p class="cita-pago" v-if="cita.estado_pago">
            💰 {{ cita.estado_pago }} - {{ cita.metodo_pago || 'N/A' }}
          </p>
        </div>
        <div class="cita-actions">
          <button @click="openEditModal(cita)" class="btn-icon" title="Reprogramar/Editar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <button @click="cancelarCita(cita)" v-if="cita.estado !== 'cancelada'" class="btn-danger" title="Cancelar cita">
            ❌
          </button>
          <button @click="completarCita(cita)" v-if="cita.estado !== 'completada' && cita.estado !== 'cancelada'" class="btn-success" title="Marcar como completada">
            ✅
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>✏️ Editar Cita</h2>
          <button class="close-btn" @click="showEditModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label>Cliente</label>
            <div class="readonly-field">
              {{ editingCita?.usuario?.nombre_completo }}
            </div>
          </div>
          <div class="form-row">
            <label>Mascota</label>
            <div class="readonly-field">
              {{ editingCita?.mascota?.nombre }} ({{ editingCita?.mascota?.especie }})
            </div>
          </div>
          <div class="form-row">
            <label>Fecha</label>
            <input v-model="editingCita.fecha" type="date" class="fancy-input" />
          </div>
          <div class="form-row">
            <label>Hora</label>
            <input v-model="editingCita.hora" type="time" class="fancy-input" />
          </div>
          <div class="form-row">
            <label>Veterinario</label>
            <select v-model="editingCita.veterinario.id" class="fancy-select">
              <option v-for="vet in veterinarios" :key="vet.id" :value="vet.id">
                {{ vet.nombre }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <label>Servicio</label>
            <select v-model="editingCita.servicio.id" class="fancy-select">
              <option v-for="serv in servicios" :key="serv.id" :value="serv.id">
                {{ serv.titulo }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <label>Estado</label>
            <select v-model="editingCita.estado" class="fancy-select">
              <option value="programada">Programada</option>
              <option value="confirmada">Confirmada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="no_asistio">No asistió</option>
            </select>
          </div>
          <div class="form-row">
            <label>Observaciones</label>
            <textarea v-model="editingCita.observaciones" class="fancy-textarea" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showEditModal = false">Cancelar</button>
          <button class="btn-primary" @click="saveCita">Guardar Cambios</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #03252b 0%, #0a4a56 100%);
  padding: 2rem;
  color: #e0f7fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding-left: calc(2rem + 80px);
}

@media (min-width: 1024px) {
  .admin-container {
    padding-left: calc(2rem + 260px);
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
  margin: 0 0 2rem;
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

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(128, 222, 234, 0.2);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #ffffff;
}

.stat-label {
  font-size: 0.9rem;
  color: #b2ebf2;
}

.stat-card.success { border-color: rgba(165, 214, 167, 0.3); background: rgba(165, 214, 167, 0.1); }
.stat-card.warning { border-color: rgba(255, 138, 128, 0.3); background: rgba(255, 138, 128, 0.1); }
.stat-card.info { border-color: rgba(129, 212, 250, 0.3); background: rgba(129, 212, 250, 0.1); }

/* Filtros */
.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  border-radius: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #80deea;
  font-size: 0.9rem;
}

.search-input,
.fancy-select,
.fancy-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(77, 208, 225, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 1rem;
  transition: border 0.2s;
}

.search-input:focus,
.fancy-select:focus,
.fancy-input:focus {
  outline: none;
  border-color: #80deea;
  box-shadow: 0 0 0 2px rgba(128, 222, 234, 0.2);
}

.fancy-textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(77, 208, 225, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
}

.readonly-field {
  width: 100%;
  padding: 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #b2ebf2;
  font-size: 1rem;
  border: 1px solid rgba(77, 208, 225, 0.3);
}

/* Citas */
.citas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.5rem;
}

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

.cita-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(77, 208, 225, 0.15);
  transition: all 0.25s ease;
}

.cita-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.08);
}

.cita-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(128, 222, 234, 0.2);
}

.cita-estado .badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.estado-programada { background: rgba(129, 212, 250, 0.2); color: #81d4fa; }
.estado-confirmada { background: rgba(165, 214, 167, 0.2); color: #a5d6a7; }
.estado-completada { background: rgba(159, 168, 218, 0.2); color: #9fa8da; }
.estado-cancelada { background: rgba(255, 138, 128, 0.2); color: #ff8a80; }

.cita-fecha {
  text-align: right;
  font-weight: 600;
  color: #ffffff;
  font-size: 0.9rem;
}

.cita-body h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #ffffff;
}

.cita-body p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #b2ebf2;
}

.cita-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-icon,
.btn-danger,
.btn-success {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #80deea;
}

.btn-icon:hover {
  background: rgba(128, 222, 234, 0.2);
  transform: scale(1.05);
}

.btn-danger {
  background: rgba(255, 138, 128, 0.2);
  border: 1px solid rgba(255, 138, 128, 0.3);
  color: #ff8a80;
}

.btn-danger:hover {
  background: rgba(255, 138, 128, 0.3);
}

.btn-success {
  background: rgba(165, 214, 167, 0.2);
  border: 1px solid rgba(165, 214, 167, 0.3);
  color: #a5d6a7;
}

.btn-success:hover {
  background: rgba(165, 214, 167, 0.3);
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
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(77, 208, 225, 0.3);
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

/* Notificación */
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

@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
    padding-left: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-container {
    grid-template-columns: 1fr;
  }

  .citas-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    padding: 1.5rem;
    margin: 1rem;
  }
}
</style>