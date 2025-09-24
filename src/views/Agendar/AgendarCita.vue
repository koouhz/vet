<template>
  <div>
    <!-- Convertimos a Number para asegurar tipo correcto -->
    <FormCita 
      v-if="servicioId" 
      :servicio-id="servicioId" 
      @cerrar="cerrarModal"
    />
    <p v-else>❌ Servicio no seleccionado.</p>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import FormCita from './FormCita.vue'

export default {
  name: 'AgendarCitaView',
  components: { FormCita },
  setup() {
    const route = useRoute()

    // Tomar servicioId de la query y asegurarnos que sea Number
    const servicioId = computed(() => Number(route.query.servicioId) || null)

    return { servicioId }
  },
  methods: {
    cerrarModal() {
      this.$router.push({ name: 'Home' })
    }
  }
}
</script>
