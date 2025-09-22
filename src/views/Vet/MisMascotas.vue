<template>
  <div class="mis-mascotas-container">
    <div class="header-section">
      <h1>🐶 Mis Mascotas Atendidas</h1>
      <p class="subtitle">Mascotas bajo tu cuidado clínico</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando tus mascotas...</p>
    </div>

    <div v-else-if="error" class="error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="error-icon">
        <circle cx="12" cy="12" r="10" stroke="#dc2626" stroke-width="2"/>
        <path d="M15 9L9 15" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
        <path d="M9 9L15 15" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p>⚠️ {{ error }}</p>
      <button @click="fetchMascotas" class="btn-retry">Reintentar</button>
    </div>

    <div v-else-if="mascotas.length === 0" class="no-mascotas">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="empty-icon">
        <path d="M12 8C13.1046 8 14 7.10457 14 6C14 4.89543 13.1046 4 12 4C10.8954 4 10 4.89543 10 6C10 7.10457 10.8954 8 12 8Z" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 10C19.1046 10 20 9.10457 20 8C20 6.89543 19.1046 6 18 6C16.8954 6 16 6.89543 16 8C16 9.10457 16.8954 10 18 10Z" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 10C7.10457 10 8 9.10457 8 8C8 6.89543 7.10457 6 6 6C4.89543 6 4 6.89543 4 8C4 9.10457 4.89543 10 6 10Z" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 14C15.866 14 19 11.866 19 8H5C5 11.866 8.13401 14 12 14Z" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 20H21V18C21 15.2386 17.4183 13 12 13C6.58172 13 3 15.2386 3 18V20Z" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3>¡Aún no has atendido mascotas!</h3>
      <p>Las mascotas que atiendas aparecerán aquí automáticamente.</p>
    </div>

    <div v-else class="mascotas-list">
      <div v-for="mascota in mascotas" :key="mascota.id" class="mascota-card">
        <div class="mascota-header">
          <h3>{{ mascota.nombre }} 🐾</h3>
          <span class="especie-tag">{{ mascota.especie }}</span>
        </div>
        <div class="mascota-body">
          <div class="info-grid">
            <div v-if="mascota.raza" class="info-item">
              <span class="label">🏷️ Raza:</span>
              <span class="value">{{ mascota.raza }}</span>
            </div>
            <div class="info-item">
              <span class="label">🎂 Edad:</span>
              <span class="value">{{ calcularEdad(mascota.fecha_nacimiento) }} años</span>
            </div>
            <div class="info-item">
              <span class="label">👤 Dueño:</span>
              <span class="value">{{ mascota.usuario?.nombre_completo || 'No disponible' }}</span>
            </div>
            <div v-if="mascota.peso_kg" class="info-item">
              <span class="label">⚖️ Peso:</span>
              <span class="value">{{ mascota.peso_kg }} kg</span>
            </div>
            <div v-if="mascota.sexo" class="info-item">
              <span class="label">🚻 Sexo:</span>
              <span class="value">{{ formatSexo(mascota.sexo) }}</span>
            </div>
          </div>
        </div>
        <div class="mascota-footer">
          <button @click="verHistorial(mascota.id)" class="btn-ver">
            📋 Ver Historial Clínico
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'

const router = useRouter()
const mascotas = ref([])
const loading = ref(true)
const error = ref('')

