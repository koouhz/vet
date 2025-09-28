<template>
  <div class="mascotas-vet-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Mis Mascotas</h1>
        <p class="subtitle">Mascotas que has atendido según la tabla <code>citasmascotas</code>.</p>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-item">
          <label for="filter-especie" class="filter-label">Especie</label>
          <select
            id="filter-especie"
            :value="selectedEspecie"
            @change="handleEspecieChange"
            class="status-select"
          >
            <option value="">Todas</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="conejo">Conejo</option>
            <option value="hámster">Hámster</option>
            <option value="ave">Ave</option>
            <option value="reptil">Reptil</option>
            <option value="otros">Otros</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filter-estado" class="filter-label">Estado</label>
          <select
            id="filter-estado"
            :value="selectedActiva"
            @change="handleActivaChange"
            class="status-select"
          >
            <option value="">Todos</option>
            <option value="true">Activa</option>
            <option value="false">Inactiva</option>
          </select>
        </div>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando mascotas...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadMascotas" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredMascotas.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
            <path d="M8.5 14.5L10 16L15.5 10.5" />
          </svg>
          <p>No has atendido ninguna mascota aún.</p>
        </div>

        <div v-else class="mascotas-grid">
          <div
            v-for="mascota in filteredMascotas"
            :key="mascota.id"
            class="mascota-card"
          >
            <div class="card-header">
              <h3 class="mascota-nombre">
                {{ mascota.nombre }}
                <span class="mascota-especie">{{ mascota.especie }}</span>
              </h3>
              <span class="badge" :class="`badge--${mascota.is_activa ? 'activa' : 'inactiva'}`">
                {{ mascota.is_activa ? 'Activa' : 'Inactiva' }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Dueño:</span>
                <span class="value">{{ mascota.dueño || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Raza:</span>
                <span class="value">{{ mascota.raza || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Peso:</span>
                <span class="value">{{ mascota.peso_kg ? `${mascota.peso_kg} kg` : '—' }}</span>
              </div>
              <div v-if="mascota.alergias" class="info-row">
                <span class="label">Alergias:</span>
                <span class="value">{{ mascota.alergias }}</span>
              </div>
              <div v-if="mascota.notas_medicas" class="info-row">
                <span class="label">Notas médicas:</span>
                <span class="value">{{ mascota.notas_medicas }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button @click="viewHistorial(mascota.id)" class="btn btn--outline">
                Ver historial
              </button>
              <button @click="viewDetalles(mascota.id)" class="btn btn--success">
                Detalles
              </button>
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
const error = ref(null)
const rawMascotas = ref([])
const selectedEspecie = ref('')
const selectedActiva = ref('')

// Handlers
const handleEspecieChange = (event) => {
  selectedEspecie.value = event.target.value
}

const handleActivaChange = (event) => {
  selectedActiva.value = event.target.value
}

// Mascotas filtradas
const filteredMascotas = computed(() => {
  return rawMascotas.value.filter(mascota => {
    const matchEspecie = !selectedEspecie.value || mascota.especie === selectedEspecie.value
    const matchActiva = selectedActiva.value === '' ||
      (selectedActiva.value === 'true' && mascota.is_activa) ||
      (selectedActiva.value === 'false' && !mascota.is_activa)
    return matchEspecie && matchActiva
  })
})

// Cargar mascotas
const loadMascotas = async () => {
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

    // 3. Obtener IDs de mascotas atendidas
    const { data: citasData, error: citasError } = await supabase
      .from('citasmascotas')
      .select('mascota_id')
      .eq('veterinario_id', vetData.id)
      .not('mascota_id', 'is', null)

    if (citasError) {
      console.error('Error al cargar citas:', citasError)
      throw new Error('Error al consultar citas')
    }

    if (!citasData || citasData.length === 0) {
      rawMascotas.value = []
      isLoading.value = false
      return
    }

    // 4. Obtener IDs únicos de mascotas
    const mascotaIds = [...new Set(citasData.map(c => c.mascota_id))]

    // 5. Cargar datos de mascotas
    const { data: mascotasData, error: mascotasError } = await supabase
      .from('mascotas')
      .select(`
        id,
        nombre,
        especie,
        raza,
        peso_kg,
        alergias,
        notas_medicas,
        is_activa,
        usuario_id
      `)
      .in('id', mascotaIds)
      .order('nombre', { ascending: true })

    if (mascotasError) {
      console.error('Error al cargar mascotas:', mascotasError)
      throw new Error('Error al cargar datos de mascotas')
    }

    // 6. Obtener dueños
    const usuarioIds = [...new Set(mascotasData.map(m => m.usuario_id).filter(Boolean))]
    const dueñosMap = {}

    if (usuarioIds.length > 0) {
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, nombre_completo')
        .in('id', usuarioIds)

      if (!usuariosError && usuariosData) {
        usuariosData.forEach(u => {
          dueñosMap[u.id] = u.nombre_completo
        })
      }
    }

    // 7. Combinar datos
    rawMascotas.value = mascotasData.map(m => ({
      ...m,
      dueño: dueñosMap[m.usuario_id] || null
    }))

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar mascotas. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Acciones
const viewHistorial = (mascotaId) => {
  // Navegar a historial de citas de esta mascota
  router.push({ name: 'HistorialMascotaVet', params: { id: mascotaId } })
}

const viewDetalles = (mascotaId) => {
  // Navegar a detalles de la mascota
  router.push({ name: 'DetalleMascotaVet', params: { id: mascotaId } })
}

onMounted(() => {
  loadMascotas()
})
</script>

<style scoped>
/* Estilos idénticos a MisCitasVet.vue */
.mascotas-vet-container {
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
  margin-top: 0.25rem;
}

.subtitle code {
  background: #f1f5f9;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-family: monospace;
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
  min-width: 200px;
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

.mascotas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.mascota-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.mascota-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.mascota-nombre {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.mascota-especie {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: normal;
  margin-left: 0.5rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge--activa { background: #dcfce7; color: #166534; }
.badge--inactiva { background: #fee2e2; color: #dc2626; }

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
  min-width: 100px;
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

.btn--outline {
  background: #f1f5f9;
  color: #1e293b;
}

.btn--outline:hover:not(:disabled) {
  background: #e2e8f0;
}

@media (max-width: 480px) {
  .mascotas-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .mascota-card {
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
</style>
