<!-- src/components/Footer.vue -->
<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-column">
        <h3>Veterinaria Paws</h3>
        <p>Cuidando la salud de tus mascotas con amor y profesionalismo desde 2015.</p>
      </div>
      <div class="footer-column">
        <h4>Contacto</h4>
        <p>📍 Calle Veterinaria 123, Ciudad</p>
        <p>📞 (555) 123-4567</p>
        <p>✉️ contacto@veterinariavet.com</p>
      </div>
      <div class="footer-column">
        <h4>Horarios</h4>
        <p>Lunes - Viernes: 8:00 AM - 8:00 PM</p>
        <p>Sábados: 9:00 AM - 6:00 PM</p>
        <p>Domingos: 10:00 AM - 4:00 PM</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2025 Veterinaria Vet. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.footer {
  background-color: #03252b;
  color: white;
  padding: 3rem 2rem 1rem;
  font-family: 'Inter', sans-serif;
}

.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 2rem;
}

.footer-column h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #ecf0f1;
  font-weight: 500;
}

.footer-column h4 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #ecf0f1;
  font-weight: 500;
}

.footer-column p {
  margin: 0.5rem 0;
  color: #bdc3c7;
  line-height: 1.6;
  font-weight: 300;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #bdc3c7;
  font-size: 0.9rem;
  font-weight: 300;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
