<template>
  <div class="mis-citas-container">
    <h1>📅 Mis Citas</h1>

    <div v-if="citas.length === 0" class="no-citas">
      <p>No tienes citas registradas.</p>
    </div>

    <div v-else class="citas-list">
      <div v-for="cita in citas" :key="cita.id" class="cita-card">
        <h3>{{ cita.mascotas.nombre }} 🐾</h3>
        <p><strong>Fecha:</strong> {{ cita.fecha }} - {{ cita.hora }}</p>
        <p><strong>Estado:</strong> {{ cita.estado }}</p>
        <p><strong>Servicio:</strong> {{ cita.servicios.titulo }}</p>
        <p><strong>Cliente:</strong> {{ cita.usuarios.nombre_completo }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabaseClient"

const citas = ref([])

const fetchCitas = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from("citasmascotas")
    .select(`
      id,
      fecha,
      hora,
      estado,
      mascotas(nombre),
      servicios(titulo),
      usuarios(nombre_completo)
    `)
    .eq("veterinario_id", user.id)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true })

  if (!error) {
    citas.value = data
  } else {
    console.error("Error al cargar citas:", error)
  }
}

onMounted(fetchCitas)
</script>

<style scoped>
.mis-citas-container {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.citas-list {
  display: grid;
  gap: 1.5rem;
}

.cita-card {
  background: white;
  padding: 1.25rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.cita-card h3 {
  margin: 0 0 0.5rem;
}

.no-citas {
  background: #fff3cd;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  color: #856404;
}
</style>
