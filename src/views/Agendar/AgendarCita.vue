<template>
  <div>
    <!-- FormCita se muestra sin servicio preseleccionado -->
    <FormCita 
      @cerrar="cerrarModal"
    />
  </div>
</template>

<script>
import FormCita from './FormCita.vue'

export default {
  name: 'AgendarCitaView',
  components: { FormCita },
  methods: {
    cerrarModal() {
      this.$router.push({ name: 'Home' })
    }
  }
}
</script>
