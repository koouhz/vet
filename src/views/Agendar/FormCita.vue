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
    <select v-model="veterinarioId" @change="resetHorarios" required>
      <option disabled value="">-- Selecciona veterinario --</option>
      <option v-for="v in veterinarios" :key="v.id" :value="v.id">
        {{ v.usuarios.nombre_completo }} – {{ v.especialidades.nombre }}
      </option>
    </select>
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

    <!-- Selección de fecha -->
    <label>Selecciona la fecha:</label>
    <input
      type="date"
      v-model="fecha"
      :min="fechaMin"
      :max="fechaMax"
      @change="cargarHorarios"
      required
    />

    <!-- Horarios disponibles -->
    <div v-if="horasDisponibles.length">
      <label>Selecciona un horario:</label>
      <div class="horarios-grid">
        <button
          v-for="h in horasDisponibles"
          :key="h.id"
          class="horario-btn"
          :class="{ seleccionado: hora === h.texto }"
          @click="hora = h.texto"
        >
          {{ h.texto }}
        </button>
      </div>
    </div>
    <div v-else-if="fecha && veterinarioId">
      <p class="vet-warning">⚠️ No hay horarios disponibles para este día</p>
    </div>

    <!-- Botón agendar -->
    <button class="btn-primary" @click="agendar">Agendar Cita</button>

    <!-- Botón para ver baucher -->
    <div v-if="citaReciente" style="margin-top:1rem;">
      <button class="btn-primary" @click="generarVoucher">
        📄 Ver / Descargar Baucher
      </button>
    </div>

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
import { generarVoucherCita } from './voucherService.js' // <-- misma carpeta

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
      mostrarModalMascota: false,
      fechaMin: '',
      fechaMax: '',
      citaReciente: null // <--- Nueva propiedad
    }
  },
  async created() {
    await this.cargarServicios()
    await this.cargarMascotas()
    this.configurarFechas()
  },
  methods: {
    configurarFechas() {
      const hoy = new Date()
      const semanaDespues = new Date()
      semanaDespues.setDate(hoy.getDate() + 7)
      this.fechaMin = hoy.toISOString().split('T')[0]
      this.fechaMax = semanaDespues.toISOString().split('T')[0]
    },

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
        .eq('is_activo', true)

      if (error) {
        console.error(error)
        this.veterinarios = []
        return
      }

      this.veterinarios = data.map(d => d.veterinarios)
    },

    resetHorarios() {
      this.fecha = ''
      this.horasDisponibles = []
      this.hora = ''
    },

    obtenerDiaSemanaTexto(fecha) {
      const dias = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"]
      const d = new Date(fecha)
      return dias[d.getDay()]
    },

    generarSlots(inicio, fin, intervalo, idHorario) {
      const slots = []
      let [h, m] = inicio.split(':').map(Number)
      const [hFin, mFin] = fin.split(':').map(Number)

      while (h < hFin || (h === hFin && m < mFin)) {
        const horaTexto = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
        slots.push({ id: `${idHorario}-${horaTexto}`, texto: horaTexto })

        m += intervalo
        if (m >= 60) { h++; m = m % 60 }
      }

      return slots
    },

    async cargarHorarios() {
      if (!this.veterinarioId || !this.fecha) {
        this.horasDisponibles = []
        return
      }

      const diaSemana = this.obtenerDiaSemanaTexto(this.fecha)

      const { data, error } = await supabase
        .from('horarios_veterinarios')
        .select(`
          id,
          es_disponible,
          horario_base:horario_base_id(dia_semana,hora_inicio,hora_fin)
        `)
        .eq('veterinario_id', this.veterinarioId)
        .eq('es_disponible', true)
        .eq('horario_base.dia_semana', diaSemana)

      if (error) { console.error(error); this.horasDisponibles = []; return }

      let slots = []
      data.forEach(h => {
        if (h.horario_base) {
          slots = slots.concat(this.generarSlots(
            h.horario_base.hora_inicio,
            h.horario_base.hora_fin,
            30,
            h.id
          ))
        }
      })

      // Filtrar los horarios que ya están ocupados
      const { data: citas } = await supabase
        .from('citasmascotas')
        .select('hora')
        .eq('veterinario_id', this.veterinarioId)
        .eq('fecha', this.fecha)

      const horasOcupadas = (citas || []).map(c => c.hora.substring(0,5))
      this.horasDisponibles = slots.filter(s => !horasOcupadas.includes(s.texto))
    },

    async agendar() {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return alert('Debes iniciar sesión')
      if (!this.servicioLocal || !this.veterinarioId || !this.mascotaId || !this.fecha || !this.hora) {
        return alert('Completa todos los campos')
      }

      const { data, error } = await supabase.from('citasmascotas').insert([{
        usuario_id: user.user.id,
        mascota_id: this.mascotaId,
        veterinario_id: this.veterinarioId,
        servicio_id: this.servicioLocal,
        fecha: this.fecha,
        hora: this.hora,
      }]).select() // obtener registro insertado

      if (error) return alert('Error: ' + error.message)

      // Guardamos la cita reciente para el baucher
      this.citaReciente = data[0]

      alert('✅ Cita agendada correctamente')
      // Opcional: resetear campos si quieres
      // this.servicioLocal = ''; this.veterinarioId = ''; ...
    },

   generarVoucher() {
      if (!this.citaReciente) return;

      const servicio = this.servicios.find(s => s.id === this.citaReciente.servicio_id);
      const veterinario = this.veterinarios.find(v => v.id === this.citaReciente.veterinario_id);
      const mascota = this.mascotas.find(m => m.id === this.citaReciente.mascota_id);

      generarVoucherCita({
        servicio,
        veterinario,
        mascota,
        fecha: this.citaReciente.fecha,
        hora: this.citaReciente.hora
      });
    }
  }
}
</script>

