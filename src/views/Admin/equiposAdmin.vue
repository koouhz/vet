<template>
  <div class="equipos-admin-container">
    <div class="main-content">
      <!-- Header -->
      <div class="admin-header">
        <h1 class="admin-title">Gestión de Equipos Médicos</h1>
        <button @click="openCrearEquipoModal" class="btn-primary">
          <i class="fas fa-plus"></i> Registrar Nuevo Equipo
        </button>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="filtros-container">
        <div class="filtro-item">
          <label for="filtro-tipo">Tipo</label>
          <select id="filtro-tipo" v-model="filtroTipo" @change="filtrarEquipos">
            <option value="">Todos los tipos</option>
            <option value="diagnostico">Diagnóstico</option>
            <option value="cirugia">Cirugía</option>
            <option value="laboratorio">Laboratorio</option>
            <option value="cuidado">Cuidado</option>
          </select>
        </div>
        <div class="filtro-item">
          <label for="filtro-estado">Estado</label>
          <select id="filtro-estado" v-model="filtroEstado" @change="filtrarEquipos">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera_de_servicio">Fuera de servicio</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>
        <div class="search-box">
          <input 
            type="text" 
            v-model="busqueda" 
            placeholder="Buscar equipo..." 
            @input="filtrarEquipos"
          />
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando equipos médicos...</p>
      </div>

      <!-- Lista de equipos como tarjetas -->
      <div v-else class="equipos-lista">
        <div v-if="equiposFiltrados.length === 0" class="no-data">
          <i class="fas fa-search"></i>
          <p>No se encontraron equipos médicos</p>
        </div>
        <div v-else class="equipos-grid">
          <div v-for="equipo in equiposFiltrados" :key="equipo.id" class="equipo-card">
            <div class="equipo-header">
              <h3>{{ equipo.nombre }}</h3>
              <span class="badge" :class="getTipoColor(equipo.tipo)">
                {{ getTipoLabel(equipo.tipo) }}
              </span>
            </div>
            <div class="equipo-body">
              <div class="info-row">
                <strong>Marca/Modelo:</strong>
                <span>{{ equipo.marca }} {{ equipo.modelo }}</span>
              </div>
              <div class="info-row">
                <strong>N° Serie:</strong>
                <span>{{ equipo.numero_serie || 'No disponible' }}</span>
              </div>
              <div class="info-row">
                <strong>Ubicación:</strong>
                <span>{{ equipo.ubicacion || 'No especificada' }}</span>
              </div>
              <div class="info-row">
                <strong>Estado:</strong>
                <span :class="getEstadoClass(equipo.estado)">
                  {{ getEstadoLabel(equipo.estado) }}
                </span>
              </div>
              <div class="info-row">
                <strong>Compra:</strong>
                <span>{{ equipo.fecha_compra ? new Date(equipo.fecha_compra).toLocaleDateString() : 'No especificada' }}</span>
              </div>
              <div class="info-row">
                <strong>Garantía:</strong>
                <span :class="getGarantiaClass(equipo.garantia_expira)">
                  {{ equipo.garantia_expira ? new Date(equipo.garantia_expira).toLocaleDateString() : 'Sin garantía' }}
                </span>
              </div>
              <div v-if="equipo.notas" class="info-row notas">
                <strong>Notas:</strong>
                <span>{{ equipo.notas }}</span>
              </div>
            </div>
            <div class="equipo-actions">
              <button @click="editarEquipo(equipo)" class="btn-action btn-edit">
                <i class="fas fa-edit"></i>
                <span>Editar</span>
              </button>
              <button @click="cambiarEstado(equipo)" class="btn-action" :class="getEstadoButtonClass(equipo.estado)">
                <i class="fas fa-sync-alt"></i>
                <span>{{ getEstadoButtonText(equipo.estado) }}</span>
              </button>
              <button @click="eliminarEquipo(equipo.id)" class="btn-action btn-delete">
                <i class="fas fa-archive"></i>
                <span>Dar de baja</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Crear/Editar Equipo -->
      <div v-if="modalVisible" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-contenido">
          <div class="modal-header">
            <h2>{{ modoEdicion ? 'Editar Equipo Médico' : 'Registrar Nuevo Equipo' }}</h2>
            <button class="btn-close" @click="cerrarModal">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardarEquipo" class="form-equipo">
              <div class="form-group">
                <label for="nombre">Nombre del Equipo *</label>
                <input 
                  type="text" 
                  id="nombre" 
                  v-model="equipoForm.nombre" 
                  required 
                  placeholder="Ej. Ecógrafo Portátil"
                />
              </div>
              <div class="form-group">
                <label for="tipo">Tipo *</label>
                <select id="tipo" v-model="equipoForm.tipo" required>
                  <option value="">Seleccionar tipo</option>
                  <option value="diagnostico">Diagnóstico</option>
                  <option value="cirugia">Cirugía</option>
                  <option value="laboratorio">Laboratorio</option>
                  <option value="cuidado">Cuidado</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="marca">Marca</label>
                  <input 
                    type="text" 
                    id="marca" 
                    v-model="equipoForm.marca" 
                    placeholder="Ej. Siemens"
                  />
                </div>
                <div class="form-group">
                  <label for="modelo">Modelo</label>
                  <input 
                    type="text" 
                    id="modelo" 
                    v-model="equipoForm.modelo" 
                    placeholder="Ej. X300"
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="numero_serie">Número de Serie</label>
                <input 
                  type="text" 
                  id="numero_serie" 
                  v-model="equipoForm.numero_serie" 
                  placeholder="Ej. SN-2024-001"
                />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="fecha_compra">Fecha de Compra</label>
                  <input 
                    type="date" 
                    id="fecha_compra" 
                    v-model="equipoForm.fecha_compra"
                  />
                </div>
                <div class="form-group">
                  <label for="garantia_expira">Garantía Expira</label>
                  <input 
                    type="date" 
                    id="garantia_expira" 
                    v-model="equipoForm.garantia_expira"
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="ubicacion">Ubicación</label>
                <input 
                  type="text" 
                  id="ubicacion" 
                  v-model="equipoForm.ubicacion" 
                  placeholder="Ej. Sala 1 - Diagnóstico"
                />
              </div>
              <div class="form-group">
                <label for="estado">Estado *</label>
                <select id="estado" v-model="equipoForm.estado" required>
                  <option value="activo">Activo</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="fuera_de_servicio">Fuera de servicio</option>
                  <option value="archivado">Archivado</option>
                </select>
              </div>
              <div class="form-group">
                <label for="notas">Notas</label>
                <textarea 
                  id="notas" 
                  v-model="equipoForm.notas" 
                  placeholder="Notas adicionales sobre el equipo"
                  rows="3"
                ></textarea>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-secondary" @click="cerrarModal">Cancelar</button>
                <button type="submit" class="btn-primary">
                  {{ modoEdicion ? 'Actualizar' : 'Registrar' }} Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación Cambiar Estado -->
      <div v-if="modalEstadoVisible" class="modal-overlay" @click.self="cerrarModalEstado">
        <div class="modal-confirmacion">
          <div class="modal-header">
            <h3>Cambiar Estado del Equipo</h3>
            <button class="btn-close" @click="cerrarModalEstado">&times;</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas cambiar el estado del equipo <strong>{{ equipoEstado?.nombre }}</strong>?</p>
            <div class="estado-seleccion">
              <label>Estado actual: 
                <span :class="getEstadoClass(equipoEstado?.estado)">
                  {{ getEstadoLabel(equipoEstado?.estado) }}
                </span>
              </label>
            </div>
            <div class="form-group">
              <label for="nuevo_estado">Nuevo estado:</label>
              <select id="nuevo_estado" v-model="nuevoEstado" class="select-estado">
                <option value="activo">Activo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="fuera_de_servicio">Fuera de servicio</option>
                <option value="archivado">Archivado</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="cerrarModalEstado">Cancelar</button>
            <button class="btn-primary" @click="confirmarCambioEstado">Cambiar Estado</button>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación Dar de Baja -->
      <div v-if="modalEliminarVisible" class="modal-overlay" @click.self="cerrarModalEliminar">
        <div class="modal-confirmacion">
          <div class="modal-header">
            <h3>Confirmar Dar de Baja</h3>
            <button class="btn-close" @click="cerrarModalEliminar">&times;</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas dar de baja el equipo <strong>{{ equipoEliminar?.nombre }}</strong>?</p>
            <p>Esta acción cambiará su estado a "Archivado".</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="cerrarModalEliminar">Cancelar</button>
            <button class="btn-delete" @click="confirmarDarBaja">Dar de Baja</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const equipos = ref([])
