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
        <li>
          <router-link to="/" class="nav-link" exact-active-class="active">
            Inicio
          </router-link>

        </li>
        <li>
          <router-link to="/servicios" class="nav-link" exact-active-class="active" exact>
            Servicios
          </router-link>
        </li>
        <li>
          <router-link to="/equipo" class="nav-link" exact-active-class="active" exact>
            Equipo
          </router-link>
        </li>
        <li>
          <router-link to="/contacto" class="nav-link" exact-active-class="active" exact>
            Contacto
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

        <ul v-if="dropdownOpen" class="dropdown-menu" role="menu">
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
    <div v-if="isMobile && mobileMenuOpen" class="mobile-menu" role="dialog" aria-modal="true">
      <ul class="mobile-nav-links">
        <li>
          <router-link to="/" @click="closeMobileMenu" exact-active-class="active" exact>
            Inicio
          </router-link>
        </li>
        <li>
          <router-link to="/servicios" @click="closeMobileMenu" exact-active-class="active" exact>
            Servicios
          </router-link>
        </li>
        <li>
          <router-link to="/equipo" @click="closeMobileMenu" exact-active-class="active" exact>
            Equipo
          </router-link>
        </li>
        <li>
          <router-link to="/contacto" @click="closeMobileMenu" exact-active-class="active" exact>
            Contacto
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

// --- Dropdown Logic ---
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) mobileMenuOpen.value = false
}

const closeDropdown = () => { dropdownOpen.value = false }
const toggleMobileMenu = () => { mobileMenuOpen.value = !mobileMenuOpen.value; if(mobileMenuOpen.value) dropdownOpen.value=false }
const closeMobileMenu = () => { mobileMenuOpen.value = false }

let mouseLeaveTimeout
const handleMouseEnter = () => { if(mouseLeaveTimeout) clearTimeout(mouseLeaveTimeout) }
const handleMouseLeave = () => { mouseLeaveTimeout = setTimeout(()=>dropdownOpen.value=false,200) }

onMounted(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) dropdownOpen.value=false
  }
  document.addEventListener('click', handleClickOutside)
  onUnmounted(()=>document.removeEventListener('click', handleClickOutside))
})

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) { mobileMenuOpen.value=false; dropdownOpen.value=false }
}

onMounted(async()=>{
  checkScreenSize()
  window.addEventListener('resize',checkScreenSize)
  const { data:{user} } = await supabase.auth.getUser()
  if(user){
    userLogged.value = true
    const { data, error } = await supabase.from('usuarios').select('nombre_completo').eq('id',user.id).single()
    if(!error && data) userName.value = data.nombre_completo.split(' ')[0]||'Usuario'
  }
})

onUnmounted(()=>{
  window.removeEventListener('resize',checkScreenSize)
  if(mouseLeaveTimeout) clearTimeout(mouseLeaveTimeout)
})

const logout = async()=>{
  await supabase.auth.signOut()
  userLogged.value=false
  userName.value=''
  closeDropdown()
  closeMobileMenu()
}
</script>


<style scoped>
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
/* Contenedor del dropdown */
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

/* Estilo base para todos los items del dropdown */
/* Contenedor del dropdown */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.5rem 0;
  min-width: 180px;
  max-width: 220px; /* para móviles no se haga gigante */
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
  list-style: none;
  z-index: 1001;
}

/* Estilo base para todos los items del dropdown */
.dropdown-item,
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 0.6rem 1rem; /* padding más adaptable */
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.25s ease-in-out;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  text-decoration: none;
  background: #ffffff;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  box-sizing: border-box; /* asegura que el padding no haga overflow */
}

/* Hover de los items normales */
.dropdown-item:hover {
  background: var(--color-accent);
  color: #ffffff;
  box-shadow: 0 6px 12px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

/* Hover del botón logout */
.logout-btn {
  color: #ef4444;
}

.logout-btn:hover {
  background: #ef4444;
  color: #ffffff;
  box-shadow: 0 6px 12px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

/* RESPONSIVIDAD */
@media (max-width: 768px) {
  .dropdown-menu {
    right: 0.5rem;
    min-width: 140px;
    max-width: 90vw;
  }

  .dropdown-item,
  .logout-btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.9rem;
  }
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

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .mobile-toggle {
    display: block;
  }
}

</style>
