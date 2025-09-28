<template>
  <div class="modal-backdrop">
    <div class="modal">
      <h3>Registrar nueva mascota</h3>

      <label>Nombre:</label>
      <input v-model="nombre" placeholder="Ingresa el nombre" />

      <label>Especie:</label>
      <select v-model="especie">
        <option>perro</option>
        <option>gato</option>
        <option>conejo</option>
        <option>hámster</option>
        <option>ave</option>
        <option>reptil</option>
        <option>otros</option>
      </select>

      <label>Raza:</label>
      <input v-model="raza" placeholder="Ingresa la raza" />

      <label>Fecha de nacimiento:</label>
      <input type="date" v-model="fecha_nacimiento" />

      <label>Peso (kg):</label>
      <input type="number" step="0.01" v-model="peso_kg" placeholder="0.00" />

      <label>Sexo:</label>
      <select v-model="sexo">
        <option>macho</option>
        <option>hembra</option>
        <option>castrado</option>
        <option>esterilizado</option>
      </select>

      <label>Alergias:</label>
      <input v-model="alergias" placeholder="Describe alergias si aplica" />

      <label>Notas médicas:</label>
      <textarea v-model="notas_medicas" placeholder="Notas médicas adicionales"></textarea>

      <div class="buttons">
        <button class="btn-primary" @click="guardarMascota">Guardar</button>
        <button class="btn-secondary" @click="$emit('cerrar')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  data() {
    return {
      nombre: '',
      especie: 'perro',
      raza: '',
      fecha_nacimiento: '',
      peso_kg: '',
      sexo: 'macho',
      alergias: '',
      notas_medicas: ''
    }
  },
  methods: {
    async guardarMascota() {
      if (!this.nombre.trim()) return alert("Debes ingresar un nombre para la mascota");

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return alert("Debes iniciar sesión");

      const { data, error } = await supabase.from('mascotas')
        .insert([{
          usuario_id: user.user.id,
          nombre: this.nombre,
          especie: this.especie,
          raza: this.raza,
          fecha_nacimiento: this.fecha_nacimiento,
          peso_kg: this.peso_kg || null,
          sexo: this.sexo,
          alergias: this.alergias || null,
          notas_medicas: this.notas_medicas || null
        }])
        .select().single()

      if (error) return alert(error.message)
      this.$emit('nueva', data)

      // Reset form
      this.nombre = ''
      this.raza = ''
      this.fecha_nacimiento = ''
      this.peso_kg = ''
      this.alergias = ''
      this.notas_medicas = ''
      this.especie = 'perro'
      this.sexo = 'macho'
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: flex-start; /* importante para que no se tape con navbar */
  padding: 2rem 1rem;
  z-index: 1000;
  overflow-y: auto; /* scroll si la pantalla es pequeña */
}

.modal {
  background: #fff;
  color: #000;
  border-radius: var(--radius);
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: calc(100vh - 4rem); /* no sobrepasa la pantalla */
  overflow-y: auto; /* scroll interno si el contenido es largo */
  box-shadow: 0 6px 20px rgba(0, 128, 150, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal h3 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

label {
  color: #1e293b;
  font-weight: 500;
  margin-bottom: 0.3rem;
}

input, select, textarea {
  font-family: inherit;
  font-size: 1rem;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: #fff;
  color: #1e293b;
  outline: none;
  transition: border-color var(--transition);
  width: 100%;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--color-accent);
}

textarea {
  min-height: 80px;
  resize: vertical;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

button {
  padding: 0.8rem 2rem;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  border: none;
}

.btn-primary {
  background: var(--color-accent);
  color: #fff;
}

.btn-primary:hover {
  background: #005f6b;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: var(--color-accent);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: rgba(0, 128, 150, 0.1);
}

/* Responsivo */
@media (max-width: 600px) {
  .modal {
    padding: 1rem;
    max-width: 100%;
  }

  button {
    width: 100%;
    text-align: center;
  }

  .buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
