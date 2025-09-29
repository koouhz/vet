<template>
  <div class="citas-vet-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Mis Citas</h1>
        <p class="subtitle">Gestiona tus citas desde la tabla <code>citasmascotas</code>.</p>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-item">
          <label for="filter-date" class="filter-label">Fecha</label>
          <input
            id="filter-date"
            type="date"
            :value="selectedDate"
            @input="handleDateInput"
            class="date-input"
          />
        </div>
        <div class="filter-item">
          <label for="filter-status" class="filter-label">Estado</label>
          <select
            id="filter-status"
            :value="selectedStatus"
            @change="handleStatusChange"
            class="status-select"
          >
            <option value="">Todos</option>
            <option value="programada">Programada</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
            <option value="no_asistio">No asistió</option>
          </select>
        </div>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando citas...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadCitas" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredCitas.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M8 2V5" /><path d="M16 2V5" />
            <path d="M3 9H21" /><path d="M3 15H21" /><path d="M3 21H21" />
          </svg>
          <p>No tienes citas asignadas.</p>
        </div>

        <div v-else class="citas-grid">
          <div
            v-for="cita in filteredCitas"
            :key="cita.id"
            class="cita-card"
          >
            <div class="card-header">
              <div>
                <span class="time">{{ formatTime(cita.hora) }}</span>
                <span class="date">{{ formatDate(cita.fecha) }}</span>
              </div>
              <span class="badge" :class="`badge--${cita.estado}`">
                {{ getEstadoLabel(cita.estado) }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Mascota:</span>
                <span class="value">{{ cita.mascota_nombre || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Dueño:</span>
                <span class="value">{{ cita.usuario_nombre || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Servicio:</span>
                <span class="value">{{ cita.servicio_titulo || '—' }}</span>
              </div>
              <div v-if="cita.observaciones" class="info-row">
                <span class="label">Notas:</span>
                <span class="value">{{ cita.observaciones }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button
                v-if="cita.estado === 'programada' || cita.estado === 'confirmada'"
                @click="updateCita(cita.id, 'completada')"
                class="btn btn--success"
                :disabled="isProcessing"
              >
                Completar
              </button>
              <button
                v-if="cita.estado === 'programada'"
                @click="updateCita(cita.id, 'cancelada')"
                class="btn btn--danger"
                :disabled="isProcessing"
              >
                Cancelar
              </button>
              <!-- Botón dentro de tu cita-card -->
              <button @click="openModal(cita)" class="btn btn--outline">
                Ver
              </button>

              <!-- Modal flotante -->
              <div v-if="modalVisible" class="modal-overlay">
                <div class="modal-window">
                  <div class="modal-header">
                    <h3>Detalle de la Cita</h3>
                    <button class="modal-close" @click="closeModal">&times;</button>
                  </div>

                  <div class="modal-body">
                    <p><strong>Fecha:</strong> {{ formatDate(selectedCita.fecha) }}</p>
                    <p><strong>Hora:</strong> {{ formatTime(selectedCita.hora) }}</p>
                    <p><strong>Estado:</strong> {{ getEstadoLabel(selectedCita.estado) }}</p>

                    <hr />

                    <p><strong>Mascota:</strong> {{ selectedCita.mascota_nombre || '—' }}</p>
                    <p v-if="selectedCita.mascota_raza"><strong>Raza:</strong> {{ selectedCita.mascota_raza }}</p>
                    <p v-if="selectedCita.mascota_edad"><strong>Edad:</strong> {{ selectedCita.mascota_edad }} años</p>

                    <hr />

                    <p><strong>Dueño:</strong> {{ selectedCita.usuario_nombre || '—' }}</p>
                    <p v-if="selectedCita.usuario_contacto"><strong>Contacto:</strong> {{ selectedCita.usuario_contacto }}</p>

                    <hr />

                    <p><strong>Servicio:</strong> {{ selectedCita.servicio_titulo || '—' }}</p>

                    <p v-if="selectedCita.observaciones"><strong>Notas:</strong> {{ selectedCita.observaciones }}</p>
                  </div>

                  <div class="modal-footer">
                    <button
                      v-if="selectedCita.estado === 'programada' || selectedCita.estado === 'confirmada'"
                      @click="updateCita(selectedCita.id, 'completada')"
                      class="btn btn--success"
                    >Completar</button>
                    <button
                      v-if="selectedCita.estado === 'programada'"
                      @click="updateCita(selectedCita.id, 'cancelada')"
                      class="btn btn--danger"
                    >Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layouts/AppSidebar.vue'

// Router
const router = useRouter()

// Estado
const isLoading = ref(false)
const isProcessing = ref(false)
const error = ref(null)
const rawCitas = ref([])
const selectedDate = ref('')
const selectedStatus = ref('')
const modalVisible = ref(false)
const selectedCita = ref({})

// Constantes
const today = new Date().toISOString().split('T')[0]
const estadoLabels = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_asistio: 'No asistió'
}
const openModal = (cita) => {
  selectedCita.value = cita
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  selectedCita.value = {}
}

// Handlers
const handleDateInput = (event) => {
  selectedDate.value = event.target.value
}

const handleStatusChange = (event) => {
  selectedStatus.value = event.target.value
}

// Citas filtradas
const filteredCitas = computed(() => {
  return rawCitas.value.filter(cita => {
    const matchDate = !selectedDate.value || cita.fecha === selectedDate.value
    const matchStatus = !selectedStatus.value || cita.estado === selectedStatus.value
    return matchDate && matchStatus
  })
})

// Formateo
const formatDate = (dateStr) => {
<<<<<<< HEAD
  // Forzar que se interprete como fecha "local" sin restar horas
  const [year, month, day] = dateStr.split('-') // Asume formato YYYY-MM-DD
  const date = new Date(Number(year), Number(month) - 1, Number(day)) // Crea fecha en zona local
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}
=======
  if (!dateStr) return "—";

  // 🔹 Separar año, mes y día de la BD
  const [year, month, day] = dateStr.split("-");

  // 🔹 Crear objeto Date
  const date = new Date(year, month - 1, day);

  // 🔹 Días y meses en español
  const diasSemana = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  const meses = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre"
  ];

  // 🔹 Construir el formato
  const diaNombre = diasSemana[date.getDay()];
  const mesNombre = meses[date.getMonth()];

  // 🔹 Ejemplo: "Domingo, 28 de septiembre de 2025"
  return `${diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1)}, ${day} de ${mesNombre} de ${year}`;
};
>>>>>>> b623939 (PDF)

const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  return timeStr.slice(0, 5); // HH:mm
};

const getEstadoLabel = (estado) => {
  return estadoLabels[estado] || estado
}

// Cargar citas (versión robusta)
const loadCitas = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 1. Obtener usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('No autenticado')
    }

    // 2. Obtener veterinario
    const { data: vetData, error: vetError } = await supabase
      .from('veterinarios')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    if (vetError || !vetData) {
      throw new Error('No eres veterinario en el sistema')
    }

    // 3. Cargar citas con relaciones EXPLÍCITAS
    const { data, error: citasError } = await supabase
      .from('citasmascotas')
      .select(`
        id,
        fecha,
        hora,
        estado,
        observaciones,
        mascota_id,
        usuario_id,
        servicio_id
      `)
      .eq('veterinario_id', vetData.id)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: true })

    if (citasError) {
      console.error('Error Supabase:', citasError)
      throw new Error('Error al consultar citas')
    }

    // 4. Si no hay citas, terminar
    if (!data || data.length === 0) {
      rawCitas.value = []
      isLoading.value = false
      return
    }

    // 5. Obtener datos relacionados en lotes
    const mascotaIds = [...new Set(data.map(c => c.mascota_id).filter(Boolean))]
    const usuarioIds = [...new Set(data.map(c => c.usuario_id).filter(Boolean))]
    const servicioIds = [...new Set(data.map(c => c.servicio_id).filter(Boolean))]

    // Cargar mascotas
    const mascotasMap = {}
    if (mascotaIds.length > 0) {
      const { data: mascotas, error: mascotasError } = await supabase
        .from('mascotas')
        .select('id, nombre')
        .in('id', mascotaIds)

      if (!mascotasError && mascotas) {
        mascotas.forEach(m => { mascotasMap[m.id] = m.nombre })
      }
    }

    // Cargar usuarios
    const usuariosMap = {}
    if (usuarioIds.length > 0) {
      const { data: usuarios, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, nombre_completo')
        .in('id', usuarioIds)

      if (!usuariosError && usuarios) {
        usuarios.forEach(u => { usuariosMap[u.id] = u.nombre_completo })
      }
    }

    // Cargar servicios
    const serviciosMap = {}
    if (servicioIds.length > 0) {
      const { data: servicios, error: serviciosError } = await supabase
        .from('servicios')
        .select('id, titulo')
        .in('id', servicioIds)

      if (!serviciosError && servicios) {
        servicios.forEach(s => { serviciosMap[s.id] = s.titulo })
      }
    }

    // 6. Combinar datos
    rawCitas.value = data.map(cita => ({
      ...cita,
      mascota_nombre: mascotasMap[cita.mascota_id] || null,
      usuario_nombre: usuariosMap[cita.usuario_id] || null,
      servicio_titulo: serviciosMap[cita.servicio_id] || null
    }))

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar citas. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Actualizar cita
const updateCita = async (citaId, nuevoEstado) => {
  if (isProcessing.value) return
  const action = nuevoEstado === 'completada' ? 'completar' : 'cancelar'
  if (!confirm(`¿${action === 'completar' ? 'Completar' : 'Cancelar'} esta cita?`)) return

  isProcessing.value = true
  try {
    const updateData = { estado: nuevoEstado }
    if (nuevoEstado === 'completada') {
      updateData.hora_salida = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('citasmascotas')
      .update(updateData)
      .eq('id', citaId)

    if (updateError) {
      console.error('Error al actualizar:', updateError)
      throw new Error('No se pudo actualizar la cita')
    }

    await loadCitas()
  } catch (err) {
    alert(err.message)
  } finally {
    isProcessing.value = false
  }
}

// Ver detalles
const viewCitaDetails = (citaId) => {
  router.push({ name: 'DetalleCitaVet', params: { id: citaId } })
}

onMounted(() => {
  loadCitas()
})
</script>

<style scoped>
.citas-vet-container {
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

/* Responsive: Ajustar para tablet y móvil */
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

  .date-input,
  .status-select {
    width: 100%;
  }
}

/* Encabezado */
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
  margin-top: 0.25rem;
}

.subtitle code {
  background: #f1f5f9;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-family: monospace;
}

/* Filtros */
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
  min-width: 200px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.date-input,
.status-select {
  color: #1e293b;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: white;
  transition: border-color 0.2s;
}

.date-input:focus,
.status-select:focus {
  outline: none;
  border-color: #145a32;
  box-shadow: 0 0 0 3px rgba(20, 90, 50, 0.1);
}

/* Contenido */
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

/* Grid de citas */
.citas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.cita-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cita-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.time {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.date {
  font-size: 0.95rem;
  color: #64748b;
  display: block;
  margin-top: 0.25rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge--programada { background: #dbeafe; color: #1d4ed8; }
.badge--confirmada { background: #dcfce7; color: #166534; }
.badge--completada { background: #ede9fe; color: #7c3aed; }
.badge--cancelada { background: #fee2e2; color: #dc2626; }
.badge--no_asistio { background: #ffedd5; color: #ea580c; }

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
  min-width: 85px;
}

.value {
  color: #1e293b;
  flex: 1;
}

.card-footer {
  display: flex;
  gap: 0.875rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
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

.btn--danger {
  background: #dc2626;
  color: white;
}

.btn--danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn--outline {
  background: #f1f5f9;
  color: #1e293b;
}

.btn--outline:hover:not(:disabled) {
  background: #e2e8f0;
}

/* Responsive extra: Móvil pequeño */
@media (max-width: 480px) {
  .citas-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .cita-card {
    padding: 1.25rem;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-window {
  background: #fff;
  width: 450px;
  max-width: 90%;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #145a32;
  color: #fff;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  color: #1e293b;
}

.modal-body hr {
  margin: 1rem 0;
  border: 0.5px solid #e2e8f0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
}

</style>
