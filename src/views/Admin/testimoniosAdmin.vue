<template>
  <div class="testimonios-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Testimonios</h1>
        <p class="subtitle">Gestiona los testimonios de clientes del sistema.</p>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-item">
          <label for="filter-estado" class="filter-label">Estado</label>
          <select
            id="filter-estado"
            :value="selectedPublicado"
            @change="handlePublicadoChange"
            class="status-select"
          >
            <option value="">Todos</option>
            <option value="false">Pendientes</option>
            <option value="true">Publicados</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filter-destacado" class="filter-label">Destacado</label>
          <select
            id="filter-destacado"
            :value="selectedDestacado"
            @change="handleDestacadoChange"
            class="status-select"
          >
            <option value="">Cualquiera</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filter-calificacion" class="filter-label">Calificación</label>
          <select
            id="filter-calificacion"
            :value="selectedCalificacion"
            @change="handleCalificacionChange"
            class="status-select"
          >
            <option value="">Todas</option>
            <option value="5">5 estrellas</option>
            <option value="4">4+ estrellas</option>
            <option value="3">3+ estrellas</option>
            <option value="2">2- estrellas</option>
            <option value="1">1 estrella</option>
          </select>
        </div>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando testimonios...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadTestimonios" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredTestimonios.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
            <path d="M8 12L10 14L16 8" />
          </svg>
          <p>No hay testimonios que coincidan con los filtros.</p>
        </div>

        <div v-else class="testimonios-grid">
          <div
            v-for="testimonio in filteredTestimonios"
            :key="testimonio.id"
            class="testimonio-card"
            :class="{ 'destacado': testimonio.destacado }"
          >
            <div class="card-header">
              <div class="cliente-info">
                <h3 class="cliente-nombre">
                  {{ testimonio.nombre_cliente || 'Cliente' }}
                  <span v-if="testimonio.nombre_mascota" class="mascota-nombre">
                    ({{ testimonio.nombre_mascota }})
                  </span>
                </h3>
                <div class="calificacion">
                  <span v-for="i in 5" :key="i" class="estrella" :class="{ 'llena': i <= testimonio.calificacion }">
                    ★
                  </span>
                  <span class="calificacion-numero">{{ testimonio.calificacion }}/5</span>
                </div>
              </div>
              <div class="estado-badges">
                <span class="badge" :class="`badge--${testimonio.publicado ? 'publicado' : 'pendiente'}`">
                  {{ testimonio.publicado ? 'Publicado' : 'Pendiente' }}
                </span>
                <span v-if="testimonio.destacado" class="badge badge--destacado">
                  Destacado
                </span>
              </div>
            </div>

            <div class="card-body">
              <p class="contenido">{{ testimonio.contenido }}</p>
            </div>

            <div class="card-footer">
              <div class="acciones">
                <button
                  v-if="!testimonio.publicado"
                  @click="aprobarTestimonio(testimonio.id)"
                  class="btn btn--success"
                >
                  Aprobar
                </button>
                <button
                  v-if="testimonio.publicado"
                  @click="rechazarTestimonio(testimonio.id)"
                  class="btn btn--danger"
                >
                  Rechazar
                </button>
                <button
                  @click="toggleDestacado(testimonio)"
                  class="btn"
                  :class="testimonio.destacado ? 'btn--warning' : 'btn--outline'"
                >
                  {{ testimonio.destacado ? 'Quitar destacado' : 'Destacar' }}
                </button>
                <button @click="eliminarTestimonio(testimonio.id)" class="btn btn--delete">
                  Eliminar
                </button>
              </div>
              <div class="fecha">
                <span class="label">Fecha:</span>
                <span class="value">{{ formatDate(testimonio.creado_en) }}</span>
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
import AppSidebar from '@/components/layouts/AppSidebar.vue'

const isLoading = ref(false)
const error = ref(null)
const rawTestimonios = ref([])
const selectedPublicado = ref('')
const selectedDestacado = ref('')
const selectedCalificacion = ref('')

// Handlers
const handlePublicadoChange = (event) => {
  selectedPublicado.value = event.target.value
}

const handleDestacadoChange = (event) => {
  selectedDestacado.value = event.target.value
}

const handleCalificacionChange = (event) => {
  selectedCalificacion.value = event.target.value
}

