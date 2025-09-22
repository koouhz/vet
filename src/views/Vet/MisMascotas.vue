<template>
  <div class="mis-mascotas-container">
    <h1>🐶 Mis Mascotas</h1>
    <div v-if="mascotas.length === 0" class="no-mascotas">
      <p>No tienes mascotas registradas.</p>
    </div>
    <div v-else class="mascotas-list">
      <div v-for="mascota in mascotas" :key="mascota.id" class="mascota-card">
        <h3>{{ mascota.nombre }} 🐾</h3>
        <p><strong>Especie:</strong> {{ mascota.especie }}</p>
        <p><strong>Raza:</strong> {{ mascota.raza }}</p>
        <p><strong>Edad:</strong> {{ mascota.edad }} años</p>
        <p><strong>Dueño:</strong> {{ mascota.usuario.nombre_completo }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "@/lib/supabaseClient"

const mascotas = ref([])

const fetchMascotas = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from("mascotas")
    .select("id, nombre, especie, raza, edad, usuario(nombre_completo)")
    .eq("id_veterinario", user.id)

  mascotas.value = data || []
}

onMounted(fetchMascotas)
</script>


<style scoped>
.mis-mascotas-container {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}
h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}
.mascotas-list {
  display: grid;
  gap: 1.5rem;
}
.mascota-card {
  background: white;
  padding: 1.25rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.mascota-card h3 {
  margin: 0 0 0.5rem;
}
.no-mascotas {
  background: #fff3cd;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  color: #856404;
}
</style>
