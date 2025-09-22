<template>
  <div class="mis-horarios-container">
    <div class="header-section">
      <h1>🕒 Mi Horario Disponible</h1>
      <p class="subtitle">
        Configura tus horas de atención para que los clientes puedan agendar citas.
      </p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando tu horario...</p>
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

    <div v-else class="horarios-content">
      <!-- Si no hay ningún horario configurado -->
      <div v-if="todosDiasCerrados" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="empty-icon">
          <circle cx="12" cy="12" r="10" stroke="#94a3b8" stroke-width="2"/>
          <path d="M12 6V12L16 14" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>¡Aún no has configurado tu horario!</h3>
        <p>Define tus horas de atención para empezar a recibir citas.</p>
        <button @click="editarHorario" class="btn-primary">
          ➕ Configurar Horario Ahora
        </button>
      </div>

      <!-- Grid de días -->
      <div v-else class="horarios-grid">
        <div
          v-for="(bloques, dia) in horarioFormateado"
          :key="dia"
          class="dia-card"
          :class="{ 'dia-inactivo': !bloques || bloques.length === 0 }"
        >
          <div class="dia-header">
            <h3>{{ nombresDias[dia] || capitalize(dia) }}</h3>
            <span v-if="!bloques || bloques.length === 0" class="badge-inactivo">
              Cerrado
            </span>
          </div>
          <div class="bloques-list">
            <div v-if="!bloques || bloques.length === 0" class="no-horario">
              <p>Sin horario disponible</p>
              <button @click="editarHorario" class="btn-small">Configurar</button>
            </div>
            <div
              v-else
              v-for="(bloque, index) in bloques"
              :key="index"
              class="bloque-item"
            >
              {{ bloque }}
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de edición global -->
      <div class="actions-section">
        <button @click="editarHorario" class="btn-editar">
          ✏️ Editar Horario Completo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const horario = ref({})
const loading = ref(true)
const error = ref(null)

// Mapeo de días
const nombresDias = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
}

// Capitalizar fallback
const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Verificar si todos los días están cerrados
const todosDiasCerrados = computed(() => {
  return Object.values(horarioFormateado.value).every(bloques => !bloques || bloques.length === 0)
})

// Obtener horario
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
      throw new Error('No se encontró tu perfil de veterinario')
    }

    horario.value = (typeof vetData?.horario_disponible === 'object' && vetData.horario_disponible !== null)
      ? vetData.horario_disponible
      : {}
  } catch (err) {
    error.value = err.message || 'Error desconocido al cargar horario'
    console.error('[MisHorarios] Error:', err)
  } finally {
    loading.value = false
  }
}

// Horario formateado
const horarioFormateado = computed(() => {
  const ordenDias = [
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'domingo'
  ]

  const resultado = {}
  ordenDias.forEach(dia => {
    const bloques = horario.value?.[dia]
    resultado[dia] = Array.isArray(bloques) ? bloques : []
  })
  return resultado
})

// Navegar a edición
const editarHorario = () => {
  router.push({ name: 'EditarHorario' })
}

onMounted(() => {
  fetchHorario()
})
</script>

<style scoped>
.mis-horarios-container {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
  margin-left: 240px; /* Ajuste por sidebar */
  transition: margin-left 0.3s ease;
}

/* Responsive: Ajustar para sidebar colapsado o móvil */
@media (max-width: 768px) {
  .mis-horarios-container {
    margin-left: 0;
    padding: 1.5rem 1rem;
  }
}

.header-section {
  margin-bottom: 2.5rem;
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
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #145a32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
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
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin: 2rem auto;
  max-width: 500px;
}

.error-icon {
  margin-bottom: 1rem;
}

.error p {
  font-size: 1.1rem;
  color: #dc2626;
  margin: 0.5rem 0 1rem;
  font-weight: 500;
}

.btn-retry {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-retry:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin: 2rem auto;
  max-width: 600px;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: #94a3b8;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0 0 1rem;
  font-weight: 600;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Horarios Grid */
.horarios-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  margin-bottom: 2.5rem;
}

.dia-card {
  background: white;
  padding: 1.75rem;
  border-radius: 16px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
  border-left: 4px solid #145a32;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dia-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.dia-inactivo {
  border-left-color: #e5e7eb;
  background: #f9fafb;
}

.dia-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.dia-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.35rem;
  font-weight: 700;
}

.badge-inactivo {
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #f3e8ff;
  color: #7e22ce;
  border: 1px solid #ede9fe;
}

.bloques-list {
  margin-top: 1rem;
}

.no-horario {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
}

.no-horario p {
  color: #94a3b8;
  font-style: italic;
  margin: 0 0 1rem;
  font-size: 0.95rem;
}

.bloque-item {
  background: #ecfdf5;
  color: #065f46;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  margin-bottom: 0.75rem;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  border: 1px solid #ccfbf1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.bloque-item:hover {
  background: #d1fae5;
  transform: scale(1.02);
}

/* Botones */
.btn-small {
  background: #dbeafe;
  color: #1d4ed8;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-small:hover {
  background: #bfdbfe;
  transform: translateY(-1px);
}

.actions-section {
  text-align: center;
  padding: 2rem 0 1rem;
}

.btn-editar {
  background: #145a32;
  color: white;
  border: none;
  padding: 0.85rem 2.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.15rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.btn-editar:hover {
  background: #0f4c28;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0,0,0,0.15);
}

.btn-primary {
  background: #145a32;
  color: white;
  border: none;
  padding: 0.85rem 2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.btn-primary:hover {
  background: #0f4c28;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.15);
}

/* Extra Responsive */
@media (max-width: 1024px) {
  .mis-horarios-container {
    margin-left: 0;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .horarios-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .dia-card {
    padding: 1.5rem;
  }

  .header-section h1 {
    font-size: 1.75rem;
  }

  .btn-editar,
  .btn-primary {
    padding: 0.75rem 1.75rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .mis-horarios-container {
    padding: 1rem;
  }

  .header-section h1 {
    font-size: 1.5rem;
  }

  .dia-header h3 {
    font-size: 1.2rem;
  }

  .btn-editar,
  .btn-primary,
  .btn-retry {
    width: 100%;
    justify-content: center;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}
</style>
