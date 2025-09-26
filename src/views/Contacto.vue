<!-- src/views/Contacto.vue -->
<template>
  <div class="contacto">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <h1>Contáctanos</h1>
        <p>Estamos aquí para ayudarte. Escríbenos, llámanos o visítanos en persona.</p>
      </div>
    </section>

    <!-- Grid: Formulario + Mapa -->
    <section class="contact-grid">
      <div class="contact-form">
        <h2>Envíanos un mensaje</h2>
        <form @submit.prevent="enviarMensaje">
          <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input type="text" id="nombre" v-model="form.nombre" required />
          </div>
          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" v-model="form.email" required />
          </div>
          <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input type="tel" id="telefono" v-model="form.telefono" />
          </div>
          <div class="form-group">
            <label for="mascota">Nombre de tu mascota</label>
            <input type="text" id="mascota" v-model="form.mascota" />
          </div>
          <div class="form-group">
            <label for="mensaje">Mensaje *</label>
            <textarea id="mensaje" v-model="form.mensaje" rows="5" required></textarea>
          </div>
          <button type="submit" class="btn-primary">Enviar mensaje</button>
        </form>
        <p v-if="mensajeEnviado" class="success-message">¡Gracias! Nos pondremos en contacto contigo pronto.</p>
      </div>

      <div class="contact-info">
        <h2>Visítanos</h2>
        <div class="info-item">
          <p><strong>Veterinaria Paws</strong></p>
          <p>Calle Veterinaria 123, Ciudad</p>
        </div>
        <div class="info-item">
          <p>📞 (555) 123-4567</p>
        </div>
        <div class="info-item">
          <p>✉️ contacto@veterinariapaws.com</p>
        </div>
        <div class="info-item">
          <p><strong>Horarios</strong></p>
          <p>Lun-Vie: 8 AM – 8 PM</p>
          <p>Sáb: 9 AM – 6 PM</p>
          <p>Dom: 10 AM – 4 PM</p>
        </div>

        <div class="map-placeholder">
          <img :src="mapaImg" alt="Ubicación Veterinaria Paws" />
        </div>

        <a href="https://www.google.com/maps" target="_blank" class="map-link">Ver en Google Maps →</a>
      </div>
    </section>
  </div>
</template>

<script>
import mapaImg from '@/assets/img/map.png'

export default {
  name: 'ContactoView',
  data() {
    return {
      form: {
        nombre: '',
        email: '',
        telefono: '',
        mascota: '',
        mensaje: ''
      },
      mensajeEnviado: false,
      mapaImg
    }
  },
  methods: {
    enviarMensaje() {
      console.log('Formulario enviado:', this.form)
      this.mensajeEnviado = true

      // Resetear formulario
      Object.assign(this.form, {
        nombre: '',
        email: '',
        telefono: '',
        mascota: '',
        mensaje: ''
      })

      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        this.mensajeEnviado = false
      }, 5000)
    }
  }
}
</script>

<style scoped>
.contacto {
  background-color: #f8f9fa;
  min-height: calc(100vh - 120px);
  font-family: 'Inter', sans-serif;
}

/* Hero Section - Ajustado para coincidir con otras vistas */
.hero {
  background: linear-gradient(135deg, #03252b 0%, #0a4a56 100%);
  color: white;
  padding: 6rem 2rem; /* Aumentado de 4rem a 6rem para coincidir */
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3rem; /* Aumentado de 2.5rem a 3rem para coincidir */
  margin-bottom: 1rem;
  font-weight: 700; /* Aumentado de 600 a 700 para coincidir */
}

.hero p {
  font-size: 1.4rem; /* Aumentado de 1.2rem a 1.4rem para coincidir */
  max-width: 800px; /* Aumentado de 600px a 800px para coincidir */
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

/* Contact Grid */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1rem;
  gap: 0;
}

.contact-form,
.contact-info {
  padding: 3rem;
  background: white;
}

.contact-form {
  border-right: 1px solid #f0f0f0;
}

.contact-form h2,
.contact-info h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.8rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.6rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background: #f8f9fa;
  color: black;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.btn-primary {
  width: 100%;
  padding: 1.2rem;
  font-size: 1.1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  margin-top: 0.5rem;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.success-message {
  color: #27ae60;
  font-size: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

/* Contact Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item p {
  color: #555;
  margin: 0.5rem 0;
  line-height: 1.6;
}

.info-item strong {
  color: #2c3e50;
}

/* Map Styles - Reducido de 450px a 300px pero manteniendo propiedades */
.map-placeholder {
  margin: 1.5rem 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.map-placeholder img {
  width: 100%;
  height: 300px; /* Reducido de 450px a 300px */
  object-fit: cover;
  display: block;
}

.map-link {
  display: inline-block;
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
  transition: color 0.3s ease;
  padding: 0.5rem 0;
}

.map-link:hover {
  color: #2980b9;
}

/* Responsive Design */
@media (max-width: 968px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 3rem 1rem;
  }

  .contact-form {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }

  .contact-form,
  .contact-info {
    padding: 2.5rem;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 3rem 1rem; /* Ajustado para vista móvil */
  }

  .hero h1 {
    font-size: 2.5rem; /* Ajustado para vista móvil */
  }

  .hero p {
    font-size: 1.2rem; /* Ajustado para vista móvil */
  }

  .contact-grid {
    padding: 2rem 1rem;
  }

  .contact-form,
  .contact-info {
    padding: 2rem;
  }

  .contact-form h2,
  .contact-info h2 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }

  .map-placeholder img {
    height: 220px; /* Ajustado para vista móvil */
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 2.5rem 1rem;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .contact-form,
  .contact-info {
    padding: 1.5rem;
  }

  .form-group input,
  .form-group textarea {
    padding: 0.9rem;
  }

  .btn-primary {
    padding: 1.1rem;
    font-size: 1rem;
  }

  .map-placeholder img {
    height: 200px; /* Ajustado para vista móvil */
  }

  .info-item {
    padding-bottom: 1.2rem;
  }
}
</style>
