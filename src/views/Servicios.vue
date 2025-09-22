<!-- src/views/Servicios.vue -->
<template>
  <div class="servicios">
    <!-- Hero section personalizada -->
    <section class="hero">
      <h1>Nuestros Servicios</h1>
      <p>Atención integral para perros, gatos y pequeños animales, con tecnología y cariño.</p>
    </section>

    <!-- Lista de servicios ampliada -->
    <section class="services-list">
      <div class="service-item" v-for="servicio in servicios" :key="servicio.id">
        <img :src="servicio.imagen" :alt="servicio.titulo" />
        <h3>{{ servicio.titulo }}</h3>
        <p>{{ servicio.descripcion }}</p>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <h2>¿Listo para cuidar de tu mascota?</h2>
      <p>Agenda una cita hoy y recibe un chequeo gratuito en tu primera visita.</p>
      <button class="btn-primary" @click="irAgendarCita">Agendar ahora</button>
    </section>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'  // ← IMPORT CORRECTO

// Importar imágenes
import imgVacunas from '@/assets/img/servicio1.png'
import imgConsultas from '@/assets/img/servicio2.png'
import imgPeluqueria from '@/assets/img/servicio3.png'
import imgEmergencias from '@/assets/img/servicio4.png'
import imgCirugias from '@/assets/img/servicio5.png'
import imgNutricion from '@/assets/img/servicio6.png'

export default {
  name: 'ServiciosView',
  data() {
    return {
      servicios: [
        {
          id: 1,
          titulo: 'Vacunación',
          descripcion: 'Programas completos de vacunación según edad, raza y riesgo epidemiológico. Incluye rabia, moquillo, parvovirus y más.',
          imagen: imgVacunas
        },
        {
          id: 2,
          titulo: 'Consultas Generales',
          descripcion: 'Evaluaciones médicas integrales, diagnóstico clínico, seguimiento de enfermedades crónicas y recomendaciones preventivas.',
          imagen: imgConsultas
        },
        {
          id: 3,
          titulo: 'Peluquería y Higiene',
          descripcion: 'Baño profesional, corte de pelo, recorte de uñas, limpieza de oídos y desparasitación externa. ¡Tu mascota lucirá impecable!',
          imagen: imgPeluqueria
        },
        {
          id: 4,
          titulo: 'Emergencias 24/7',
          descripcion: 'Atención inmediata las 24 horas, los 365 días del año. Equipo especializado en trauma, intoxicaciones y paradas cardiorrespiratorias.',
          imagen: imgEmergencias
        },
        {
          id: 5,
          titulo: 'Cirugías',
          descripcion: 'Procedimientos programados y de emergencia: esterilizaciones, castraciones, extracciones, cirugías abdominales y ortopédicas.',
          imagen: imgCirugias
        },
        {
          id: 6,
          titulo: 'Nutrición y Dietética',
          descripcion: 'Asesoría personalizada por veterinarios nutricionistas. Planes dietéticos para sobrepeso, alergias, enfermedades renales y más.',
          imagen: imgNutricion
        }
      ],
      mostrarAgendar:false
    }
  },
  methods: {
    async irAgendarCita() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        this.$router.push({ name: 'AgendarCita' }) // Redirige al formulario
      } else {
        this.$router.push({ name: 'Login' }) // Redirige a login si no está logeado
      }
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
  padding: 0 1.5rem 2rem;
  color: #555;
  line-height: 1.7;
  font-size: 1rem;
}

.cta {
  text-align: center;
  padding: 6rem 2rem;
  background: #2c3e50;
  color: white;
}

.cta h2 {
  font-size: 2.8rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.cta p {
  font-size: 1.4rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary {
  padding: 1rem 3rem;
  font-size: 1.3rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-3px);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  .hero p {
    font-size: 1.2rem;
  }
  .services-list {
    padding: 3rem 1rem;
    gap: 2rem;
  }
  .service-item h3 {
    font-size: 1.4rem;
  }
  .service-item p {
    font-size: 0.95rem;
  }
  .cta h2 {
    font-size: 2.2rem;
  }
  .cta p {
    font-size: 1.1rem;
  }
  .btn-primary {
    padding: 0.9rem 2rem;
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 4rem 1rem;
  }
  .hero h1 {
    font-size: 2.2rem;
  }
  .services-list {
    grid-template-columns: 1fr;
    padding: 2rem 1rem;
  }
  .cta {
    padding: 4rem 1rem;
  }
  .cta h2 {
    font-size: 1.8rem;
  }
}
</style>
