<template>
  <div class="form-cita">
    <h2>Agendar una Cita</h2>

    <!-- Servicio ya viene fijo -->
    <div v-if="servicio">
      <p><strong>Servicio:</strong> {{ servicio.nombre }}</p>
    </div>

    <label>Selecciona tu mascota:</label>
    <select v-model="mascotaId" required>
      <option disabled value="">-- Selecciona mascota --</option>
      <option v-for="m in mascotas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
    </select>
    <button type="button" @click="abrirNuevaMascota">+ Registrar nueva mascota</button>

    <!-- Veterinarios filtrados por el servicio -->
    <SelectVeterinario
      v-model:veterinario="veterinarioId"
      :servicio-id="servicioId"
    />

    <label>Fecha:</label>
    <input type="date" v-model="fecha" @change="cargarHorasDisponibles" required/>

    <label>Hora:</label>
    <select v-model="hora" required>
      <option disabled value="">-- Selecciona hora --</option>
      <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
    </select>

    <button @click="agendar">Agendar Cita</button>

    <ModalNuevaMascota
      v-if="mostrarModalMascota"
      @cerrar="cerrarModalMascota"
      @nueva="agregarMascota"
    />
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'
import ModalNuevaMascota from './ModalNuevaMascota.vue'
import SelectVeterinario from './SelectVeterinario.vue'

export default {
  props: ['servicioId'],
  components: { ModalNuevaMascota, SelectVeterinario },
  data() {
    return {
      mascotas: [],
      mascotaId: '',
      veterinarioId: '',
      servicio: null, // guardamos objeto servicio, no solo id
      fecha: '',
      hora: '',
      horasDisponibles: [],
      mostrarModalMascota: false
    }
  },
  async created() {
    await this.cargarMascotas()
    if (this.servicioId) {
      await this.cargarServicio(this.servicioId)
    }
  },
  methods: {
    async cargarMascotas() {
      const { data } = await supabase
        .from('mascotas')
        .select('*')
        .eq('usuario_id', (await supabase.auth.getUser()).data.user.id)
      this.mascotas = data || []
    },
    async cargarServicio(id) {
      // buscamos el servicio en la BD
      const { data } = await supabase
        .from('servicios')
        .select('*')
        .eq('id', id)
        .single()
      this.servicio = data
    },
    abrirNuevaMascota() { this.mostrarModalMascota = true },
    cerrarModalMascota() { this.mostrarModalMascota = false },
    agregarMascota(mascota) {
      this.mascotas.push(mascota)
      this.mascotaId = mascota.id
    },

    async cargarHorasDisponibles() {
      if (!this.fecha || !this.veterinarioId) return
      const diasSemana = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"]
      const dia = diasSemana[new Date(this.fecha).getDay()]

      const { data: vet } = await supabase
        .from('veterinarios')
        .select('horario_disponible')
        .eq('id', this.veterinarioId)
        .single()

      let horarioVet = vet?.horario_disponible?.[dia] || []

      const { data: citas } = await supabase
        .from('citasmascotas')
        .select('hora')
        .eq('veterinario_id', this.veterinarioId)
        .eq('fecha', this.fecha)

      const horasOcupadas = (citas || []).map(c => c.hora)
      this.horasDisponibles = horarioVet.filter(h => !horasOcupadas.includes(h))
    },

    async agendar() {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return alert('Debes iniciar sesión')

      const { error } = await supabase.from('citasmascotas').insert([{
        usuario_id: user.user.id,
        mascota_id: this.mascotaId,
        veterinario_id: this.veterinarioId,
        servicio_id: this.servicioId,
        fecha: this.fecha,
        hora: this.hora
      }])
      if (error) return alert('Error: ' + error.message)
      alert('Cita agendada')
      this.$router.push({ name: 'Home' })
    }
  }
}
</script>
<style scoped>
.form-cita {
  max-width: 550px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.form-cita h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 700;
}

.form-cita p {
  text-align: center;
  font-size: 1rem;
  color: #7f8c8d;
  margin-top: -0.5rem;
}

.form-cita label {
  font-weight: 600;
  color: #34495e;
  margin-bottom: 0.4rem;
  display: block;
}

.form-cita select,
.form-cita input[type="date"],
.form-cita input[type="time"] {
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid #dcdde1;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: #fafafa;
}

.form-cita select:focus,
.form-cita input[type="date"]:focus,
.form-cita input[type="time"]:focus {
  border-color: #3498db;
  box-shadow: 0 0 6px rgba(52, 152, 219, 0.3);
  outline: none;
  background: #fff;
}

.form-cita button {
  padding: 0.9rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-cita button:hover {
  transform: translateY(-2px);
}

.form-cita button[type="button"] {
  background-color: #2ecc71;
  color: #fff;
  margin-top: -0.5rem;
}

.form-cita button[type="button"]:hover {
  background-color: #27ae60;
}

.form-cita button:not([type="button"]) {
  background-color: #3498db;
  color: #fff;
}

.form-cita button:not([type="button"]):hover {
  background-color: #2980b9;
}

/* Animación de aparición */
.form-cita {
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>