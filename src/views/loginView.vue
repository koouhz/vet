<template>
  <div class="login-container">
    <div class="login-card">
      <div class="branding">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8V16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 12H16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h1 class="title">VET</h1>
        <p class="subtitle">Bienvenido de nuevo</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Correo electrónico</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="tuemail@ejemplo.com"
            required
            class="form-input"
            autocomplete="email"
            :class="{ 'form-input-error': errors.email }"
            @blur="validateField('email')"
            @input="clearError('email')"
          />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="password-container">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              class="form-input"
              autocomplete="current-password"
              :class="{ 'form-input-error': errors.password }"
              @blur="validateField('password')"
              @input="clearError('password')"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              aria-label="Mostrar/ocultar contraseña"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  v-if="!showPassword"
                  d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"
                />
                <path
                  v-if="showPassword"
                  d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"
                />
                <path
                  v-if="showPassword"
                  d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"
                />
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input
              type="checkbox"
              v-model="rememberMe"
              class="checkbox"
            />
            <span class="checkmark"></span>
            Recordarme
          </label>
          <a href="#" @click.prevent="openForgotPasswordModal" class="link forgot-link">¿Olvidaste tu contraseña?</a>
        </div>

        <button
          type="submit"
          :disabled="loading || hasErrors"
          class="submit-button"
        >
          <div v-if="!loading" class="button-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.854.146a.5.5 0 0 1 .11.54L13.026 8.2a.5.5 0 0 1-.708.2l-3-1.5a.5.5 0 0 1-.168-.697L10.5 4.5a.5.5 0 0 1 .697-.168l1.5 3a.5.5 0 0 1-.168.697l-7.5 3.75a.5.5 0 0 1-.448 0l-3-1.5a.5.5 0 0 1-.224-.671L1.5 7.5a.5.5 0 0 1 .671-.224L5 8.5a.5.5 0 0 1 .276.724l-.5 1a.5.5 0 0 1-.894-.448L4.5 8.5a.5.5 0 0 1 .224-.671l7.5-3.75a.5.5 0 0 1 .54.11z"/>
            </svg>
            Iniciar sesión
          </div>
          <div v-else class="loading-spinner">
            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
            </svg>
            Iniciando sesión...
          </div>
        </button>
      </form>

      <div v-if="errorMessage" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.954 1s-.419 1-.954 1-.954-.462-.954-1 .419-1 .954-1zm.954 3c-.535 0-.954.462-.954 1v2c0 .538.419 1 .954 1s.954-.462.954-1V9c0-.538-.419-1-.954-1z"/>
        </svg>
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </svg>
        {{ successMessage }}
      </div>

      <p class="register-link">
        ¿No tienes cuenta?
        <router-link to="/register" class="link">Regístrate aquí</router-link>
      </p>
    </div>

    <Transition name="modal-fade">
      <div v-if="showForgotPasswordModal" class="modal-overlay" @click.self="showForgotPasswordModal = false">
        <div class="modal-content">
          <button class="modal-close" @click="showForgotPasswordModal = false">
            &times;
          </button>
          
          <h2 class="modal-title">Restablecer Contraseña</h2>
          <p class="modal-subtitle">Ingresa tu correo electrónico y te enviaremos un enlace seguro para establecer una nueva contraseña.</p>

          <form @submit.prevent="handleForgotPassword" class="modal-form">
            <div class="form-group">
              <label for="recovery-email" class="form-label">Correo electrónico</label>
              <input
                id="recovery-email"
                v-model="emailForRecovery"
                type="email"
                placeholder="tuemail@ejemplo.com"
                required
                class="form-input"
              />
              <p v-if="recoveryError" class="form-error">{{ recoveryError }}</p>
            </div>
            
            <button
              type="submit"
              :disabled="loadingRecovery"
              class="submit-button modal-button"
            >
              <div v-if="loadingRecovery" class="loading-spinner">
                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
                </svg>
                Enviando enlace...
              </div>
              <span v-else>
                Enviar Enlace de Restablecimiento
              </span>
            </button>
            <p v-if="recoverySuccess" class="alert alert-success recovery-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
              ¡Enlace enviado! Revisa tu email.
            </p>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'vue-router';

// Router
const router = useRouter();

// Estado del formulario de login
const formData = reactive({
  email: '',
  password: '',
});

// Estados de la UI de login
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);

