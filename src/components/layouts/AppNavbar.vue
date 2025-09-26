<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <router-link to="/" class="nav-logo" aria-label="Inicio - Veterinaria">
        <img src="@/assets/img/logo.png" alt="Logo Veterinaria" class="logo-img" />
        <span class="logo-text">Vet</span>
      </router-link>

      <!-- Desktop Links -->
      <ul class="nav-links" v-if="!isMobile">
        <li v-for="item in navItems" :key="item.to">
          <router-link :to="item.to" active-class="active" class="nav-link">
            {{ item.label }}
          </router-link>
        </li>
      </ul>

      <!-- Profile Dropdown -->
      <div class="nav-profile" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" ref="dropdownRef">
        <button
          class="btn-user"
          @click="toggleDropdown"
          :aria-expanded="dropdownOpen"
          aria-haspopup="true"
          aria-label="Menú de perfil"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
          <span v-if="userLogged" class="user-name" :title="userName">{{ userName }}</span>
        </button>

        <ul
          v-if="dropdownOpen"
          class="dropdown-menu"
          role="menu"
          aria-labelledby="profile-button"
        >
          <template v-if="userLogged">
            <li><router-link to="/perfil" class="dropdown-item">Mi Perfil</router-link></li>
            <li><button @click="logout" class="dropdown-item logout-btn">Salir</button></li>
          </template>
          <template v-else>
            <li><router-link to="/login" class="dropdown-item">Iniciar Sesión</router-link></li>
            <li><router-link to="/register" class="dropdown-item">Registrarse</router-link></li>
          </template>
        </ul>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        class="mobile-toggle"
        @click="toggleMobileMenu"
        :aria-expanded="mobileMenuOpen"
        aria-label="Abrir menú móvil"
        v-if="isMobile"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div
      v-if="isMobile && mobileMenuOpen"
      class="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación móvil"
    >
      <ul class="mobile-nav-links">
        <li v-for="item in navItems" :key="item.to">
          <router-link
            :to="item.to"
            @click="closeMobileMenu"
            active-class="active"
            class="mobile-nav-link"
          >
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// --- Refs ---
const dropdownOpen = ref(false)
const mobileMenuOpen = ref(false)
const isMobile = ref(false)
const userLogged = ref(false)
const userName = ref('')
const dropdownRef = ref(null)

// --- Navigation Items ---
const navItems = [
  { label: 'Inicio', to: '/' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Equipo', to: '/equipo' },
  { label: 'Contacto', to: '/contacto' }
]

// --- Dropdown Logic ---
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) mobileMenuOpen.value = false
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

// --- Mobile Menu Logic ---
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (mobileMenuOpen.value) dropdownOpen.value = false
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// --- Mouse Events for Dropdown ---
let mouseLeaveTimeout
const handleMouseEnter = () => {
  if (mouseLeaveTimeout) clearTimeout(mouseLeaveTimeout)
}
const handleMouseLeave = () => {
  mouseLeaveTimeout = setTimeout(() => {
    dropdownOpen.value = false
  }, 200)
}

// --- Click Outside Dropdown ---
onMounted(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
      dropdownOpen.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => document.removeEventListener('click', handleClickOutside))
})

// --- Responsive Detection ---
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    mobileMenuOpen.value = false
    dropdownOpen.value = false
  }
}

// --- Auth & User Data ---
onMounted(async () => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    userLogged.value = true
    const { data, error } = await supabase
      .from('usuarios')
      .select('nombre_completo')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      userName.value = data.nombre_completo.split(' ')[0] || 'Usuario'
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  if (mouseLeaveTimeout) clearTimeout(mouseLeaveTimeout)
})

// --- Logout ---
const logout = async () => {
  await supabase.auth.signOut()
  userLogged.value = false
  userName.value = ''
  closeDropdown()
  closeMobileMenu()
}
</script>

<style scoped>
/* ===== VARIABLES CSS ===== */

/* ===== NAVBAR ===== */
.navbar {
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: background var(--transition);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 64px;
  gap: 1.5rem;
}

/* LOGO */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--color-accent);
}

.logo-img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  object-fit: cover;
  transition: transform var(--transition);
}

.logo-img:hover {
  transform: scale(1.05);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-accent);
}

/* LINKS DESKTOP */
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  transition: all var(--transition);
}

.nav-link:hover,
.nav-link.active {
  color: #ffffff;
  background: var(--color-accent);
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

/* PROFILE BUTTON */
.nav-profile {
  position: relative;
  display: flex;
  align-items: center;
}

.btn-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  padding: 0.45rem 0.85rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: all var(--transition);
}

.btn-user:hover {
  background: var(--color-accent);
  color: #ffffff;
  border-color: var(--color-accent);
}

/* DROPDOWN */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.5rem 0;
  min-width: 180px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
  list-style: none;
  z-index: 1001;
}

.dropdown-item {
  display: block;
  padding: 0.6rem 1rem;
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
}

.dropdown-item:hover {
  background: var(--color-accent);
  color: #ffffff;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* MOBILE */
.mobile-toggle {
  display: none;
  background: none;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  color: var(--color-text);
  border-radius: var(--radius);
  transition: background var(--transition);
}

.mobile-toggle:hover {
  background: var(--color-border);
}

.mobile-menu {
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding: 1rem;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
  z-index: 1000;
}

.mobile-nav-link {
  display: block;
  padding: 0.7rem 1rem;
  color: var(--color-text);
  font-weight: 500;
  border-radius: var(--radius);
  transition: all var(--transition);
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background: var(--color-accent);
  color: #ffffff;
}

/* MEDIA QUERIES */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .mobile-toggle {
    display: block;
  }
}

</style>
