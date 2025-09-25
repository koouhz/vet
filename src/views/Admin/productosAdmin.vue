<template>
  <div class="productos-admin-container">
    <AppSidebar />

    <main class="main-content">
      <div class="page-header">
        <h1>Productos</h1>
        <p class="subtitle">Gestiona el catálogo de productos del sistema.</p>
        <button @click="openCrearModal" class="btn btn--success">+ Nuevo Producto</button>
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

            <div class="card-footer">
              <button @click="editarProducto(producto)" class="btn btn--outline">Editar</button>
              <button
                @click="toggleEstado(producto)"
                class="btn"
                :class="producto.is_activo ? 'btn--danger' : 'btn--success'"
              >
                {{ producto.is_activo ? 'Desactivar' : 'Activar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingProducto ? 'Editar Producto' : 'Crear Producto' }}</h2>
            <button @click="closeModal" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre *</label>
              <input
                v-model="formProducto.nombre"
                type="text"
                class="form-input"
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea
                v-model="formProducto.descripcion"
                class="form-input textarea"
                placeholder="Descripción del producto"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Categoría *</label>
              <select v-model="formProducto.categoria" class="form-input" required>
                <option value="alimento">Alimento</option>
                <option value="medicamento">Medicamento</option>
                <option value="accesorio">Accesorio</option>
                <option value="juguete">Juguete</option>
                <option value="higiene">Higiene</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div class="form-group">
              <label>Precio ($) *</label>
              <input
                v-model="formProducto.precio"
                type="number"
                class="form-input"
                placeholder="Precio del producto"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-group">
              <label>Stock *</label>
              <input
                v-model="formProducto.stock"
                type="number"
                class="form-input"
                placeholder="Cantidad en inventario"
                min="0"
                required
              />
            </div>
            <div class="form-group">
              <label>Unidad de medida</label>
              <input
                v-model="formProducto.unidad_medida"
                type="text"
                class="form-input"
                placeholder="Ej: unidad, kg, lt"
                maxlength="50"
              />
            </div>
            <div class="form-group">
              <label>Código de barras</label>
              <input
                v-model="formProducto.codigo_barras"
                type="text"
                class="form-input"
                placeholder="Código único de barras"
                maxlength="100"
              />
            </div>
            <div class="form-group">
              <label>Estado</label>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="formProducto.is_activo"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="btn btn--outline">Cancelar</button>
            <button @click="guardarProducto" class="btn btn--success" :disabled="isProcessing">
              {{ isProcessing ? 'Guardando...' : (editingProducto ? 'Actualizar' : 'Crear') }}
            </button>
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
const isProcessing = ref(false)
const error = ref(null)
const rawProductos = ref([])
const selectedCategoria = ref('')
const selectedActivo = ref('')
const selectedStock = ref('')

// Modal
const showModal = ref(false)
const editingProducto = ref(null)
const formProducto = ref({
  nombre: '',
  descripcion: '',
  categoria: 'alimento',
  precio: 0,
  stock: 0,
  unidad_medida: 'unidad',
  codigo_barras: '',
  is_activo: true
})

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
  const labels = {
    alimento: 'Alimento',
    medicamento: 'Medicamento',
    accesorio: 'Accesorio',
    juguete: 'Juguete',
    higiene: 'Higiene',
    otros: 'Otros'
  }
  return labels[categoria] || categoria
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
    const { data, error: productosError } = await supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true })

    if (productosError) {
      console.error('Error al cargar productos:', productosError)
      throw new Error('Error al cargar productos')
    }

    rawProductos.value = data

  } catch (err) {
    console.error('Error crítico:', err)
    error.value = err.message || 'Error al cargar productos. Inténtalo más tarde.'
  } finally {
    isLoading.value = false
  }
}

// Abrir modal crear
const openCrearModal = () => {
  editingProducto.value = null
  formProducto.value = {
    nombre: '',
    descripcion: '',
    categoria: 'alimento',
    precio: 0,
    stock: 0,
    unidad_medida: 'unidad',
    codigo_barras: '',
    is_activo: true
  }
  showModal.value = true
}

// Editar producto
const editarProducto = (producto) => {
  editingProducto.value = producto
  formProducto.value = { ...producto }
  showModal.value = true
}

// Cerrar modal
const closeModal = () => {
  showModal.value = false
  editingProducto.value = null
}

// Guardar producto
const guardarProducto = async () => {
  if (isProcessing.value) return
  if (!formProducto.value.nombre || formProducto.value.precio < 0 || formProducto.value.stock < 0) {
    alert('Verifica que el nombre, precio y stock sean válidos')
    return
  }
  isProcessing.value = true

  try {
    if (editingProducto.value) {
      // Actualizar
      const { error: updateError } = await supabase
        .from('productos')
        .update(formProducto.value)
        .eq('id', editingProducto.value.id)

      if (updateError) throw updateError
    } else {
      // Crear
      const { error: insertError } = await supabase
        .from('productos')
        .insert([formProducto.value])

      if (insertError) throw insertError
    }

    await loadProductos()
    closeModal()
    alert(editingProducto.value ? 'Producto actualizado correctamente' : 'Producto creado correctamente')

  } catch (err) {
    console.error('Error al guardar producto:', err)
    alert('Error al guardar el producto. Verifica que el código de barras no esté duplicado.')
  } finally {
    isProcessing.value = false
  }
}

// Toggle estado
const toggleEstado = async (producto) => {
  if (!confirm(`¿${producto.is_activo ? 'Desactivar' : 'Activar'} "${producto.nombre}"?`)) return

  try {
    const { error: updateError } = await supabase
      .from('productos')
      .update({ is_activo: !producto.is_activo })
      .eq('id', producto.id)

    if (updateError) throw updateError
    await loadProductos()
  } catch (err) {
    console.error('Error al cambiar estado:', err)
    alert('Error al cambiar el estado del producto')
  }
}

onMounted(() => {
  loadProductos()
})
</script>

<style scoped>
/* Estilos coherentes con el dashboard admin */
.productos-admin-container {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
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
}

.btn--success {
  background: #145a32;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn--success:hover {
  background: #0f4c28;
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

.card-footer {
  display: flex;
  gap: 0.875rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--outline {
  background: #f1f5f9;
  color: #1e293b;
}

.btn--outline:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn--danger {
  background: #dc2626;
  color: white;
}

.btn--danger:hover:not(:disabled) {
  background: #b91c1c;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #94a3b8;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1e293b;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.form-input:focus {
  outline: none;
  border-color: #145a32;
  box-shadow: 0 0 0 3px rgba(20, 90, 50, 0.1);
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #145a32;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 480px) {
  .productos-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .producto-card {
    padding: 1.25rem;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
