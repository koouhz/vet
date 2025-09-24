<template>
  <div class="select-veterinario">
    <label>Selecciona Veterinario:</label>
    <select v-model="selected" @change="$emit('update:modelValue', selected)" required>
      <option disabled value="">-- Selecciona veterinario --</option>
      <option 
        v-for="v in veterinarios" 
        :key="v.id" 
        :value="v.id">
        {{ v.usuarios.nombre_completo }} - {{ v.especialidades.nombre }}
      </option>
    </select>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  props: {
    modelValue: [String, Number],
    servicioId: { type: [String, Number], required: true }
  },
  data() {
    return {
      selected: this.modelValue,
      veterinarios: []
    }
  },
  watch: {
    modelValue(val) {
      this.selected = val
    }
  },
  async created() {
    await this.cargarVeterinarios()
  },
  methods: {
    async cargarVeterinarios() {
      if (!this.servicioId) return

      // Consulta los veterinarios vinculados al servicio
      const { data, error } = await supabase
        .from('servicios_veterinarios')
        .select(`
          veterinarios (
            id,
            usuario_id,
            especialidad_id,
            usuarios ( nombre_completo ),
            especialidades ( nombre )
          )
        `)
        .eq('servicio_id', this.servicioId)
        .eq('is_activo', true)   // opcional: solo veterinarios activos

      if (error) {
        console.error('Error cargando veterinarios:', error)
        return
      }

      // Extraer los veterinarios de la relación
      this.veterinarios = (data || []).map(sv => sv.veterinarios)
    }
  }
}
</script>

<style scoped>
.select-veterinario select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}
</style>
