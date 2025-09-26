<template>
  <section class="services-section">
    <h2>Nuestros Servicios</h2>

    <div v-if="loading">Cargando servicios...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="services-grid">
      <!-- Ahora cada tarjeta es un link hacia /servicios -->
      <router-link 
        v-for="servicio in servicios" 
        :key="servicio.id" 
        to="/servicios" 
        class="service-card"
      >
        <div class="service-icon">
          {{ getIcon(servicio) }}
        </div>
        <h3>{{ servicio.titulo }}</h3>
        <p>{{ servicio.descripcion }}</p>
      </router-link>
    </div>
  </section>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'ServiciosList',
  data() {
    return {
      servicios: [],
      loading: true,
      error: null
    }
  },
  async created() {
    try {
      const { data, error } = await supabase
        .from('servicios')
        .select('id, titulo, descripcion, icono, categoria')
        .eq('is_activo', true)
        .order('id', { ascending: true })

      if (error) throw error
      this.servicios = data
    } catch (err) {
      this.error = 'Error cargando los servicios'
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  methods: {
    getIcon(servicio) {
      if (servicio.icono) return servicio.icono

      const titulo = servicio.titulo?.toLowerCase() || ''
      const categoria = servicio.categoria || ''

      if (titulo.includes('vacuna')) return '💉'
      if (titulo.includes('consulta')) return '🩺'
      if (titulo.includes('peluquer')) return '✂️'
      if (titulo.includes('emergencia')) return '🚑'
      if (titulo.includes('cirug')) return '🩻'
      if (titulo.includes('nutric') || categoria === 'cuidado') return '🥩'
      if (categoria === 'emergencia') return '🚨'

      return '🐾'
    }
  }
}
</script>

<style scoped>
.services-section {
  padding: 5rem 2rem;
  text-align: center;
  background-color: white;
  font-family: 'Inter', sans-serif;
}
.services-section h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 3rem;
  font-weight: 500;
}
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
/* router-link ahora actúa como tarjeta */
.service-card {
  background: #f9f9f9;
  padding: 2.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);
  text-decoration: none;
  color: inherit;
  display: block;
}
.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}
.service-icon {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.service-card h3 {
  color: #2c3e50;
  margin: 1rem 0 1rem;
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.3;
}
.service-card p {
  color: #555;
  line-height: 1.6;
  font-size: 1rem;
  font-weight: 300;
  margin: 0;
}
</style>
