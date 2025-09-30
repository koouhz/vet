<template>
  <div class="reportes-admin-container">
    <!-- Componente lateral integrado (Simulación de AppSidebar) -->
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <button
          v-if="currentReportId !== null"
          @click="currentReportId = null; resetAllFilters()"
          class="back-btn"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver a Reportes
        </button>
        <h1>{{ currentReportTitle }}</h1>
        <p class="subtitle">{{ currentReportSubtitle }}</p>
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
              <!-- Icono de Reporte -->
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

      <!-- Contenido del Reporte 1: Notas de Venta (Formulario y Resultados) -->
      <div v-else-if="currentReportId === 1" class="content-area reporte-form-view">
        <ReportFilterCard
          :filterParams="filterParams"
          @submit.prevent="executeReporteVentas"
          @reset="resetReporteVentas"
        >
          <h2 class="filter-title">Filtros de Búsqueda (Reporte 1)</h2>
          <div class="filter-grid">
            <InputField label="Cliente" v-model="filterParams.cliente" placeholder="Nombre o ID del cliente" />
            <InputField label="Fecha de Inicio" type="date" v-model="filterParams.fechaInicio" />
            <InputField label="Fecha de Fin" type="date" v-model="filterParams.fechaFin" />
            <InputField label="Ítem Vendido" v-model="filterParams.item" placeholder="Nombre del producto/servicio" />
          </div>
        </ReportFilterCard>

        <ReportResultsArea
          :reportMessage="reportMessage"
          :data="mockReporteVentas"
          :headers="headersReporteVentas"
        />
      </div>

      <!-- Contenido del Reporte 2: Historial Veterinario (Formulario y Resultados) -->
      <div v-else-if="currentReportId === 2" class="content-area reporte-form-view">
        <ReportFilterCard
          :filterParams="filterParams2"
          @submit.prevent="executeReporteHistorico"
          @reset="resetReporteHistorico"
        >
          <h2 class="filter-title">Filtros de Búsqueda (Reporte 2)</h2>
          <div class="filter-grid">
            <InputField label="Cliente" v-model="filterParams2.cliente" placeholder="Nombre del dueño" />
            <InputField label="Fecha de Inicio" type="date" v-model="filterParams2.fechaInicio" />
            <InputField label="Fecha de Fin" type="date" v-model="filterParams2.fechaFin" />
            <SelectField
              label="Tipo de Atención"
              v-model="filterParams2.tipoAtencion"
              :options="tipoAtencionOptions"
            />
          </div>
        </ReportFilterCard>

        <ReportResultsArea
          :reportMessage="reportMessage"
          :data="mockReporteHistorico"
          :headers="headersReporteHistorico"
        />
      </div>

      <!-- Contenido del Reporte 3: Citas Programadas (Formulario y Resultados) -->
      <div v-else-if="currentReportId === 3" class="content-area reporte-form-view">
        <ReportFilterCard
          :filterParams="filterParams3"
          @submit.prevent="executeReporteCitas"
          @reset="resetReporteCitas"
        >
          <h2 class="filter-title">Filtros de Búsqueda (Reporte 3)</h2>
          <div class="filter-grid">
            <InputField label="Veterinario" v-model="filterParams3.veterinario" placeholder="Nombre del veterinario" />
            <InputField label="Cliente" v-model="filterParams3.cliente" placeholder="Nombre del dueño" />
            <InputField label="Fecha de Inicio" type="date" v-model="filterParams3.fechaInicio" />
            <SelectField
              label="Estado de la Cita"
              v-model="filterParams3.estado"
              :options="estadoCitaOptions"
            />
          </div>
        </ReportFilterCard>

        <ReportResultsArea
          :reportMessage="reportMessage"
          :data="mockReporteCitas"
          :headers="headersReporteCitas"
        />
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// =======================================================
// COMPONENTES AUXILIARES INCLUIDOS PARA LA SIMULACIÓN
// =======================================================

