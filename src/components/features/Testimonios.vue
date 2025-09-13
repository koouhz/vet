<template>
  <section class="testimonials-section">
    <h2>Lo que dicen nuestros clientes</h2>
    <div class="testimonials-grid">
      <div class="testimonial-card" v-for="testimonio in testimonios" :key="testimonio.id">
        <div class="testimonial-content">
          <p class="testimonial-text">"{{ testimonio.contenido }}"</p>
        </div>
        <div class="testimonial-author">
          <img :src="testimonio.foto" :alt="testimonio.nombre" class="author-photo" />
          <div class="author-info">
            <h4 class="author-name">{{ testimonio.nombre }}</h4>
            <p class="author-pet">{{ testimonio.mascota }}</p>
            <p class="testimonial-date">{{ testimonio.fecha }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TestimonialSection',
  data() {
    return {
      testimonios: [
        {
          id: 1,
          contenido: "Mi perrito Leo tuvo una emergencia y la atención fue increíble. Están siempre disponibles, compasivos y profesionales. ¡Gracias por salvarle la vida!",
          nombre: "María G.",
          mascota: "Leo, Pastor Alemán",
          fecha: "Enero 2025",
          foto: new URL('@/assets/logo.png', import.meta.url).href
        },
        {
          id: 2,
          contenido: "Llevo a mi gato Whiskers aquí desde que era cachorro. Nunca he visto un equipo tan atento y detallista. La peluquería también es perfecta.",
          nombre: "Carlos R.",
          mascota: "Whiskers, Persa",
          fecha: "Diciembre 2024",
          foto: new URL('@/assets/logo.png', import.meta.url).href
        },
        {
          id: 3,
          contenido: "Después de perder a mi perro hace dos años, pensé que no volvería a confiar... pero Veterinaria Paws me devolvió la fe. Gracias por su humanidad.",
          nombre: "Ana M.",
          mascota: "Buddy, Golden Retriever",
          fecha: "Noviembre 2024",
          foto: new URL('@/assets/logo.png', import.meta.url).href
        }
      ]
    }
  }
}
</script>

<style scoped>
.testimonials-section {
  padding: 5rem 2rem;
  text-align: center;
  background-color: #f9f9f9;
  font-family: 'Inter', sans-serif;
}

.testimonials-section h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 3rem;
  font-weight: 500;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.testimonial-content {
  margin-bottom: 2rem;
}

.testimonial-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  font-weight: 300;
  font-style: italic;
  margin: 0;
  text-align: left;
}

.testimonial-author {
  display: flex;
  align-items: center;
  text-align: left;
}

.author-photo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
  border: 3px solid #f0f0f0;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 0.2rem 0;
}

.author-pet {
  font-size: 0.9rem;
  color: #3498db;
  font-weight: 400;
  margin: 0 0 0.2rem 0;
}

.testimonial-date {
  font-size: 0.85rem;
  color: #777;
  font-weight: 300;
  margin: 0;
}

@media (max-width: 1024px) {
  .testimonials-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .testimonial-card {
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .testimonials-section {
    padding: 4rem 1.5rem;
  }

  .testimonials-section h2 {
    font-size: 2rem;
    margin-bottom: 2.5rem;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 500px;
  }

  .testimonial-card {
    padding: 2rem;
  }

  .testimonial-text {
    font-size: 1rem;
  }

  .author-photo {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .testimonials-section {
    padding: 3rem 1rem;
  }

  .testimonials-section h2 {
    font-size: 1.8rem;
  }

  .testimonial-card {
    padding: 1.5rem;
  }

  .testimonial-author {
    flex-direction: column;
    text-align: center;
  }

  .author-photo {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .testimonial-text {
    font-size: 0.95rem;
  }

  .author-name {
    font-size: 1rem;
  }

  .author-pet {
    font-size: 0.85rem;
  }

  .testimonial-date {
    font-size: 0.8rem;
  }
}
</style>
