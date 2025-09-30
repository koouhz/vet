<!-- src/views/reportes/HistorialVeterinario.vue -->
<template>
  <div class="reporte-detalle-container">
    <AppSidebar />
    <main class="main-content">
      <div class="page-header">
        <h1>Historial Veterinario</h1>
        <p class="subtitle">Filtrar atenciones por cliente, mascota, tipo o rango de fechas.</p>
      </div>

      <div class="filtros-card">
        <div class="filtro-group">
          <label for="cliente">Cliente</label>
          <select v-model="filtros.cliente_id" id="cliente" class="filtro-input">
            <option value="">Todos</option>
            <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nombre_completo }}</option>
          </select>
        </div>

        <div class="filtro-group">
          <label>Tipo de atención</label>
          <select v-model="filtros.tipo_atencion" class="filtro-input">
            <option value="">Todos</option>
            <option value="consulta">Consulta</option>
            <option value="procedimiento">Procedimiento</option>
            <option value="cuidado">Cuidado</option>
            <option value="emergencia">Emergencia</option>
          </select>
        </div>

        <div class="filtro-group">
          <label>Fecha inicio</label>
          <input v-model="filtros.fecha_inicio" type="date" class="filtro-input" />
        </div>

        <div class="filtro-group">
          <label>Fecha fin</label>
          <input v-model="filtros.fecha_fin" type="date" class="filtro-input" />
        </div>

        <button @click="aplicarFiltros" class="btn btn--primary">Aplicar</button>
        <button @click="resetFiltros" class="btn btn--outline">Limpiar</button>
      </div>

      <!-- Resultados -->
      <div class="resultados-container" v-if="cargando">
        <p>Cargando...</p>
      </div>
      <div class="resultados-container" v-else-if="errores">
        <div class="error-message">{{ errores }}</div>
      </div>
      <div class="resultados-container" v-else>
        <div class="resultados-header">
          <h3>{{ resultados.length }} registros encontrados</h3>
        </div>
        <div class="tabla-wrapper">
          <table class="tabla-registros">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Mascota</th>
                <th>Veterinario</th>
                <th>Tipo</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in resultados" :key="i">
                <td>{{ r.cliente }}</td>
                <td>{{ r.mascota }}</td>
                <td>{{ r.veterinario }}</td>
                <td>{{ r.tipo_atencion }}</td>
                <td>{{ r.servicio }}</td>
                <td>{{ formatearValor(r.fecha, 'fecha') }}</td>
                <td>{{ r.estado }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppSidebar from '@/components/layouts/AppSidebar.vue'
import { supabase } from '@/lib/supabaseClient'

const filtros = ref({
  cliente_id: null,
  tipo_atencion: null,
  fecha_inicio: '',
  fecha_fin: ''
})

const resultados = ref([])
const cargando = ref(false)
const errores = ref(null)
const clientes = ref([])

const cargarClientes = async () => {
  const { data } = await supabase
    .from('usuarios')
    .select('id, nombre_completo')
    .eq('rol', 'cliente')
    .order('nombre_completo')
  clientes.value = data || []
}

const aplicarFiltros = async () => {
  cargando.value = true
  errores.value = null

  try {
    const { data, error } = await supabase.rpc('obtener_historial_veterinario', {
      p_cliente_id: filtros.value.cliente_id || null,
      p_tipo_atencion: filtros.value.tipo_atencion || null,
      p_fecha_inicio: filtros.value.fecha_inicio || null,
      p_fecha_fin: filtros.value.fecha_fin || null
    })

    if (error) throw error

    resultados.value = data.map(row => ({
      cliente: row.cliente_nombre || '—',
      mascota: `${row.mascota_nombre || '—'} (${row.mascota_especie || '—'})`,
      veterinario: row.veterinario_nombre || '—',
      tipo_atencion: row.tipo_atencion || '—',
      servicio: row.servicio_titulo || '—',
      fecha: row.fecha,
      estado: row.estado
    }))
  } catch (err) {
    errores.value = err.message
  } finally {
    cargando.value = false
  }
}

const resetFiltros = () => {
  filtros.value = {
    cliente_id: null,
    tipo_atencion: null,
    fecha_inicio: '',
    fecha_fin: ''
  }
  resultados.value = []
}

const formatearValor = (val, tipo) => {
  if (!val) return '—'
  if (tipo === 'fecha') return new Date(val).toLocaleDateString('es-ES')
  return String(val)
}

onMounted(() => {
  cargarClientes()
})
</script>

<!-- Mismos estilos que NotasVenta.vue -->
<style scoped>
/* Mantengo tu estética pero mejoro responsividad y legibilidad */
.reporte-detalle-container { display:flex; min-height:100vh; background-color:#f9fafb; }
.main-content { flex:1; padding:2rem; margin-left:260px; }
@media (max-width: 900px) { .main-content { margin-left:0; padding:1rem } }

.page-header h1 { font-size:1.75rem; margin:0 }
.subtitle { color:#64748b; margin-top:0.25rem }

.filtros-card {
  background:white; border-radius:16px; padding:1rem; margin-bottom:1.5rem;
  display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px;
  align-items:end; box-shadow:0 3px 10px rgba(2,6,23,0.06);
}
.filtro-group { display:flex; flex-direction:column; gap:6px }
.filtro-group label { font-size:0.85rem; color:#1e293b; font-weight:600 }
.filtro-input { padding:0.6rem; border:1px solid #e2e8f0; border-radius:8px; font-size:0.95rem; background:#fff }

.section, select, h1, label {
  color: #1e293b;
}
.filtros-acciones { display:flex; gap:8px; align-items:center }
.btn { padding:0.6rem 1rem; border-radius:8px; font-weight:600; cursor:pointer; border:none }
.btn--primary { background:#145a32; color:#eff2f7 }
.btn--outline { background:#fff; color:#1e293b; border:1px solid #e2e8f0 }

.resultados-container { background:white; border-radius:12px; overflow:hidden; box-shadow:0 3px 10px rgba(2,6,23,0.04) }
.resultados-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid #f1f5f9 }
.resultados-header h3 { margin:0; font-size:1rem }
.acciones-export { display:flex; gap:8px }

.loader { padding:16px }
.error-message { padding:12px; color:#c53030; background:#fff5f5 }

.tabla-wrapper { overflow-x:auto; padding:12px }
.tabla-registros { width:100%; border-collapse:collapse; font-size:0.9rem; min-width:900px }
.tabla-registros th, .tabla-registros td { padding:10px 12px; text-align:left; border-bottom:1px solid #f1f5f9 }
.tabla-registros th { background:#f8fafc; font-weight:800; font-size:0.75rem; color:#334155; text-transform:uppercase; letter-spacing:0.02em }
.td-center { text-align:center }
.td-right { text-align:right }

.empty-message { padding:20px; text-align:center; color:#64748b }
.small { padding:6px 8px; font-size:0.85rem }
</style>