// --- Simulación de AppSidebar (INTEGRADO) ---
const AppSidebar = {
  template: `
    <aside class="sidebar-container">
      <div class="logo-area">
        <h2 class="text-2xl font-bold text-white">VETCARE Admin</h2>
        <p class="text-sm text-green-300">Módulo de Gestión</p>
      </div>
      <nav class="navigation">
        <a href="#" class="nav-item">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3"></path></svg>
          Dashboard
        </a>
        <a href="#" class="nav-item">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Citas
        </a>
        <a href="#" class="nav-item nav-item--active">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m0 0h14m-7 0v-2a1 1 0 011-1h2a1 1 0 011 1v2m-7 0h7"></path></svg>
          Reportes
        </a>
        <a href="#" class="nav-item">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          Inventario
        </a>
      </nav>
      <div class="user-info">
        <div class="avatar">GH</div>
        <div class="details">
          <p class="name">Gabriel H.</p>
          <p class="role">Administrador</p>
        </div>
      </div>
    </aside>
  `
}

// --- Componente para Campo de Entrada (INTEGRADO) ---
const InputField = {
  props: ['label', 'type', 'modelValue', 'placeholder'],
  emits: ['update:modelValue'],
  template: `
    <div class="input-group">
      <label :for="'input-' + label">{{ label }}</label>
      <input
        :type="type || 'text'"
        :id="'input-' + label"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        class="input-field"
      >
    </div>
  `
}

// --- Componente para Campo Select (INTEGRADO) ---
const SelectField = {
  props: ['label', 'modelValue', 'options'],
  emits: ['update:modelValue'],
  template: `
    <div class="input-group">
      <label :for="'select-' + label">{{ label }}</label>
      <select
        :id="'select-' + label"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        class="input-field"
      >
        <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
      </select>
    </div>
  `
}

// --- Componente Contenedor de Filtros (INTEGRADO) ---
const ReportFilterCard = {
  props: ['filterParams'],
  emits: ['submit', 'reset'],
  template: `
    <div class="filter-card">
        <form @submit.prevent="$emit('submit')" class="filter-grid-container">
            <slot></slot>
            <div class="form-actions">
                <button @click="$emit('reset')" type="button" class="btn btn--secondary">
                    Limpiar Filtros
                </button>
                <button type="submit" class="btn btn--success">
                    Ejecutar Búsqueda y Generar
                </button>
            </div>
        </form>
    </div>
  `
}

