<template>
  <div class="home">
    <!-- Hero Carousel -->
    <section class="carousel-section">
      <AppCarousel />
    </section>

    <!-- Servicios Section -->
    <section class="services-section">
      <ServiciosList />
    </section>

    <!-- Equipo Section -->
    <section class="team-section">
      <EquipoVeterinarios />
    </section>

    <!-- Testimonios Section -->
    <section class="testimonials-section">
      <Testimonios />
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <h2 class="cta-title">¿Listo para cuidar de tu mejor amigo?</h2>
      <p class="cta-subtitle">
        Agenda una consulta hoy y recibe un <strong>10% de descuento</strong> en tu primera visita.
      </p>
      <button class="btn-primary" @click="scrollToContact">Agendar cita ahora</button>
    </section>
  </div>
</template>

<script setup>
import AppCarousel from '@/components/features/AppCarousel.vue'
import ServiciosList from '@/components/features/ServiciosList.vue'
import EquipoVeterinarios from '@/components/features/EquipoVeterinarios.vue'
import Testimonios from '@/components/features/Testimonios.vue'

// Función para desplazarse suavemente a la sección de contacto
const scrollToContact = () => {
  const contactSection = document.getElementById('contact')
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.home {
  overflow-x: hidden;
}

/* --- Sección de Hero Carousel --- */
.carousel-section {
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa, #e8f5e9);
  margin-bottom: 0;
}

/* --- Sección de Servicios --- */
.services-section {
  padding: 6rem 2rem;
  background-color: #ffffff;
}

/* --- Sección de Equipo --- */
.team-section {
  padding: 6rem 2rem;
  background-color: #f8f9fa;
  position: relative;
  overflow: hidden;
}

.team-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 120%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(52, 152, 219, 0.08), transparent 70%);
  z-index: -1;
  border-radius: 50%;
}

/* --- Sección de Testimonios --- */
.testimonials-section {
  padding: 6rem 2rem;
  background-color: #ffffff;
}

/* --- CTA Section --- */
.cta-section {
  text-align: center;
  padding: 8rem 2rem;
  background: linear-gradient(135deg, #e8f5e9, #f0f7ff);
  margin-top: 4rem;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(52, 152, 219, 0.15), transparent 70%);
  border-radius: 50%;
  z-index: -1;
}

.cta-title {
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.cta-subtitle {
  font-size: 1.4rem;
  color: #555;
  margin-bottom: 2.5rem;
  max-width: 750px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
}

.btn-primary {
  padding: 1.2rem 3.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(52, 152, 219, 0.35);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.btn-primary:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(52, 152, 219, 0.45);
  background: linear-gradient(135deg, #2980b9, #2573a7);
}

.btn-primary:active {
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .carousel-section {
    padding: 1rem;
  }

  .cta-title {
    font-size: 2.4rem;
  }

  .cta-subtitle {
    font-size: 1.2rem;
  }

  .btn-primary {
    padding: 1rem 2.5rem;
    font-size: 1.2rem;
  }

  .services-section,
  .team-section,
  .testimonials-section {
    padding: 4rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .cta-title {
    font-size: 2rem;
  }

  .cta-section {
    padding: 6rem 1rem;
  }

  .carousel-section {
    padding: 0.5rem;
  }
}
</style>