const filteredTestimonios = computed(() => {
  return rawTestimonios.value.filter(testimonio => {
    const matchPublicado = selectedPublicado.value === '' ||
      (selectedPublicado.value === 'true' && testimonio.publicado) ||
      (selectedPublicado.value === 'false' && !testimonio.publicado)

    const matchDestacado = selectedDestacado.value === '' ||
      (selectedDestacado.value === 'true' && testimonio.destacado) ||
      (selectedDestacado.value === 'false' && !testimonio.destacado)

    let matchCalificacion = true
    if (selectedCalificacion.value === '5') {
      matchCalificacion = testimonio.calificacion === 5
    } else if (selectedCalificacion.value === '4') {
      matchCalificacion = testimonio.calificacion >= 4
    } else if (selectedCalificacion.value === '3') {
      matchCalificacion = testimonio.calificacion >= 3
    } else if (selectedCalificacion.value === '2') {
      matchCalificacion = testimonio.calificacion <= 2
    } else if (selectedCalificacion.value === '1') {
      matchCalificacion = testimonio.calificacion === 1
    }

    return matchPublicado && matchDestacado && matchCalificacion
  })
})

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Cargar testimonios (versión robusta)
const loadTestimonios = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 1. Cargar testimonios básicos
    const { data: testimoniosData, error: testimoniosError } = await supabase
      .from('testimonios')
      .select('id, nombre_cliente, nombre_mascota, contenido, calificacion, publicado, destacado, creado_en, veterinario_id')
      .order('creado_en', { ascending: false })

    if (testimoniosError) {
      console.error('Error al cargar testimonios:', testimoniosError)
      throw new Error('Error al consultar testimonios')
    }

    if (testimoniosData.length === 0) {
      rawTestimonios.value = []
      isLoading.value = false
      return
    }

    // 2. Obtener IDs de veterinarios
    const vetIds = [...new Set(testimoniosData.map(t => t.veterinario_id).filter(Boolean))]
    const veterinariosMap = {}

    if (vetIds.length > 0) {
      // Cargar veterinarios
      const {  vetsData, error: vetsError } = await supabase
        .from('veterinarios')
        .select('id, usuario_id')
        .in('id', vetIds)

      if (vetsError) {
        console.warn('Error al cargar veterinarios:', vetsError)
        // Continuar sin nombres de veterinarios
      } else {
        // Obtener IDs de usuarios
        const usuarioIds = vetsData.map(v => v.usuario_id).filter(Boolean)
        if (usuarioIds.length > 0) {
          const {  usuariosData, error: usuariosError } = await supabase
            .from('usuarios')
            .select('id, nombre_completo')
            .in('id', usuarioIds)

          if (!usuariosError && usuariosData) {
            const usuariosMap = {}
            usuariosData.forEach(u => { usuariosMap[u.id] = u.nombre_completo })

            // Crear mapa veterinario -> nombre
            vetsData.forEach(vet => {
              if (usuariosMap[vet.usuario_id]) {
                veterinariosMap[vet.id] = usuariosMap[vet.usuario_id]
              }
            })
          }
        }
      }
    }

    // 3. Combinar datos
    rawTestimonios.value = testimoniosData.map(test => ({
      ...test,
      veterinario_nombre: veterinariosMap[test.veterinario_id] || '—'
    }))

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar testimonios. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Aprobar testimonio
const aprobarTestimonio = async (testimonioId) => {
  if (!confirm('¿Aprobar este testimonio?')) return

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { error: updateError } = await supabase
      .from('testimonios')
      .update({
        publicado: true,
        aprobado_por: user.id,
        aprobado_en: new Date().toISOString()
      })
      .eq('id', testimonioId)

    if (updateError) throw updateError
    await loadTestimonios()
    alert('Testimonio aprobado correctamente')

  } catch (err) {
    console.error('Error al aprobar:', err)
    alert('Error al aprobar el testimonio')
  }
}

// Rechazar testimonio
const rechazarTestimonio = async (testimonioId) => {
  if (!confirm('¿Rechazar este testimonio?')) return

  try {
    const { error: updateError } = await supabase
      .from('testimonios')
      .update({ publicado: false })
      .eq('id', testimonioId)

    if (updateError) throw updateError
    await loadTestimonios()
    alert('Testimonio rechazado correctamente')

  } catch (err) {
    console.error('Error al rechazar:', err)
    alert('Error al rechazar el testimonio')
  }
}

// Toggle destacado
const toggleDestacado = async (testimonio) => {
  try {
    const { error: updateError } = await supabase
      .from('testimonios')
      .update({ destacado: !testimonio.destacado })
      .eq('id', testimonio.id)

    if (updateError) throw updateError
    await loadTestimonios()

  } catch (err) {
    console.error('Error al cambiar destacado:', err)
    alert('Error al actualizar el estado destacado')
  }
}

// Eliminar testimonio
const eliminarTestimonio = async (testimonioId) => {
  if (!confirm('¿Eliminar permanentemente este testimonio?')) return

  try {
    const { error: deleteError } = await supabase
      .from('testimonios')
      .delete()
      .eq('id', testimonioId)

    if (deleteError) throw deleteError
    await loadTestimonios()
    alert('Testimonio eliminado correctamente')

  } catch (err) {
    console.error('Error al eliminar:', err)
    alert('Error al eliminar el testimonio')
  }
}

onMounted(() => {
  loadTestimonios()
})
</script>

<style scoped>
/* Estilos coherentes con el dashboard admin */
.testimonios-admin-container {
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
  min-width: 160px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.status-select {
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

.testimonios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.testimonio-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.testimonio-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.testimonio-card.destacado {
  border-left: 4px solid #8b5cf6;
  background: #f5f3ff;
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
  margin: 0 0 0.5rem 0;
  word-break: break-word;
}

.mascota-nombre {
  font-size: 0.95rem;
  color: #64748b;
  font-weight: normal;
}

.calificacion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.estrella {
  color: #e5e7eb;
  font-size: 1.125rem;
}

.estrella.llena {
  color: #fbbf24;
}

.calificacion-numero {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
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

.badge--publicado { background: #dcfce7; color: #166534; }
.badge--pendiente { background: #ffedd5; color: #ea580c; }
.badge--destacado { background: #ede9fe; color: #7c3aed; }

.card-body {
  margin-bottom: 1.5rem;
}

.contenido {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1e293b;
  margin: 0;
  white-space: pre-wrap;
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

.label {
  font-weight: 600;
  color: #475569;
}

.value {
  color: #1e293b;
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

.btn--warning {
  background: #d97706;
  color: white;
}

.btn--warning:hover:not(:disabled) {
  background: #b45309;
}

.btn--delete {
  background: #7f1d1d;
  color: white;
}

.btn--delete:hover:not(:disabled) {
  background: #991b1b;
}

@media (max-width: 480px) {
  .testimonios-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .testimonio-card {
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
}
</style>