// --- Componente Área de Resultados (INTEGRADO) ---
const ReportResultsArea = {
    props: ['reportMessage', 'data', 'headers'],
    template: `
        <div class="results-area">
            <div v-if="reportMessage" :class="['result-message', reportMessage.type]">
                <p class="font-bold">{{ reportMessage.title }}</p>
                <p>{{ reportMessage.message }}</p>
            </div>

            <p v-else-if="!data || data.length === 0" class="text-gray-500 text-center py-8">
                Presiona "Ejecutar Búsqueda" para cargar los datos del reporte.
            </p>

            <div v-else class="overflow-x-auto shadow-md rounded-lg">
                <h3 class="text-lg font-semibold mb-3 text-gray-700">Vista Previa de Resultados (Simulados)</h3>
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th v-for="header in headers" :key="header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {{ header }}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(row, index) in data" :key="index">
                            <td v-for="header in headers" :key="header + index" class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {{ row[header.toLowerCase().replace(/ /g, '_')] }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
}


// =======================================================
// LÓGICA PRINCIPAL DEL COMPONENTE REPORTES.VUE
// =======================================================

// --- ESTADO DE NAVEGACIÓN ---
const currentReportId = ref(null)
const reportMessage = ref(null) // Para mostrar mensajes de éxito o error

// --- DATOS DE REPORTES ---
const reportes = ref([
  { id: 1, titulo: 'Reporte de Notas de Venta', descripcion: 'Notas de venta filtrables por cliente, rango de fecha e ítem vendido.' },
  { id: 2, titulo: 'Reporte Historial Veterinario', descripcion: 'Historial de mascotas filtrable por cliente, rango de fecha y tipo de atención.' },
  { id: 3, titulo: 'Reporte de Citas', descripcion: 'Citas filtrables por veterinario, cliente, rango de fechas y estado.' },
])

// --- PROPIEDADES CALCULADAS PARA EL ENCABEZADO ---
const currentReportTitle = computed(() => {
    const report = reportes.value.find(r => r.id === currentReportId.value)
    return report ? report.titulo : 'Reportes'
})

const currentReportSubtitle = computed(() => {
    const report = reportes.value.find(r => r.id === currentReportId.value)
    return report ? report.descripcion : 'Visualiza y genera reportes estadísticos del sistema.'
})

// --- ESTADOS DE FILTROS ---

// Reporte 1: Notas de Venta (YA EXISTÍA)
const filterParams = ref({
    cliente: '',
    fechaInicio: '',
    fechaFin: '',
    item: ''
})

// Reporte 2: Historial Veterinario (NUEVO)
const tipoAtencionOptions = ref(['Todos', 'Consulta General', 'Vacunación', 'Cirugía', 'Internación', 'Estética'])
const filterParams2 = ref({
    cliente: '',
    fechaInicio: '',
    fechaFin: '',
    tipoAtencion: tipoAtencionOptions.value[0]
})

// Reporte 3: Citas Programadas (NUEVO)
const estadoCitaOptions = ref(['Todos', 'Programada', 'Completada', 'Cancelada', 'Pendiente Pago'])
const filterParams3 = ref({
    veterinario: '',
    cliente: '',
    fechaInicio: '',
    fechaFin: '',
    estado: estadoCitaOptions.value[0]
})


// --- MOCK DATA (VISTAS SQL SIMULADAS) ---

// Reporte 1 (vista_reporte_ventas)
const headersReporteVentas = ['Venta ID', 'Fecha Venta', 'Nombre Cliente', 'Nombre Item', 'Cantidad Vendida', 'Total Venta']
const mockReporteVentas = ref([
    { venta_id: 101, fecha_venta: '2024-09-28', nombre_cliente: 'Juan Perez', nombre_item: 'Alimento Premium 10kg', cantidad_vendida: 1, total_venta: '$ 550.00' },
    { venta_id: 102, fecha_venta: '2024-09-29', nombre_cliente: 'Maria Lopez', nombre_item: 'Consulta General', cantidad_vendida: 1, total_venta: '$ 250.00' },
    { venta_id: 103, fecha_venta: '2024-09-29', nombre_cliente: 'Juan Perez', nombre_item: 'Vacuna Antirrábica', cantidad_vendida: 2, total_venta: '$ 150.00' },
])

// Reporte 2 (vista_historial_veterinario)
const headersReporteHistorico = ['Cita ID', 'Fecha', 'Cliente', 'Mascota', 'Tipo Atención', 'Veterinario', 'Observaciones']
const mockReporteHistorico = ref([
    { cita_id: 501, fecha: '2024-09-25', cliente: 'Laura Gómez', mascota: 'Max (Perro)', tipo_atencion: 'Vacunación', veterinario: 'Dr. Flores', observaciones: 'Tercera dosis.' },
    { cita_id: 502, fecha: '2024-09-26', cliente: 'Juan Perez', mascota: 'Milo (Gato)', tipo_atencion: 'Consulta General', veterinario: 'Dra. Soliz', observaciones: 'Check-up anual.' },
    { cita_id: 503, fecha: '2024-09-27', cliente: 'Carlos Ruiz', mascota: 'Pipo (Pez)', tipo_atencion: 'Internación', veterinario: 'Dr. Flores', observaciones: 'Monitoreo intensivo.' },
])

// Reporte 3 (vista_citas_programadas)
const headersReporteCitas = ['Cita ID', 'Fecha', 'Hora', 'Estado Cita', 'Cliente', 'Mascota', 'Veterinario']
const mockReporteCitas = ref([
    { cita_id: 601, fecha: '2024-10-01', hora: '10:00', estado_cita: 'Programada', cliente: 'Ana Torres', mascota: 'Luna (Perro)', veterinario: 'Dra. Soliz' },
    { cita_id: 602, fecha: '2024-10-01', hora: '15:30', estado_cita: 'Completada', cliente: 'Marcos Soto', mascota: 'Kira (Gato)', veterinario: 'Dr. Flores' },
    { cita_id: 603, fecha: '2024-10-02', hora: '09:00', estado_cita: 'Cancelada', cliente: 'Ericka Paz', mascota: 'Coco (Loro)', veterinario: 'Dra. Soliz' },
])


// --- ACCIONES GENERALES ---

const resetAllFilters = () => {
    // Reset R1
    filterParams.value = { cliente: '', fechaInicio: '', fechaFin: '', item: '' }
    // Reset R2
    filterParams2.value = { cliente: '', fechaInicio: '', fechaFin: '', tipoAtencion: tipoAtencionOptions.value[0] }
    // Reset R3
    filterParams3.value = { veterinario: '', cliente: '', fechaInicio: '', fechaFin: '', estado: estadoCitaOptions.value[0] }
    reportMessage.value = null
    console.log("Filtros de todos los reportes reiniciados.")
}

const generarReporte = (reporteId) => {
    // Esto activa la vista del formulario correspondiente
    currentReportId.value = reporteId
    reportMessage.value = null
    console.log(`[NAVEGACIÓN] Abriendo formulario para Reporte #${reporteId}`)
}

