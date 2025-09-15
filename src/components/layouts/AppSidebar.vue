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
        <SidebarItem to="/" icon="ph-house" label="Inicio" :collapsed="isCollapsed" />

        <!-- Dashboard según rol -->
        <SidebarItem
          :to="dashboardRoute"
          icon="ph-gauge"
          label="Dashboard"
          :collapsed="isCollapsed"
        />

        <SidebarItem to="/reportes" icon="ph-file-text" label="Reportes" :collapsed="isCollapsed" />
        <SidebarItem to="/configuracion" icon="ph-gear" label="Configuración" :collapsed="isCollapsed" />

        <li class="nav-divider"></li>

        <SidebarItem to="/perfil" icon="ph-user" label="Mi Perfil" :collapsed="isCollapsed" />
        <SidebarItem @click="handleLogout" icon="ph-sign-out" label="Cerrar Sesión" :collapsed="isCollapsed" class="logout-item" />
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue';
import { useRouter } from 'vue-router';
import SidebarItem from './SidebarItem.vue';

// Inyectamos authStore global
const authStore = inject('authStore') || { user: { role: 'cliente' } };

const userRole = computed(() => authStore.user?.role || 'cliente');

const router = useRouter();
const isCollapsed = ref(false);
const showToggle = ref(true);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleLogout = async () => {
  try {
    const { supabase } = await import('@/lib/supabaseClient.js');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push('/login');
  } catch (err) {
    console.error('Error al cerrar sesión:', err.message);
  }
};

// Dashboard route dinámico según rol
const dashboardRoute = ref('/');
watch(userRole, (newRole) => {
  if (newRole === 'admin') dashboardRoute.value = '/dashboard-admin';
  else if (newRole === 'veterinario') dashboardRoute.value = '/dashboard-vet';
  else dashboardRoute.value = '/';
}, { immediate: true });
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
  color: var(--color-text2);
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
