<template>
  <div class="form-cita card">
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

    <!-- Si no hay veterinarios -->
    <div v-if="veterinarios.length === 0 && servicioLocal" class="vet-warning">
      ⚠️ No hay veterinarios disponibles para este servicio
    </div>

    <!-- Selección de mascota -->
    <label>Selecciona tu mascota:</label>
    <select v-model="mascotaId" required>
      <option disabled value="">-- Selecciona mascota --</option>
      <option v-for="m in mascotas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
    </select>
    <button type="button" class="btn-secondary" @click="abrirNuevaMascota">
      + Registrar nueva mascota
    </button>

    <!-- Horarios disponibles -->
    <label>Hora:</label>
    <select v-model="hora" required>
      <option disabled value="">-- Selecciona hora --</option>
      <option v-for="h in horasDisponibles" :key="h.id" :value="h.id">
        {{ h.texto }}
      </option>
    </select>

    <!-- Botón agendar -->
    <button class="btn-primary" @click="agendar">Agendar Cita</button>

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
      hora: '',
      horasDisponibles: [],
      mostrarModalMascota: false
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

    async actualizarServicio() {
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

      this.veterinarios = data.map(d => d.veterinarios)
    },

    async cargarHorarios() {
      if (!this.veterinarioId) return

      const { data, error } = await supabase
        .from('horarios_veterinarios')
        .select(`
          id,
          es_disponible,
          horario_base:horario_base_id(dia_semana,hora_inicio,hora_fin)
        `)
        .eq('veterinario_id', this.veterinarioId)
        .eq('es_disponible', true)

      if (error) {
        console.error(error)
        this.horasDisponibles = []
        return
      }

      // Mapear solo el día y las horas
      this.horasDisponibles = data.map(h => ({
        id: h.id,
        texto: `${h.horario_base.dia_semana} | ${h.horario_base.hora_inicio} - ${h.horario_base.hora_fin}`
      }))
    },

        async agendar() {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return alert('Debes iniciar sesión')
      if (!this.servicioLocal || !this.veterinarioId || !this.mascotaId || !this.hora) {
        return alert('Completa todos los campos')
      }

        const { error } = await supabase.from('citasmascotas').insert([{
          usuario_id: user.user.id,
          mascota_id: this.mascotaId,
          veterinario_id: this.veterinarioId,
          servicio_id: this.servicioLocal,
          id_horario_veterinario: this.hora, // si quieres usar horario seleccionado
          fecha: new Date(),                 // fecha automática
          hora: new Date().toLocaleTimeString() // hora automática
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
  max-width: 600px;
  margin: 2rem auto;
  padding: 2.5rem;
  border-radius: var(--radius);
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 128, 150, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform var(--transition), box-shadow var(--transition);
  color: #000; /* Texto principal en negro */
}

.form-cita:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 128, 150, 0.12);
}

.form-cita h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #000; /* Título en negro */
}

label {
  font-weight: 500;
  color: #000; /* Etiquetas en negro */
  margin-bottom: 0.3rem;
}

select, input, textarea {
  font-family: inherit;
  font-size: 1rem;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: #fff; /* Fondo blanco */
  color: #000; /* Texto negro */
  outline: none;
  transition: border-color var(--transition);
  width: 100%;
  margin-bottom: 1rem;
}

/* Opciones de select */
select option {
  color: #000; /* Texto negro */
  background: #fff; /* Fondo blanco */
}

select:focus, input:focus, textarea:focus {
  border-color: var(--color-accent);
}

button {
  padding: 0.8rem 2rem;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  color: #000; /* Texto negro por defecto */
}

/* Botón primario mantiene texto blanco para contraste */
.btn-primary {
  background: var(--color-accent);
  color: #fff;
  border: none;
}

.btn-primary:hover {
  background: #005f6b;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: #000; /* Texto negro */
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: rgba(0, 128, 150, 0.1);
}

.vet-warning {
  background: #fff4f4;
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  padding: 0.8rem 1rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}
</style>
