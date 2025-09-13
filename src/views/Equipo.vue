<!-- src/views/Equipo.vue -->
<template>
  <div class="equipo">
    <AppNavbar />

    <!-- Hero -->
    <section class="hero">
      <h1>Nuestro Equipo</h1>
      <p>Veterinarios apasionados, comprometidos y con años de experiencia cuidando de tus mejores amigos.</p>
    </section>

    <!-- Lista de veterinarios -->
    <section class="team-grid">
      <div class="team-card" v-for="veterinario in veterinarios" :key="veterinario.id">
        <img :src="veterinario.imagen" :alt="veterinario.nombre" />
        <h3>{{ veterinario.nombre }}</h3>
        <p class="specialty">{{ veterinario.especialidad }}</p>
        <p class="experience">{{ veterinario.experiencia }}</p>
        <p class="bio">{{ veterinario.bio }}</p>
      </div>
    </section>

    <!-- Testimonio interno -->
    <section class="testimonial">
      <blockquote>
        “Lo que nos distingue no es solo la tecnología, sino el corazón con el que tratamos a cada mascota y a cada dueño.”
      </blockquote>
      <cite>— Dra. María López, Directora Médica</cite>
    </section>

    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from '@/components/layouts/AppNavbar.vue'
import AppFooter from '@/components/layouts/AppFooter.vue'

// Importar imágenes con import (evita ESLint)
import vet1 from '@/assets/logo.png'
import vet2 from '@/assets/logo.png'
import vet3 from '@/assets/logo.png'
import vet4 from '@/assets/logo.png'

export default {
  name: 'EquipoSection',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      veterinarios: [
        {
          id: 1,
          nombre: 'Dra. María López',
          especialidad: 'Cirugía Veterinaria',
          experiencia: '12 años de experiencia',
          bio: 'Especialista en cirugía ortopédica y laparoscópica. Ha realizado más de 2000 procedimientos exitosos.',
          imagen: vet1
        },
        {
          id: 2,
          nombre: 'Dr. Carlos Ruiz',
          especialidad: 'Medicina Interna',
          experiencia: '10 años de experiencia',
          bio: 'Experto en enfermedades crónicas, endocrinología y manejo de diabetes en mascotas. Apasionado por la prevención.',
          imagen: vet2
        },
        {
          id: 3,
          nombre: 'Dra. Ana Torres',
          especialidad: 'Emergencias y Urgencias',
          experiencia: '8 años de experiencia',
          bio: 'Líder del equipo de urgencias 24/7. Entrenada en RCP canino y manejo de toxicologías complejas.',
          imagen: vet3
        },
        {
          id: 4,
          nombre: 'Dr. Luis García',
          especialidad: 'Peluquería y Cuidado Estético',
          experiencia: '6 años de experiencia',
          bio: 'Certificado en grooming avanzado y salud cutánea. Conoce a fondo las necesidades de cada raza.',
          imagen: vet4
        }
      ]
    }
  }
}
</script>

<style scoped>
.equipo {
  background-color: #f8f9fa;
}

.hero {
  text-align: center;
  padding: 6rem 2rem;
  background: #03252b;
  color: #2c3e50;
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

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 3rem;
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.team-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
}

.team-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.team-card img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.team-card h3 {
  margin: 1.8rem 0 0.5rem;
  color: #2c3e50;
  font-size: 1.6rem;
  font-weight: 600;
}

.specialty {
  color: #3498db;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.experience {
  color: #7f8c8d;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.bio {
  padding: 0 1.5rem 2rem;
  color: #555;
  line-height: 1.7;
  font-size: 0.95rem;
}

.testimonial {
  text-align: center;
  padding: 5rem 2rem;
  background: #f0f7ff;
  border-top: 1px solid #e0e7ff;
}

.testimonial blockquote {
  font-size: 1.8rem;
  font-style: italic;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 500;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.testimonial cite {
  color: #3498db;
  font-size: 1.3rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  .hero p {
    font-size: 1.2rem;
  }

  .team-grid {
    padding: 3rem 1rem;
  }

  .team-card img {
    height: 250px;
  }

  .team-card h3 {
    font-size: 1.4rem;
  }

  .testimonial blockquote {
    font-size: 1.5rem;
  }

  .testimonial cite {
    font-size: 1.1rem;
  }
}
</style>
