<template>
  <div class="reportes-admin-container">
    <!-- Asumo que AppSidebar existe -->
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <!-- Título dinámico según la vista -->
        <button
          v-if="currentReportId !== null"
          @click="currentReportId = null"
          class="back-btn"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver a Reportes
        </button>
        <h1>{{ currentReportId === 1 ? 'Reporte de Notas de Venta' : 'Reportes' }}</h1>
        <p class="subtitle">{{ currentReportId === 1 ? 'Filtra y genera las notas de venta.' : 'Visualiza y genera reportes estadísticos del sistema.' }}</p>
      </div>

      <!-- Contenido de la Vista Principal (Lista de Tarjetas) -->
      <div v-if="currentReportId === null" class="content-area">
        <div v-if="reportes.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M9 12H21" /><path d="M9 18H21" /><path d="M9 6H21" />
            <path d="M3 12H6" /><path d="M3 18H6" /><path d="M3 6H6" />
          </svg>
          <p>No hay reportes disponibles en este momento.</p>
        </div>

        <div v-else class="reportes-grid">
          <div
            v-for="reporte in reportes"
            :key="reporte.id"
            class="reporte-card"
          >
            <div class="icon-container">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 18H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 6H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 12H6" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 18H6" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 6H6" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>{{ reporte.titulo }}</h3>
            <p>{{ reporte.descripcion }}</p>
            <div class="card-footer">
              <button @click="generarReporte(reporte.id)" class="btn btn--success">
                Generar
              </button>
              <button @click="verDetalles(reporte.id)" class="btn btn--outline">
                Ver
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido del Reporte 1: Notas de Venta (Formulario de Filtros) -->
      <div v-else-if="currentReportId === 1" class="content-area reporte-form-view">
        <div class="filter-card">
          <h2 class="filter-title">Filtros de Búsqueda</h2>

          <form @submit.prevent="executeReporteVentas" class="filter-grid">

            <!-- Cliente -->
            <div class="input-group">
              <label for="filtro-cliente">Cliente</label>
              <input type="text" id="filtro-cliente" v-model="filterParams.cliente" placeholder="Nombre o ID del cliente" class="input-field">
            </div>

            <!-- Fecha de Inicio -->
            <div class="input-group">
              <label for="filtro-fecha-inicio">Fecha de Inicio</label>
              <input type="date" id="filtro-fecha-inicio" v-model="filterParams.fechaInicio" class="input-field">
            </div>

            <!-- Fecha de Fin -->
            <div class="input-group">
              <label for="filtro-fecha-fin">Fecha de Fin</label>
              <input type="date" id="filtro-fecha-fin" v-model="filterParams.fechaFin" class="input-field">
            </div>

            <!-- Ítem Vendido -->
            <div class="input-group">
              <label for="filtro-item">Ítem Vendido</label>
              <input type="text" id="filtro-item" v-model="filterParams.item" placeholder="Nombre del producto/servicio" class="input-field">
            </div>
          </form>

          <div class="form-actions">
            <button @click="resetFilters" type="button" class="btn btn--secondary">
              Limpiar Filtros
            </button>
            <button @click="executeReporteVentas" type="submit" class="btn btn--success">
              Ejecutar Búsqueda y Generar
            </button>
          </div>
        </div>

        <!-- Área de Resultados / Mensajes -->
        <div v-if="reportMessage" :class="['result-message', reportMessage.type]">
            <p class="font-bold">{{ reportMessage.title }}</p>
            <p>{{ reportMessage.message }}</p>
        </div>

        <div class="results-area">
          <p v-if="!reportMessage">Aquí se mostrará la tabla con los resultados del reporte.</p>
        </div>

      </div>

      <!-- Contenido de otros Reportes (ID 2 y 3) -->
       <div v-else class="content-area report-detail-view">
           <h2 class="text-xl font-semibold text-gray-800 mb-4">Reporte {{ currentReportId }} en Desarrollo</h2>
           <p class="text-gray-500">Pronto podrás ver la interfaz de filtros para este reporte.</p>
       </div>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// Asegúrate de que esta importación sea correcta para tu estructura de carpetas
import AppSidebar from '@/components/layouts/AppSidebar.vue'

// --- ESTADO DE NAVEGACIÓN ---
// null: muestra la lista de tarjetas (vista principal)
// 1: muestra el formulario del Reporte de Notas de Venta
const currentReportId = ref(null)

