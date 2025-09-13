<template>
  <div class="register-container">
    <h2>Registrarse</h2>
    <form @submit.prevent="registerUser">
      <label>Email</label>
      <input type="email" v-model="email" required />

      <label>Contraseña</label>
      <input type="password" v-model="password" required />

      <label>Nombre completo</label>
      <input type="text" v-model="nombre" required />

      <button type="submit" :disabled="loading">
        {{ loading ? 'Registrando...' : 'Registrarse' }}
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">{{ success }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

import { useRouter } from 'vue-router'

// Variables reactivas
const email = ref('')
const password = ref('')
const nombre = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

// Router para redirección
const router = useRouter()

// Función de registro
const registerUser = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  // 1️⃣ Crear usuario en Auth de Supabase
  const { data, error: supaError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })

  if (supaError) {
    error.value = supaError.message
    loading.value = false
    return
  }

  // 2️⃣ Crear registro en tabla usuarios
  const { error: dbError } = await supabase
    .from('usuarios')
    .insert([
      {
        id: data.user.id,
        nombre_completo: nombre.value
      }
    ])

  if (dbError) {
    error.value = dbError.message
    loading.value = false
    return
  }

  success.value = 'Usuario registrado correctamente. ¡Por favor inicia sesión!'
  loading.value = false

  // Redirigir al login
  setTimeout(() => {
    router.push('/login')
  }, 1500)
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 6rem auto;
  padding: 2rem;
  background: #1e1e1e;
  color: #e0e0e0;
  border-radius: 8px;
}

input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #444;
  background: #2a2a2a;
  color: #fff;
}

button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #145a32;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #f87171;
  margin-top: 1rem;
}

.success {
  color: #4ade80;
  margin-top: 1rem;
}
</style>
