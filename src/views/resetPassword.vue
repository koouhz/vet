<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <div class="branding">
        <h1 class="title">Actualizar Contraseña</h1>
        <p class="subtitle">Ingresa tu nueva contraseña para completar el proceso</p>
      </div>

      <Transition name="toast">
        <div
          v-if="toast.message"
          :class="['toast', toast.type]"
          class="toast"
        >
          {{ toast.message }}
        </div>
      </Transition>

      <form @submit.prevent="handlePasswordReset" class="reset-form">
        <div class="form-group">
          <label for="new-password">Nueva Contraseña</label>
          <input
            id="new-password"
            v-model="passwordForm.newPassword"
            type="password"
            required
            placeholder="••••••••"
          />
        </div>
        
        <div class="form-group">
          <label for="confirm-password">Confirmar Nueva Contraseña</label>
          <input
            id="confirm-password"
            v-model="passwordForm.confirmPassword"
            type="password"
            required
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="isUpdatingPassword"
        >
          <div v-if="isUpdatingPassword" class="loading-spinner">
            <i class="ph ph-circle-notch animate-spin"></i>
            <span>Actualizando...</span>
          </div>
          <span v-else>
            Actualizar Contraseña
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { supabase } from '@/lib/supabaseClient.js';
import { useRouter } from 'vue-router';

const router = useRouter();

// Estados
const isUpdatingPassword = ref(false);

// Formularios
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
});

// Toast
const toast = ref({
  message: '',
  type: 'success'
});

const showToast = (message, type = 'success') => {
  toast.value = { message, type };
  setTimeout(() => {
    toast.value.message = '';
  }, 3000);
};

const handlePasswordReset = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast('Las contraseñas no coinciden', 'error');
    return;
  }

  isUpdatingPassword.value = true;

  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword
    });

    if (error) {
      console.error('Error al actualizar la contraseña:', error);
      showToast('Error al actualizar la contraseña. Intenta de nuevo.', 'error');
      return;
    }

    showToast('Contraseña actualizada correctamente. Redirigiendo...', 'success');
    
    // Opcional: limpiar los campos del formulario
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    
    setTimeout(() => {
      // Redirige al usuario a la página de inicio o a donde desees
      router.push('/'); 
    }, 2000);

  } catch (err) {
    console.error('Error al actualizar la contraseña:', err.message);
    showToast('Ocurrió un error. Revisa la consola.', 'error');
  } finally {
    isUpdatingPassword.value = false;
  }
};
</script>

<style scoped>
.reset-password-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  font-family: var(--font-family);
}

.reset-password-card {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  box-shadow: var(--shadow-xl);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.branding {
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.subtitle {
  font-size: 1rem;
  color: var(--color-gray);
  margin: 0;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-gray);
}

input {
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  color: var(--color-text);
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0, 128, 150, 0.2);
}

.submit-button {
  width: 100%;
  padding: 0.9rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 128, 150, 0.2);
}

.submit-button:disabled {
  background: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* ===== ALERTS ===== */
.toast {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  color: white;
  font-weight: 400;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast.success {
  background: #10b981;
}

.toast.error {
  background: #ef4444;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>