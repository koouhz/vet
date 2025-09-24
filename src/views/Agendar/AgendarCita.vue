<template>
  <div>
    <FormCita :servicio-id="$route.query.servicio" @cerrar="cerrarModal"/>
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
