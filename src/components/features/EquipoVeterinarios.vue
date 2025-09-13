<!-- src/components/EquipoVeterinarios.vue -->
<template>
  <section class="team-section">
    <h2>Nuestro Equipo de Veterinarios</h2>
    <div class="team-grid">
      <div class="team-card" v-for="veterinario in veterinarios" :key="veterinario.id">
        <img :src="veterinario.imagen" :alt="veterinario.nombre" />
        <h3>{{ veterinario.nombre }}</h3>
        <p class="specialty">{{ veterinario.especialidad }}</p>
        <p>{{ veterinario.experiencia }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
// ✅ Importamos las imágenes usando ES Modules
import vet1 from '@/assets/logo.png'
import vet2 from '@/assets/logo.png'
import vet3 from '@/assets/logo.png'
import vet4 from '@/assets/logo.png'

// ✅ Creamos el array de veterinarios directamente
const veterinarios = [
  {
    id: 1,
    nombre: 'Dr. Jhosmar Nina Cordova',
    especialidad: 'Cirugía Veterinaria',
    experiencia: '12 años de experiencia',
    imagen: vet1
  },
  {
    id: 2,
    nombre: 'Dr. Ricardo Limachi',
    especialidad: 'Medicina Interna',
    experiencia: '10 años de experiencia',
    imagen: vet2
  },
  {
    id: 3,
    nombre: 'Dr. Samuel Jimenez',
    especialidad: 'Emergencias y Urgencias',
    experiencia: '8 años de experiencia',
    imagen: vet3
  },
  {
    id: 4,
    nombre: 'Dr. Gabriel Haches',
    especialidad: 'Peluquería y Cuidado Estético',
    experiencia: '6 años de experiencia',
    imagen: vet4
  },
  {
    id: 5,
    nombre: 'Dr. Juan Calani',
    especialidad: 'Tratamientos y Fisioterapia',
    experiencia: '3 años de experiencia',
    imagen: vet4
  }
]
</script>

<style scoped>
.team-section {
  padding: 5rem 2rem;
  text-align: center;
  background-color: #f9f9f9;
  font-family: 'Inter', sans-serif;
}

.team-section h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 3rem;
  font-weight: 500;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.team-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.team-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.team-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
}

.team-card h3 {
  margin: 1.5rem 1rem 0.5rem;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 500;
}

.specialty {
  color: #3498db;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.team-card p {
  color: #555;
  margin: 0 1.5rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 300;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .team-section {
    padding: 3rem 1.5rem;
  }

  .team-section h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .team-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .team-card {
    max-width: 320px;
    margin: 0 auto;
  }

  .team-card img {
    height: 220px;
  }
}

@media (max-width: 480px) {
  .team-section {
    padding: 2rem 1rem;
  }

  .team-section h2 {
    font-size: 1.8rem;
  }

  .team-card h3 {
    font-size: 1.2rem;
  }

  .specialty {
    font-size: 0.9rem;
  }

  .team-card p {
    font-size: 0.85rem;
  }
}
</style>
