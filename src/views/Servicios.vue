<template>
  <div class="servicios">
    <section class="hero">
      <h1>Servicios con Veterinarios</h1>
      <p>
        Estos son los servicios disponibles junto con los veterinarios
        que actualmente los atienden.
      </p>
    </section>

    <section class="services-list">
      <div
        class="service-item"
        v-for="rel in serviciosVeterinarios"
        :key="rel.id"
      >
        <img :src="rel.servicios?.foto_url" :alt="rel.servicios?.titulo" />
        <h3>{{ rel.servicios?.titulo }}</h3>
        <p>{{ rel.servicios?.descripcion }}</p>

        <!-- Veterinario asignado -->
        <div v-if="rel.veterinarios">
          <h4>Veterinario:</h4>
          <p>
            {{ rel.veterinarios.usuarios?.nombre_completo }} – 
            {{ rel.veterinarios.especialidades?.nombre }}
          </p>
        </div>
        <div v-else>
          <p class="no-vet">⚠️ Sin veterinario asignado</p>
        </div>

        <button
          class="btn-primary"
          @click="irAgendarCita(rel.servicios.id, rel.veterinarios?.id)"
        >
          Agendar ahora
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'ServiciosView',
  data() {
    return {
      serviciosVeterinarios: []
    }
  },
  async created() {
    await this.cargarServiciosVeterinarios()
  },
  methods: {
    async cargarServiciosVeterinarios() {
      try {
        const { data, error } = await supabase
          .from('servicios_veterinarios')
          .select(`
            id,
            servicios (
              id,
              titulo,
              descripcion,
              foto_url,
              is_activo
            ),
            veterinarios (
              id,
              usuarios (
                nombre_completo
              ),
              especialidades (
                nombre
              )
            )
          `)

        if (error) throw error

        this.serviciosVeterinarios = data
      } catch (err) {
        console.error('Error cargando servicios con veterinarios:', err.message)
      }
    },

    async irAgendarCita(servicioId, veterinarioId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return this.$router.push({ name: 'Login' })

      this.$router.push({
        name: 'AgendarCita',
        query: { servicioId, veterinarioId }
      })
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
</style>
