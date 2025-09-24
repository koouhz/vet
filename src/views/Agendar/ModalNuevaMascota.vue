<template>
  <div class="modal-backdrop">
    <div class="modal">
      <h3>Registrar nueva mascota</h3>

      <label>Nombre:</label>
      <input v-model="nombre" />

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
      <input v-model="raza" />

      <label>Fecha de nacimiento:</label>
      <input type="date" v-model="fecha_nacimiento" />

      <label>Peso (kg):</label>
      <input type="number" step="0.01" v-model="peso_kg" />

      <label>Sexo:</label>
      <select v-model="sexo">
        <option>macho</option>
        <option>hembra</option>
        <option>castrado</option>
        <option>esterilizado</option>
      </select>

      <label>Alergias:</label>
      <input v-model="alergias" />

      <label>Notas médicas:</label>
      <textarea v-model="notas_medicas"></textarea>

      <div class="buttons">
        <button @click="guardarMascota">Guardar</button>
        <button @click="$emit('cerrar')">Cancelar</button>
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
      this.$emit('cerrar')
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.5);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:999;
}
.modal {
  background:white;
  padding:2rem;
  border-radius:10px;
  width:350px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:0 5px 20px rgba(0,0,0,0.3);
  display:flex;
  flex-direction: column;
  gap:0.7rem;
}
.modal label {
  font-weight:600;
}
.modal input, .modal select, .modal textarea {
  padding:0.4rem 0.6rem;
  border-radius:5px;
  border:1px solid #ccc;
  font-size:0.95rem;
  width:100%;
}
.modal textarea {
  resize: vertical;
  min-height: 50px;
}
.buttons {
  margin-top:1rem;
  display:flex;
  justify-content:space-between;
}
.buttons button {
  padding:0.5rem 1.2rem;
  border:none;
  border-radius:50px;
  cursor:pointer;
  font-weight:600;
  color:white;
  transition:0.3s;
}
.buttons button:first-child { background:#3498db; }
.buttons button:first-child:hover { background:#2980b9; }
.buttons button:last-child { background:#e74c3c; }
.buttons button:last-child:hover { background:#c0392b; }
</style>
