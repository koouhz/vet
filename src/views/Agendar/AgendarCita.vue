<template>
  <div class="agendar-cita">
    <h1>Agendar una Cita</h1>
    <p>Completa los datos para tu mascota y el servicio que deseas.</p>

    <!-- Selección de mascota -->
    <label>Selecciona tu mascota:</label>
    <select v-model="mascotaId" @change="mostrarNuevo=false">
      <option disabled value="">-- Selecciona una mascota --</option>
      <option v-for="m in mascotas" :key="m.id" :value="m.id">
        {{ m.nombre }} ({{ m.especie }})
      </option>
      <option value="nueva">+ Registrar nueva mascota</option>
    </select>

    <!-- Formulario inline para nueva mascota -->
    <div v-if="mascotaId === 'nueva'" class="nueva-mascota">
      <h3>Registrar nueva mascota</h3>
      <label>Nombre:</label>
      <input type="text" v-model="nuevaMascota.nombre" required />

      <label>Especie:</label>
      <select v-model="nuevaMascota.especie" required>
        <option disabled value="">Selecciona especie</option>
        <option>perro</option>
        <option>gato</option>
        <option>conejo</option>
        <option>hámster</option>
        <option>ave</option>
        <option>reptil</option>
        <option>otros</option>
      </select>

      <label>Raza:</label>
      <input type="text" v-model="nuevaMascota.raza" />

      <label>Fecha de nacimiento:</label>
      <input type="date" v-model="nuevaMascota.fecha_nacimiento" />

      <label>Peso (kg):</label>
      <input type="number" v-model="nuevaMascota.peso_kg" step="0.01" />

      <label>Sexo:</label>
      <select v-model="nuevaMascota.sexo">
        <option disabled value="">Selecciona sexo</option>
        <option>macho</option>
        <option>hembra</option>
        <option>castrado</option>
        <option>esterilizado</option>
      </select>

      <label>Microchip ID:</label>
      <input type="text" v-model="nuevaMascota.microchip_id" />

      <label>Alergias:</label>
      <input type="text" v-model="nuevaMascota.alergias" />

      <label>Notas médicas:</label>
      <textarea v-model="nuevaMascota.notas_medicas"></textarea>
    </div>

    <!-- Veterinario y servicio -->
    <label>Selecciona el veterinario:</label>
    <select v-model="veterinarioId" @change="cargarServicios" required>
      <option disabled value="">-- Selecciona un veterinario --</option>
      <option v-for="v in veterinarios" :key="v.id" :value="v.id">
        {{ v.usuario_nombre }} - {{ v.especialidad_nombre }}
      </option>
    </select>

    <label>Selecciona el servicio:</label>
    <select v-model="servicioId" required>
      <option disabled value="">-- Selecciona un servicio --</option>
      <option v-for="s in serviciosDisponibles" :key="s.id" :value="s.id">
        {{ s.titulo }} - {{ s.duracion_minutos }} min
      </option>
    </select>

    <!-- Fecha y hora -->
    <label>Fecha de la cita:</label>
    <input type="date" v-model="fecha" required />

    <label>Hora de la cita:</label>
    <input type="time" v-model="hora" required />

    <label>Observaciones:</label>
    <textarea v-model="observaciones" placeholder="Notas adicionales"></textarea>

    <button @click="agendarCita">Agendar cita</button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

export default {
  setup() {
    const user = ref(null)
    const mascotas = ref([])
    const veterinarios = ref([])
    const serviciosDisponibles = ref([])

    const mascotaId = ref('')
    const nuevaMascota = ref({
      nombre: '',
      especie: '',
      raza: '',
      fecha_nacimiento: '',
      peso_kg: '',
      sexo: '',
      microchip_id: '',
      alergias: '',
      notas_medicas: ''
    })

    const veterinarioId = ref('')
    const servicioId = ref('')
    const fecha = ref('')
    const hora = ref('')
    const observaciones = ref('')

    // Cargar usuario y mascotas
    onMounted(async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        alert('Debes iniciar sesión primero')
        return
      }
      user.value = userData.user

      const { data: misMascotas } = await supabase
        .from('mascotas')
        .select('*')
        .eq('usuario_id', user.value.id)
        .eq('is_activa', true)
      mascotas.value = misMascotas || []

      // Cargar veterinarios activos
      const { data: vets } = await supabase
        .from('veterinarios')
        .select('id, usuario_id, especialidad_id, is_activo, usuario:usuarios(nombre_completo), especialidad:especialidades(nombre)')
        .eq('is_activo', true)
      veterinarios.value = vets.map(v => ({
        ...v,
        usuario_nombre: v.usuario.nombre_completo,
        especialidad_nombre: v.especialidad.nombre
      }))
    })

    const cargarServicios = async () => {
      if (!veterinarioId.value) return
      const { data } = await supabase
        .from('servicios_veterinarios')
        .select('servicio_id, servicio:servicios(titulo,duracion_minutos)')
        .eq('veterinario_id', veterinarioId.value)
        .eq('is_activo', true)
      serviciosDisponibles.value = data.map(d => ({
        id: d.servicio_id,
        titulo: d.servicio.titulo,
        duracion_minutos: d.servicio.duracion_minutos
      }))
    }

    const agendarCita = async () => {
      let idMascota = mascotaId.value

      // Si es nueva mascota, crearla primero
      if (idMascota === 'nueva') {
        const { data, error } = await supabase.from('mascotas').insert([{
          usuario_id: user.value.id,
          nombre: nuevaMascota.value.nombre,
          especie: nuevaMascota.value.especie,
          raza: nuevaMascota.value.raza,
          fecha_nacimiento: nuevaMascota.value.fecha_nacimiento,
          peso_kg: nuevaMascota.value.peso_kg,
          sexo: nuevaMascota.value.sexo,
          microchip_id: nuevaMascota.value.microchip_id,
          alergias: nuevaMascota.value.alergias,
          notas_medicas: nuevaMascota.value.notas_medicas
        }]).select().single()

        if (error) return alert('Error al crear mascota: ' + error.message)
        idMascota = data.id
      }

      // Crear cita
      const { error } = await supabase.from('citasmascotas').insert([{
        usuario_id: user.value.id,
        mascota_id: idMascota,
        veterinario_id: veterinarioId.value,
        servicio_id: servicioId.value,
        fecha: fecha.value,
        hora: hora.value,
        observaciones: observaciones.value
      }])

      if (error) return alert('Error al agendar cita: ' + error.message)
      alert('Cita agendada correctamente!')
    }

    return {
      mascotas,
      veterinarios,
      serviciosDisponibles,
      mascotaId,
      nuevaMascota,
      veterinarioId,
      servicioId,
      fecha,
      hora,
      observaciones,
      cargarServicios,
      agendarCita
    }
  }
}
</script>

<style scoped>
.agendar-cita { max-width: 600px; margin: 4rem auto; padding: 2rem; background: #f8f9fa; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);}
form label { display: block; margin-top: 1rem; font-weight: 600; }
form input, form select, form textarea { width: 100%; padding: 0.7rem; margin-top: 0.3rem; border-radius: 6px; border: 1px solid #ccc; }
form button { margin-top: 1.5rem; padding: 1rem 2rem; background: #3498db; color: white; border: none; border-radius: 50px; cursor: pointer; }
form button:hover { background: #2980b9; }
.nueva-mascota { margin-top: 1.5rem; padding: 1rem; background: #e8f0fe; border-radius: 8px; }
</style>
