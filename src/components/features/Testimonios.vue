<template>
  <section class="testimonios">
    <h2 class="title">Testimonios Destacados</h2>

    <div v-if="loading" class="loading">Cargando testimonios...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else class="testimonios-list">
      <div v-for="t in testimonios" :key="t.id" class="testimonio-card">
        <div class="contenido">
          <h3 class="cliente">{{ t.nombre_cliente }}</h3>
          <p class="mascota">Mascota: <span>{{ t.nombre_mascota }}</span></p>
          <p class="texto">"{{ t.contenido }}"</p>
        </div>
        <div class="calificacion">⭐ {{ t.calificacion }}/5</div>
      </div>
      <div v-if="testimonios.length === 0" class="no-testimonios">
        No hay testimonios destacados por el momento.
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabaseClient";

export default {
  name: "Testimonios",
  setup() {
    const testimonios = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const cargarTestimonios = async () => {
      loading.value = true;
      error.value = null;

      const { data, error: err } = await supabase
        .from("testimonios")
        .select("*")
        .eq("publicado", true)
        .eq("destacado", true)
        .order("creado_en", { ascending: false })
        .limit(3);

      if (err) {
        console.error("Error al cargar testimonios:", err);
        error.value = "No se pudieron cargar los testimonios. Intente más tarde.";
      } else {
        testimonios.value = data;
      }

      loading.value = false;
    };

    onMounted(() => {
      cargarTestimonios();
    });

    return { testimonios, loading, error };
  }
};
</script>

<style scoped>
.testimonios {
  padding: 3rem 1rem;
  background: #f0f4f8;
}

.title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2rem;
}

.loading, .error, .no-testimonios {
  text-align: center;
  font-size: 1.1rem;
  color: #475569;
  margin: 1rem 0;
}

.testimonios-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.testimonio-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  width: 320px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s, box-shadow 0.2s;
}

.testimonio-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.contenido {
  margin-bottom: 1rem;
}

.cliente {
  font-size: 1.2rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.3rem;
}

.mascota {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 0.7rem;
}

.mascota span {
  font-weight: 500;
  color: #1e293b;
}

.texto {
  font-size: 1rem;
  font-style: italic;
  color: #334155;
}

.calificacion {
  text-align: right;
  font-weight: 600;
  color: #f59e0b;
  font-size: 1rem;
}
</style>