<style scoped>
.form-cita { max-width: 600px; margin: 2rem auto; padding: 2.5rem; border-radius: 10px; background: #fff; box-shadow: 0 6px 20px rgba(0,128,150,0.08); display: flex; flex-direction: column; gap: 1rem; color:#000;}
label { font-weight:500; margin-bottom:0.3rem;}
select, input { width:100%; margin-bottom:1rem; padding:0.6rem 0.8rem; border-radius:8px; border:1px solid #ccc;}
button { cursor:pointer; padding:0.6rem 1.2rem; border-radius:6px;}
.btn-primary { background:#3498db; color:#fff; border:none;}
.btn-primary:hover { background:#2980b9;}
.btn-secondary { background:transparent; border:1px solid #ccc;}
.vet-warning { background:#fff4f4; border:1px solid #e74c3c; color:#e74c3c; padding:0.8rem; border-radius:6px; text-align:center;}
.horarios-grid { display:flex; flex-wrap:wrap; gap:0.5rem;}
.horario-btn { padding:0.6rem 1rem; border:none; border-radius:6px; background:#27ae60; color:#fff; cursor:pointer;}
.horario-btn:hover { background:#2ecc71;}
.horario-btn.seleccionado { background:#16a085;}
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
  color: #000;
}

.form-cita:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 128, 150, 0.12);
}

.form-cita h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #000;
}

label {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.3rem;
}

select, input, textarea {
  font-family: inherit;
  font-size: 1rem;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: #fff;
  color: #1e293b;
  outline: none;
  transition: border-color var(--transition);
  width: 100%;
  margin-bottom: 1rem;
}

select option {
  color: #000;
  background: #fff;
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
  color: #000;
}

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
  color: #000;
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

.horarios-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.horario-btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  background: #2ecc71;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.horario-btn:hover {
  background: #27ae60;
}

.horario-btn.seleccionado {
  background: #3498db;
}
.horarios {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.horario-slot {
  padding: 0.6rem 1rem;
  border-radius: 6px;
  background: #27ae60; /* verde */
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
}

.horario-slot:hover {
  background: #2ecc71;
}

.horario-slot.seleccionado {
  background: #16a085; /* verde oscuro cuando se selecciona */
}
</style>
