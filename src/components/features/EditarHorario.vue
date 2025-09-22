<!-- src/views/dashboard-vet/EditarHorario.vue -->
<template>
  <div class="editar-horario-container">
    <div class="header-section">
      <h1>✏️ Editar Mi Horario</h1>
      <p class="subtitle">Define tus bloques de atención por día. Usa formato 24h: <strong>HH:MM-HH:MM</strong></p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando horario actual...</p>
    </div>

    <div v-else-if="error" class="error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="error-icon">
        <circle cx="12" cy="12" r="10" stroke="#dc2626" stroke-width="2"/>
        <path d="M15 9L9 15" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
        <path d="M9 9L15 15" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p>⚠️ {{ error }}</p>
      <button @click="fetchHorario" class="btn-retry">Reintentar</button>
    </div>

    <form v-else @submit.prevent="guardarHorario" class="form-horario">
      <div class="dias-grid">
        <div
          v-for="(dia, index) in diasSemana"
          :key="index"
          class="dia-section"
          :class="{ 'dia-activo': horarioEditado[dia.id] !== null }"
        >
          <div class="dia-header">
            <label class="switch">
              <input
                type="checkbox"
                :id="`toggle-${dia.id}`"
                :checked="horarioEditado[dia.id] !== null"
                @change="toggleDia(dia.id)"
              />
              <span class="slider"></span>
            </label>
            <h3>{{ dia.nombre }}</h3>
          </div>

          <Transition name="fade">
            <div v-if="horarioEditado[dia.id] !== null" class="bloques-container">
              <div class="bloques-list">
                <div
                  v-for="(bloque, idx) in horarioEditado[dia.id]"
                  :key="idx"
                  class="bloque-item"
                  :class="{ 'error-input': errores[dia.id]?.[idx] }"
                >
                  <input
                    type="text"
                    v-model="horarioEditado[dia.id][idx]"
                    :placeholder="`Ej: 09:00-12:00`"
                    class="input-bloque"
                    @blur="validarBloque(dia.id, idx)"
                    @input="limpiarError(dia.id, idx)"
                    :disabled="guardando"
                  />
                  <button
                    type="button"
                    @click="eliminarBloque(dia.id, idx)"
                    class="btn-eliminar"
                    :disabled="guardando"
                    :aria-label="`Eliminar bloque ${idx + 1}`"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="button"
                @click="agregarBloque(dia.id)"
                class="btn-agregar"
                :disabled="guardando"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon">
                  <path d="M12 4V20M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Agregar Bloque de Horario
              </button>

              <div v-if="errores[dia.id] && errores[dia.id].some(e => e)" class="errores-dia">
                <div
                  v-for="item in erroresVisibles(dia.id)"
                  :key="item.idx"
                  class="error-texto"
                >
                  ⚠️ Bloque {{ item.idx + 1 }}: {{ item.error }}
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="button"
          @click="cancelar"
          class="btn-cancelar"
          :disabled="guardando"
        >
          ← Cancelar
        </button>
        <button
          type="submit"
          class="btn-guardar"
          :disabled="guardando || !hayCambiosValidos"
        >
          <span v-if="guardando" class="spinner-small"></span>
          {{ guardando ? 'Guardando...' : '💾 Guardar Cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const guardando = ref(false)
const error = ref(null)
const horarioOriginal = ref({})
const horarioEditado = ref({})
const errores = ref({})

// Lista de días
const diasSemana = [
  { id: 'lunes', nombre: 'Lunes' },
  { id: 'martes', nombre: 'Martes' },
  { id: 'miercoles', nombre: 'Miércoles' },
  { id: 'jueves', nombre: 'Jueves' },
  { id: 'viernes', nombre: 'Viernes' },
  { id: 'sabado', nombre: 'Sábado' },
  { id: 'domingo', nombre: 'Domingo' }
]

// Verificar si hay cambios válidos
const hayCambiosValidos = computed(() => {
  if (!hayCambios.value) return false

  // Verificar que no haya errores
  for (const dia of diasSemana) {
    if (errores.value[dia.id]?.some(e => e)) return false
  }
  return true
})

// Verificar si hay cambios respecto al original
const hayCambios = computed(() => {
  return JSON.stringify(horarioOriginal.value) !== JSON.stringify(horarioEditado.value)
})

// Obtener horario actual
const fetchHorario = async () => {
  loading.value = true
  error.value = null

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      throw new Error('Usuario no autenticado')
    }

    const user = authData.user

    const { data: vetData, error: vetError } = await supabase
      .from('veterinarios')
      .select('horario_disponible')
      .eq('usuario_id', user.id)
      .single()

    if (vetError) {
      throw new Error('No se pudo cargar tu horario')
    }

    // Inicializar estructura
    const horarioInicial = {}
    const erroresInicial = {}
    diasSemana.forEach(dia => {
      const valor = vetData?.horario_disponible?.[dia.id]
      horarioInicial[dia.id] = (Array.isArray(valor) && valor.length > 0) ? [...valor] : null
      erroresInicial[dia.id] = []
    })

    horarioOriginal.value = JSON.parse(JSON.stringify(horarioInicial))
    horarioEditado.value = JSON.parse(JSON.stringify(horarioInicial))
    errores.value = erroresInicial
  } catch (err) {
    error.value = err.message
    console.error('[EditarHorario] Error:', err)
  } finally {
    loading.value = false
  }
}