const busqueda = ref('')
const filtroTipo = ref('')
const filtroEstado = ref('')
const modalVisible = ref(false)
const modalEstadoVisible = ref(false)
const modalEliminarVisible = ref(false)
const modoEdicion = ref(false)
const loading = ref(true)
const equipoForm = ref({
  id: null,
  nombre: '',
  tipo: '',
  marca: '',
  modelo: '',
  numero_serie: '',
  fecha_compra: '',
  garantia_expira: '',
  ubicacion: '',
  estado: 'activo',
  notas: ''
})
const equipoEstado = ref(null)
const nuevoEstado = ref('mantenimiento')
const equipoEliminar = ref(null)

// Cargar datos desde Supabase
const cargarDatos = async () => {
  loading.value = true
  
  try {
    const { data: equiposData, error: equiposError } = await supabase
      .from('equiposmedicos')
      .select(`
        id,
        nombre,
        tipo,
        marca,
        modelo,
        numero_serie,
        fecha_compra,
        garantia_expira,
        ubicacion,
        estado,
        notas,
        creado_en,
        actualizado_en
      `)
      .order('nombre', { ascending: true })
    
    if (equiposError) throw equiposError
    equipos.value = equiposData || []
    
  } catch (error) {
    console.error('Error al cargar datos:', error)
    alert('Error al cargar los equipos médicos: ' + error.message)
  } finally {
    loading.value = false
  }
}

