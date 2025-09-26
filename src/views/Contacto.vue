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
          <input type="hidden" name="_captcha" value="false" />
          <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input type="text" id="nombre" name="Nombre" v-model="form.nombre" required />
          </div>
          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" name="Email" v-model="form.email" required />
          </div>
          <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input type="tel" id="telefono" name="Teléfono" v-model="form.telefono" />
          </div>
          <div class="form-group">
            <label for="mascota">Nombre de tu mascota</label>
            <input type="text" id="mascota" name="Mascota" v-model="form.mascota" />
          </div>
          <div class="form-group">
            <label for="mensaje">Mensaje *</label>
            <textarea id="mensaje" name="Mensaje" v-model="form.mensaje" rows="5" required></textarea>
          </div>
          <button type="submit" class="btn-primary">Enviar mensaje</button>
          <p v-if="mensajeEnviado" class="success-message">
            ¡Gracias! Nos pondremos en contacto contigo pronto.
          </p>
        </form>
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
          <p>✉ contacto@veterinariapaws.com</p>
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
    async enviarMensaje() {
      const data = new FormData()
      data.append('Nombre', this.form.nombre)
      data.append('Email', this.form.email)
      data.append('Teléfono', this.form.telefono)
      data.append('Mascota', this.form.mascota)
      data.append('Mensaje', this.form.mensaje)
      data.append('_captcha', 'false')

      try {
        await fetch('https://formsubmit.co/vetcare2509@gmail.com', {
          method: 'POST',
          body: data
        })
        this.mensajeEnviado = true

        // Limpiar formulario
        this.form = { nombre: '', email: '', telefono: '', mascota: '', mensaje: '' }

        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
          this.mensajeEnviado = false
        }, 5000)
      } catch (error) {
        alert('Hubo un error al enviar el mensaje. Intenta nuevamente.')
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.contacto { background-color: #f8f9fa; font-family: 'Inter', sans-serif; min-height: calc(100vh - 120px); }
.hero { background: linear-gradient(135deg, #03252b 0%, #0a4a56 100%); color:white; padding:6rem 2rem; text-align:center; }
.hero-content { max-width:800px; margin:0 auto; }
.hero h1 { font-size:3rem; margin-bottom:1rem; font-weight:700; }
.hero p { font-size:1.4rem; max-width:800px; margin:0 auto; color:rgba(255,255,255,0.9); line-height:1.6; }
.contact-grid { display:grid; grid-template-columns:1fr 1fr; max-width:1200px; margin:0 auto; padding:4rem 1rem; gap:0; }
.contact-form, .contact-info { padding:3rem; background:white; }
.contact-form { border-right:1px solid #f0f0f0; }
.contact-form h2, .contact-info h2 { text-align:center; color:#2c3e50; margin-bottom:2rem; font-size:1.8rem; font-weight:600; }
.form-group { margin-bottom:1.8rem; }
.form-group label { display:block; margin-bottom:0.6rem; color:#2c3e50; font-weight:500; }
.form-group input, .form-group textarea { width:100%; padding:1rem; border:1px solid #e1e8ed; border-radius:8px; font-size:1rem; background:#f8f9fa; color:black; transition:border-color 0.3s; }
.form-group input:focus, .form-group textarea:focus { outline:none; border-color:#3498db; box-shadow:0 0 0 3px rgba(52,152,219,0.1); }
.form-group textarea { resize:vertical; min-height:120px; }
.btn-primary { width:100%; padding:1.2rem; font-size:1.1rem; background:#3498db; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; transition:all 0.3s; margin-top:0.5rem; }
.btn-primary:hover { background:#2980b9; transform:translateY(-2px); }
.success-message { color:#27ae60; font-size:1rem; margin-top:1.5rem; padding:1rem; background:rgba(39,174,96,0.1); border-radius:8px; text-align:center; font-weight:500; }
.contact-info { display:flex; flex-direction:column; gap:1.5rem; }
.info-item { padding-bottom:1.5rem; border-bottom:1px solid #f0f0f0; }
.info-item:last-child { border-bottom:none; }
.info-item p { color:#555; margin:0.5rem 0; line-height:1.6; }
.info-item strong { color:#2c3e50; }
.map-placeholder { margin:1.5rem 0; border-radius:10px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
.map-placeholder img { width:100%; height:300px; object-fit:cover; display:block; }
.map-link { display:inline-block; color:#3498db; text-decoration:none; font-weight:500; margin-top:1rem; transition:color 0.3s; padding:0.5rem 0; }
.map-link:hover { color:#2980b9; }
@media (max-width:968px) { .contact-grid { grid-template-columns:1fr; gap:2rem; padding:3rem 1rem; } .contact-form { border-right:none; border-bottom:1px solid #f0f0f0; } .contact-form, .contact-info { padding:2.5rem; } }
@media (max-width:768px) { .hero { padding:3rem 1rem; } .hero h1 { font-size:2.5rem; } .hero p { font-size:1.2rem; } .contact-grid { padding:2rem 1rem; } .contact-form, .contact-info { padding:2rem; } .contact-form h2, .contact-info h2 { font-size:1.6rem; margin-bottom:1.5rem; } .map-placeholder img { height:220px; } }
@media (max-width:480px) { .hero { padding:2.5rem 1rem; } .hero h1 { font-size:2rem; } .contact-form, .contact-info { padding:1.5rem; } .form-group input, .form-group textarea { padding:0.9rem; } .btn-primary { padding:1.1rem; font-size:1rem; } .map-placeholder img { height:200px; } .info-item { padding-bottom:1.2rem; } }
</style>
