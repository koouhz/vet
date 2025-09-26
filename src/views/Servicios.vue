<template>
  <div class="servicios">
    <!-- Sección principal -->
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
        <div class="service-content">
          <h3>{{ servicio.titulo }}</h3>
          <p>{{ servicio.descripcion }}</p>

          <!-- Veterinarios disponibles -->
          <div v-if="servicio.servicios_veterinarios?.length">
            <h4>Veterinarios disponibles:</h4>
            <div class="vet-cards">
              <div
                class="vet-card"
                v-for="rel in servicio.servicios_veterinarios"
                :key="rel.veterinarios?.id"
              >
                {{ rel.veterinarios?.usuarios?.nombre_completo }}
                <span class="vet-especialidad">
                  ({{ rel.veterinarios?.especialidades?.nombre }})
                </span>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="no-vet-card">
              Sin veterinarios asignados por ahora
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay servicios -->
      <div v-if="servicios.length === 0" class="no-services">
        <p>🚫 No hay servicios disponibles en este momento</p>
      </div>
    </section>

    <!-- Botón único para agendar -->
    <div class="agendar-btn-container">
      <button class="btn-primary" @click="irAgendarCita">
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
/* Contenedor general */
.servicios {
  background-color: #f8f9fa;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* Hero section */
.hero {
  text-align: center;
  padding: 5rem 1.5rem;
  background: linear-gradient(135deg, #03252b 0%, #0a4a56 100%);
  color: white;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  margin-bottom: 1rem;
  font-weight: 700;
}
.hero p {
  font-size: clamp(1rem, 2vw, 1.4rem);
  max-width: 700px;
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.9);
}

/* Lista de servicios */
.services-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 3rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.service-item {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.4s ease-in-out;
}

.service-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.service-item img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.service-content {
  padding: 1.5rem;
}

.service-item h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
}
.service-item p {
  margin: 0.5rem 0 1rem;
  color: #555;
  line-height: 1.6;
  font-size: 1rem;
}

/* Veterinarios asignados */
.vet-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.5rem;
  justify-content: center;
}

.vet-card {
  background: #eafaf1;
  color: #145a32;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.vet-especialidad {
  font-weight: 400;
  color: #1b4332;
  margin-left: 4px;
}

/* Si no hay veterinarios */
.no-vet-card {
  background: #fff4f4;
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  padding: 0.8rem 1.2rem;
  border-radius: 15px;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: bottom;
  justify-content: center;
  margin-top: 0.5rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.3s ease;
}

/* Mensaje si no hay servicios */
.no-services {
  text-align: center;
  font-size: 1.2rem;
  color: #555;
  grid-column: 1 / -1;
  padding: 2rem;
}

/* Botón */
.agendar-btn-container {
  text-align: center;
  margin: 1.5rem 0 3rem;
}

.btn-primary {
  margin-top: 0.5rem;
  padding: 0.9rem 2.2rem;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2980b9, #1f5f85);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Animación de aparición */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
