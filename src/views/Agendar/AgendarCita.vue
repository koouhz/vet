<template>
  <div class="agendar-cita">
    <h1>Agendar una Cita</h1>
    <p>Completa los datos para tu mascota y el servicio que deseas.</p>

    <form @submit.prevent="agendar">
      <label>Nombre de la mascota:</label>
      <input type="text" v-model="mascotaNombre" required />

      <label>Servicio:</label>
      <select v-model="servicio" required>
        <option disabled value="">Selecciona un servicio</option>
        <option>Vacunación</option>
        <option>Consultas Generales</option>
        <option>Peluquería y Higiene</option>
        <option>Emergencias 24/7</option>
        <option>Cirugías</option>
        <option>Nutrición y Dietética</option>
      </select>

      <label>Fecha de la cita:</label>
      <input type="date" v-model="fecha" required />

      <label>Hora:</label>
      <input type="time" v-model="hora" required />

      <button type="submit">Agendar cita</button>
    </form>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'AgendarCitaView',
  data() {
    return {
      mascotaNombre: '',
      servicio: '',
      fecha: '',
      hora: ''
    }
  },
  async created() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      this.$router.push({ name: 'Login' }) // Redirigir si no está logeado
    }
  },
  methods: {
    async agendar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return this.$router.push({ name: 'Login' })

      // Guardar cita en Supabase
      const { error } = await supabase.from('citasmascotas').insert([{
        id_usuario: user.id,
        nombre_mascota: this.mascotaNombre,
        servicio: this.servicio,
        fecha: this.fecha,
        hora: this.hora
      }])

      if (error) return alert('Error al agendar la cita: ' + error.message)
      alert('Cita agendada correctamente!')
      this.$router.push({ name: 'Home' })
    }
  }
}
</script>

<style scoped>
.agendar-cita {
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

form label {
  display: block;
  margin-top: 1rem;
  font-weight: 600;
}

form input, form select {
  width: 100%;
  padding: 0.7rem;
  margin-top: 0.3rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

form button {
  margin-top: 1.5rem;
  padding: 1rem 2rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
}

form button:hover {
  background: #2980b9;
}
</style>
