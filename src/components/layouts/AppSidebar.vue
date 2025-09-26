<template>
  <aside :class="['app-sidebar', { 'sidebar-collapsed': isCollapsed }]" aria-label="Navegación principal">
    <!-- Logo & Toggle -->
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="@/assets/img/logo.png" alt="Logo VetCare" class="logo" />
        <h1 v-if="!isCollapsed" class="logo-text">VetCare</h1>
      </div>
      <button v-if="showToggle" @click="toggleSidebar" class="toggle-btn" aria-label="Alternar menú">
        <i class="ph ph-caret-left" :class="{ rotated: isCollapsed }"></i>
      </button>
    </div>

    <!-- Navegación Principal -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <!-- Inicio: visible para todos -->
        <SidebarItem to="/" icon="ph-house" label="Inicio" :collapsed="isCollapsed" />

        <!-- Dashboard: solo admin y veterinario -->
        <SidebarItem
          v-if="canAccessDashboard"
          :to="dashboardRoute"
          icon="ph-gauge"
          :label="dashboardLabel"
          :collapsed="isCollapsed"
        />

        <SidebarItem
          v-if="canAccessReportes"
          :to="{ name: 'ReportesAdmin' }"
          icon="ph-file-text"
          label="Reportes"
          :collapsed="isCollapsed"
        />


        <!-- Configuración: solo admin -->
        <SidebarItem
          v-if="isAdmin"
          :to="{ name: 'ConfiguracionAdmin' }"
          icon="ph-gear"
          label="Configuración"
          :collapsed="isCollapsed"
        />

        <li class="nav-divider"></li>

        <!-- Perfil y Logout: visibles para todos -->
        <SidebarItem to="/perfil" icon="ph-user" label="Mi Perfil" :collapsed="isCollapsed" />
        <SidebarItem @click="handleLogout" icon="ph-sign-out" label="Cerrar Sesión" :collapsed="isCollapsed" class="logout-item" />
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import SidebarItem from './SidebarItem.vue';

// Inyectamos authStore global o creamos uno temporal
const authStore = inject('authStore') || { user: ref(null), loadUser: async () => {} };

const router = useRouter();
const isCollapsed = ref(false);
const showToggle = ref(true);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

// Función para cargar usuario al montar el sidebar
onMounted(async () => {
  if (!authStore.user.value) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error) authStore.user.value = userData;
    }
  }
});

// Computed para roles
const userRole = computed(() => authStore.user?.value?.rol || 'cliente');
const isAdmin = computed(() => userRole.value === 'admin');
const isVet = computed(() => userRole.value === 'veterinario');

// Permisos de acceso
const canAccessDashboard = computed(() => isAdmin.value || isVet.value);
const canAccessReportes = computed(() => isAdmin.value || isVet.value);

// Dashboard dinámico
const dashboardRoute = computed(() => {
  if (isAdmin.value) return '/dashboard-admin';
  if (isVet.value) return '/dashboard-vet';
  return '/';
});
const dashboardLabel = computed(() => {
  if (isAdmin.value) return 'Dashboard';
  if (isVet.value) return 'Dashboard';
  return 'Dashboard';
});

// Logout
const handleLogout = async () => {
  try {
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
  background: var(--color-bg);
  border-right: 1px solid var(--color-border);
  height: 100vh;
  width: 260px;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--color-border);
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
  color: var(--color-text);
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
  color: var(--color-gray);
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
  background-color: var(--color-border);
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
  background-color: var(--color-border);
  margin: 0.75rem 1rem;
}

.logout-item {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}
</style>
