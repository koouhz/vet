<template>
  <div class="select-veterinario">
    <label>Servicio:</label>
    <select v-model="servicioSeleccionado" @change="cargarVeterinarios">
      <option disabled value="">-- Selecciona servicio --</option>
      <option v-for="s in servicios" :key="s.id" :value="s.id">{{ s.titulo }}</option>
    </select>

    <label>Veterinario:</label>
    <select v-model="veterinarioSeleccionado">
      <option disabled value="">-- Selecciona veterinario --</option>
      <option v-for="v in veterinarios" :key="v.id" :value="v.id">{{ v.usuario.nombre_completo }}</option>
    </select>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  props: {
    servicio: { type: [String, Number], default: '' },
    veterinario: { type: [String, Number], default: '' }
  },
  data() {
    return {
      servicios: [],
      veterinarios: [],
      servicioSeleccionado: this.servicio,
      veterinarioSeleccionado: this.veterinario
    }
  },
  watch: {
    servicioSeleccionado(val) { this.$emit('update:servicio', val); this.cargarVeterinarios() },
    veterinarioSeleccionado(val) { this.$emit('update:veterinario', val) }
  },
  async created() {
    await this.cargarServicios()
    if (this.servicioSeleccionado) this.cargarVeterinarios()
  },
  methods: {
    async cargarServicios() {
      const { data } = await supabase.from('servicios').select('id,titulo').eq('is_activo', true)
      this.servicios = data
    },
    async cargarVeterinarios() {
      if (!this.servicioSeleccionado) {
        this.veterinarios = []
        return
      }
      // Trae los veterinarios que ofrecen el servicio seleccionado
      const { data } = await supabase
        .from('servicios_veterinarios')
        .select('veterinario_id, veterinario: veterinario_id (id, usuario_id, usuario:usuarios(nombre_completo)))')
        .eq('servicio_id', this.servicioSeleccionado)
        .eq('is_activo', true)
      this.veterinarios = data.map(d => d.veterinario)
    }
  }
}
</script>

<style scoped>
.select-veterinario { margin: 1rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
select { padding: 0.5rem; border-radius: 5px; border: 1px solid #ccc; }
</style>
