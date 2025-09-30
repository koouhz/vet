<!-- src/views/reportes/NotasVenta.vue -->
<template>
  <div class="reporte-detalle-container">
    <AppSidebar />
    <main class="main-content">
      <div class="page-header">
        <h1>Notas de Venta</h1>
        <p class="subtitle">Filtrar y exportar ventas por cliente, fecha o producto.</p>
      </div>

      <!-- FILTROS -->
      <section class="filtros-card" aria-label="Filtros de búsqueda">
        <div class="filtro-group">
          <label for="cliente">Cliente</label>
          <select v-model="filtros.cliente_id" id="cliente" class="filtro-input">
            <option value="">Todos los clientes</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.nombre_completo }}
            </option>
          </select>
        </div>

        <div class="filtro-group">
          <label for="producto">Producto</label>
          <select v-model="filtros.producto_id" id="producto" class="filtro-input">
            <option value="">Todos los productos</option>
            <option v-for="prod in productos" :key="prod.id" :value="prod.id">
              {{ prod.nombre }}
            </option>
          </select>
        </div>

        <div class="filtro-group">
          <label for="fecha_inicio">Fecha inicio</label>
          <input v-model="filtros.fecha_inicio" type="date" id="fecha_inicio" class="filtro-input" />
        </div>

        <div class="filtro-group">
          <label for="fecha_fin">Fecha fin</label>
          <input v-model="filtros.fecha_fin" type="date" id="fecha_fin" class="filtro-input" />
        </div>

        <div class="filtros-acciones">
          <button @click="aplicarFiltros" :disabled="cargando" class="btn btn--primary">
            {{ cargando ? 'Buscando...' : 'Aplicar filtros' }}
          </button>
          <button @click="resetFiltros" class="btn btn--outline">Limpiar</button>
        </div>
      </section>

      <!-- RESULTADOS -->
      <section class="resultados-container" aria-live="polite">
        <div class="resultados-header">
          <h3>{{ resultados.length }} registros encontrados</h3>
          <div class="acciones-export">
            <button @click="exportarCSV" :disabled="resultados.length === 0" class="btn btn--outline small">Exportar CSV</button>
            <!-- Puedes agregar botón PDF aquí si quieres -->
          </div>
        </div>

        <div v-if="errores" class="error-message">{{ errores }}</div>

        <div v-if="cargando" class="loader">
          <p>Cargando resultados…</p>
        </div>

        <div v-else class="tabla-wrapper" v-show="resultados.length > 0">
          <table class="tabla-registros">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
                <th>Total Venta</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, idx) in resultados" :key="idx">
                <td>{{ fila.nombre_cliente }}</td>
                <td>{{ fila.nombre_item }}</td>
                <td class="td-center">{{ fila.cantidad_vendida }}</td>
                <td class="td-right">{{ formatearValor(fila.precio_unitario, 'precio') }}</td>
                <td class="td-right">{{ formatearValor(fila.total_item, 'precio') }}</td>
                <td class="td-right">{{ formatearValor(fila.total_venta, 'precio') }}</td>
                <td class="td-center">{{ formatearValor(fila.fecha_venta, 'fecha') }}</td>
                <td class="td-center">{{ fila.estado_venta || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!cargando && resultados.length === 0" class="empty-message">
          <p>No hay ventas que coincidan con los filtros.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
// ------------------------------
// NotasVenta.vue (mejorado)
// - Se conecta a la vista 'vista_reporte_ventas' (leer nota abajo si necesitas modificar la vista)
// - Filtra por cliente_id, producto_id y rango de fechas
// - Exporta CSV (rápido) y muestra la tabla.
// ------------------------------

import { ref, onMounted } from 'vue'
import AppSidebar from '@/components/layouts/AppSidebar.vue'
import { supabase } from '@/lib/supabaseClient' // tu cliente supabase

// Estado reactivo (data)
const filtros = ref({
  cliente_id: '',
  producto_id: '',
  fecha_inicio: '',
  fecha_fin: ''
})

const resultados = ref([])
const cargando = ref(false)
const errores = ref(null)
const clientes = ref([])
const productos = ref([])

// Cargar listas para los selects
const cargarListas = async () => {
  // Traer clientes (usuarios con rol 'cliente')
  const { data: cli, error: errCli } = await supabase
    .from('usuarios')
    .select('id,nombre_completo')
    .eq('rol', 'cliente')
    .order('nombre_completo', { ascending: true })

  if (errCli) {
    console.error('Error cargando clientes', errCli)
  } else {
    clientes.value = cli || []
  }

  // Traer productos activos
  const { data: prods, error: errProds } = await supabase
    .from('productos')
    .select('id,nombre')
    .eq('is_activo', true)
    .order('nombre', { ascending: true })

  if (errProds) {
    console.error('Error cargando productos', errProds)
  } else {
    productos.value = prods || []
  }
}

// Construye y ejecuta la consulta a la vista con los filtros
const aplicarFiltros = async () => {
  cargando.value = true
  errores.value = null
  resultados.value = []

  try {
    // Si tu vista no incluye usuario_id / producto_id / estado, revisa la sección SQL que te dejé arriba.
    let query = supabase
      .from('vista_reporte_ventas') // LA VISTA que devuelve los campos de venta
      .select('*')                   // seleccionar todas las columnas de la vista

    // Filtrar por cliente (usuario_id) si existe
    if (filtros.value.cliente_id) {
      query = query.eq('usuario_id', filtros.value.cliente_id)
    }

    // Filtrar por producto si existe
    if (filtros.value.producto_id) {
      query = query.eq('producto_id', filtros.value.producto_id)
    }

    // Filtrar por rango de fechas (fecha_venta)
    if (filtros.value.fecha_inicio) {
      // >= fecha_inicio 00:00:00
      query = query.gte('fecha_venta', filtros.value.fecha_inicio)
    }
    if (filtros.value.fecha_fin) {
      // <= fecha_fin 23:59:59 (añadimos tiempo final para incluir todo el día)
      const fechaFin = `${filtros.value.fecha_fin}T23:59:59Z`
      query = query.lte('fecha_venta', fechaFin)
    }

    // Ordenar por fecha desc
    query = query.order('fecha_venta', { ascending: false })

    // Ejecutar
    const { data, error } = await query

    if (error) throw error

    // Mapear columnas al formato que usa tu template (nombres en la vista)
    resultados.value = (data || []).map(r => ({
      venta_id: r.venta_id,
      usuario_id: r.usuario_id,
      nombre_cliente: r.nombre_cliente,
      producto_id: r.producto_id,
      nombre_item: r.nombre_item,
      cantidad_vendida: r.cantidad_vendida,
      precio_unitario: r.precio_unitario,
      total_item: r.total_item,
      total_venta: r.total_venta,
      fecha_venta: r.fecha_venta,
      estado_venta: r.estado_venta // este campo depende de la vista; si no existe, quedará undefined
    }))

  } catch (err) {
    console.error('Error consulta ventas:', err)
    errores.value = err.message || 'Error al obtener datos'
  } finally {
    cargando.value = false
  }
}

// Reset filtros
const resetFiltros = () => {
  filtros.value = {
    cliente_id: '',
    producto_id: '',
    fecha_inicio: '',
    fecha_fin: ''
  }
  resultados.value = []
  errores.value = null
}

// Formateo helper
const formatearValor = (valor, tipo) => {
  if (valor == null || valor === '') return '—'
  if (tipo === 'fecha') {
    const d = new Date(valor)
    // Si la fecha no es válida, devolver el raw
    if (isNaN(d.getTime())) return String(valor)
    return d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  }
  if (tipo === 'precio') {
    const n = Number(valor)
    if (isNaN(n)) return String(valor)
    return `$${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
  }
  return String(valor)
}

// Exportar CSV (útil y rápido)
const exportarCSV = () => {
  if (!resultados.value.length) return

  const keys = Object.keys(resultados.value[0])
  const csvRows = []
  csvRows.push(keys.join(','))

  resultados.value.forEach(row => {
    const vals = keys.map(k => {
      const v = row[k] == null ? '' : String(row[k]).replace(/"/g, '""')
      return `"${v}"`
    })
    csvRows.push(vals.join(','))
  })

  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `notas_venta_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Ejecutar al montar
onMounted(() => {
  cargarListas()
  // opcional: ejecutar la primera carga sin filtros
  // aplicarFiltros()
})
</script>

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