// --- ESTADOS DEL MODAL DE RECUPERACIÓN (NUEVOS) ---
const showForgotPasswordModal = ref(false);
const emailForRecovery = ref('');
const loadingRecovery = ref(false);
const recoveryError = ref('');
const recoverySuccess = ref(false);
// --------------------------------------------------

// Validaciones de campo
const errors = reactive({
  email: '',
  password: '',
});

// Regex para validaciones
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- Funciones de Validación (CORREGIDAS) ---
const validateField = (field) => {
  switch (field) {
    case 'email':
      if (!formData.email.trim()) {
        errors.email = 'Ingresa tu correo electrónico';
      } else if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Formato de correo inválido';
      } else {
        errors.email = '';
      }
      break;
    case 'password':
      if (!formData.password) {
        errors.password = 'Ingresa tu contraseña';
      } else if (formData.password.length < 1) {
        errors.password = 'La contraseña no puede estar vacía';
      } else {
        errors.password = '';
      }
      break;
  }
};

const clearError = (field) => {
  errors[field] = '';
  if (errorMessage.value) {
    errorMessage.value = '';
  }
};

const hasErrors = computed(() => {
  return Object.values(errors).some((e) => e !== '') ||
           !formData.email.trim() ||
           !formData.password;
});
// ---------------------------------------------


// Función para actualizar el último acceso
const updateLastAccess = async (userId) => {
  try {
    await supabase
      .from('usuarios')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.warn('No se pudo actualizar el último acceso:', error);
  }
};

// --- FUNCIÓN PARA ABRIR EL MODAL (NUEVA) ---
const openForgotPasswordModal = () => {
  // Copia el email si ya está en el campo de login
  emailForRecovery.value = formData.email; 
  recoveryError.value = '';
  recoverySuccess.value = false;
  showForgotPasswordModal.value = true;
};

// --- FUNCIÓN PARA RESTABLECER CONTRASEÑA EN EL MODAL (NUEVA) ---
const handleForgotPassword = async () => {
  recoveryError.value = '';
  recoverySuccess.value = false;

  if (!emailRegex.test(emailForRecovery.value.trim())) {
    recoveryError.value = 'Ingresa un correo electrónico válido.';
    return;
  }

  loadingRecovery.value = true;

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(emailForRecovery.value.trim(), {
      // Redirige al cliente al componente resetPassword.vue
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;

    recoverySuccess.value = true;
    
    // Cierra el modal y muestra el éxito en el loginView principal
    setTimeout(() => {
      showForgotPasswordModal.value = false;
      successMessage.value = 'Revisa tu correo. Te hemos enviado un enlace para restablecer tu contraseña.';
    }, 3000);

  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    recoveryError.value = 'Error al enviar el correo. Verifica que el email esté registrado.';
  } finally {
    loadingRecovery.value = false;
  }
};

// Función principal de inicio de sesión (ORIGINAL)
const handleLogin = async () => {
  // Validar campos
  validateField('email');
  validateField('password');

  if (hasErrors.value) {
    errorMessage.value = 'Por favor completa todos los campos correctamente';
    return;
  }

  // Limpiar mensajes
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    // 1️⃣ Autenticación con Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
    });

    if (authError) {
      console.error('Error de autenticación:', authError);
      throw authError;
    }

    if (!authData.user?.id) {
      throw new Error('No se pudo obtener la información del usuario');
    }

    // 2️⃣ Obtener información del usuario de la base de datos
    const { data: userData, error: dbError } = await supabase
      .from('usuarios')
      .select('id, nombre_completo, email, rol, is_activo')
      .eq('id', authData.user.id)
      .single();

    if (dbError) {
      console.error('Error al obtener datos del usuario:', dbError);
      if (dbError.code === 'PGRST116') {
        throw new Error('Usuario no encontrado en el sistema');
      }
      throw dbError;
    }

    // 3️⃣ Verificar que el usuario esté activo
    if (!userData.is_activo) {
      // Cerrar sesión si el usuario está desactivado
      await supabase.auth.signOut();
      throw new Error('Tu cuenta ha sido desactivada. Contacta al soporte técnico.');
    }

    // 4️⃣ Actualizar último acceso
    await updateLastAccess(userData.id);

    // 5️⃣ Mostrar mensaje de bienvenida
    successMessage.value = `¡Bienvenido de vuelta, ${userData.nombre_completo}!`;

    // 6️⃣ Redirigir según el rol
    setTimeout(() => {
      switch (userData.rol) {
        case 'admin':
          router.push('/dashboard-admin');
          break;
        case 'veterinario':
          router.push('/dashboard-vet');
          break;
        case 'cliente':
        default:
          router.push('/');
          break;
      }
    }, 1500);

  } catch (err) {
    console.error('Error en login:', err);

    // Mensajes de error humanizados
    if (err.message?.includes('Invalid login credentials') ||
        err.message?.includes('incorrect') ||
        err.message?.includes('invalid')) {
      errorMessage.value = 'Correo o contraseña incorrectos. Verifica tus credenciales.';
    } else if (err.message?.includes('desactivada') ||
              err.message?.includes('desactivado')) {
      errorMessage.value = 'Tu cuenta ha sido desactivada. Contacta al soporte técnico.';
    } else if (err.message?.includes('not confirmed') ||
              err.message?.includes('Email not confirmed')) {
      errorMessage.value = 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.';
    } else if (err.message?.includes('Usuario no encontrado')) {
      errorMessage.value = 'No encontramos una cuenta asociada a este correo. ¿Ya te registraste?';
    } else if (err.message?.includes('Too many requests')) {
      errorMessage.value = 'Demasiados intentos fallidos. Espera unos minutos e intenta nuevamente.';
    } else {
      errorMessage.value = 'Error al iniciar sesión. Por favor intenta nuevamente.';
    }
  } finally {
    loading.value = false;
  }
};

