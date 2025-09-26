<template>
  <div class="form-cita">
    <h2>Agendar una Cita</h2>

    <!-- Selección de servicio -->
    <label>Selecciona el servicio:</label>
    <select v-model="servicioLocal" @change="actualizarServicio" required>
      <option disabled value="">-- Selecciona servicio --</option>
      <option v-for="s in servicios" :key="s.id" :value="s.id">{{ s.titulo }}</option>
    </select>

    <!-- Selección de veterinario -->
    <label>Selecciona el veterinario:</label>
    <select v-model="veterinarioId" @change="cargarHorarios" required>
      <option disabled value="">-- Selecciona veterinario --</option>
      <option v-for="v in veterinarios" :key="v.id" :value="v.id">
        {{ v.usuarios.nombre_completo }} – {{ v.especialidades.nombre }}
      </option>
    </select>

    <!-- Selección de mascota -->
    <label>Selecciona tu mascota:</label>
    <select v-model="mascotaId" required>
      <option disabled value="">-- Selecciona mascota --</option>
      <option v-for="m in mascotas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
    </select>
    <button type="button" @click="abrirNuevaMascota">+ Registrar nueva mascota</button>

    <!-- Fecha -->
    <label>Fecha:</label>
    <input type="date" :min="fechaMinima" v-model="fecha" @change="actualizarServicio" required />

    <!-- Horarios disponibles -->
    <label>Hora:</label>
    <select v-model="hora" required>
      <option disabled value="">-- Selecciona hora --</option>
      <option v-for="h in horasDisponibles" :key="h" :value="h">{{ h }}</option>
    </select>

    <!-- Botón agendar -->
    <button @click="agendar">Agendar Cita</button>

    <!-- Modal nueva mascota -->
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

export default {
  props: {
    servicioId: { type: [String, Number], required: false }
  },
  components: { ModalNuevaMascota },
  data() {
    return {
      servicios: [],
      veterinarios: [],
      mascotas: [],
      servicioLocal: this.servicioId || '',
      veterinarioId: '',
      mascotaId: '',
      fecha: '',
      hora: '',
      horasDisponibles: [],
      mostrarModalMascota: false
    }
  },
  computed: {
    fechaMinima() {
      return new Date().toISOString().split('T')[0]
    }
  },
  async created() {
    await this.cargarServicios()
    await this.cargarMascotas()
  },
  methods: {
    async cargarServicios() {
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('is_activo', true)
      if (error) console.error(error)
      else this.servicios = data
    },
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
    agregarMascota(m) {
      this.mascotas.push(m)
      this.mascotaId = m.id
      this.cerrarModalMascota()
    },

    obtenerDiaSemana(fecha) {
      const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
      return dias[new Date(fecha).getDay()]
    },

    async actualizarServicio() {
      this.$emit('update:servicioId', this.servicioLocal)
      this.veterinarioId = ''
      this.horasDisponibles = []

      if (!this.servicioLocal) {
        this.veterinarios = []
        return
      }

      const { data, error } = await supabase
        .from('servicios_veterinarios')
        .select(`
          veterinarios (
            id,
            usuarios (nombre_completo),
            especialidades (nombre)
          )
        `)
        .eq('servicio_id', this.servicioLocal)

      if (error) {
        console.error(error)
        this.veterinarios = []
        return
      }

      const diaSemana = this.fecha ? this.obtenerDiaSemana(this.fecha) : null

      // Filtrar veterinarios por disponibilidad en el día seleccionado
      this.veterinarios = []
      for (const d of data) {
        const vet = d.veterinarios
        if (!diaSemana) {
          this.veterinarios.push(vet)
          continue
        }

        const { data: horarios, error: hError } = await supabase
          .from('horarios_veterinarios')
          .select('id, es_disponible, horario_base:horario_base_id(dia_semana)')
          .eq('veterinario_id', vet.id)
          .eq('es_disponible', true)

        if (!hError && horarios.some(h => h.horario_base?.dia_semana.toLowerCase() === diaSemana)) {
          this.veterinarios.push(vet)
        }
      }
    },

    async cargarHorarios() {
      try {
        if (!this.veterinarioId || !this.fecha) return

        const diaSemana = this.obtenerDiaSemana(this.fecha)

        const { data, error } = await supabase
          .from('horarios_veterinarios')
          .select(`
            id,
            es_disponible,
            horario_base:horario_base_id (
              dia_semana,
              hora_inicio,
              hora_fin
            )
          `)
          .eq('veterinario_id', this.veterinarioId)
          .eq('es_disponible', true)

        if (error) throw error

        this.horasDisponibles = data
          .filter(h => h.horario_base && h.horario_base.dia_semana.toLowerCase() === diaSemana)
          .map(h => `${h.horario_base.hora_inicio} - ${h.horario_base.hora_fin}`)

      } catch (err) {
        console.error('Error cargando horarios:', err.message)
        this.horasDisponibles = []
      }
    },

    async agendar() {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return alert('Debes iniciar sesión')
      if (!this.servicioLocal || !this.veterinarioId || !this.mascotaId || !this.fecha || !this.hora) {
        return alert('Completa todos los campos')
      }

      const { error } = await supabase.from('citasmascotas').insert([{
        usuario_id: user.user.id,
        mascota_id: this.mascotaId,
        veterinario_id: this.veterinarioId,
        servicio_id: this.servicioLocal,
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
  max-width: 500px; margin: 2rem auto; padding: 2rem;
  background: #fff; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  display: flex; flex-direction: column; gap: 1rem;
}
.form-cita h2 { text-align: center; color: #2c3e50; margin-bottom: 1rem; }
.form-cita label { font-weight: 600; margin-bottom: 0.3rem; color: #34495e; }
.form-cita select, .form-cita input[type="date"] { padding: 0.5rem 0.8rem; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; }
.form-cita button { padding: 0.7rem 1.5rem; border: none; border-radius: 50px; background-color: #3498db; color: #fff; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.form-cita button:hover { background-color: #2980b9; transform: translateY(-2px); }
.form-cita button[type="button"] { background-color: #2ecc71; }
.form-cita button[type="button"]:hover { background-color: #27ae60; }
.form-cita select:disabled { background-color: #f0f0f0; }
</style>