// Activar/desactivar día
const toggleDia = (diaId) => {
  if (horarioEditado.value[diaId] === null) {
    horarioEditado.value[diaId] = []
    errores.value[diaId] = []
  } else {
    horarioEditado.value[diaId] = null
    errores.value[diaId] = []
  }
}

// Agregar nuevo bloque
const agregarBloque = (diaId) => {
  if (!Array.isArray(horarioEditado.value[diaId])) {
    horarioEditado.value[diaId] = []
    errores.value[diaId] = []
  }
  horarioEditado.value[diaId].push('')
  errores.value[diaId].push('')
}

// Eliminar bloque
const eliminarBloque = (diaId, index) => {
  horarioEditado.value[diaId].splice(index, 1)
  errores.value[diaId].splice(index, 1)
}

// Limpiar error específico
const limpiarError = (diaId, index) => {
  if (errores.value[diaId] && errores.value[diaId][index]) {
    errores.value[diaId][index] = ''
  }
}

// Validar un bloque específico
const validarBloque = (diaId, index) => {
  const valor = horarioEditado.value[diaId][index]
  if (!valor) {
    errores.value[diaId][index] = 'El bloque no puede estar vacío'
    return
  }

  // Formato HH:MM-HH:MM
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!regex.test(valor)) {
    errores.value[diaId][index] = 'Formato inválido. Usa HH:MM-HH:MM'
    return
  }

  // Validar que la hora de inicio sea menor que la de fin
  const [inicio, fin] = valor.split('-')
  if (inicio >= fin) {
    errores.value[diaId][index] = 'La hora de inicio debe ser menor que la de fin'
    return
  }

  // Validar solapamientos con otros bloques del mismo día
  const bloques = horarioEditado.value[diaId]
  for (let i = 0; i < bloques.length; i++) {
    if (i === index || !bloques[i]) continue

    const [inicio2, fin2] = bloques[i].split('-')
    if (!inicio2 || !fin2) continue

    // Convertir a minutos para comparar
    const inicioMin = convertirAHoras(inicio)
    const finMin = convertirAHoras(fin)
    const inicio2Min = convertirAHoras(inicio2)
    const fin2Min = convertirAHoras(fin2)

    if (
      (inicioMin < fin2Min && finMin > inicio2Min) &&
      (inicioMin !== fin2Min && finMin !== inicio2Min)
    ) {
      errores.value[diaId][index] = 'Este bloque se solapa con otro horario'
      return
    }
  }

  errores.value[diaId][index] = ''
}

// Convertir HH:MM a minutos desde medianoche
const convertirAHoras = (hora) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

// Guardar cambios
const guardarHorario = async () => {
  // Validar todos los bloques primero
  let tieneErrores = false
  for (const dia of diasSemana) {
    if (horarioEditado.value[dia.id] !== null) {
      for (let i = 0; i < horarioEditado.value[dia.id].length; i++) {
        validarBloque(dia.id, i)
        if (errores.value[dia.id][i]) {
          tieneErrores = true
        }
      }
    }
  }

  if (tieneErrores) {
    alert('❌ Corrige los errores antes de guardar')
    return
  }

  if (!hayCambios.value) {
    alert('ℹ️ No hay cambios para guardar')
    return
  }

  guardando.value = true
  error.value = null

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      throw new Error('Usuario no autenticado')
    }

    const user = authData.user

    const { data: vetData, error: vetError } = await supabase
      .from('veterinarios')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    if (vetError) {
      throw new Error('No se encontró tu perfil de veterinario')
    }

    // Preparar horario para guardar
    const horarioParaGuardar = {}
    diasSemana.forEach(dia => {
      const valor = horarioEditado.value[dia.id]
      horarioParaGuardar[dia.id] = (Array.isArray(valor) && valor.length > 0) ? [...valor] : null
    })

    // Guardar en DB
    const { error: updateError } = await supabase
      .from('veterinarios')
      .update({ horario_disponible: horarioParaGuardar })
      .eq('id', vetData.id)

    if (updateError) {
      throw new Error('Error al guardar: ' + updateError.message)
    }

    horarioOriginal.value = JSON.parse(JSON.stringify(horarioEditado.value))
    alert('✅ ¡Horario actualizado correctamente!')
    router.push('/dashboard-vet/mi-horario')
  } catch (err) {
    alert('❌ Error: ' + err.message)
    console.error('[EditarHorario] Error al guardar:', err)
  } finally {
    guardando.value = false
  }
}

