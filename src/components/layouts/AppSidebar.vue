<template>
  <aside :class="['sidebar', { 'sidebar--collapsed': isCollapsed }]">
    <!-- Logo / Header -->
    <div class="sidebar-header">
      <div class="logo" @click="toggleCollapse">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8V16" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 12H16" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span v-if="!isCollapsed" class="logo-text">VET</span>
      </div>

      <!-- Botón de colapso (solo visible en escritorio) -->
      <button v-if="!isMobile" class="collapse-btn" @click="toggleCollapse">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 19L5 12L12 5" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Menú de Navegación -->
    <nav class="sidebar-nav">
      <ul>
        <!-- Inicio (solo para cliente) -->
        <li v-if="showHome" class="sidebar-item">
          <router-link to="/" class="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="!isCollapsed">Inicio</span>
          </router-link>
        </li>

        <!-- Admin -->
        <li v-if="isAdmin" class="sidebar-item">
          <router-link to="/dashboard-admin" class="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19.4 15C19.9523 15.6152 20.2845 16.3455 20.3452 17.1C20.4059 17.8545 20.1925 18.5889 19.7462 19.1991C19.2999 19.8093 18.655 20.2509 17.9366 20.4277C17.2182 20.6046 16.4693 20.5014 15.8 20.14C14.2874 19.3326 13.1573 18.0549 12.6293 16.5C12.1013 14.9451 12.2162 13.269 12.9482 11.85C13.6802 10.431 14.9533 9.39837 16.4 9C17.8467 8.60163 19.4425 8.65789 20.8 9.14C22.1575 9.62211 23.1595 10.5076 23.54 11.6C23.9205 12.6924 23.656 13.874 22.84 14.8C22.024 15.726 20.7753 16.2496 19.4 15Z" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4.6 15C5.15231 15.6152 5.48448 16.3455 5.54518 17.1C5.60588 17.8545 5.39252 18.5889 4.94618 19.1991C4.49984 19.8093 3.85494 20.2509 3.13656 20.4277C2.41819 20.6046 1.66932 20.5014 1 20.14C-0.51264 19.3326 -1.64268 18.0549 -2.17066 16.5C-2.69864 14.9451 -2.58378 13.269 -1.85178 11.85C-1.11979 10.431 0.153339 9.39837 1.6 9C3.04666 8.60163 4.64249 8.65789 6 9.14C7.35751 9.62211 8.35952 10.5076 8.74 11.6C9.12048 12.6924 8.85599 13.874 8.04 14.8C7.224 15.726 5.97527 16.2496 4.6 15Z" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="!isCollapsed">Administración</span>
          </router-link>
        </li>

        <li v-if="isAdmin" class="sidebar-item">
          <router-link to="/servicios" class="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V16" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12H16" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="!isCollapsed">Servicios</span>
          </router-link>
        </li>

        <li v-if="isAdmin" class="sidebar-item">
          <router-link to="/equipo" class="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 11H8" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 15H8" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="!isCollapsed">Equipos</span>
          </router-link>
        </li>

        <!-- Veterinario -->
        <li v-if="isVeterinarian" class="sidebar-item">
          <router-link to="/dashboard-vet" class="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V16" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12H16" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="!isCollapsed">Mi Panel</span>
          </router-link>
        </li>

        <li v-if="isVeterinarian" class="sidebar-item">
          <router-link to="/perfil" class="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21C20 19.3431 18.6569 18 17 18H7C5.34315 18 4 19.3431 4 21" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="!isCollapsed">Mi Perfil</span>
          </router-link>
        </li>

        <li v-if="isVeterinarian" class="sidebar-item">
          <router-link to="/servicios" class="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V16" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 12H16" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="!isCollapsed">Mis Servicios</span>
          </router-link>
        </li>

        <li v-if="isVeterinarian" class="sidebar-item">
          <router-link to="/citas" class="sidebar-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V5" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 2V5" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 9H21" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 15H21" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 21H21" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="!isCollapsed">Mis Citas</span>
          </router-link>
        </li>

        <!-- Cerrar sesión -->
        <li class="sidebar-item sidebar-item--logout">
          <button @click="handleLogout" class="sidebar-link logout-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12H9" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="!isCollapsed">Cerrar sesión</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Botón de toggle solo en móvil -->
    <button v-if="isMobile" class="mobile-toggle" @click="toggleCollapse">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12H21" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round"/>
        <path d="M3 6H21" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round"/>
        <path d="M3 18H21" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const isCollapsed = ref(false)
const isMobile = ref(false)

// Detectar tamaño de pantalla
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    isCollapsed.value = false // En escritorio, por defecto expandido
  }
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

const isAdmin = ref(false)
const isVeterinarian = ref(false)
const showHome = ref(true)

const getUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: userData, error } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (!error && userData) {
    isAdmin.value = userData.rol === 'admin'
    isVeterinarian.value = userData.rol === 'veterinario'
    showHome.value = !isAdmin.value && !isVeterinarian.value
  }
}

getUserRole()

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: linear-gradient(135deg, #03252b 0%, #0a4a56 100%);
  color: #e0f2fe;
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, transform 0.3s ease;
  overflow-x: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.sidebar--collapsed {
  width: 80px;
}

/* Encabezado del sidebar */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.75rem 1.25rem;
  margin-bottom: 2.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo:hover {
  opacity: 0.85;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  white-space: nowrap;
  transition: opacity 0.3s ease, width 0.3s ease;
}

.sidebar--collapsed .logo-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.collapse-btn {
  background: none;
  border: none;
  color: #e0f2fe;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 10px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
}

/* Menú de navegación */
.sidebar-nav ul {
  list-style: none;
  padding: 0 1.25rem;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-item {
  margin: 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.85rem 1.25rem;
  border-radius: 10px;
  text-decoration: none;
  color: #e0f2fe;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s ease, transform 0.2s ease, color 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-link svg {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.sidebar-link:hover,
.sidebar-link.active {
  background: rgba(224, 242, 254, 0.15);
  transform: translateX(6px);
}

.sidebar-link span {
  transition: opacity 0.3s ease, width 0.3s ease;
}

.sidebar--collapsed .sidebar-link span {
  opacity: 0;
  width: 0;
}

/* Botón de logout */
.logout-btn {
  background: none;
  border: none;
  text-align: left;
  width: 100%;
  padding: 0.85rem 1.25rem;
  margin-top: auto;
  margin-bottom: 1.5rem;
  color: #e0f2fe;
  cursor: pointer;
  border-radius: 10px;
  font-weight: 500;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #fecaca;
  transform: translateX(6px);
}

/* Toggle en móvil */
.mobile-toggle {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e0f2fe;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 1001;
  display: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.mobile-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(-50%) scale(1.1);
}

.sidebar--collapsed .mobile-toggle {
  display: flex;
}

/* Responsive: Mobile only */
@media (max-width: 768px) {
  .sidebar {
    width: 80px;
    transform: translateX(-100%);
  }

  .sidebar--collapsed {
    width: 100%;
    height: 100vh;
    transform: translateX(0);
  }

  .sidebar-header,
  .sidebar-nav ul {
    padding: 0 1rem;
  }

  .collapse-btn {
    display: none;
  }

  .mobile-toggle {
    display: flex;
  }

  .sidebar--collapsed .sidebar-header,
  .sidebar--collapsed .sidebar-nav ul {
    padding: 1.25rem;
  }

  .sidebar--collapsed .sidebar-link span {
    opacity: 1;
    width: auto;
  }
}
</style>
