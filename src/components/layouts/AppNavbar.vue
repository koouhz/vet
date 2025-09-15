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
/* ============================================= */
/* 🟢 NAVBAR — ESTILOS AISLADOS Y RESISTENTES A main.css */
/* Nada depende de variables globales. Todo explícito. */
/* ============================================= */

/* === Fuentes externas (garantizadas) === */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

.navbar {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  gap: 1.5rem;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #111827 !important; /* ¡Fuerza negro oscuro! */
  font-weight: 700;
}

.logo-img {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827 !important; /* ¡Fuerza negro oscuro! */
  letter-spacing: -0.02em;
  font-family: 'Inter', sans-serif;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  text-decoration: none;
  color: #111827 !important; /* ¡Fuerza negro oscuro! */
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: color 0.2s ease, background 0.2s ease;
  display: inline-block;
  height: 100%;
  line-height: 64px;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: #2563eb !important; /* Azul eléctrico directo */
  font-weight: 600;
  background: #f9fafb !important; /* Fondo claro directo */
}

.nav-link.active {
  box-shadow: inset 0 -2px 0 #2563eb !important;
}

/* === Profile Button === */
.nav-profile {
  position: relative;
  display: flex;
  align-items: center;
}

.btn-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fff !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #111827 !important; /* ¡Fuerza negro oscuro! */
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.2s ease;
  min-height: 36px;
  font-family: 'Inter', sans-serif;
}

.btn-user:hover {
  background: #f9fafb !important;
  border-color: #d1d5db !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
}

.user-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #111827 !important; /* ¡Fuerza negro oscuro! */
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

/* === Dropdown Menu === */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 12px;
  padding: 0.5rem 0;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  list-style: none;
  opacity: 0;
  transform: translateY(-8px);
  pointer-events: none;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1002 !important; /* Más alto que cualquier cosa */
}

.navbar .dropdown-menu {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

.dropdown-item {
  display: block;
  padding: 0.6rem 1rem;
  color: #111827 !important; /* ¡Fuerza negro oscuro! */
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  background: none !important;
  border: none !important;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

.dropdown-item:hover,
.logout-btn:hover {
  background: #f9fafb !important;
  color: #111827 !important;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #dc2626 !important;
}

/* === Mobile Toggle === */
.mobile-toggle {
  display: none;
  background: none;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  color: #111827 !important; /* ¡Fuerza negro oscuro! */
  border-radius: 8px;
  transition: background 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.mobile-toggle:hover {
  background: #f9fafb !important;
}

/* === Mobile Menu === */
.mobile-menu {
  background: #fff !important;
  border-top: 1px solid #e5e7eb !important;
  padding: 1rem;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-10px);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001 !important;
  overflow: hidden;
}

.navbar .mobile-menu {
  opacity: 1;
  transform: translateY(0);
}

.mobile-nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-nav-link {
  text-decoration: none;
  color: #111827 !important; /* ¡Fuerza negro oscuro! */
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background 0.2s ease, color 0.2s ease;
  display: block;
  font-family: 'Inter', sans-serif;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: #2563eb !important;
  font-weight: 600;
  background: #f9fafb !important;
}

/* === MEDIA QUERIES === */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
    height: 56px;
    gap: 1rem;
  }

  .logo-text {
    font-size: 1.25rem;
  }

  .nav-links {
    display: none;
  }

  .mobile-toggle {
    display: block;
  }

  .btn-user {
    padding: 0.5rem 0.75rem;
    min-height: 32px;
  }

  .user-name {
    max-width: 80px;
    font-size: 0.85rem;
  }

  .dropdown-menu {
    min-width: 160px;
    right: -1rem;
  }

  .mobile-nav-link {
    font-size: 1rem;
  }
}
</style>
