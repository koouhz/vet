<template>
  <div class="reportes-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Reportes</h1>
        <p class="subtitle">Visualiza y genera reportes estadísticos del sistema.</p>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="reportes.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M9 12H21" />
            <path d="M9 18H21" />
            <path d="M9 6H21" />
            <path d="M3 12H6" />
            <path d="M3 18H6" />
            <path d="M3 6H6" />
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
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppSidebar from '@/components/layouts/AppSidebar.vue'

// Datos de ejemplo para reportes
const reportes = ref([
  {
    id: 1,
    titulo: 'Reporte de Usuarios',
    descripcion: 'Cantidad de usuarios registrados por mes y rol.'
  },
  {
    id: 2,
    titulo: 'Reporte de Citas',
    descripcion: 'Estadísticas de citas por estado, veterinario y servicio.'
  },
  {
    id: 3,
    titulo: 'Reporte de Ventas',
    descripcion: 'Ventas mensuales, productos más vendidos y ingresos.'
  },
  {
    id: 4,
    titulo: 'Reporte de Veterinarios',
    descripcion: 'Productividad y especialidades por veterinario.'
  },
  {
    id: 5,
    titulo: 'Reporte de Equipos',
    descripcion: 'Uso y mantenimiento de equipos médicos.'
  },
  {
    id: 6,
    titulo: 'Reporte de Testimonios',
    descripcion: 'Calificaciones y feedback de clientes.'
  }
])

// Acciones (placeholder para futura implementación)
const generarReporte = (reporteId) => {
  alert(`Generando reporte ${reporteId}... (Funcionalidad pendiente)`)
}

const verDetalles = (reporteId) => {
  alert(`Ver detalles del reporte ${reporteId}... (Funcionalidad pendiente)`)
}
</script>

<style scoped>
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
