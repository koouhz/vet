<template>
  <aside
    class="app-sidebar"
    :class="{ 'sidebar-collapsed': isCollapsed }"
    aria-label="Navegación principal"
  >
    <!-- Logo & Toggle -->
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="@/assets/img/logo.png" alt="Logo Clínica Veterinaria" class="logo" />
        <h1 v-if="!isCollapsed" class="logo-text">VetCare</h1>
      </div>
      <button
        v-if="showToggle"
        @click="toggleSidebar"
        class="toggle-btn"
        aria-label="Alternar menú"
      >
        <i class="ph ph-caret-left" :class="{ rotated: isCollapsed }"></i>
      </button>
    </div>

    <!-- Navegación Principal -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <!-- Dashboard según rol -->
        <SidebarItem
          v-if="userRole === 'admin'"
          to="/dashboard/admin"
          icon="ph-chart-bar"
          label="Dashboard Admin"
        />
        <SidebarItem
          v-else-if="userRole === 'veterinario'"
          to="/dashboard/vet"
          icon="ph-stethoscope"
          label="Mi Panel"
        />

        <!-- Citas -->
        <SidebarItem
          to="/citas"
          icon="ph-calendar"
          label="Mis Citas"
          v-if="userRole !== 'admin'"
        />
        <SidebarItem
          to="/citas-gestion"
          icon="ph-calendar-check"
          label="Gestionar Citas"
          v-if="userRole === 'admin' || userRole === 'veterinario'"
        />

        <!-- Mascotas -->
        <SidebarItem
          to="/mascotas"
          icon="ph-paw-print"
          label="Mis Mascotas"
          v-if="userRole !== 'admin'"
        />
        <SidebarItem
          to="/mascotas-gestion"
          icon="ph-dog"
          label="Todas las Mascotas"
          v-if="userRole === 'admin'"
        />

        <!-- Veterinarios -->
        <SidebarItem
          to="/equipo"
          icon="ph-users"
          label="Nuestro Equipo"
          v-if="userRole !== 'veterinario'"
        />
        <SidebarItem
          to="/mi-perfil-vet"
          icon="ph-user-circle-gear"
          label="Mi Perfil Profesional"
          v-if="userRole === 'veterinario'"
        />

        <!-- Servicios -->
        <SidebarItem
          to="/servicios"
          icon="ph-list-checks"
          label="Servicios"
        />

        <!-- Testimonios -->
        <SidebarItem
          to="/testimonios"
          icon="ph-chat-centered-text"
          label="Testimonios"
        />
        <SidebarItem
          to="/testimonios-aprobar"
          icon="ph-check-circle"
          label="Aprobar Testimonios"
          v-if="userRole === 'admin'"
        />

        <!-- Contacto y Mensajes -->
        <SidebarItem
          to="/contacto"
          icon="ph-envelope"
          label="Contáctanos"
          v-if="userRole === 'cliente'"
        />
        <SidebarItem
          to="/mensajes"
          icon="ph-inbox"
          label="Mensajes de Contacto"
          v-if="userRole === 'admin'"
        />

        <!-- Configuración (solo admin) -->
        <SidebarItem
          to="/configuracion"
          icon="ph-gear"
          label="Configuración"
          v-if="userRole === 'admin'"
        />

        <!-- Perfil y Cerrar Sesión -->
        <li class="nav-divider"></li>
        <SidebarItem
          to="/perfil"
          icon="ph-user"
          label="Mi Perfil"
        />
        <SidebarItem
          @click="handleLogout"
          icon="ph-sign-out"
          label="Cerrar Sesión"
          class="logout-item"
        />
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import SidebarItem from './SidebarItem.vue';

// Inyectamos el store global o auth (ajusta según tu implementación)
// Aquí asumo que tienes un store de auth o un composable que provee userRole
const authStore = inject('authStore') || {
  user: { role: 'cliente' } // fallback para desarrollo
};

const userRole = computed(() => authStore.user?.role || 'cliente');

const router = useRouter();
const isCollapsed = ref(false);
const showToggle = ref(false); // Puedes activarlo si quieres permitir colapsar

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleLogout = async () => {
  try {
    // Aquí debes integrar tu lógica de logout con Supabase
    const { supabase } = await import('@/lib/supabaseClient.js');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push('/login');
  } catch (err) {
    console.error('Error al cerrar sesión:', err.message);
  }
};
</script>

<style scoped>
.app-sidebar {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
  height: 100vh;
  width: 260px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.sidebar-collapsed .logo-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.toggle-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: background-color 0.2s ease;
}

.toggle-btn:hover {
  background-color: #e2e8f0;
}

.rotated {
  transform: rotate(180deg);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 0.75rem 1rem;
}

.logout-item {
  margin-top: auto;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

/* Media Queries */
@media (max-width: 768px) {
  .app-sidebar {
    transform: translateX(-100%);
    box-shadow: none;
  }

  .app-sidebar.active {
    transform: translateX(0);
  }
}
</style>
