<template>
  <div class="reportes-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Reportes</h1>
        <p class="subtitle">Explora datos detallados del sistema veterinario.</p>
      </div>

      <div class="content-area">
        <div class="reportes-grid">
          <div
            v-for="reporte in reportes"
            :key="reporte.id"
            class="reporte-card"
          >
            <div class="card-header">
              <h3>{{ reporte.titulo }}</h3>
              <div class="card-badge">{{ reporte.badge }}</div>
            </div>
            <p class="card-description">{{ reporte.descripcion }}</p>

            <div class="card-actions">
              <router-link
                :to="reporte.route"
                class="btn btn--secondary"
              >
                Ver registros
              </router-link>
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

const reportes = ref([
  {
    id: 1,
    titulo: 'Notas de Venta',
    badge: 'Ventas',
    descripcion: 'Ventas por cliente, rango de fecha e ítem.',
    route: { name: 'ReporteNotasVenta' }
  },
  {
    id: 2,
    titulo: 'Historial Veterinario',
    badge: 'Mascotas',
    descripcion: 'Atenciones por mascota, cliente y tipo (vacunación, desparasitación, etc.).',
    route: { name: 'ReporteHistorialVeterinario' }
  },
  {
    id: 3,
    titulo: 'Citas Programadas',
    badge: 'Citas',
    descripcion: 'Citas por veterinario, cliente, estado y rango de fechas.',
    route: { name: 'ReporteCitas' }
  }
])
</script>

<style scoped>
.reportes-admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
  color: #1e293b;
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-left: 260px; /* Ajustado al ancho de tu sidebar */
  transition: margin-left 0.3s ease;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1.25rem;
  }
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.subtitle {
  color: #64748b;
  font-size: 1.05rem;
  margin-top: 0.35rem;
}

.reportes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.75rem;
}

.reporte-card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.reporte-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.card-header h3 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.card-badge {
  background: #e0f2fe;
  color: #0284c7;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
}

.card-description {
  color: #64748b;
  line-height: 1.6;
  margin: 0.75rem 0 1.25rem;
  font-size: 0.95rem;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.925rem;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-height: 42px;
  text-decoration: none;
  text-align: center;
}

.btn--secondary {
  background: white;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  font-weight: 600;
}

.btn--secondary:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .reportes-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .reporte-card {
    padding: 1.25rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .card-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .reporte-card {
    padding: 1rem;
  }
}
</style>
