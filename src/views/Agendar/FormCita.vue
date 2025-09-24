<template>
  <div class="form-cita">
    <h2>Agendar una Cita</h2>

    <!-- Selección de mascota -->
    <label>Selecciona tu mascota:</label>
    <select v-model="mascotaId" required>
      <option disabled value="">-- Selecciona mascota --</option>
      <option v-for="m in mascotas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
    </select>
    <button type="button" @click="abrirNuevaMascota">+ Registrar nueva mascota</button>

    <!-- Selección de veterinario -->
    <SelectVeterinario 
      v-model="veterinarioId" 
      :servicio-id="servicioId"
    />

    <!-- Fecha -->
    <label>Fecha:</label>
    <input type="date" v-model="fecha" @change="cargarHorasDisponibles" required />

    <!-- Hora -->
    <label>Hora:</label>
    <select v-model="hora" required>
      <option disabled value="">-- Selecciona hora --</option>
      <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
    </select>

    <!-- Botón agendar -->
    <button @click="agendar">Agendar Cita</button>

    <!-- Modal para nueva mascota -->
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
  props: {
    servicioId: { type: [String, Number], required: true }
  },
  components: { ModalNuevaMascota, SelectVeterinario },
  data() {
    return {
      mascotas: [],
      mascotaId: '',
      veterinarioId: '',
      fecha: '',
      hora: '',
      horasDisponibles: [],
      mostrarModalMascota: false
    }
  },
  async created() {
    await this.cargarMascotas()
  },
  methods: {
    async cargarMascotas() {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return
      const { data } = await supabase
        .from('mascotas')
        .select('*')
        .eq('usuario_id', user.user.id)
      this.mascotas = data || []
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

      const horasOcupadas = citas.map(c => c.hora)
      this.horasDisponibles = horarioVet.filter(h => !horasOcupadas.includes(h))
    },

    async agendar() {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return alert('Debes iniciar sesión')

      if (!this.mascotaId || !this.veterinarioId || !this.servicioId || !this.fecha || !this.hora) {
        return alert('Completa todos los campos')
      }

      const { error } = await supabase.from('citasmascotas').insert([{
        usuario_id: user.user.id,
        mascota_id: this.mascotaId,
        veterinario_id: this.veterinarioId,
        servicio_id: this.servicioId,
        fecha: this.fecha,
        hora: this.hora
      }])

      if (error) return alert('Error: ' + error.message)

      alert('✅ Cita agendada correctamente')
      this.$router.push({ name: 'Home' })
    }
  }
}
</script>

<style scoped>
.form-cita {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-cita h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.form-cita label {
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #34495e;
}

.form-cita select,
.form-cita input[type="date"] {
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.form-cita button {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 50px;
  background-color: #3498db;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-cita button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.form-cita button[type="button"] {
  background-color: #2ecc71;
}

.form-cita button[type="button"]:hover {
  background-color: #27ae60;
}

.form-cita select:disabled {
  background-color: #f0f0f0;
}
</style>
