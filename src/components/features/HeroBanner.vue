<!-- src/components/HeroBanner.vue -->
<template>
  <section class="hero-banner">
    <div class="hero-content">
      <h1>Cuidamos a tus mascotas</h1>
      <p>Atención profesional, amor y compromiso con la salud de tu mejor amigo.</p>
      <button class="btn-primary">Agendar cita</button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroBanner'
}
</script>

<style scoped>
.hero-banner {
  height: 70vh;
  background-image: url('@/assets/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  position: relative;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  padding: 2rem;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
}

.hero-content p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
}

.btn-primary {
  padding: 0.8rem 2rem;
  font-size: 1.2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #2980b9;
}

@media (max-width: 768px) {
  .hero-banner {
    height: 60vh;
  }
  .hero-content h1 {
    font-size: 2.5rem;
  }
  .hero-content p {
    font-size: 1.2rem;
  }
}
</style>
