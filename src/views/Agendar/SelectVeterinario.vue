<template>
  <div>
    <label>Veterinario</label>
    <select v-model="selected" @change="$emit('input', selected)">
      <option v-for="vet in veterinarios" :key="vet.id_veterinario" :value="vet.id_veterinario">
        {{ vet.nombre }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SelectVeterinario',
  props: {
    servicioId: { type: String, required: true },
    value: String
  },
  data() {
    return {
      veterinarios: [],
      selected: this.value
    }
  },
  watch: {
    value(val) { this.selected = val }
  },
  created() {
    // carga veterinarios que ofrecen ese servicio
    fetch(`http://localhost/api/servicios/${this.servicioId}/veterinarios`)
      .then(res => res.json())
      .then(data => {
        this.veterinarios = data
      })
  }
}
</script>
<style scoped>
.select-veterinario { margin: 1rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
select { padding: 0.5rem; border-radius: 5px; border: 1px solid #ccc; }
</style>
