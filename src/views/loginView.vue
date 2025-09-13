<template>
  <div class="login-container">
    <h2>Iniciar sesión</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Correo electrónico</label>
        <input
          type="email"
          id="email"
          v-model="email"
          required
          placeholder="tu@email.com"
        />
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          placeholder="********"
        />
      </div>

      <button type="submit" :disabled="loading">
        <span v-if="loading">Cargando...</span>
        <span v-else>Iniciar sesión</span>
      </button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <p class="register-link">
      ¿No tienes cuenta?
      <router-link to="/register">Regístrate aquí</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  loading.value = false

  if (error) {
    errorMessage.value = error.message
  } else {
    // Si el login es exitoso, redirigimos al home
    router.push('/')
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 120px auto 0;
  padding: 2rem;
  border-radius: 12px;
  background-color: #1e1e1e;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.25rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  background-color: #145a32;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  background-color: #2a7a4a;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0f4223;
}

.error {
  margin-top: 1rem;
  color: #f87171;
  text-align: center;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.register-link a {
  color: #3b82f6;
}
</style>
