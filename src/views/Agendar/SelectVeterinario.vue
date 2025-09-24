<template>
  <div class="select-vet">
    <h3>Elige un veterinario</h3>

    <div v-if="veterinarios.length === 0" class="no-vet">
      <p>No hay veterinarios asignados a este servicio.</p>
    </div>

    <div class="vet-list">
      <div 
        v-for="vet in veterinarios" 
        :key="vet.id" 
        class="vet-card" 
        :class="{ selected: vet.id === modelValue }"
        @click="$emit('update:modelValue', vet.id)"
      >
        <img :src="vet.foto_url || '/default-vet.png'" alt="Foto Veterinario" />
        <div class="vet-info">
          <h4>{{ vet.nombre_completo }}</h4>
          <p class="especialidad">{{ vet.especialidad?.nombre }}</p>
          <p class="experiencia">{{ vet.anos_experiencia }} años de experiencia</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  name: "SelectVeterinario",
  props: {
    servicioId: { type: [String, Number], required: true },
    modelValue: { type: [String, Number], default: '' }
  },
  data() {
    return {
      veterinarios: []
    }
  },
  async created() {
    await this.cargarVeterinarios()
  },
  methods: {
    async cargarVeterinarios() {
      if (!this.servicioId) return

      const { data, error } = await supabase
        .from('servicios_veterinarios')
        .select(`
          id,
          veterinarios(
            id,
            usuario:usuarios(nombre_completo, avatar_url),
            especialidad:especialidades(nombre),
            foto_url,
            anos_experiencia
          )
        `)
        .eq('servicio_id', this.servicioId)
        .eq('is_activo', true)

      if (error) {
        console.error('Error cargando veterinarios:', error)
        return
      }

      // Aplanar datos para usarlos más fácil en el template
      this.veterinarios = data.map(v => {
        const vet = v.veterinarios
        return {
          id: vet.id,
          foto_url: vet.foto_url || vet.usuario?.avatar_url,
          nombre_completo: vet.usuario?.nombre_completo,
          especialidad: vet.especialidad,
          anos_experiencia: vet.anos_experiencia
        }
      })
    }
  }
}
</script>

<style scoped>
.select-vet {
  margin-top: 1rem;
}

.select-vet h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.vet-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.vet-card {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  cursor: pointer;
  display: flex;
  gap: 1rem;
  align-items: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.vet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.vet-card.selected {
  border: 2px solid #3498db;
  background: #ecf6fd;
}

.vet-card img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}

.vet-info h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 700;
}

.vet-info p {
  margin: 0.2rem 0;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.vet-info .especialidad {
  font-weight: 600;
  color: #2980b9;
}

.vet-info .experiencia {
  font-style: italic;
  font-size: 0.85rem;
}
</style>
