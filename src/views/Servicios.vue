<template>
  <div class="servicios">
    <section class="hero">
      <h1>Servicios disponibles</h1>
      <p>
        Estos son todos los servicios ofrecidos por la veterinaria. 
        Puedes revisar la lista completa y luego agendar una cita.
      </p>
    </section>

    <!-- Lista de servicios -->
    <section class="services-list">
      <div
        class="service-item"
        v-for="servicio in servicios"
        :key="servicio.id"
      >
        <img :src="servicio.foto_url" :alt="servicio.titulo" />
        <h3>{{ servicio.titulo }}</h3>
        <p>{{ servicio.descripcion }}</p>

        <!-- Veterinarios disponibles -->
        <div v-if="servicio.servicios_veterinarios?.length">
          <h4>Veterinarios disponibles:</h4>
          <ul>
            <li
              v-for="rel in servicio.servicios_veterinarios"
              :key="rel.veterinarios?.id"
            >
              {{ rel.veterinarios?.usuarios?.nombre_completo }} – 
              {{ rel.veterinarios?.especialidades?.nombre }}
            </li>
          </ul>
        </div>
        <div v-else>
          <p class="no-vet">⚠️ Sin veterinarios asignados por ahora</p>
        </div>
      </div>
    </section>

    <!-- Botón único para agendar -->
    <div class="agendar-btn-container">
      <button
        class="btn-primary"
        @click="irAgendarCita"
      >
        Agendar cita
      </button>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'ServiciosView',
  data() {
    return {
      servicios: []
    }
  },
  async created() {
    await this.cargarServicios()
  },
  methods: {
    async cargarServicios() {
      try {
        const { data, error } = await supabase
          .from('servicios')
          .select(`
            id,
            titulo,
            descripcion,
            foto_url,
            is_activo,
            servicios_veterinarios (
              id,
              veterinarios (
                id,
                usuarios (nombre_completo),
                especialidades (nombre)
              )
            )
          `)
          .eq('is_activo', true)

        if (error) throw error
        this.servicios = data
      } catch (err) {
        console.error('Error cargando servicios:', err.message)
      }
    },

    async irAgendarCita() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return this.$router.push({ name: 'Login' })

      this.$router.push({ name: 'AgendarCita' })
    }
  }
}
</script>

<style scoped>
.servicios {
  background-color: #f8f9fa;
  min-height: calc(100vh - 120px);
}

.hero {
  text-align: center;
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #03252b 0%, #0a4a56 100%);
  color: white;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}
.hero p {
  font-size: 1.4rem;
  max-width: 800px;
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.9);
}

.services-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.service-item {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  padding-bottom: 1.5rem;
}

.service-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.service-item img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}
.service-item h3 {
  padding: 1.5rem;
  margin: 0;
  color: #2c3e50;
  font-size: 1.6rem;
  font-weight: 600;
}
.service-item p {
  padding: 0 1.5rem 1rem;
  color: #555;
  line-height: 1.7;
  font-size: 1rem;
}

.no-vet {
  color: #e74c3c;
  font-weight: 500;
  margin: 0.5rem 0;
}

.btn-primary {
  margin-top: 0.5rem;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  .hero p {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .services-list {
    grid-template-columns: 1fr;
    padding: 2rem 1rem;
  }
}
.agendar-btn-container {
  text-align: center;
  margin: 2rem 0;
}

.btn-primary {
  margin-top: 0.5rem;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}
.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}
</style>