// Filtrar equipos (computed)
const equiposFiltrados = computed(() => {
  return equipos.value.filter(equipo => {
    const coincideBusqueda = !busqueda.value || 
      equipo.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      (equipo.marca && equipo.marca.toLowerCase().includes(busqueda.value.toLowerCase())) ||
      (equipo.modelo && equipo.modelo.toLowerCase().includes(busqueda.value.toLowerCase()))
    const coincideTipo = !filtroTipo.value || equipo.tipo === filtroTipo.value
    const coincideEstado = !filtroEstado.value || equipo.estado === filtroEstado.value
    
    return coincideBusqueda && coincideTipo && coincideEstado
  })
})

// Abrir modal para crear
const openCrearEquipoModal = () => {
  modoEdicion.value = false
  equipoForm.value = {
    id: null,
    nombre: '',
    tipo: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    fecha_compra: '',
    garantia_expira: '',
    ubicacion: '',
    estado: 'activo',
    notas: ''
  }
  modalVisible.value = true
}

// Editar equipo
const editarEquipo = (equipo) => {
  modoEdicion.value = true
  equipoForm.value = { ...equipo }
  modalVisible.value = true
}

// Cerrar modal
const cerrarModal = () => {
  modalVisible.value = false
}

// Guardar equipo (crear o actualizar)
const guardarEquipo = async () => {
  try {
    if (modoEdicion.value) {
      // Actualizar equipo
      const { data, error } = await supabase
        .from('equiposmedicos')
        .update({
          nombre: equipoForm.value.nombre,
          tipo: equipoForm.value.tipo,
          marca: equipoForm.value.marca,
          modelo: equipoForm.value.modelo,
          numero_serie: equipoForm.value.numero_serie,
          fecha_compra: equipoForm.value.fecha_compra,
          garantia_expira: equipoForm.value.garantia_expira,
          ubicacion: equipoForm.value.ubicacion,
          estado: equipoForm.value.estado,
          notas: equipoForm.value.notas,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', equipoForm.value.id)
        .select()
        .single()
      
      if (error) throw error
      
      // Actualizar en la lista local
      const index = equipos.value.findIndex(e => e.id === equipoForm.value.id)
      if (index !== -1) {
        equipos.value[index] = { ...data }
      }
      
      alert('Equipo actualizado exitosamente')
    } else {
      // Crear nuevo equipo
      const { data, error } = await supabase
        .from('equiposmedicos')
        .insert({
          nombre: equipoForm.value.nombre,
          tipo: equipoForm.value.tipo,
          marca: equipoForm.value.marca,
          modelo: equipoForm.value.modelo,
          numero_serie: equipoForm.value.numero_serie,
          fecha_compra: equipoForm.value.fecha_compra,
          garantia_expira: equipoForm.value.garantia_expira,
          ubicacion: equipoForm.value.ubicacion,
          estado: equipoForm.value.estado,
          notas: equipoForm.value.notas
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Agregar a la lista local
      equipos.value.push(data)
      alert('Equipo registrado exitosamente')
    }
    
    cerrarModal()
  } catch (error) {
    console.error('Error al guardar equipo:', error)
    alert('Error al guardar el equipo: ' + error.message)
  }
}

// Abrir modal para cambiar estado
const cambiarEstado = (equipo) => {
  equipoEstado.value = equipo
  nuevoEstado.value = equipo.estado === 'activo' ? 'mantenimiento' : 'activo'
  modalEstadoVisible.value = true
}

// Cerrar modal de estado
const cerrarModalEstado = () => {
  modalEstadoVisible.value = false
  equipoEstado.value = null
}

// Confirmar cambio de estado
const confirmarCambioEstado = async () => {
  try {
    const { data, error } = await supabase
      .from('equiposmedicos')
      .update({
        estado: nuevoEstado.value,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', equipoEstado.value.id)
      .select()
      .single()
    
    if (error) throw error
    
    // Actualizar en la lista local
    const index = equipos.value.findIndex(e => e.id === equipoEstado.value.id)
    if (index !== -1) {
      equipos.value[index] = { ...data }
    }
    
    alert(`Estado del equipo actualizado a: ${getEstadoLabel(nuevoEstado.value)}`)
    cerrarModalEstado()
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    alert('Error al cambiar el estado del equipo: ' + error.message)
  }
}

// Eliminar equipo (dar de baja)
const eliminarEquipo = (id) => {
  const equipo = equipos.value.find(e => e.id === id)
  if (equipo) {
    equipoEliminar.value = equipo
    modalEliminarVisible.value = true
  }
}

// Cerrar modal de eliminar
const cerrarModalEliminar = () => {
  modalEliminarVisible.value = false
  equipoEliminar.value = null
}

// Confirmar dar de baja
const confirmarDarBaja = async () => {
  try {
    const { data, error } = await supabase
      .from('equiposmedicos')
      .update({
        estado: 'archivado',
        actualizado_en: new Date().toISOString()
      })
      .eq('id', equipoEliminar.value.id)
      .select()
      .single()
    
    if (error) throw error
    
    // Actualizar en la lista local
    const index = equipos.value.findIndex(e => e.id === equipoEliminar.value.id)
    if (index !== -1) {
      equipos.value[index] = { ...data }
    }
    
    alert('Equipo dado de baja exitosamente')
    cerrarModalEliminar()
  } catch (error) {
    console.error('Error al dar de baja:', error)
    alert('Error al dar de baja el equipo: ' + error.message)
  }
}

// Obtener color de tipo
const getTipoColor = (tipo) => {
  const colores = {
    'diagnostico': 'badge-blue',
    'cirugia': 'badge-red',
    'laboratorio': 'badge-purple',
    'cuidado': 'badge-green'
  }
  return colores[tipo] || 'badge-gray'
}

// Obtener etiqueta de tipo
const getTipoLabel = (tipo) => {
  const labels = {
    'diagnostico': 'Diagnóstico',
    'cirugia': 'Cirugía',
    'laboratorio': 'Laboratorio',
    'cuidado': 'Cuidado'
  }
  return labels[tipo] || tipo
}

// Obtener clase de estado
const getEstadoClass = (estado) => {
  const clases = {
    'activo': 'estado-activo',
    'mantenimiento': 'estado-mantenimiento',
    'fuera_de_servicio': 'estado-inactivo',
    'archivado': 'estado-archivado'
  }
  return clases[estado] || 'estado-activo'
}

// Obtener etiqueta de estado
const getEstadoLabel = (estado) => {
  const labels = {
    'activo': 'Activo',
    'mantenimiento': 'Mantenimiento',
    'fuera_de_servicio': 'Fuera de servicio',
    'archivado': 'Archivado'
  }
  return labels[estado] || estado
}

// Obtener clase para botón de estado
const getEstadoButtonClass = (estado) => {
  const clases = {
    'activo': 'btn-mantenimiento',
    'mantenimiento': 'btn-activo',
    'fuera_de_servicio': 'btn-activo',
    'archivado': 'btn-activo'
  }
  return clases[estado] || 'btn-mantenimiento'
}

// Obtener texto para botón de estado
const getEstadoButtonText = (estado) => {
  const textos = {
    'activo': 'Mantenimiento',
    'mantenimiento': 'Activar',
    'fuera_de_servicio': 'Activar',
    'archivado': 'Reactivar'
  }
  return textos[estado] || 'Cambiar estado'
}

// Obtener clase para garantía
const getGarantiaClass = (fechaGarantia) => {
  if (!fechaGarantia) return 'garantia-sin'
  
  const hoy = new Date()
  const fecha = new Date(fechaGarantia)
  const diffTime = fecha - hoy
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'garantia-vencida'
  if (diffDays <= 30) return 'garantia-por-vencer'
  return 'garantia-activa'
}

// Cargar datos al montar el componente
onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.equipos-admin-container {
  background-color: #0f1a2c;
  color: white;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  margin-left: 240px;
  padding: 2rem;
}

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

.equipos-lista {
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

.equipos-grid {
  display: grid;
  gap: 1.5rem;
  padding: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.equipo-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.equipo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.equipo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.equipo-header h3 {
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
.badge-red { background-color: #e74c3c; color: white; }
.badge-purple { background-color: #9b59b6; color: white; }
.badge-green { background-color: #2ecc71; color: white; }
.badge-gray { background-color: #7f8c8d; color: white; }

.equipo-body {
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

.notas span {
  display: block;
  margin-top: 0.25rem;
  font-style: italic;
  color: #bdc3c7;
}

.estado-activo {
  color: #2ecc71;
  font-weight: 500;
}

.estado-mantenimiento {
  color: #f39c12;
  font-weight: 500;
}

.estado-inactivo {
  color: #e74c3c;
  font-weight: 500;
}

.estado-archivado {
  color: #7f8c8d;
  font-weight: 500;
}

.garantia-activa {
  color: #2ecc71;
  font-weight: 500;
}

.garantia-por-vencer {
  color: #f39c12;
  font-weight: 500;
}

.garantia-vencida {
  color: #e74c3c;
  font-weight: 500;
}

.garantia-sin {
  color: #7f8c8d;
  font-weight: 500;
}

.equipo-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-edit {
  background-color: #3498db;
}

.btn-edit:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.btn-delete {
  background-color: #e74c3c;
}

.btn-delete:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
}

.btn-mantenimiento {
  background-color: #f39c12;
}

.btn-activo {
  background-color: #2ecc71;
}

.btn-mantenimiento:hover,
.btn-activo:hover {
  transform: translateY(-1px);
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

.form-equipo {
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

.select-estado {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #2c3e50;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.estado-seleccion {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  
  .equipos-grid {
    grid-template-columns: 1fr;
  }
  
  .equipo-header {
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
  
  .equipo-actions {
    justify-content: center;
  }
}
</style>