// --- ESTADO DEL REPORTE 1: NOTAS DE VENTA ---
const filterParams = ref({
  cliente: '',
  fechaInicio: '',
  fechaFin: '',
  item: ''
})

const reportMessage = ref(null) // Para mostrar mensajes de éxito o error

// --- DATOS DE REPORTES (ACTUALIZADOS) ---
const reportes = ref([
  {
    id: 1,
    titulo: 'Reporte de Notas de Venta',
    descripcion: 'Notas de venta filtrables por cliente, rango de fecha e ítem vendido.'
  },
  {
    id: 2,
    titulo: 'Reporte Historial Veterinario',
    descripcion: 'Historial de mascotas filtrable por cliente, rango de fecha y tipo de atención.'
  },
  {
    id: 3,
    titulo: 'Reporte de Citas',
    descripcion: 'Citas filtrables por veterinario, cliente, rango de fechas y estado.'
  },
])

// --- ACCIONES ---

const generarReporte = (reporteId) => {
  // Si se hace clic en el Reporte 1, cambiamos la vista
  if (reporteId === 1) {
    currentReportId.value = 1
    reportMessage.value = null // Limpiar mensaje al entrar
  } else {
    // Para cualquier otro reporte, mostramos una simulación en consola
    const reporte = reportes.value.find(r => r.id === reporteId)
    const titulo = reporte ? reporte.titulo : `Reporte #${reporteId}`
    console.log(`✅ [ACCIÓN EJECUTADA] Simulación de generación del reporte: "${titulo}" (ID: ${reporteId})`)
    // Usamos console.log en lugar de alert() para un mejor UX
    // alert(`Generando reporte ${reporteId}... (Funcionalidad pendiente)`)
  }
}

const verDetalles = (reporteId) => {
  console.log(`[ACCIÓN] Viendo detalles del reporte #${reporteId}...`)
  // alert(`Ver detalles del reporte ${reporteId}... (Funcionalidad pendiente)`)
}

const resetFilters = () => {
  filterParams.value = {
    cliente: '',
    fechaInicio: '',
    fechaFin: '',
    item: ''
  }
  reportMessage.value = null
  console.log("Filtros del Reporte de Notas de Venta limpiados.")
}

const executeReporteVentas = () => {
  // 1. Simulación de la lógica de filtrado/generación
  const params = filterParams.value

  console.log("--- EJECUTANDO REPORTE DE NOTAS DE VENTA ---")
  console.log(`Cliente: ${params.cliente || 'N/A'}`)
  console.log(`Rango: ${params.fechaInicio || 'N/A'} hasta ${params.fechaFin || 'N/A'}`)
  console.log(`Ítem: ${params.item || 'N/A'}`)
  console.log("-------------------------------------------")

  // 2. Mostrar el mensaje de éxito en la interfaz
  reportMessage.value = {
    title: 'Reporte Generado con Éxito',
    message: 'Se han encontrado 15 notas de venta. Los parámetros usados se han registrado en la consola para referencia.',
    type: 'success'
  }
}
</script>

<style scoped>
/* Estilos Base (no modificados de tu versión original) */
.reportes-admin-container {
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
}

.content-area {
  min-height: 400px;
}
/* ... otros estilos de .message y .reportes-grid ... */

.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #64748b;
  text-align: center;
}

.reportes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.reporte-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.reporte-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #145a32;
}

.icon-container {
  width: 64px;
  height: 64px;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  transition: background-color 0.3s ease;
}

.reporte-card:hover .icon-container {
  background: #d1fae5;
}

.reporte-card h3 {
  margin: 1rem 0 0.75rem;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
}

.reporte-card p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
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
/* Estilos Específicos para la Vista de Formulario de Reporte */
.back-btn {
  display: flex;
  align-items: center;
  color: #145a32;
  font-weight: 600;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: #0f4c28;
}

.filter-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.filter-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
  margin-bottom: 0.375rem;
}

.input-field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field:focus {
  border-color: #145a32;
  outline: none;
  box-shadow: 0 0 0 2px rgba(20, 90, 50, 0.2); /* Sombra suave para enfoque */
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
}

.btn--secondary {
  background: #e2e8f0;
  color: #1e293b;
}
.btn--secondary:hover {
  background: #cbd5e1;
}

.results-area {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 150px;
}

.result-message {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.result-message.success {
    background: #d1fae5; /* secondary-light con un toque más verde */
    border-left: 4px solid #145a32;
    color: #0f4c28;
}

/* Responsive extra */
@media (max-width: 768px) {
  .reportes-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .reporte-card {
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
