<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-logo">
        <img src="@/assets/logo.png" alt="Logo Veterinaria" />
        <h1>Veterinaria Vet</h1>
      </div>

      <ul class="nav-links">
        <li><router-link to="/">Inicio</router-link></li>
        <li><router-link to="/servicios">Servicios</router-link></li>
        <li><router-link to="/equipo">Nuestro Equipo</router-link></li>
        <li><router-link to="/contacto">Contacto</router-link></li>
      </ul>

      <!-- Perfil dinámico -->
      <div
        class="nav-profile"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <button class="btn-user" @click="toggleDropdown">
          <template v-if="userLogged">
            <img
              :src="userAvatar"
              alt="Avatar"
              class="user-avatar"
              @error="handleAvatarError"
            />
            <span class="user-name">{{ userName }}</span>
          </template>
          <template v-else>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </template>
        </button>

        <ul v-if="dropdownOpen" class="dropdown-menu">
          <template v-if="userLogged">
            <li><router-link to="/perfil" @click="closeDropdown">Perfil</router-link></li>
            <li><button @click="logout" class="logout-btn">Cerrar sesión</button></li>
          </template>
          <template v-else>
            <li><router-link to="/login" @click="closeDropdown">Iniciar sesión</router-link></li>
            <li><router-link to="/register" @click="closeDropdown">Registrarse</router-link></li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// Dropdown
const dropdownOpen = ref(false)
const toggleDropdown = () => (dropdownOpen.value = !dropdownOpen.value)
const closeDropdown = () => (dropdownOpen.value = false)

// Mouse
let mouseLeaveTimeout
const handleMouseEnter = () => { if (mouseLeaveTimeout) clearTimeout(mouseLeaveTimeout) }
const handleMouseLeave = () => {
  mouseLeaveTimeout = setTimeout(() => { dropdownOpen.value = false }, 150)
}

// Usuario
const userLogged = ref(false)
const userName = ref('')
const userAvatar = ref('')

// Avatar genérico
const handleAvatarError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzk5YTNhZiI+PHBhdGggZD0iTTEyIDEyYzIuNyAwIDQuOC0yLjEgNC44LTQuOFMxNC43IDIuNCAxMiAyLjQgNy4yIDQuNSA3LjIgNy4yIDkuMyAxMiAxMiAxMnptMCAyLjRjLTMuMiAwLTkuNiAxLjYtOS42IDQuOHYyLjRoMTkuMnYtMi40YzAtMy4yLTYuNC00LjgtOS42LTQuOHoiLz48L3N2Zz4='
}

// Logout
const logout = async () => {
  await supabase.auth.signOut()
  userLogged.value = false
  userName.value = ''
  userAvatar.value = ''
  closeDropdown()
}

// Revisar usuario al montar
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    userLogged.value = true
    const { data, error } = await supabase
      .from('usuarios')
      .select('nombre_completo, avatar_url')
      .eq('id', user.id)
      .single()
    if (!error && data) {
      userName.value = data.nombre_completo
      userAvatar.value = data.avatar_url || ''
    }
  }
})
</script>

<style scoped>
/* Tu CSS existente (navbar, dropdown, responsive) */
.navbar { background-color: #fff; border-bottom: 1px solid #e5e7eb; position: fixed; width: 100%; top: 0; z-index: 1000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.nav-container { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; padding: 0 2rem; height: 64px; }
.nav-logo { display: flex; align-items: center; gap: 0.75rem; }
.nav-logo img { height: 32px; width: 32px; border-radius: 6px; }
.nav-logo h1 { color: #111827; margin: 0; font-size: 1.25rem; font-weight: 600; }
.nav-links { display: flex; list-style: none; margin: 0; padding: 0; gap: 2rem; }
.nav-links a { text-decoration: none; color: #6b7280; font-weight: 500; font-size: 0.875rem; transition: color 0.2s; padding: 0.5rem 0; }
.nav-links a:hover { color: #111827; }
.nav-links a.router-link-active { color: #2563eb; }
.nav-profile { position: relative; }
.btn-user { display: flex; align-items: center; gap: 0.5rem; background-color: #fff; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; border-radius: 50px; cursor: pointer; color: #374151; transition: all 0.2s; font-weight: 500; font-size: 0.875rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.btn-user:hover { background-color: #f9fafb; border-color: #d1d5db; transform: translateY(-1px); box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1); }
.user-avatar { width: 24px; height: 24px; border-radius: 50%; }
.dropdown-menu { position: absolute; right: 0; top: calc(100% + 4px); background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; list-style: none; padding: 0.25rem; min-width: 160px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.dropdown-menu li { margin: 0; }
.dropdown-menu a, .logout-btn { display: block; padding: 0.5rem 0.75rem; color: #374151; text-decoration: none; border-radius: 4px; transition: background-color 0.2s; background: none; border: none; width: 100%; text-align: left; cursor: pointer; font-size: 0.875rem; }
.dropdown-menu a:hover, .logout-btn:hover { background-color: #f9fafb; }
@media (max-width: 768px) { .nav-container { padding: 0 1rem; height: 56px; } .nav-logo h1 { display: none; } .nav-links { display: none; } .dropdown-menu { min-width: 140px; } }
@media (max-width: 480px) { .user-name { display: none; } .btn-user { padding: 0.5rem; } }
</style>
