<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Logo / Branding -->
      <div class="branding">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8V16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 12H16" stroke="#145A32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h1 class="title">VET</h1>
        <p class="subtitle">Cuida a tu mascota, con confianza.</p>
      </div>

      <form @submit.prevent="registerUser" class="register-form">
        <!-- Nombre Completo -->
        <div class="form-group">
          <label for="nombre" class="form-label">Nombre completo</label>
          <input
            id="nombre"
            v-model="formData.nombre_completo"
            type="text"
            placeholder="Ej: María González"
            :class="{ 'form-input-error': errors.nombre_completo }"
            class="form-input"
            autocomplete="name"
            required
            @blur="validateField('nombre_completo')"
          />
          <p v-if="errors.nombre_completo" class="form-error">{{ errors.nombre_completo }}</p>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email" class="form-label">Correo electrónico</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="tuemail@ejemplo.com"
            :class="{ 'form-input-error': errors.email }"
            class="form-input"
            autocomplete="email"
            required
            @blur="validateField('email')"
          />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="password-container">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres, con número y letra"
              :class="{ 'form-input-error': errors.password }"
              class="form-input"
              autocomplete="new-password"
              required
              @blur="validateField('password')"
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
          <div class="password-hints">
            <span :class="{ 'hint-valid': formData.password.length >= 8 }">✔️ 8+ caracteres</span>
            <span :class="{ 'hint-valid': /[A-Za-z]/.test(formData.password) }">✔️ Letra</span>
            <span :class="{ 'hint-valid': /\d/.test(formData.password) }">✔️ Número</span>
          </div>
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
        </div>

        <!-- Teléfono (Opcional) -->
        <div class="form-group">
          <label for="telefono" class="form-label">Teléfono (opcional)</label>
          <input
            id="telefono"
            v-model="formData.telefono"
            type="tel"
            placeholder="+591 7XXXXXXX"
            :class="{ 'form-input-error': errors.telefono }"
            class="form-input"
            autocomplete="tel"
            @blur="validateField('telefono')"
          />
          <p v-if="errors.telefono" class="form-error">{{ errors.telefono }}</p>
        </div>

        <!-- Campos opcionales adicionales -->
        <div class="form-group">
          <label for="genero" class="form-label">Género (opcional)</label>
          <select
            id="genero"
            v-model="formData.genero"
            class="form-input"
          >
            <option value="">Seleccionar...</option>
            <option value="femenino">Femenino</option>
            <option value="masculino">Masculino</option>
            <option value="otro">Otro</option>
            <option value="prefiero-no-decir">Prefiero no decir</option>
          </select>
        </div>

        <!-- Botón de registro -->
        <button
          type="submit"
          :disabled="loading || hasErrors"
          class="submit-button"
        >
          <span v-if="!loading">Crear cuenta</span>
          <div v-else class="loading-spinner">
            <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
            </svg>
            Creando cuenta...
          </div>
        </button>

        <!-- Estado de éxito/error -->
        <div v-if="error" class="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.954 1s-.419 1-.954 1-.954-.462-.954-1 .419-1 .954-1zm.954 3c-.535 0-.954.462-.954 1v2c0 .538.419 1 .954 1s.954-.462.954-1V9c0-.538-.419-1-.954-1z"/>
          </svg>
          {{ error }}
        </div>

        <div v-if="success" class="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
          {{ success }}
        </div>

        <!-- Enlace a login -->
        <p class="login-link">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="link">Iniciar sesión</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'vue-router';

// Router
const router = useRouter();

// Estado del formulario
const formData = reactive({
  nombre_completo: '',
  email: '',
  password: '',
  telefono: '',
  genero: '',
});

// Estados de la UI
const error = ref('');
const success = ref('');
const loading = ref(false);
const showPassword = ref(false);

// Validaciones de campo
const errors = reactive({
  nombre_completo: '',
  email: '',
  password: '',
  telefono: '',
});

// Regex para validaciones
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+591\s?)?[67]\d{7}$/; // Formato específico para Bolivia

