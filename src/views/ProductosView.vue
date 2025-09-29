<template>
  <div class="productos-cliente-container">
    <header class="productos-header">
      <div class="header-content">
        <h1>Productos</h1>
        <button @click="toggleCarrito" class="cart-button" aria-label="Carrito de compras">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.70711 15.2929C4.31658 15.6834 4.31658 16.3166 4.70711 16.7071C5.09763 17.0976 5.7308 17.0976 6.12132 16.7071L7 13ZM7 13H17M17 13L20.7071 16.7071C21.0976 17.0976 21.7308 17.0976 22.1213 16.7071C22.5118 16.3166 22.5118 15.6834 22.1213 15.2929L17 13ZM17 13H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-if="totalItems > 0" class="cart-badge">{{ totalItems }}</span>
        </button>
      </div>
    </header>

    <div class="filters-section">
      <div class="search-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 21L16.65 16.65" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar productos..."
          class="search-input"
        />
      </div>

      <div class="filters-row">
        <select v-model="selectedCategoria" class="filter-select">
          <option value="">Todas las categorías</option>
          <option value="alimento">Alimento</option>
          <option value="medicamento">Medicamento</option>
          <option value="accesorio">Accesorio</option>
          <option value="juguete">Juguete</option>
          <option value="higiene">Higiene</option>
          <option value="otros">Otros</option>
        </select>

        <select v-model="selectedStock" class="filter-select">
          <option value="">Todos los productos</option>
          <option value="disponible">Disponibles</option>
          <option value="bajo">Bajo stock</option>
        </select>
      </div>
    </div>



    <div class="productos-grid">
      <div
        v-for="producto in filteredProductos"
        :key="producto.id"
        class="producto-card"
        :class="{ 'bajo-stock': producto.stock <= 5, 'agotado': producto.stock === 0 }"
      >
        <div class="producto-header">
          <h3 class="producto-nombre">{{ producto.nombre }}</h3>
          <span class="stock-indicator" :class="{ 'stock-bajo': producto.stock <= 5, 'stock-agotado': producto.stock === 0 }">
            {{ producto.stock === 0 ? 'Agotado' : producto.stock + ' ' + producto.unidad_medida }}
          </span>
        </div>

        <div class="producto-body">
          <div class="categoria-badge" :class="'categoria-' + producto.categoria">
            {{ getCategoriaLabel(producto.categoria) }}
          </div>

          <p v-if="producto.descripcion" class="descripcion">{{ producto.descripcion }}</p>

          <div class="precio-section">
            <span class="precio">{{ formatoMoneda(producto.precio) }}</span>
            <span v-if="producto.stock <= 5 && producto.stock > 0" class="stock-warning">
              ¡Últimas unidades!
            </span>
          </div>
        </div>

        <div class="producto-footer">
          <div class="cantidad-control">
            <button
              @click="decrementarCantidad(producto.id)"
              class="cantidad-btn"
              :disabled="carrito[producto.id] <= 1 || producto.stock === 0"
            >
              -
            </button>
            <span class="cantidad">{{ carrito[producto.id] || 0 }}</span>
            <button
              @click="incrementarCantidad(producto.id)"
              class="cantidad-btn"
              :disabled="producto.stock === 0 || (carrito[producto.id] || 0) >= producto.stock"
            >
              +
            </button>
          </div>

          <button
            @click="agregarAlCarrito(producto)"
            class="comprar-btn"
            :disabled="producto.stock === 0"
            :class="{ 'agotado-btn': producto.stock === 0 }"
          >
            {{ producto.stock === 0 ? 'Agotado' : 'Agregar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCarrito" class="carrito-overlay" @click="toggleCarrito">
      <div class="carrito-content" @click.stop>
        <div class="carrito-header">
          <h2>Carrito de compras</h2>
          <button @click="toggleCarrito" class="close-btn">&times;</button>
        </div>

        <div class="carrito-body">
          <div v-if="Object.keys(carrito).length === 0" class="carrito-vacio">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.70711 15.2929C4.31658 15.6834 4.31658 16.3166 4.70711 16.7071C5.09763 17.0976 5.7308 17.0976 6.12132 16.7071L7 13ZM7 13H17M17 13L20.7071 16.7071C21.0976 17.0976 21.7308 17.0976 22.1213 16.7071C22.5118 16.3166 22.5118 15.6834 22.1213 15.2929L17 13ZM17 13H7" />
            </svg>
            <p>Tu carrito está vacío</p>
          </div>

          <div v-else>
            <div
              v-for="producto in productosEnCarrito"
              :key="producto.id"
              class="item-carrito"
            >
              <div class="item-info">
                <h4>{{ producto.nombre }}</h4>
                <p class="item-precio">{{ formatoMoneda(producto.precio) }} c/u</p>
              </div>

              <div class="item-cantidad">
                <button
                  @click="quitarDelCarrito(producto.id)"
                  class="item-btn"
                >
                  -
                </button>
                <span>{{ carrito[producto.id] }}</span>
                <button
                  @click="agregarAlCarrito(producto)"
                  class="item-btn"
                  :disabled="carrito[producto.id] >= producto.stock"
                >
                  +
                </button>
              </div>

              <div class="item-total">
                {{ formatoMoneda(producto.precio * carrito[producto.id]) }}
                <button
                  @click="eliminarDelCarrito(producto.id)"
                  class="eliminar-btn"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="Object.keys(carrito).length > 0" class="carrito-footer">
          <div class="total-section">
            <span>Total:</span>
            <span class="total-precio">{{ formatoMoneda(totalPrecio) }}</span>
          </div>
          <button @click="procesarCompra" class="checkout-btn">
            Procesar compra
          </button>
        </div>
      </div>
    </div>
    <div v-if="showPaymentModal" class="carrito-overlay" @click="showPaymentModal = false">
      <div class="carrito-content pago-modal" @click.stop>
        <div class="carrito-header">
          <h2>Simulación de Pago</h2>
          <button @click="showPaymentModal = false" class="close-btn">&times;</button>
        </div>

        <div class="pago-body">
          <div class="total-a-pagar">
            <span>Total a pagar:</span>
            <span class="total-precio">{{ formatoMoneda(totalPrecio) }}</span>
          </div>

          <h3 class="metodo-title">Selecciona el método de pago</h3>
          <div class="metodo-grid">
            <button 
              @click="paymentMethod = 'qr'" 
              :class="['metodo-btn', { 'selected': paymentMethod === 'qr' }]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h3v3H7zM14 7h3v3h-3zM7 14h3v3H7zM14 14h3v3h-3z"/></svg>
              <span>Pago QR</span>
            </button>
            <button 
              @click="paymentMethod = 'card'" 
              :class="['metodo-btn', { 'selected': paymentMethod === 'card' }]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22M7 15h.01M11 15h2"/></svg>
              <span>Tarjeta de Crédito/Débito</span>
            </button>
          </div>

          <div class="metodo-detalle">
            <div v-if="paymentMethod === 'qr'" class="qr-content">
              <p class="instruccion">Escanea el siguiente código QR para completar tu pago de **{{ formatoMoneda(totalPrecio) }}**.</p>
              <div class="qr-code-placeholder">
                
              </div>
              <p class="disclaimer">Simulación: No se realizará un cargo real.</p>
            </div>

            <form v-if="paymentMethod === 'card'" @submit.prevent="confirmPayment" class="card-form">
              <p class="instruccion">Ingresa los detalles de tu tarjeta para el pago de **{{ formatoMoneda(totalPrecio) }}**.</p>
              <div class="form-group">
                <label for="cardNumber">Número de tarjeta</label>
                <input type="text" id="cardNumber" placeholder="XXXX XXXX XXXX XXXX" required maxlength="16" />
              </div>
              <div class="form-group-row">
                <div class="form-group">
                  <label for="expiry">Fecha de expiración</label>
                  <input type="text" id="expiry" placeholder="MM/YY" required maxlength="5" />
                </div>
                <div class="form-group">
                  <label for="cvc">CVC</label>
                  <input type="text" id="cvc" placeholder="XXX" required maxlength="3" />
                </div>
              </div>
              <div class="form-group">
                <label for="cardName">Nombre en la tarjeta</label>
                <input type="text" id="cardName" required />
              </div>
            </form>
          </div>
        </div>
        
        <div class="carrito-footer">
          <button 
            @click="confirmPayment" 
            :disabled="!paymentMethod"
            class="checkout-btn"
          >
            Pagar {{ formatoMoneda(totalPrecio) }}
          </button>
        </div>
      </div>
    </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// Estado
const productos = ref([])
const searchQuery = ref('')
const selectedCategoria = ref('')
const selectedStock = ref('')
const carrito = ref({})
const showCarrito = ref(false)
// 🚀 NUEVO ESTADO PARA EL PAGO
const showPaymentModal = ref(false)
const paymentMethod = ref(null) // 'qr' o 'card'

// Cargar productos
const loadProductos = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('is_activo', true)
    .order('nombre', { ascending: true })

  if (error) {
    console.error('Error al cargar productos:', error)
  } else {
    productos.value = data
  }
}

// Productos filtrados
const filteredProductos = computed(() => {
  return productos.value.filter(producto => {
    const matchSearch = !searchQuery.value ||
      producto.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchCategoria = !selectedCategoria.value || producto.categoria === selectedCategoria.value

    let matchStock = true
    if (selectedStock.value === 'disponible') {
      matchStock = producto.stock > 0
    } else if (selectedStock.value === 'bajo') {
      matchStock = producto.stock > 0 && producto.stock <= 5
    }

    return matchSearch && matchCategoria && matchStock
  })
})

// Productos en carrito (para mostrar en modal)
const productosEnCarrito = computed(() => {
  return productos.value.filter(producto => carrito.value[producto.id] > 0)
})

// Total de items en carrito
const totalItems = computed(() => {
  return Object.values(carrito.value).reduce((sum, qty) => sum + qty, 0)
})

// Total del precio
const totalPrecio = computed(() => {
  return productosEnCarrito.value.reduce((total, producto) => {
    return total + (producto.precio * carrito.value[producto.id])
  }, 0)
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

// Funciones del carrito
const agregarAlCarrito = (producto) => {
  if (producto.stock === 0) return

  const currentQty = carrito.value[producto.id] || 0
  if (currentQty < producto.stock) {
    carrito.value = {
      ...carrito.value,
      [producto.id]: currentQty + 1
    }
  }
}

const quitarDelCarrito = (productoId) => {
  const currentQty = carrito.value[productoId] || 0
  if (currentQty > 1) {
    carrito.value = {
      ...carrito.value,
      [productoId]: currentQty - 1
    }
  } else {
    eliminarDelCarrito(productoId)
  }
}

const eliminarDelCarrito = (productoId) => {
  const newCarrito = { ...carrito.value }
  delete newCarrito[productoId]
  carrito.value = newCarrito
}

const incrementarCantidad = (productoId) => {
  const producto = productos.value.find(p => p.id === productoId)
  if (producto) {
    agregarAlCarrito(producto)
  }
}

const decrementarCantidad = (productoId) => {
  quitarDelCarrito(productoId)
}

// Toggle carrito
const toggleCarrito = () => {
  showCarrito.value = !showCarrito.value
}

// Procesar compra (Ahora solo abre el modal de pago)
const procesarCompra = () => {
  if (Object.keys(carrito.value).length === 0) return
  showCarrito.value = false // Cerrar el carrito
  showPaymentModal.value = true // Abrir el modal de pago
}

// 🚀 NUEVA FUNCIÓN PARA CONFIRMAR EL PAGO
const confirmPayment = async () => {
  if (!paymentMethod.value) {
    alert('Por favor, selecciona un método de pago: QR o Tarjeta.')
    return
  }
  
  // Aquí se ejecutaría la lógica de pago real (validaciones de formulario, llamada a API)
  // Por ahora, es solo una simulación:

  try {
    // Simulación: Lógica para crear venta y actualizar stock
    
    // Aquí podrías agregar un spinner si fuera una llamada real asíncrona

    alert(`¡Pago de ${formatoMoneda(totalPrecio.value)} procesado exitosamente por ${paymentMethod.value === 'qr' ? 'QR' : 'Tarjeta'}!`)
    
    // Limpiar estado y actualizar
    carrito.value = {}
    paymentMethod.value = null
    showPaymentModal.value = false
    await loadProductos() // Recargar para actualizar stock

  } catch (error) {
    console.error('Error al procesar compra:', error)
    alert('Error al procesar la compra. Inténtalo de nuevo.')
  }
}


onMounted(() => {
  loadProductos()
})
</script>

<style scoped>
/* Estilos existentes... */
.productos-cliente-container {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1rem;
}

/* Header */
.productos-header {
  background: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.productos-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.cart-button {
  background: none;
  border: none;
  position: relative;
  cursor: pointer;
  color: #1e293b;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #145a32;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Filtros */
.filters-section {
  max-width: 1200px;
  margin: 1.5rem auto 2rem;
  padding: 0 1rem;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.filters-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  color: #1e293b;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
  min-width: 180px;
  flex: 1;
}

/* Productos */
.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.producto-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.producto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.producto-card.bajo-stock {
  border-left: 4px solid #f59e0b;
}

.producto-card.agotado {
  opacity: 0.7;
  border-left: 4px solid #ef4444;
}

.producto-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.producto-nombre {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
  min-width: 0;
}

.stock-indicator {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
}

.stock-indicator.stock-bajo {
  background: #ffedd5;
  color: #ea580c;
}

.stock-indicator.stock-agotado {
  background: #fee2e2;
  color: #dc2626;
}

.producto-body {
  margin-bottom: 1.25rem;
}

.categoria-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.categoria-alimento { background: #dbeafe; color: #1d4ed8; }
.categoria-medicamento { background: #ede9fe; color: #7c3aed; }
.categoria-accesorio { background: #dcfce7; color: #166534; }
.categoria-juguete { background: #ffedd5; color: #ea580c; }
.categoria-higiene { background: #fee2e2; color: #dc2626; }
.categoria-otros { background: #f3e8ff; color: #7e22ce; }

.descripcion {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0.5rem 0;
}

.precio-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.precio {
  font-size: 1.25rem;
  font-weight: 700;
  color: #145a32;
}

.stock-warning {
  font-size: 0.8rem;
  color: #d97706;
  font-weight: 600;
}

.producto-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.cantidad-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cantidad-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #cbd5e1;
  background: white;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cantidad-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cantidad {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
}

.comprar-btn {
  background: #145a32;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.comprar-btn:hover:not(:disabled) {
  background: #0f4c28;
}

.comprar-btn:disabled,
.agotado-btn {
  background: #cbd5e1;
  cursor: not-allowed;
}

/* Carrito modal */
.carrito-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.carrito-content {
  background: white;
  border-radius: 16px 16px 0 0;
  max-height: 80vh;
  overflow-y: auto;
  padding: 1.5rem;
  margin: 0 auto;
  width: 100%;
  max-width: 500px;
}

.carrito-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.carrito-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carrito-vacio {
  text-align: center;
  padding: 2rem 1rem;
  color: #64748b;
}

.carrito-vacio svg {
  margin-bottom: 1rem;
}

.item-carrito {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.item-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.item-precio {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.item-cantidad {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #cbd5e1;
  background: white;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.item-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 80px;
}

.item-total span {
  font-weight: 600;
  color: #145a32;
}

.eliminar-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #ef4444;
  cursor: pointer;
  margin-top: 0.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carrito-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2e8f0;
}

.total-section {
  display: flex;
  justify-content: space-between;
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.total-precio {
  color: #145a32;
}

.checkout-btn {
  width: 100%;
  padding: 0.75rem;
  background: #145a32;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.125rem;
  cursor: pointer;
  transition: background 0.2s;
}

.checkout-btn:hover {
  background: #0f4c28;
}

/* 🚀 NUEVOS ESTILOS PARA EL MODAL DE PAGO 🚀 */

.pago-modal {
    max-width: 450px;
}

.total-a-pagar {
    display: flex;
    justify-content: space-between;
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px dashed #e2e8f0;
}

.total-a-pagar .total-precio {
    color: #145a32;
    font-size: 1.5rem;
}

.metodo-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
    text-align: center;
}

.metodo-grid {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.metodo-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.metodo-btn:hover {
    border-color: #94a3b8;
}

.metodo-btn.selected {
    border-color: #145a32;
    background: #dcfce7;
    color: #145a32;
    box-shadow: 0 0 0 2px #dcfce7;
}

.metodo-btn svg {
    width: 32px;
    height: 32px;
    margin-bottom: 0.5rem;
}

.metodo-detalle {
    min-height: 150px; /* Para mantener el layout estable */
    padding: 1rem 0;
}

.instruccion {
    text-align: center;
    color: #475569;
    margin-bottom: 1rem;
}

.qr-code-placeholder {
    width: 150px;
    height: 150px;
    margin: 1rem auto;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 500;
}

.disclaimer {
    text-align: center;
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 1rem;
}

/* Card Form Styles */
.card-form .form-group {
    margin-bottom: 1rem;
}

.card-form label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.25rem;
}

.card-form input {
    width: 100%;
    padding: 0.65rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.card-form input:focus {
    border-color: #145a32;
    outline: none;
}

.form-group-row {
    display: flex;
    gap: 1rem;
}

.form-group-row .form-group {
    flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .productos-header {
    padding: 0.75rem 0;
  }

  .header-content {
    padding: 0 0.75rem;
  }

  .filters-section {
    margin: 1rem auto 1.5rem;
    padding: 0 0.75rem;
  }

  .filters-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .filter-select {
    min-width: auto;
    width: 100%;
  }

  .productos-grid {
    grid-template-columns: 1fr;
    padding: 0 0.75rem 1.5rem;
    gap: 1.25rem;
  }

  .producto-card {
    padding: 1.25rem;
  }

  .carrito-content {
    border-radius: 12px 12px 0 0;
    padding: 1.25rem;
  }
}
</style>