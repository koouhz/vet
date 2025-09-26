<template>
  <div class="configuracion-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Configuración</h1>
        <p class="subtitle">Gestiona la configuración del sistema, usuarios y permisos.</p>
      </div>

      <!-- Secciones de configuración -->
      <div class="config-sections">
        <div class="config-section-card">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20 21C20 19.3431 18.6569 18 17 18H7C5.34315 18 4 19.3431 4 21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="section-content">
            <h2>Usuarios</h2>
            <p>Agregar, editar o eliminar usuarios del sistema.</p>
          </div>
          <div class="section-actions">
            <button @click="navigateTo('UsuarioAdmin')" class="btn btn--outline">
              Gestionar
            </button>
          </div>
        </div>

        <div class="config-section-card">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12H16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="section-content">
            <h2>Preferencias del sistema</h2>
            <p>Configurar temas, notificaciones y otras opciones generales.</p>
          </div>
          <div class="section-actions">
            <button @click="navigateTo('ConfiguracionAdmin')" class="btn btn--outline">
              Configurar
            </button>
          </div>
        </div>

        <div class="config-section-card">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="section-content">
            <h2>Bitácora del sistema</h2>
            <p>Visualizar el registro histórico de todas las acciones realizadas.</p>
          </div>
          <div class="section-actions">
            <button @click="navigateTo('BitacoraAdmin')" class="btn btn--outline">
              Ver registro
            </button>
          </div>
        </div>

        <div class="config-section-card">
          <div class="section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 18H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 6H21" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 12H6" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 18H6" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 6H6" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="section-content">
            <h2>Reportes</h2>
            <p>Generar y visualizar reportes estadísticos del sistema.</p>
          </div>
          <div class="section-actions">
            <button @click="navigateTo('ReportesAdmin')" class="btn btn--outline">
              Generar
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layouts/AppSidebar.vue'

const router = useRouter()

const navigateTo = (routeName) => {
  router.push({ name: routeName })
}
</script>

<style scoped>
.configuracion-admin-container {
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
  margin-bottom: 2.5rem;
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

.config-sections {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.config-section-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.config-section-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #145a32;
}

.section-icon {
  width: 48px;
  height: 48px;
  background: #ecfdf5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  transition: background-color 0.3s ease;
}

.config-section-card:hover .section-icon {
  background: #d1fae5;
}

.section-content {
  flex: 1;
  margin-bottom: 1.25rem;
}

.section-content h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}

.section-content p {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.section-actions {
  display: flex;
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

.btn--outline {
  background: #f1f5f9;
  color: #1e293b;
}

.btn--outline:hover:not(:disabled) {
  background: #e2e8f0;
}

/* Responsive extra */
@media (max-width: 768px) {
  .config-sections {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .config-section-card {
    padding: 1.25rem;
  }
}
</style>
