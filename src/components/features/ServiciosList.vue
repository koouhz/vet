<!-- src/components/ServiciosList.vue -->
<template>
  <section class="services-section">
    <h2>Nuestros Servicios</h2>
    <div class="services-grid">
      <div class="service-card" v-for="servicio in servicios" :key="servicio.id">
        <div class="service-icon">
          {{ servicio.icon }}
        </div>
        <h3>{{ servicio.titulo }}</h3>
        <p>{{ servicio.descripcion }}</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ServiciosList',
  data() {
    return {
      servicios: [
        {
          id: 1,
          titulo: 'Vacunación',
          descripcion: 'Programas completos de vacunación para perros, gatos y pequeños animales.',
          icon: '💉'
        },
        {
          id: 2,
          titulo: 'Consultas Generales',
          descripcion: 'Evaluaciones médicas completas, diagnósticos y seguimiento de salud.',
          icon: '🩺'
        },
        {
          id: 3,
          titulo: 'Peluquería y Higiene',
          descripcion: 'Baño, corte de pelo, recorte de uñas y limpieza dental profesional.',
          icon: '✂️'
        },
        {
          id: 4,
          titulo: 'Emergencias 24/7',
          descripcion: 'Atención inmediata las 24 horas del día, los 7 días de la semana.',
          icon: '🚨'
        },
        {
          id: 5,
          titulo: 'Cirugías',
          descripcion: 'Procedimientos quirúrgicos programados y de emergencia con anestesia segura.',
          icon: '🪓'
        },
        {
          id: 6,
          titulo: 'Nutrición',
          descripcion: 'Asesoría personalizada sobre alimentación según raza, edad y condición.',
          icon: '🍎'
        }
      ]
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

.service-card {
  background: #f9f9f9;
  padding: 2.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);
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

@media (max-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .service-card {
    padding: 2rem 1.5rem;
  }

  .service-icon {
    font-size: 3rem;
    margin-bottom: 1.2rem;
    height: 70px;
  }
}

@media (max-width: 768px) {
  .services-section {
    padding: 4rem 1.5rem;
  }

  .services-section h2 {
    font-size: 2rem;
    margin-bottom: 2.5rem;
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    max-width: 500px;
  }

  .service-card {
    padding: 2rem;
  }

  .service-card h3 {
    font-size: 1.4rem;
  }

  .service-card p {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .services-section {
    padding: 3rem 1rem;
  }

  .services-section h2 {
    font-size: 1.8rem;
  }

  .service-card {
    padding: 1.5rem;
  }

  .service-icon {
    font-size: 2.8rem;
    margin-bottom: 1rem;
    height: 60px;
  }

  .service-card h3 {
    font-size: 1.3rem;
  }

  .service-card p {
    font-size: 0.9rem;
  }
}
</style>
