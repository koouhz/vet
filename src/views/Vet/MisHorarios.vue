<template>
  <div class="horarios-vet-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Mi Horario</h1>
        <p class="subtitle">Gestiona tu disponibilidad semanal en la tabla <code>horarios_veterinarios</code>.</p>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando horarios...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadHorarios" class="retry-btn">Reintentar</button>
        </div>

        <div v-else class="horarios-grid">
          <div
            v-for="dia in diasSemana"
            :key="dia.value"
            class="dia-card"
          >
            <div class="dia-header">
              <h3 class="dia-nombre">{{ dia.label }}</h3>
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="getDisponibilidad(dia.value)"
                  @change="toggleDia(dia.value)"
                  :disabled="isProcessing"
                />
                <span class="slider"></span>
              </label>
            </div>

            <div v-if="getDisponibilidad(dia.value)" class="dia-body">
              <div class="time-range">
                <div class="time-inputs">
                  <input
                    type="time"
                    :value="getHoraInicio(dia.value)"
                    @change="updateHoraInicio(dia.value, $event.target.value)"
                    class="time-input"
                    :disabled="isProcessing"
                  />
                  <span class="separator">—</span>
                  <input
                    type="time"
                    :value="getHoraFin(dia.value)"
                    @change="updateHoraFin(dia.value, $event.target.value)"
                    class="time-input"
                    :disabled="isProcessing"
                  />
                </div>
              </div>
            </div>

            <div v-else class="dia-inactivo">
              <p>No disponible este día</p>
            </div>
          </div>
        </div>

        <div class="save-section">
          <button
            @click="guardarCambios"
            class="btn btn--success"
            :disabled="isProcessing || !hayCambios"
          >
            {{ isProcessing ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import AppSidebar from '@/components/layouts/AppSidebar.vue'

// Estado
const isLoading = ref(false)
const isProcessing = ref(false)
const error = ref(null)
const horariosBase = ref([]) // [{ id, dia_semana, hora_inicio, hora_fin }]
const horariosVet = ref([])  // [{ id, horario_base_id, es_disponible }]
const cambios = ref({})     // { horario_base_id: { es_disponible, hora_inicio, hora_fin } }

// Días de la semana
const diasSemana = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miércoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sábado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
]

// ¿Hay cambios pendientes?
const hayCambios = computed(() => {
  return Object.keys(cambios.value).length > 0
})

// Obtener horario base por día
const getHorarioBase = (dia) => {
  return horariosBase.value.find(h => h.dia_semana === dia)
}

// Obtener horario veterinario por día
const getHorarioVet = (dia) => {
  const base = getHorarioBase(dia)
  if (!base) return null
  return horariosVet.value.find(h => h.horario_base_id === base.id)
}

// Obtener disponibilidad
const getDisponibilidad = (dia) => {
  const base = getHorarioBase(dia)
  if (!base) return false

  const cambio = cambios.value[base.id]
  if (cambio !== undefined) {
    return cambio.es_disponible
  }

  const vet = getHorarioVet(dia)
  return vet ? vet.es_disponible : false
}

// Obtener hora de inicio
const getHoraInicio = (dia) => {
  const base = getHorarioBase(dia)
  if (!base) return '09:00'

  const cambio = cambios.value[base.id]
  if (cambio && cambio.hora_inicio !== undefined) {
    return cambio.hora_inicio
  }

  return base.hora_inicio || '09:00'
}

// Obtener hora de fin
const getHoraFin = (dia) => {
  const base = getHorarioBase(dia)
  if (!base) return '18:00'

  const cambio = cambios.value[base.id]
  if (cambio && cambio.hora_fin !== undefined) {
    return cambio.hora_fin
  }

  return base.hora_fin || '18:00'
}

// Cargar horarios
const loadHorarios = async () => {
  isLoading.value = true
  error.value = null
  cambios.value = {}

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

    // 3. Cargar horarios base (todos los días)
    const { data: baseData, error: baseError } = await supabase
      .from('horarios_base')
      .select('id, dia_semana, hora_inicio, hora_fin')
      .order('id', { ascending: true })

    if (baseError) {
      console.error('Error al cargar horarios base:', baseError)
      throw new Error('Error al cargar horarios base')
    }

    horariosBase.value = baseData

    // 4. Cargar horarios del veterinario
    const { data: vetHorarios, error: vetHorariosError } = await supabase
      .from('horarios_veterinarios')
      .select('id, horario_base_id, es_disponible')
      .eq('veterinario_id', vetData.id)

    if (vetHorariosError) {
      console.error('Error al cargar horarios veterinario:', vetHorariosError)
      throw new Error('Error al cargar tus horarios')
    }

    horariosVet.value = vetHorarios

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar horarios. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Toggle día
const toggleDia = (dia) => {
  const base = getHorarioBase(dia)
  if (!base) return

  const nuevoValor = !getDisponibilidad(dia)
  if (!cambios.value[base.id]) {
    cambios.value[base.id] = {}
  }
  cambios.value[base.id].es_disponible = nuevoValor

  // Si se desactiva, limpiar horas
  if (!nuevoValor) {
    delete cambios.value[base.id].hora_inicio
    delete cambios.value[base.id].hora_fin
  }
}

// Actualizar hora de inicio
const updateHoraInicio = (dia, valor) => {
  const base = getHorarioBase(dia)
  if (!base) return

  if (!cambios.value[base.id]) {
    cambios.value[base.id] = {}
  }
  cambios.value[base.id].hora_inicio = valor
}

// Actualizar hora de fin
const updateHoraFin = (dia, valor) => {
  const base = getHorarioBase(dia)
  if (!base) return

  if (!cambios.value[base.id]) {
    cambios.value[base.id] = {}
  }
  cambios.value[base.id].hora_fin = valor
}

// Guardar cambios
const guardarCambios = async () => {
  if (isProcessing.value || !hayCambios.value) return

  isProcessing.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: vetData } = await supabase
      .from('veterinarios')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    const vetId = vetData.id

    // Procesar cada cambio
    for (const [horarioBaseId, cambiosDia] of Object.entries(cambios.value)) {
      const horarioVetExistente = horariosVet.value.find(h => h.horario_base_id === parseInt(horarioBaseId))

      if (cambiosDia.es_disponible === false) {
        // Si se desactivó, eliminar o actualizar a false
        if (horarioVetExistente) {
          await supabase
            .from('horarios_veterinarios')
            .update({ es_disponible: false })
            .eq('id', horarioVetExistente.id)
        }
        // Si no existía, no hacemos nada (no se crea un registro inactivo)
      } else {
        // Activar o actualizar
        const updateData = {
          veterinario_id: vetId,
          horario_base_id: parseInt(horarioBaseId),
          es_disponible: true
        }

        // Si hay cambios de horas, actualizar horarios_base
        if (cambiosDia.hora_inicio || cambiosDia.hora_fin) {
          const horaInicio = cambiosDia.hora_inicio || getHoraInicioPorId(horarioBaseId)
          const horaFin = cambiosDia.hora_fin || getHoraFinPorId(horarioBaseId)

          await supabase
            .from('horarios_base')
            .update({
              hora_inicio: horaInicio,
              hora_fin: horaFin
            })
            .eq('id', horarioBaseId)
        }

        if (horarioVetExistente) {
          // Actualizar existente
          await supabase
            .from('horarios_veterinarios')
            .update(updateData)
            .eq('id', horarioVetExistente.id)
        } else {
          // Crear nuevo
          await supabase
            .from('horarios_veterinarios')
            .insert(updateData)
        }
      }
    }

    // Recargar
    await loadHorarios()
    alert('Horarios actualizados correctamente')

  } catch (err) {
    console.error('Error al guardar:', err)
    alert('Error al guardar los cambios')
  } finally {
    isProcessing.value = false
  }
}

// Helpers para obtener horas por ID
const getHoraInicioPorId = (id) => {
  const base = horariosBase.value.find(h => h.id === parseInt(id))
  return base ? base.hora_inicio : '09:00'
}

const getHoraFinPorId = (id) => {
  const base = horariosBase.value.find(h => h.id === parseInt(id))
  return base ? base.hora_fin : '18:00'
}

onMounted(() => {
  loadHorarios()
})
</script>

<style scoped>
/* Estilos idénticos a los anteriores */
.horarios-vet-container {
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

/* Grid de días */
.horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
  margin-bottom: 2rem;
}

.dia-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dia-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.dia-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.dia-nombre {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* Switch personalizado */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #145a32;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* Rango de tiempo */
.time-range {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.time-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  width: 120px;
  background: white;
}

.separator {
  font-weight: 700;
  color: #475569;
}

.dia-inactivo {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  padding: 1.5rem 0;
}

/* Botón guardar */
.save-section {
  text-align: center;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
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

/* Responsive */
@media (max-width: 480px) {
  .horarios-grid {
    grid-template-columns: 1fr;
  }

  .time-input {
    width: 100px;
    font-size: 0.9rem;
  }
}
</style>
