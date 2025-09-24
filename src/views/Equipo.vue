<!-- src/views/Equipo.vue -->
<template>
  <div class="equipo">
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
        "Lo que nos distingue no es solo la tecnología, sino el corazón con el que tratamos a cada mascota y a cada dueño."
      </blockquote>
      <cite>— Dr. Jhosmar Alejandro Nina Cordova</cite>
    </section>
  </div>
</template>

<script>
// Importar imágenes
import vet1 from '@/assets/img/personal4.png'
import vet2 from '@/assets/img/personal3.png'
import vet3 from '@/assets/img/personal1.png'
import vet4 from '@/assets/img/personal2.png'
import vet5 from '@/assets/img/yooo.jpg'

export default {
  name: 'EquipoView',
  data() {
    return {
      veterinarios: [
        {
          id: 1,
          nombre: 'Dr. Jhosmar Nina Cordova',
          especialidad: 'Cirugía Veterinaria',
          experiencia: '12 años de experiencia',
          bio: 'Especialista en cirugía ortopédica y laparoscópica. Ha realizado más de 2000 procedimientos exitosos.',
          imagen: vet1
        },
        {
          id: 2,
          nombre: 'Dr. Ricardo Limachi',
          especialidad: 'Medicina Interna',
          experiencia: '10 años de experiencia',
          bio: 'Experto en enfermedades crónicas, endocrinología y manejo de diabetes en mascotas. Apasionado por la prevención.',
          imagen: vet2
        },
        {
          id: 3,
          nombre: 'Dr. Samuel Jimenez',
          especialidad: 'Emergencias y Urgencias',
          experiencia: '8 años de experiencia',
          bio: 'Líder del equipo de urgencias 24/7. Entrenada en RCP canino y manejo de toxicologías complejas.',
          imagen: vet3
        },
        {
          id: 4,
          nombre: 'Dr. Gabriel Haches',
          especialidad: 'Peluquería y Cuidado Estético',
          experiencia: '6 años de experiencia',
          bio: 'Certificado en grooming avanzado y salud cutánea. Conoce a fondo las necesidades de cada raza.',
          imagen: vet4
        },
        {
          id: 5,
          nombre: 'Dr. Juan Calani',
          especialidad: 'Tratamientos y Fisioterapia',
          experiencia: '3 años de experiencia',
          bio: 'Certificado en fisiología y cuidado animal.',
          imagen: vet5
        }
      ]
    }
  }
}
</script>

<style scoped>
.equipo {
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
    gap: 2rem;
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