const verDetalles = (reporteId) => {
    console.log(`[ACCIÓN] Viendo detalles del reporte #${reporteId}...`)
}


// --- ACCIONES ESPECÍFICAS DE REPORTE ---

const showSuccessMessage = (title) => {
    reportMessage.value = {
        title: `${title} Generado con Éxito`,
        message: 'La búsqueda se ha ejecutado. Los parámetros de filtrado se han registrado en la consola.',
        type: 'success'
    }
}

// R1: Reporte de Notas de Venta
const resetReporteVentas = () => {
    filterParams.value = { cliente: '', fechaInicio: '', fechaFin: '', item: '' }
    reportMessage.value = null
    console.log("Filtros del Reporte 1 (Ventas) limpiados.")
}

const executeReporteVentas = () => {
    console.log("--- EJECUTANDO REPORTE 1: NOTAS DE VENTA ---")
    console.log("Filtros Aplicados:", filterParams.value)
    showSuccessMessage('Reporte de Ventas')
    // Aquí iría la llamada al backend para generar el JasperReport
}

// R2: Reporte Historial Veterinario
const resetReporteHistorico = () => {
    filterParams2.value = { cliente: '', fechaInicio: '', fechaFin: '', tipoAtencion: tipoAtencionOptions.value[0] }
    reportMessage.value = null
    console.log("Filtros del Reporte 2 (Historial) limpiados.")
}

const executeReporteHistorico = () => {
    console.log("--- EJECUTANDO REPORTE 2: HISTORIAL VETERINARIO ---")
    console.log("Filtros Aplicados:", filterParams2.value)
    showSuccessMessage('Reporte Historial Veterinario')
    // Aquí iría la llamada al backend para generar el JasperReport
}

// R3: Reporte de Citas
const resetReporteCitas = () => {
    filterParams3.value = { veterinario: '', cliente: '', fechaInicio: '', fechaFin: '', estado: estadoCitaOptions.value[0] }
    reportMessage.value = null
    console.log("Filtros del Reporte 3 (Citas) limpiados.")
}

const executeReporteCitas = () => {
    console.log("--- EJECUTANDO REPORTE 3: CITAS PROGRAMADAS ---")
    console.log("Filtros Aplicados:", filterParams3.value)
    showSuccessMessage('Reporte de Citas')
    // Aquí iría la llamada al backend para generar el JasperReport
}
</script>

<style scoped>
/* Estilos Base (incluye los estilos de AppSidebar para la simulación) */
.reportes-admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
}

/* Estilos de AppSidebar */
.sidebar-container {
  width: 240px;
  background-color: #145a32; /* Verde Oscuro Vetcare */
  color: white;
  padding: 1.5rem 0;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
}

.logo-area {
  padding: 0 1.5rem 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
}

.navigation {
  flex-grow: 1;
  padding: 0 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin: 0.25rem 0;
  border-radius: 8px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item--active {
  background-color: #0f4c28; /* Verde ligeramente más oscuro para activo */
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: #d1fae5;
  color: #145a32;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 1rem;
}

.user-info .details .name {
  font-weight: 600;
  margin: 0;
}

.user-info .details .role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}
/* Fin Estilos de AppSidebar */


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
  border-top: 1px solid #e2e8f0;
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
  background: #d1fae5;
  border-left: 4px solid #145a32;
  color: #0f4c28;
}

.overflow-x-auto {
    overflow-x: auto;
}

.min-w-full {
    min-width: 100%;
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
