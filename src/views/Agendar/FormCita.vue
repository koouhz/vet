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
      @change="cargarHorarios"
    />

    <!-- Fecha (opcional, para filtrar horas ocupadas) -->
    <label>Fecha (opcional):</label>
    <input type="date" v-model="fecha" @change="cargarHorarios" />

    <!-- Horarios disponibles -->
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

    async cargarHorarios() {
  if (!this.veterinarioId) return

  try {
    // Obtener horarios del veterinario según día
    const diaSemana = this.fecha
      ? ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][new Date(this.fecha).getDay()]
      : null

    const { data: horariosVet, error } = await supabase
      .from('horarios_veterinarios')
      .select('hora_inicio,hora_fin,dia,es_disponible')
      .eq('veterinario_id', this.veterinarioId)
      .eq('es_disponible', true)

    if (error) throw error

    // Filtrar por día si se seleccionó fecha
    let horariosFiltrados = horariosVet
    if (diaSemana) {
      horariosFiltrados = horariosVet.filter(h => h.dia === diaSemana)
    }

    // Generar intervalos de 30 minutos
    let horas = []
    horariosFiltrados.forEach(hv => {
      let [hora, minuto] = hv.hora_inicio.split(':').map(Number)
      const [finHora, finMin] = hv.hora_fin.split(':').map(Number)

      while (hora < finHora || (hora === finHora && minuto < finMin)) {
        horas.push(`${String(hora).padStart(2,'0')}:${String(minuto).padStart(2,'0')}`)
        minuto += 30
        if (minuto >= 60) { minuto = 0; hora += 1 }
      }
    })

    // Filtrar horas ya ocupadas en citasmascotas (si se eligió fecha)
    if (this.fecha) {
      const { data: citas } = await supabase
        .from('citasmascotas')
        .select('hora')
        .eq('veterinario_id', this.veterinarioId)
        .eq('fecha', this.fecha)
      const ocupadas = citas.map(c => c.hora)
      horas = horas.filter(h => !ocupadas.includes(h))
    }

    this.horasDisponibles = horas
  } catch (err) {
    console.error('Error cargando horarios del veterinario:', err.message)
  }
},


    async agendar() {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return alert('Debes iniciar sesión')

      if (!this.mascotaId || !this.veterinarioId || !this.servicioId || !this.hora) {
        return alert('Completa todos los campos')
      }

      const { error } = await supabase.from('citasmascotas').insert([{
        usuario_id: user.user.id,
        mascota_id: this.mascotaId,
        veterinario_id: this.veterinarioId,
        servicio_id: this.servicioId,
        fecha: this.fecha || new Date().toISOString().split('T')[0],
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
/* estilos idénticos a los anteriores */
.form-cita { max-width: 500px; margin: 2rem auto; padding: 2rem; background: #ffffffff; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 1rem; }
.form-cita h2 { text-align: center; color: #2c3e50; margin-bottom: 1rem; }
.form-cita label { font-weight: 600; margin-bottom: 0.3rem; color: #34495e; }
.form-cita select, .form-cita input[type="date"] { padding: 0.5rem 0.8rem; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; }
.form-cita button { padding: 0.7rem 1.5rem; border: none; border-radius: 50px; background-color: #3498db; color: #fff; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.form-cita button:hover { background-color: #2980b9; transform: translateY(-2px); }
.form-cita button[type="button"] { background-color: #2ecc71; }
.form-cita button[type="button"]:hover { background-color: #27ae60; }
.form-cita select:disabled { background-color: #f0f0f0; }
</style>