const validateField = (field) => {
  switch (field) {
    case 'nombre_completo':
      if (!formData.nombre_completo.trim()) {
        errors.nombre_completo = 'Ingresa tu nombre completo';
      } else if (formData.nombre_completo.trim().length < 3) {
        errors.nombre_completo = 'El nombre debe tener al menos 3 caracteres';
      } else if (formData.nombre_completo.trim().length > 100) {
        errors.nombre_completo = 'El nombre es demasiado largo';
      } else {
        errors.nombre_completo = '';
      }
      break;

    case 'email':
      if (!formData.email.trim()) {
        errors.email = 'El correo es obligatorio';
      } else if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Formato de correo inválido';
      } else {
        errors.email = '';
      }
      break;

    case 'password':
      if (!formData.password) {
        errors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 8) {
        errors.password = 'Mínimo 8 caracteres';
      } else if (!/[A-Za-z]/.test(formData.password)) {
        errors.password = 'Debe contener al menos una letra';
      } else if (!/\d/.test(formData.password)) {
        errors.password = 'Debe contener al menos un número';
      } else {
        errors.password = '';
      }
      break;

    case 'telefono':
      if (formData.telefono && !phoneRegex.test(formData.telefono)) {
        errors.telefono = 'Formato: +591 7XXXXXXX o 7XXXXXXX';
      } else {
        errors.telefono = '';
      }
      break;
  }
};

const hasErrors = computed(() => {
  return Object.values(errors).some((e) => e !== '') ||
         !formData.nombre_completo ||
         !formData.email ||
         !formData.password;
});

// Función principal de registro
const registerUser = async () => {
  // Validar todos los campos
  validateField('nombre_completo');
  validateField('email');
  validateField('password');
  validateField('telefono');

  if (hasErrors.value) {
    error.value = 'Por favor corrige los errores en el formulario';
    return;
  }

  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    // 1️⃣ Preparar los datos limpios
    const userData = {
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
    };

    const profileData = {
      nombre_completo: formData.nombre_completo.trim(),
      telefono: formData.telefono.trim() || null,
      genero: formData.genero || null,
    };

    // 2️⃣ Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          nombre_completo: profileData.nombre_completo,
          rol: 'cliente'
        }
      }
    });

    if (authError) {
      console.error('Error de autenticación:', authError);
      throw authError;
    }

    if (!authData.user?.id) {
      throw new Error('No se pudo crear el usuario');
    }

    // 3️⃣ Insertar en la tabla usuarios
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert([{
        id: authData.user.id,
        nombre_completo: profileData.nombre_completo,
        email: userData.email,
        telefono: profileData.telefono,
        genero: profileData.genero,
        rol: 'cliente',
        is_activo: true,
        fecha_registro: new Date().toISOString(),
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      }]);

    if (dbError) {
      console.error('Error de base de datos:', dbError);

      // Si falla la inserción en la DB, intentar limpiar el usuario de Auth
      await supabase.auth.admin?.deleteUser(authData.user.id).catch(console.error);

      if (dbError.code === '23505') {
        throw new Error('Este correo ya está registrado');
      }
      throw dbError;
    }

    // 4️⃣ Éxito
    success.value = 'Cuenta creada exitosamente. Revisa tu email para confirmar tu cuenta.';

    // Limpiar formulario
    Object.keys(formData).forEach(key => {
      formData[key] = '';
    });

    // Redirigir después de un momento
    setTimeout(() => {
      router.push('/login');
    }, 3000);

  } catch (err) {
    console.error('Error en registro:', err);

    // Mensajes de error específicos
    if (err.message?.includes('User already registered')) {
      error.value = 'Este correo ya está registrado. ¿Deseas iniciar sesión?';
    } else if (err.message?.includes('Invalid email')) {
      error.value = 'El formato del correo electrónico no es válido';
    } else if (err.message?.includes('Password')) {
      error.value = 'La contraseña debe tener al menos 8 caracteres';
    } else if (err.message?.includes('correo ya está registrado')) {
      error.value = 'Este correo ya está en uso. Intenta con otro o inicia sesión.';
    } else if (err.code === '23505') {
      error.value = 'Ya existe una cuenta con este correo electrónico';
    } else {
      error.value = 'Error al crear la cuenta. Por favor intenta de nuevo.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ===== BASE STYLES ===== */
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.register-card {
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
  text-align: center;
}

/* ===== BRAND ===== */
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

/* ===== FORM ===== */
.register-form {
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
  margin-left: 0.1rem;
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

.password-hints {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.hint-valid {
  color: #10b981;
  font-weight: 500;
}

/* ===== BUTTON ===== */
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #0f4a26;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(20, 90, 50, 0.15);
}

.submit-button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: flex;
  align-items: center;
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
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  margin: 1rem 0;
  font-weight: 500;
  text-align: left;
}

.alert-error {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bef264;
}

/* ===== LINK ===== */
.login-link {
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

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .register-card {
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

  .password-hints {
    gap: 0.5rem;
  }
}
</style>
