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
      <button class="btn-primary" @click="scrollToContact">Agendar cita</button>
    </section>
  </div>
</template>

<script setup>
import AppCarousel from '@/components/features/AppCarousel.vue'
import ServiciosList from '@/components/features/ServiciosList.vue'
import EquipoVeterinarios from '@/components/features/EquipoVeterinarios.vue'
import Testimonios from '@/components/features/Testimonios.vue'

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
.home {
  overflow-x: hidden;
}

/* --- Sección de Hero Carousel --- */
.carousel-section {
  padding: 1rem 0; /* espacio vertical mínimo */
  background-color: #fafafa;
  margin-bottom: 0;
}

/* --- Sección de Servicios --- */
.services-section {
  padding: 1.5rem 2rem; /* menos espacio vertical */
  background-color: #ffffff;
}

/* --- Sección de Equipo --- */
.team-section {
  padding: 1.5rem 2rem;
  background-color: #fafafa;
  position: relative;
  overflow: hidden;
}

.team-section::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -40%;
  width: 100%;
  height: 180%;
  background: radial-gradient(circle at center, rgba(0, 140, 158, 0.05), transparent 70%);
  z-index: -1;
  border-radius: 50%;
}

/* --- Sección de Testimonios --- */
.testimonials-section {
  padding: 1.5rem 2rem;
  background-color: #ffffff;
}

/* --- CTA Section --- */
.cta-section {
  text-align: center;
  padding: 2rem 2rem; /* espacio vertical reducido */
  background-color: #f8f9fa;
  margin-top: 0;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(0, 140, 158, 0.1), transparent 70%);
  border-radius: 50%;
  z-index: -1;
}

.cta-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -0.5px;
  font-family: 'Minimalust', system-ui, sans-serif;
}

.cta-subtitle {
  font-size: 1.4rem;
  color: #555;
  margin-bottom: 2rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 300;
  line-height: 1.5;
  font-family: 'Minimalust', system-ui, sans-serif;
}

.btn-primary {
  padding: 0.9rem 2.5rem;
  font-size: 1.2rem;
  font-weight: 300;
  background: transparent;
  color: #008c9e;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: -0.1px;
  font-family: inherit;
  box-shadow: none;
}

.btn-primary:hover {
  background: rgba(0, 140, 158, 0.05);
  border-color: #008c9e;
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

/* --- Responsive Design --- */
@media (max-width: 768px) {
  .carousel-section {
    padding: 0.8rem 0;
  }

  .services-section,
  .team-section,
  .testimonials-section {
    padding: 1rem 1.5rem;
  }

  .cta-section {
    padding: 1.5rem 1.5rem;
  }

  .cta-title {
    font-size: 2.2rem;
  }

  .cta-subtitle {
    font-size: 1.3rem;
  }

  .btn-primary {
    padding: 0.8rem 2rem;
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .carousel-section {
    padding: 0.5rem 0;
  }

  .cta-section {
    padding: 1rem 1rem;
  }

  .cta-title {
    font-size: 1.8rem;
  }

  .cta-subtitle {
    font-size: 1.1rem;
  }

  .btn-primary {
    padding: 0.7rem 1.8rem;
    font-size: 1rem;
  }
}

</style>
