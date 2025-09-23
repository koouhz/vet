<template>
  <div class="servicios-admin-container">
    <!-- Contenedor principal con padding para el sidebar -->
    <div class="main-content">
      <!-- Header -->
      <div class="admin-header">
        <h1 class="admin-title">Gestión de Servicios</h1>
        <button @click="openCrearServicioModal" class="btn-primary">
          <i class="fas fa-plus"></i> Crear Nuevo Servicio
        </button>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="filtros-container">
        <div class="filtro-item">
          <label for="filtro-categoria">Categoría</label>
          <select id="filtro-categoria" v-model="filtroCategoria" @change="filtrarServicios">
            <option value="">Todas las categorías</option>
            <option value="consulta">Consulta</option>
            <option value="procedimiento">Procedimiento</option>
            <option value="cuidado">Cuidado</option>
            <option value="emergencia">Emergencia</option>
          </select>
        </div>
        <div class="filtro-item">
          <label for="filtro-especialidad">Especialidad</label>
          <select id="filtro-especialidad" v-model="filtroEspecialidad" @change="filtrarServicios">
            <option value="">Todas las especialidades</option>
            <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">{{ esp.nombre }}</option>
          </select>
        </div>
        <div class="search-box">
          <input 
            type="text" 
            v-model="busqueda" 
            placeholder="Buscar servicio..." 
            @input="filtrarServicios"
          />
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando servicios...</p>
      </div>

      <!-- Lista de servicios como tarjetas -->
      <div v-else class="servicios-lista">
        <div v-if="serviciosFiltrados.length === 0" class="no-data">
          <i class="fas fa-search"></i>
          <p>No se encontraron servicios</p>
        </div>
        <div v-else class="servicios-grid">
          <div v-for="servicio in serviciosFiltrados" :key="servicio.id" class="servicio-card">
            <div class="servicio-header">
              <h3>{{ servicio.titulo }}</h3>
              <span class="badge" :class="getCategoriaColor(servicio.categoria)">
                {{ getCategoriaLabel(servicio.categoria) }}
              </span>
            </div>
            <div v-if="servicio.foto_url" class="servicio-imagen">
              <img :src="servicio.foto_url" :alt="servicio.titulo" @error="handleImageError($event, servicio)" />
            </div>
            <div class="servicio-body">
              <div v-if="servicio.descripcion" class="info-row">
                <span>{{ servicio.descripcion }}</span>
              </div>
              <div class="info-row">
                <strong>Especialidad:</strong>
                <span>{{ getNombreEspecialidad(servicio.especialidad_id) }}</span>
              </div>
              <div class="info-row">
                <strong>Precio:</strong>
                <span class="precio">S/ {{ servicio.precio.toFixed(2) }}</span>
              </div>
              <div class="info-row">
                <strong>Duración:</strong>
                <span class="duracion">{{ servicio.duracion_minutos }} min</span>
              </div>
              <div class="info-row">
                <strong>Estado:</strong>
                <span :class="servicio.is_activo ? 'estado-activo' : 'estado-inactivo'">
                  {{ servicio.is_activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
            <div class="servicio-actions">
              <button @click="editarServicio(servicio)" class="btn-edit" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="toggleEstado(servicio)" class="btn-toggle" :class="{ 'btn-activo': servicio.is_activo }" :title="servicio.is_activo ? 'Desactivar' : 'Activar'">
                <i :class="servicio.is_activo ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
              </button>
              <button @click="eliminarServicio(servicio.id)" class="btn-delete" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Servicio -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-contenido">
        <div class="modal-header">
          <h2>{{ modoEdicion ? 'Editar Servicio' : 'Crear Nuevo Servicio' }}</h2>
          <button class="btn-close" @click="cerrarModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarServicio" class="form-servicio">
            <div class="form-group">
              <label for="titulo">Título del Servicio *</label>
              <input 
                type="text" 
                id="titulo" 
                v-model="servicioForm.titulo" 
                required 
                placeholder="Ej. Consulta General"
              />
            </div>
            <div class="form-group">
              <label for="categoria">Categoría *</label>
              <select id="categoria" v-model="servicioForm.categoria" required>
                <option value="">Seleccionar categoría</option>
                <option value="consulta">Consulta</option>
                <option value="procedimiento">Procedimiento</option>
                <option value="cuidado">Cuidado</option>
                <option value="emergencia">Emergencia</option>
              </select>
            </div>
            <div class="form-group">
              <label for="especialidad">Especialidad</label>
              <select id="especialidad" v-model="servicioForm.especialidad_id">
                <option :value="null">Sin especialidad</option>
                <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">
                  {{ esp.nombre }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="precio">Precio (S/) *</label>
                <input 
                  type="number" 
                  id="precio" 
                  v-model.number="servicioForm.precio" 
                  step="0.01" 
                  min="0" 
                  required 
                  placeholder="0.00"
                />
              </div>
              <div class="form-group">
                <label for="duracion">Duración (min) *</label>
                <input 
                  type="number" 
                  id="duracion" 
                  v-model.number="servicioForm.duracion_minutos" 
                  min="5" 
                  step="5" 
                  required 
                  placeholder="30"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="descripcion">Descripción</label>
              <textarea 
                id="descripcion" 
                v-model="servicioForm.descripcion" 
                placeholder="Descripción opcional del servicio"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="foto_url">URL de la imagen</label>
              <input 
                type="text" 
                id="foto_url" 
                v-model="servicioForm.foto_url" 
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            <div class="form-group">
              <label for="icono">Icono (opcional)</label>
              <input 
                type="text" 
                id="icono" 
                v-model="servicioForm.icono" 
                placeholder="fas fa-stethoscope"
              />
            </div>
            <div class="form-group form-checkbox">
              <input 
                type="checkbox" 
                id="is_activo" 
                v-model="servicioForm.is_activo"
              />
              <label for="is_activo">Servicio activo</label>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="cerrarModal">Cancelar</button>
              <button type="submit" class="btn-primary">
                {{ modoEdicion ? 'Actualizar' : 'Crear' }} Servicio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Confirmación Eliminar -->
    <div v-if="modalEliminarVisible" class="modal-overlay" @click.self="cerrarModalEliminar">
      <div class="modal-confirmacion">
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
          <button class="btn-close" @click="cerrarModalEliminar">&times;</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar el servicio <strong>{{ servicioEliminar?.titulo }}</strong>?</p>
          <p>Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cerrarModalEliminar">Cancelar</button>
          <button class="btn-delete" @click="confirmarEliminar">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const servicios = ref([])
const especialidades = ref([])
const busqueda = ref('')
const filtroCategoria = ref('')
const filtroEspecialidad = ref('')
const modalVisible = ref(false)
const modalEliminarVisible = ref(false)
const modoEdicion = ref(false)
const loading = ref(true)
const servicioForm = ref({
  id: null,
  titulo: '',
  categoria: '',
  especialidad_id: null,
  precio: 0,
  duracion_minutos: 30,
  descripcion: '',
  foto_url: '',
  icono: '',
  is_activo: true
})
const servicioEliminar = ref(null)

// Cargar datos desde Supabase
const cargarDatos = async () => {
  loading.value = true
  
  try {
    // Cargar especialidades
    const { data: especialidadesData, error: especialidadesError } = await supabase
      .from('especialidades')
      .select('id, nombre')
      .eq('is_activa', true)
      .order('nombre', { ascending: true })
    
    if (especialidadesError) throw especialidadesError
    especialidades.value = especialidadesData || []
    
    // Cargar servicios
    const { data: serviciosData, error: serviciosError } = await supabase
      .from('servicios')
      .select(`
        id,
        titulo,
        descripcion,
        duracion_minutos,
        precio,
        categoria,
        icono,
        foto_url,
        especialidad_id,
        is_activo
      `)
      .order('titulo', { ascending: true })
    
    if (serviciosError) throw serviciosError
    servicios.value = serviciosData || []
    
  } catch (error) {
    console.error('Error al cargar datos:', error)
    alert('Error al cargar los servicios: ' + error.message)
  } finally {
    loading.value = false
  }
}

// Filtrar servicios (computed)
const serviciosFiltrados = computed(() => {
  return servicios.value.filter(servicio => {
    const coincideBusqueda = !busqueda.value || 
      servicio.titulo.toLowerCase().includes(busqueda.value.toLowerCase())
    const coincideCategoria = !filtroCategoria.value || servicio.categoria === filtroCategoria.value
    const coincideEspecialidad = !filtroEspecialidad.value || 
      (servicio.especialidad_id && servicio.especialidad_id.toString() === filtroEspecialidad.value)
    
    return coincideBusqueda && coincideCategoria && coincideEspecialidad
  })
})

// Manejar error de imagen
const handleImageError = (event, servicio) => {
  console.warn('Error al cargar imagen para servicio:', servicio.titulo)
  event.target.style.display = 'none'
}

// Abrir modal para crear
const openCrearServicioModal = () => {
  modoEdicion.value = false
  servicioForm.value = {
    id: null,
    titulo: '',
    categoria: '',
    especialidad_id: null,
    precio: 0,
    duracion_minutos: 30,
    descripcion: '',
    foto_url: '',
    icono: '',
    is_activo: true
  }
  modalVisible.value = true
}

// Editar servicio
const editarServicio = (servicio) => {
  modoEdicion.value = true
  servicioForm.value = { ...servicio }
  modalVisible.value = true
}

// Cerrar modal
const cerrarModal = () => {
  modalVisible.value = false
}

// Guardar servicio (crear o actualizar)
const guardarServicio = async () => {
  try {
    if (modoEdicion.value) {
      // Actualizar servicio
      const { data, error } = await supabase
        .from('servicios')
        .update({
          titulo: servicioForm.value.titulo,
          categoria: servicioForm.value.categoria,
          especialidad_id: servicioForm.value.especialidad_id,
          precio: servicioForm.value.precio,
          duracion_minutos: servicioForm.value.duracion_minutos,
          descripcion: servicioForm.value.descripcion,
          foto_url: servicioForm.value.foto_url,
          icono: servicioForm.value.icono,
          is_activo: servicioForm.value.is_activo,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', servicioForm.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      // Actualizar en la lista local
      const index = servicios.value.findIndex(s => s.id === servicioForm.value.id)
      if (index !== -1) {
        servicios.value[index] = { ...data }
      }
      
      alert('Servicio actualizado exitosamente')
    } else {
      // Crear nuevo servicio
      const { data, error } = await supabase
        .from('servicios')
        .insert({
          titulo: servicioForm.value.titulo,
          categoria: servicioForm.value.categoria,
          especialidad_id: servicioForm.value.especialidad_id,
          precio: servicioForm.value.precio,
          duracion_minutos: servicioForm.value.duracion_minutos,
          descripcion: servicioForm.value.descripcion,
          foto_url: servicioForm.value.foto_url,
          icono: servicioForm.value.icono,
          is_activo: servicioForm.value.is_activo
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Agregar a la lista local
      servicios.value.push(data)
      alert('Servicio creado exitosamente')
    }
    
    cerrarModal.value = false
    cerrarModal()
  } catch (error) {
    console.error('Error al guardar servicio:', error)
    alert('Error al guardar el servicio: ' + error.message)
  }
}

// Toggle de estado activo/inactivo
const toggleEstado = async (servicio) => {
  try {
    const nuevoEstado = !servicio.is_activo
    const { data, error } = await supabase
      .from('servicios')
      .update({
        is_activo: nuevoEstado,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', servicio.id)
      .select()
      .single()
    
    if (error) throw error
    
    // Actualizar en la lista local
    const index = servicios.value.findIndex(s => s.id === servicio.id)
    if (index !== -1) {
      servicios.value[index] = { ...data }
    }
    
    alert(`Servicio ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`)
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    alert('Error al cambiar el estado del servicio: ' + error.message)
  }
}

// Eliminar servicio
const eliminarServicio = (id) => {
  const servicio = servicios.value.find(s => s.id === id)
  if (servicio) {
    servicioEliminar.value = servicio
    modalEliminarVisible.value = true
  }
}

// Cerrar modal de eliminar
const cerrarModalEliminar = () => {
  modalEliminarVisible.value = false
  servicioEliminar.value = null
}

// Confirmar eliminación
const confirmarEliminar = async () => {
  try {
    const { error } = await supabase
      .from('servicios')
      .delete()
      .eq('id', servicioEliminar.value.id)
    
    if (error) throw error
    
    // Eliminar de la lista local
    servicios.value = servicios.value.filter(s => s.id !== servicioEliminar.value.id)
    alert('Servicio eliminado exitosamente')
    cerrarModalEliminar()
  } catch (error) {
    console.error('Error al eliminar servicio:', error)
    alert('Error al eliminar el servicio: ' + error.message)
  }
}

// Obtener nombre de especialidad
const getNombreEspecialidad = (especialidadId) => {
  if (!especialidadId) return 'Sin especialidad'
  const especialidad = especialidades.value.find(e => e.id === especialidadId)
  return especialidad ? especialidad.nombre : 'No asignada'
}

// Obtener color de categoría
const getCategoriaColor = (categoria) => {
  const colores = {
    'consulta': 'badge-blue',
    'procedimiento': 'badge-green',
    'cuidado': 'badge-purple',
    'emergencia': 'badge-red'
  }
  return colores[categoria] || 'badge-gray'
}

// Obtener etiqueta de categoría
const getCategoriaLabel = (categoria) => {
  const labels = {
    'consulta': 'Consulta',
    'procedimiento': 'Procedimiento',
    'cuidado': 'Cuidado',
    'emergencia': 'Emergencia'
  }
  return labels[categoria] || categoria
}

// Cargar datos al montar el componente
onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
/* Contenedor principal */
.servicios-admin-container {
  background-color: #0f1a2c;
  color: white;
  min-height: 100vh;
  width: 100%;
}

/* Contenido principal con margen para el sidebar */
.main-content {
  margin-left: 240px;
  padding: 2rem;
}

/* Header */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #2c3e50;
}

.admin-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  color: #3498db;
  white-space: nowrap;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

/* Filtros */
.filtros-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filtro-item {
  flex: 1;
  min-width: 200px;
}

.filtro-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #bdc3c7;
}

.filtro-item select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #2c3e50;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.filtro-item select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

/* Barra de búsqueda */
.search-box {
  position: relative;
  min-width: 250px;
  flex: 0 0 300px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #2c3e50;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #bdc3c7;
}

/* Loading */
.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: #bdc3c7;
}

.loading i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #3498db;
}

/* Lista de servicios */
.servicios-lista {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
}

.no-data {
  text-align: center;
  padding: 4rem 2rem;
  color: #bdc3c7;
  font-style: italic;
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #7f8c8d;
}

.servicios-grid {
  display: grid;
  gap: 1.5rem;
  padding: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

/* Tarjeta de servicio */
.servicio-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.servicio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.servicio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.servicio-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #ecf0f1;
  flex: 1;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
}

.badge-blue { background-color: #3498db; color: white; }
.badge-green { background-color: #2ecc71; color: white; }
.badge-purple { background-color: #9b59b6; color: white; }
.badge-red { background-color: #e74c3c; color: white; }
.badge-gray { background-color: #7f8c8d; color: white; }

/* Imagen del servicio */
.servicio-imagen {
  width: 100%;
  height: 150px;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 8px;
}

.servicio-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.servicio-imagen img:hover {
  transform: scale(1.05);
}

/* Cuerpo del servicio */
.servicio-body {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.info-row strong {
  color: #bdc3c7;
  min-width: 120px;
}

.precio {
  color: #2ecc71;
  font-weight: 600;
}

.duracion {
  color: #3498db;
  font-weight: 500;
}

.estado-activo {
  color: #2ecc71;
  font-weight: 500;
}

.estado-inactivo {
  color: #e74c3c;
  font-weight: 500;
}

/* Botones de acción */
.servicio-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-edit, .btn-delete, .btn-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  border: none;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn-edit {
  background-color: #3498db;
}

.btn-edit:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.btn-delete {
  background-color: #e74c3c;
}

.btn-delete:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

.btn-toggle {
  background-color: #7f8c8d;
}

.btn-toggle:hover {
  transform: translateY(-2px);
}

.btn-activo {
  background-color: #2ecc71;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-contenido {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: #3498db;
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #bdc3c7;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.btn-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #e74c3c;
}

.modal-body {
  padding: 2rem;
}

.form-servicio {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #bdc3c7;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #2c3e50;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.form-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: #bdc3c7;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
  
  .admin-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .filtros-container {
    flex-direction: column;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .modal-contenido {
    margin: 1rem;
    max-width: none;
  }
  
  .servicios-grid {
    grid-template-columns: 1fr;
  }
  
  .servicio-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-row strong {
    min-width: auto;
  }
  
  .search-box {
    flex: 1;
    min-width: 200px;
  }
}
</style>