// Obtener mascotas
const fetchMascotas = async () => {
  loading.value = true
  error.value = ''

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      throw new Error('Usuario no autenticado')
    }

    const user = authData.user

    // Obtener ID del veterinario
    const { data: vetData, error: vetError } = await supabase
      .from('veterinarios')
      .select('id')
      .eq('usuario_id', user.id)
      .single()

    if (vetError) {
      throw new Error('No se encontró tu perfil de veterinario')
    }

    // Obtener IDs de mascotas atendidas
    const { data: citasData, error: citasError } = await supabase
      .from('citasmascotas')
      .select('mascota_id')
      .eq('veterinario_id', vetData.id)
      .not('mascota_id', 'is', null)

    if (citasError) {
      throw new Error('Error al cargar citas')
    }

    if (!citasData || citasData.length === 0) {
      mascotas.value = []
      loading.value = false
      return
    }

    // IDs únicos
    const mascotaIds = [...new Set(citasData.map(c => c.mascota_id))]

    // Obtener detalles
    const { data: mascotasData, error: mascotasError } = await supabase
      .from('mascotas')
      .select(`
        id,
        nombre,
        especie,
        raza,
        fecha_nacimiento,
        peso_kg,
        sexo,
        usuario_id,
        usuarios (nombre_completo)
      `)
      .in('id', mascotaIds)
      .order('nombre', { ascending: true })

    if (mascotasError) {
      throw new Error('Error al cargar mascotas')
    }

    mascotas.value = mascotasData || []
  } catch (err) {
    error.value = err.message || 'Error desconocido'
    console.error('[MisMascotas] Error:', err)
  } finally {
    loading.value = false
  }
}

// Calcular edad
const calcularEdad = (fechaNac) => {
  if (!fechaNac) return '?'
  const hoy = new Date()
  const nacimiento = new Date(fechaNac)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }
  return edad
}

// Formatear sexo
const formatSexo = (sexo) => {
  if (!sexo) return 'No especificado'
  const labels = {
    macho: 'Macho',
    hembra: 'Hembra',
    castrado: 'Castrado',
    esterilizado: 'Esterilizado'
  }
  return labels[sexo] || sexo
}

// Navegar a historial
const verHistorial = (mascotaId) => {
  router.push(`/dashboard-vet/mascotas/${mascotaId}`)
}

onMounted(() => {
  fetchMascotas()
})
</script>

<style scoped>
.mis-mascotas-container {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
}

@media (max-width: 1024px) {
  .mis-mascotas-container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .mis-mascotas-container {
    padding: 1.5rem 1rem;
  }
}

.header-section {
  margin-bottom: 2.5rem;
  text-align: center;
}

.header-section h1 {
  font-size: 2rem;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  line-height: 1.2;
}

.subtitle {
  color: #64748b;
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f4f6;
  border-top: 5px solid #145a32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 2rem auto;
  max-width: 500px;
}

.error-icon {
  margin-bottom: 1.5rem;
}

.error p {
  font-size: 1.2rem;
  color: #dc2626;
  margin: 0.5rem 0 1.5rem;
  font-weight: 600;
}

.btn-retry {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.btn-retry:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
}

.no-mascotas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 2rem auto;
  max-width: 600px;
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: #94a3b8;
}

.no-mascotas h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0 0 1rem;
  font-weight: 600;
}

.no-mascotas p {
  color: #64748b;
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.6;
}

.mascotas-list {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  margin-bottom: 2rem;
}

.mascota-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-top: 4px solid #145a32;
  transition: all 0.3s ease;
}

.mascota-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.mascota-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.mascota-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.3;
}

.especie-tag {
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #dbeafe;
  color: #1d4ed8;
  text-transform: capitalize;
  border: 1px solid #bfdbfe;
}

.info-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.label {
  font-weight: 600;
  color: #475569;
  min-width: 80px;
  font-size: 0.95rem;
}

.value {
  color: #1e293b;
  font-size: 0.95rem;
  flex: 1;
}

.mascota-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.btn-ver {
  background: #145a32;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.btn-ver:hover {
  background: #0f4c28;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .mascotas-list {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .mascota-card {
    padding: 1.5rem;
  }

  .info-grid {
    gap: 0.5rem;
  }

  .header-section h1 {
    font-size: 1.75rem;
  }

  .mascota-header h3 {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .mis-mascotas-container {
    padding: 1rem;
  }

  .btn-ver {
    width: 100%;
    justify-content: center;
    font-size: 1rem;
    padding: 0.75rem;
  }

  .mascota-footer {
    justify-content: center;
  }
}
</style>
