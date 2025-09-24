<template>
  <div class="mis-servicios-container">
    <h1>💉 Mis Servicios</h1>
    <div v-if="servicios.length === 0" class="no-servicios">
      <p>No tienes servicios activos.</p>
    </div>
    <div v-else class="servicios-list">
      <div v-for="servicio in servicios" :key="servicio.id" class="servicio-card">
        <h3>{{ servicio.titulo }}</h3>
        <p>{{ servicio.descripcion }}</p>
        <p><strong>Duración:</strong> {{ servicio.duracion_minutos }} min</p>
        <p><strong>Precio:</strong> ${{ servicio.precio }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabaseClient"

const servicios = ref([])

const fetchServicios = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from("servicios_veterinarios")
    .select("id, servicios(titulo, descripcion, duracion_minutos, precio)")
    .eq("veterinario_id", user.id)
    .eq("is_activo", true)

  servicios.value = data.map(s => s.servicios) || []
}

onMounted(fetchServicios)
</script>
<style scoped>
.mis-servicios-container {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}
h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}
.servicios-list {
  display: grid;
  gap: 1.5rem;
}
.servicio-card {
  background: white;
  padding: 1.25rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.servicio-card h3 {
  margin: 0 0 0.5rem;
}
.no-servicios {
  background: #fff3cd;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  color: #856404;
}
</style>
