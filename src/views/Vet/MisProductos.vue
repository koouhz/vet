<template>
  <div class="productos-vet-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Mis Productos</h1>
        <p class="subtitle">Catálogo de productos disponibles en la tabla <code>productos</code>.</p>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-item">
          <label for="filter-categoria" class="filter-label">Categoría</label>
          <select
            id="filter-categoria"
            :value="selectedCategoria"
            @change="handleCategoriaChange"
            class="status-select"
          >
            <option value="">Todas</option>
            <option value="alimento">Alimento</option>
            <option value="medicamento">Medicamento</option>
            <option value="accesorio">Accesorio</option>
            <option value="juguete">Juguete</option>
            <option value="higiene">Higiene</option>
            <option value="otros">Otros</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filter-estado" class="filter-label">Estado</label>
          <select
            id="filter-estado"
            :value="selectedActivo"
            @change="handleActivoChange"
            class="status-select"
          >
            <option value="">Todos</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="filter-stock" class="filter-label">Stock</label>
          <select
            id="filter-stock"
            :value="selectedStock"
            @change="handleStockChange"
            class="status-select"
          >
            <option value="">Cualquiera</option>
            <option value="bajo">Bajo stock</option>
            <option value="agotado">Agotado</option>
          </select>
        </div>
      </div>

      <!-- Contenido -->
      <div class="content-area">
        <div v-if="isLoading" class="message">
          <div class="spinner"></div>
          <p>Cargando productos...</p>
        </div>

        <div v-else-if="error" class="message error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="loadProductos" class="retry-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredProductos.length === 0" class="message empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" />
            <path d="M16 11H8" />
            <path d="M16 15H8" />
          </svg>
          <p>No hay productos que coincidan con los filtros.</p>
        </div>

        <div v-else class="productos-grid">
          <div
            v-for="producto in filteredProductos"
            :key="producto.id"
            class="producto-card"
            :class="{ 'bajo-stock': producto.stock <= 5, 'agotado': producto.stock === 0 }"
          >
            <div class="card-header">
              <h3 class="producto-nombre">{{ producto.nombre }}</h3>
              <span class="badge" :class="`badge--${producto.is_activo ? 'activo' : 'inactivo'}`">
                {{ producto.is_activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Categoría:</span>
                <span class="value">{{ getCategoriaLabel(producto.categoria) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Precio:</span>
                <span class="value">{{ formatoMoneda(producto.precio) }}</span>
              </div>
              <div class="info-row stock-info">
                <span class="label">Stock:</span>
                <span class="value" :class="{ 'stock-bajo': producto.stock <= 5, 'stock-agotado': producto.stock === 0 }">
                  {{ producto.stock }} {{ producto.unidad_medida }}
                </span>
              </div>
              <div v-if="producto.descripcion" class="info-row">
                <span class="label">Descripción:</span>
                <span class="value">{{ producto.descripcion }}</span>
              </div>
              <div v-if="producto.codigo_barras" class="info-row">
                <span class="label">Código:</span>
                <span class="value">{{ producto.codigo_barras }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import AppSidebar from '@/components/layouts/AppSidebar.vue'

// Estado
const isLoading = ref(false)
const error = ref(null)
const rawProductos = ref([])
const selectedCategoria = ref('')
const selectedActivo = ref('')
const selectedStock = ref('')

// Categorías
const categoriaLabels = {
  alimento: 'Alimento',
  medicamento: 'Medicamento',
  accesorio: 'Accesorio',
  juguete: 'Juguete',
  higiene: 'Higiene',
  otros: 'Otros'
}

// Handlers
const handleCategoriaChange = (event) => {
  selectedCategoria.value = event.target.value
}

const handleActivoChange = (event) => {
  selectedActivo.value = event.target.value
}

const handleStockChange = (event) => {
  selectedStock.value = event.target.value
}

// Productos filtrados
const filteredProductos = computed(() => {
  return rawProductos.value.filter(producto => {
    const matchCategoria = !selectedCategoria.value || producto.categoria === selectedCategoria.value
    const matchActivo = selectedActivo.value === '' ||
      (selectedActivo.value === 'true' && producto.is_activo) ||
      (selectedActivo.value === 'false' && !producto.is_activo)

    let matchStock = true
    if (selectedStock.value === 'bajo') {
      matchStock = producto.stock > 0 && producto.stock <= 5
    } else if (selectedStock.value === 'agotado') {
      matchStock = producto.stock === 0
    }

    return matchCategoria && matchActivo && matchStock
  })
})

// Formateo
const getCategoriaLabel = (categoria) => {
  return categoriaLabels[categoria] || categoria
}

const formatoMoneda = (valor) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(valor)
}

// Cargar productos
const loadProductos = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Cargar productos activos por defecto
    const query = supabase
      .from('productos')
      .select('id, nombre, descripcion, categoria, precio, stock, unidad_medida, codigo_barras, is_activo')
      .order('nombre', { ascending: true })

    const { data, error: productosError } = await query

    if (productosError) {
      console.error('Error al cargar productos:', productosError)
      throw new Error('Error al cargar el catálogo de productos')
    }

    rawProductos.value = data

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar productos. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadProductos()
})
</script>

<style scoped>
/* Estilos idénticos a los anteriores */
.productos-vet-container {
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1.5rem;
  }

  .filters-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-item {
    width: 100%;
    min-width: auto;
  }

  .status-select {
    width: 100%;
  }
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
  margin-top: 0.25rem;
}

.subtitle code {
  background: #f1f5f9;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-family: monospace;
}

.filters-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 180px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.status-select {
  color: #1e293b;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: white;
  transition: border-color 0.2s;
}

.status-select:focus {
  outline: none;
  border-color: #145a32;
  box-shadow: 0 0 0 3px rgba(20, 90, 50, 0.1);
}

.content-area {
  min-height: 400px;
}

.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #64748b;
  text-align: center;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #145a32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #145a32;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #0f4c28;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

.producto-card {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.producto-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.producto-card.bajo-stock {
  border-left: 4px solid #f59e0b;
}

.producto-card.agotado {
  border-left: 4px solid #ef4444;
  opacity: 0.8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.producto-nombre {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge--activo { background: #dcfce7; color: #166534; }
.badge--inactivo { background: #fee2e2; color: #dc2626; }

.card-body {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.label {
  font-weight: 600;
  color: #475569;
  min-width: 85px;
}

.value {
  color: #1e293b;
  flex: 1;
}

.stock-info .value.stock-bajo {
  color: #d97706;
  font-weight: 600;
}

.stock-info .value.stock-agotado {
  color: #dc2626;
  font-weight: 600;
}

@media (max-width: 480px) {
  .productos-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .producto-card {
    padding: 1.25rem;
  }
}
</style>