// Al montar el componente, verificar si hay una sesión activa
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    // Si ya hay sesión, verificar el rol y redirigir
    try {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('rol, is_activo')
        .eq('id', session.user.id)
        .single();

      if (userData?.is_activo) {
        switch (userData.rol) {
          case 'admin':
            router.push('/dashboard-admin');
            break;
          case 'veterinario':
            router.push('/dashboard-vet');
            break;
          case 'cliente':
          default:
            router.push('/');
            break;
        }
      }
    } catch (error) {
      console.warn('Error verificando sesión existente:', error);
    }
  }
});
</script>

<style scoped>
/* Estilos omitidos por espacio, pero deben incluir los estilos del modal que te proporcioné anteriormente. */
/* ===== BASE STYLES (tus estilos originales) ===== */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
  text-align: center;
}

/* ===== BRANDING (tus estilos originales) ===== */
.branding {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.branding svg {
  color: #145a32;
}

.title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

/* ===== FORM (tus estilos originales) ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
  letter-spacing: -0.01em;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  outline: none;
  color: #1e293b;
  background-color: white;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #145a32;
  box-shadow: 0 0 0 2px rgba(20, 90, 50, 0.15);
}

.form-input-error {
  border-color: #ef4444 !important;
  background-color: #fef2f2;
}

.form-error {
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 0.25rem;
  font-weight: 500;
}

.password-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #145a32;
}

/* ===== FORM OPTIONS (tus estilos originales) ===== */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -0.5rem 0 0.5rem 0;
  font-size: 0.875rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #64748b;
  font-weight: 500;
}

.checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox:checked {
  background: #145a32;
  border-color: #145a32;
}

.forgot-link {
  color: #145a32;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  cursor: pointer;
}

.forgot-link:hover {
  color: #0f4a26;
  text-decoration: underline;
}

/* ===== BUTTON (tus estilos originales) ===== */
.submit-button {
  width: 100%;
  padding: 0.9rem;
  background: #145a32;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.02em;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #0f4a26;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(20, 90, 50, 0.15);
}

.submit-button:disabled {
  background: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
  transform: none;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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

/* ===== ALERTS (tus estilos originales) ===== */
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  margin: 1rem 0;
  font-weight: 500;
  text-align: left;
}

.alert-error {
  color: #dc2626;
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.alert-success {
  color: #166534;
  background: #dcfce7;
  border: 1px solid #bef264;
}

/* ===== LINKS (tus estilos originales) ===== */
.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.link {
  color: #145a32;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.link:hover {
  color: #0f4a26;
  text-decoration: underline;
}

/* ===== MODAL STYLES (NUEVOS) ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  width: 90%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: modal-slide-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #1e293b;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 2rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-button {
  margin-top: 0.5rem;
}

.recovery-success {
    margin-top: 1.5rem;
}

/* Animaciones del modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modal-slide-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ===== RESPONSIVE (tus estilos originales) ===== */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
  }

  .title {
    font-size: 1.6rem;
  }

  .form-input {
    padding: 0.75rem;
  }

  .submit-button {
    padding: 0.8rem;
  }

  .form-options {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}
</style>