// Cancelar edición
const cancelar = () => {
  if (hayCambios.value && !confirm('¿Descartar todos los cambios no guardados?')) {
    return
  }
  router.push('/dashboard-vet/mi-horario')
}

onMounted(fetchHorario)
</script>

<style scoped>
.editar-horario-container {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
  margin-left: 240px; /* Para sidebar */
  transition: margin-left 0.3s ease;
}

/* Responsive para sidebar colapsado o móvil */
@media (max-width: 1024px) {
  .editar-horario-container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .editar-horario-container {
    padding: 1.5rem 1rem;
  }
}

.header-section {
  margin-bottom: 2.5rem;
  text-align: center;
}

.header-section h1 {
  font-size: 2rem;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  line-height: 1.2;
}

.subtitle {
  color: #64748b;
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.5;
  max-width: 800px;
  margin: 0 auto 1.5rem;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f4f6;
  border-top: 5px solid #145a32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error */
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin: 2rem auto;
  max-width: 500px;
}

.error-icon {
  margin-bottom: 1.5rem;
}

.error p {
  font-size: 1.2rem;
  color: #dc2626;
  margin: 0.5rem 0 1.5rem;
  font-weight: 600;
}

.btn-retry {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.btn-retry:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0,0,0,0.15);
}

/* Formulario */
.form-horario {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  max-width: 1200px;
  margin: 0 auto;
}

.dias-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  margin-bottom: 3rem;
}

.dia-section {
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  background: #fff;
  transition: all 0.3s ease;
  position: relative;
}

.dia-section.dia-activo {
  border-color: #145a32;
  box-shadow: 0 4px 12px rgba(20, 90, 50, 0.1);
}

.dia-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.dia-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
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
  background-color: #e5e7eb;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

input:checked + .slider {
  background-color: #145a32;
}

input:checked + .slider:before {
  transform: translateX(30px);
}

/* Bloques */
.bloques-container {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #e2e8f0;
}

.bloque-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.25rem;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.2s;
}

.bloque-item.error-input {
  border-color: #ef4444;
  background: #fef2f2;
}

.bloque-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.input-bloque {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  font-weight: 500;
  transition: all 0.2s;
}

.input-bloque:focus {
  outline: none;
  border-color: #145a32;
  box-shadow: 0 0 0 3px rgba(20, 90, 50, 0.1);
}

.btn-eliminar {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-eliminar:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.btn-eliminar:disabled {
  background: #f8fafc;
  color: #e2e8f0;
  cursor: not-allowed;
  transform: none;
}

.btn-agregar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #dbeafe;
  color: #1d4ed8;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  align-self: flex-start;
  margin-top: 1rem;
}

.btn-agregar:hover {
  background: #bfdbfe;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.btn-agregar:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.icon {
  width: 18px;
  height: 18px;
}

/* Errores por día */
.errores-dia {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border-radius: 8px;
  border-left: 4px solid #dc2626;
}

.error-texto {
  color: #dc2626;
  font-size: 0.9rem;
  margin: 0.25rem 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Acciones */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f1f5f9;
}

.btn-cancelar,
.btn-guardar {
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
  justify-content: center;
}

.btn-cancelar {
  background: #f1f5f9;
  color: #475569;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.btn-cancelar:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0,0,0,0.15);
}

.btn-guardar {
  background: #145a32;
  color: white;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.btn-guardar:hover {
  background: #0f4c28;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0,0,0,0.15);
}

.btn-guardar:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

/* Responsive */
@media (max-width: 768px) {
  .dias-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .dia-section {
    padding: 1.5rem;
  }

  .form-horario {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-cancelar,
  .btn-guardar {
    width: 100%;
    font-size: 1.1rem;
    padding: 0.8rem 1.5rem;
  }

  .header-section h1 {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .editar-horario-container {
    padding: 1rem;
  }

  .dia-header {
    gap: 1rem;
  }

  .dia-header h3 {
    font-size: 1.3rem;
  }

  .switch {
    width: 50px;
    height: 25px;
  }

  .slider:before {
    height: 18px;
    width: 18px;
  }

  input:checked + .slider:before {
    transform: translateX(25px);
  }
}
</style>
