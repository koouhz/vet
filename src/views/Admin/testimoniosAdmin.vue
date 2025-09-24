<template>
  <div class="testimonios-admin-container">
    <div class="main-content">
      <!-- Header -->
      <div class="admin-header">
        <h1 class="admin-title">Gestión de Testimonios</h1>
        <div class="header-actions">
          <button @click="recargarDatos" class="btn-outline">
            <i class="fas fa-sync-alt"></i> Actualizar
          </button>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="filtros-container">
        <div class="filtro-item">
          <label for="filtro-estado">Estado</label>
          <select id="filtro-estado" v-model="filtroEstado" @change="filtrarTestimonios">
            <option value="">Todos los estados</option>
            <option value="publicado">Publicados</option>
            <option value="no_publicado">No publicados</option>
            <option value="destacado">Destacados</option>
          </select>
        </div>
        <div class="filtro-item">
          <label for="filtro-calificacion">Calificación</label>
          <select id="filtro-calificacion" v-model="filtroCalificacion" @change="filtrarTestimonios">
            <option value="">Todas las calificaciones</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>
        </div>
        <div class="search-box">
          <input 
            type="text" 
            v-model="busqueda" 
            placeholder="Buscar por cliente o mascota..." 
            @input="filtrarTestimonios"
          />
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando testimonios...</p>
      </div>

      <!-- Lista de testimonios como tarjetas -->
      <div v-else class="testimonios-lista">
        <div v-if="testimoniosFiltrados.length === 0" class="no-data">
          <i class="fas fa-comment-dots"></i>
          <p>No se encontraron testimonios</p>
        </div>
        <div v-else class="testimonios-grid">
          <div v-for="testimonio in testimoniosFiltrados" :key="testimonio.id" class="testimonio-card">
            <div class="testimonio-header">
              <div class="calificacion">
                <i v-for="i in 5" :key="i" class="fas" :class="i <= testimonio.calificacion ? 'fa-star' : 'fa-star-o'" :style="{ color: i <= testimonio.calificacion ? '#f39c12' : '#7f8c8d' }"></i>
                <span class="calificacion-numero">{{ testimonio.calificacion }}/5</span>
              </div>
              <div class="estado-badges">
                <span v-if="testimonio.publicado" class="badge badge-publicado">Publicado</span>
                <span v-if="testimonio.destacado" class="badge badge-destacado">Destacado</span>
                <span v-if="!testimonio.publicado" class="badge badge-borrador">Borrador</span>
              </div>
            </div>
            <div v-if="testimonio.foto_url" class="testimonio-imagen">
              <img :src="testimonio.foto_url" :alt="testimonio.nombre_mascota" @error="handleImageError($event, testimonio)" />
            </div>
            <div class="testimonio-body">
              <div class="info-cliente">
                <h3>{{ testimonio.nombre_cliente || 'Cliente Anónimo' }}</h3>
                <p v-if="testimonio.nombre_mascota" class="nombre-mascota">
                  <i class="fas fa-paw"></i> {{ testimonio.nombre_mascota }}
                </p>
              </div>
              <div class="testimonio-contenido">
                <p>"{{ testimonio.contenido }}"</p>
              </div>
              <div class="testimonio-metadatos">
                <div class="metadato-item">
                  <i class="fas fa-calendar"></i>
                  <span>{{ new Date(testimonio.creado_en).toLocaleDateString() }}</span>
                </div>
                <div v-if="testimonio.aprobado_por" class="metadato-item">
                  <i class="fas fa-user-check"></i>
                  <span>Aprobado por: {{ getNombreUsuario(testimonio.aprobado_por) }}</span>
                </div>
                <div v-if="testimonio.aprobado_en" class="metadato-item">
                  <i class="fas fa-clock"></i>
                  <span>{{ new Date(testimonio.aprobado_en).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
            <div class="testimonio-actions">
              <button 
                v-if="!testimonio.publicado" 
                @click="aprobarTestimonio(testimonio)" 
                class="btn-action btn-publicar"
              >
                <i class="fas fa-check-circle"></i>
                <span>Aprobar</span>
              </button>
              <button 
                v-if="testimonio.publicado" 
                @click="rechazarTestimonio(testimonio)" 
                class="btn-action btn-rechazar"
              >
                <i class="fas fa-times-circle"></i>
                <span>Rechazar</span>
              </button>
              <button 
                @click="toggleDestacado(testimonio)" 
                class="btn-action" 
                :class="testimonio.destacado ? 'btn-quitar-destacado' : 'btn-destacar'"
              >
                <i :class="testimonio.destacado ? 'fas fa-star' : 'far fa-star'"></i>
                <span>{{ testimonio.destacado ? 'Quitar destacado' : 'Destacar' }}</span>
              </button>
              <button @click="eliminarTestimonio(testimonio.id)" class="btn-action btn-delete">
                <i class="fas fa-trash"></i>
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación Aprobar -->
      <div v-if="modalAprobarVisible" class="modal-overlay" @click.self="cerrarModalAprobar">
        <div class="modal-confirmacion">
          <div class="modal-header">
            <h3>Aprobar Testimonio</h3>
            <button class="btn-close" @click="cerrarModalAprobar">&times;</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas aprobar el testimonio de <strong>{{ testimonioAprobar?.nombre_cliente }}</strong>?</p>
            <p>Este testimonio será visible en la página principal.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="cerrarModalAprobar">Cancelar</button>
            <button class="btn-publicar" @click="confirmarAprobar">Aprobar</button>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación Rechazar -->
      <div v-if="modalRechazarVisible" class="modal-overlay" @click.self="cerrarModalRechazar">
        <div class="modal-confirmacion">
          <div class="modal-header">
            <h3>Rechazar Testimonio</h3>
            <button class="btn-close" @click="cerrarModalRechazar">&times;</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas rechazar el testimonio de <strong>{{ testimonioRechazar?.nombre_cliente }}</strong>?</p>
            <p>Este testimonio ya no será visible en la página principal.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="cerrarModalRechazar">Cancelar</button>
            <button class="btn-rechazar" @click="confirmarRechazar">Rechazar</button>
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
            <p>¿Estás seguro de que deseas eliminar el testimonio de <strong>{{ testimonioEliminar?.nombre_cliente }}</strong>?</p>
            <p>Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="cerrarModalEliminar">Cancelar</button>
            <button class="btn-delete" @click="confirmarEliminar">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const testimonios = ref([])
const usuarios = ref([])
const busqueda = ref('')
const filtroEstado = ref('')
const filtroCalificacion = ref('')
const loading = ref(true)
const modalAprobarVisible = ref(false)
const modalRechazarVisible = ref(false)
const modalEliminarVisible = ref(false)
const testimonioAprobar = ref(null)
const testimonioRechazar = ref(null)
const testimonioEliminar = ref(null)

// Cargar datos desde Supabase
const cargarDatos = async () => {
  loading.value = true
  
  try {
    // Cargar testimonios
    const { data: testimoniosData, error: testimoniosError } = await supabase
      .from('testimonios')
      .select(`
        id,
        usuario_id,
        mascota_id,
        nombre_cliente,
        nombre_mascota,
        contenido,
        calificacion,
        foto_url,
        publicado,
        destacado,
        aprobado_por,
        aprobado_en,
        creado_en,
        actualizado_en
      `)
      .order('creado_en', { ascending: false })
    
    if (testimoniosError) throw testimoniosError
    testimonios.value = testimoniosData || []
    
    // Cargar usuarios para mostrar quién aprobó
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre_completo')
    
    if (usuariosError) throw usuariosError
    usuarios.value = usuariosData || []
    
  } catch (error) {
    console.error('Error al cargar datos:', error)
    alert('Error al cargar los testimonios: ' + error.message)
  } finally {
    loading.value = false
  }
}

// Filtrar testimonios (computed)
const testimoniosFiltrados = computed(() => {
  return testimonios.value.filter(testimonio => {
    const coincideBusqueda = !busqueda.value || 
      (testimonio.nombre_cliente && testimonio.nombre_cliente.toLowerCase().includes(busqueda.value.toLowerCase())) ||
      (testimonio.nombre_mascota && testimonio.nombre_mascota.toLowerCase().includes(busqueda.value.toLowerCase()))
    const coincideEstado = !filtroEstado.value || 
      (filtroEstado.value === 'publicado' && testimonio.publicado) ||
      (filtroEstado.value === 'no_publicado' && !testimonio.publicado) ||
      (filtroEstado.value === 'destacado' && testimonio.destacado)
    const coincideCalificacion = !filtroCalificacion.value || 
      testimonio.calificacion.toString() === filtroCalificacion.value
    
    return coincideBusqueda && coincideEstado && coincideCalificacion
  })
})

// Manejar error de imagen
const handleImageError = (event, testimonio) => {
  console.warn('Error al cargar imagen para testimonio:', testimonio.nombre_cliente)
  event.target.style.display = 'none'
}

// Obtener nombre del usuario
const getNombreUsuario = (usuarioId) => {
  const usuario = usuarios.value.find(u => u.id === usuarioId)
  return usuario ? usuario.nombre_completo : 'Usuario no encontrado'
}

// Abrir modal para aprobar
const aprobarTestimonio = (testimonio) => {
  testimonioAprobar.value = testimonio
  modalAprobarVisible.value = true
}

// Cerrar modal de aprobar
const cerrarModalAprobar = () => {
  modalAprobarVisible.value = false
  testimonioAprobar.value = null
}

// Confirmar aprobar
const confirmarAprobar = async () => {
  try {
    const { data, error } = await supabase
      .from('testimonios')
      .update({
        publicado: true,
        aprobado_por: (await supabase.auth.getUser()).data.user?.id,
        aprobado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })
      .eq('id', testimonioAprobar.value.id)
      .select()
      .single()
    
    if (error) throw error
    
    // Actualizar en la lista local
    const index = testimonios.value.findIndex(t => t.id === testimonioAprobar.value.id)
    if (index !== -1) {
      testimonios.value[index] = { ...data }
    }
    
    alert('Testimonio aprobado exitosamente')
    cerrarModalAprobar()
  } catch (error) {
    console.error('Error al aprobar testimonio:', error)
    alert('Error al aprobar el testimonio: ' + error.message)
  }
}

// Abrir modal para rechazar
const rechazarTestimonio = (testimonio) => {
  testimonioRechazar.value = testimonio
  modalRechazarVisible.value = true
}

// Cerrar modal de rechazar
const cerrarModalRechazar = () => {
  modalRechazarVisible.value = false
  testimonioRechazar.value = null
}

// Confirmar rechazar
const confirmarRechazar = async () => {
  try {
    const { data, error } = await supabase
      .from('testimonios')
      .update({
        publicado: false,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', testimonioRechazar.value.id)
      .select()
      .single()
    
    if (error) throw error
    
    // Actualizar en la lista local
    const index = testimonios.value.findIndex(t => t.id === testimonioRechazar.value.id)
    if (index !== -1) {
      testimonios.value[index] = { ...data }
    }
    
    alert('Testimonio rechazado exitosamente')
    cerrarModalRechazar()
  } catch (error) {
    console.error('Error al rechazar testimonio:', error)
    alert('Error al rechazar el testimonio: ' + error.message)
  }
}

// Toggle destacado
const toggleDestacado = async (testimonio) => {
  try {
    const nuevoEstado = !testimonio.destacado
    const { data, error } = await supabase
      .from('testimonios')
      .update({
        destacado: nuevoEstado,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', testimonio.id)
      .select()
      .single()
    
    if (error) throw error
    
    // Actualizar en la lista local
    const index = testimonios.value.findIndex(t => t.id === testimonio.id)
    if (index !== -1) {
      testimonios.value[index] = { ...data }
    }
    
    alert(`Testimonio ${nuevoEstado ? 'destacado' : 'quitado de destacados'} exitosamente`)
  } catch (error) {
    console.error('Error al cambiar estado destacado:', error)
    alert('Error al cambiar el estado destacado: ' + error.message)
  }
}

// Eliminar testimonio
const eliminarTestimonio = (id) => {
  const testimonio = testimonios.value.find(t => t.id === id)
  if (testimonio) {
    testimonioEliminar.value = testimonio
    modalEliminarVisible.value = true
  }
}

// Cerrar modal de eliminar
const cerrarModalEliminar = () => {
  modalEliminarVisible.value = false
  testimonioEliminar.value = null
}

// Confirmar eliminar
const confirmarEliminar = async () => {
  try {
    const { error } = await supabase
      .from('testimonios')
      .delete()
      .eq('id', testimonioEliminar.value.id)
    
    if (error) throw error
    
    // Eliminar de la lista local
    testimonios.value = testimonios.value.filter(t => t.id !== testimonioEliminar.value.id)
    alert('Testimonio eliminado exitosamente')
    cerrarModalEliminar()
  } catch (error) {
    console.error('Error al eliminar testimonio:', error)
    alert('Error al eliminar el testimonio: ' + error.message)
  }
}

// Recargar datos
const recargarDatos = () => {
  cargarDatos()
}

// Cargar datos al montar el componente
onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.testimonios-admin-container {
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
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  color: #3498db;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-outline {
  background-color: transparent;
  color: #3498db;
  border: 1px solid #3498db;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn-outline:hover {
  background-color: rgba(52, 152, 219, 0.1);
  transform: translateY(-1px);
}

.filtros-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filtro-item label {
  font-weight: 500;
  color: #bdc3c7;
}

.filtro-item select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #031527;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.726);
  color: rgb(255, 255, 255);
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

.testimonios-lista {
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
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #7f8c8d;
}

.testimonios-grid {
  display: grid;
  gap: 1.5rem;
  padding: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.testimonio-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.testimonio-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.testimonio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.calificacion {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.calificacion i {
  font-size: 1rem;
}

.calificacion-numero {
  margin-left: 0.5rem;
  font-weight: 600;
  color: #f39c12;
}

.estado-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
}

.badge-publicado {
  background-color: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.badge-destacado {
  background-color: rgba(243, 156, 18, 0.2);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

.badge-borrador {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.testimonio-imagen {
  width: 100%;
  height: 150px;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 8px;
}

.testimonio-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.testimonio-imagen img:hover {
  transform: scale(1.05);
}

.testimonio-body {
  margin-bottom: 1.5rem;
}

.info-cliente {
  margin-bottom: 1rem;
}

.info-cliente h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #ecf0f1;
}

.nombre-mascota {
  margin: 0;
  color: #3498db;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.testimonio-contenido {
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #3498db;
  margin-bottom: 1rem;
}

.testimonio-contenido p {
  margin: 0;
  font-style: italic;
  line-height: 1.5;
  color: #ecf0f1;
}

.testimonio-metadatos {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.metadato-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #bdc3c7;
  font-size: 0.875rem;
}

.metadato-item i {
  font-size: 0.875rem;
}

.testimonio-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 1rem;
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

.btn-publicar {
  background-color: #2ecc71;
}

.btn-publicar:hover {
  background-color: #27ae60;
  transform: translateY(-1px);
}

.btn-rechazar {
  background-color: #e74c3c;
}

.btn-rechazar:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
}

.btn-destacar {
  background-color: #f39c12;
}

.btn-destacar:hover {
  background-color: #e67e22;
  transform: translateY(-1px);
}

.btn-quitar-destacado {
  background-color: #7f8c8d;
}

.btn-quitar-destacado:hover {
  background-color: #95a5a6;
  transform: translateY(-1px);
}

.btn-delete {
  background-color: #e74c3c;
}

.btn-delete:hover {
  background-color: #c0392b;
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

.modal-confirmacion {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
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

.modal-header h3 {
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
  text-align: center;
}

.modal-body p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  color: #ecf0f1;
}

.modal-body p strong {
  color: #3498db;
}

.modal-footer {
  display: flex;
  justify-content: center;
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
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
  
  .admin-header {
    flex-direction: column;
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .filtros-container {
    grid-template-columns: 1fr;
  }
  
  .modal-confirmacion {
    margin: 1rem;
    max-width: none;
  }
  
  .testimonios-grid {
    grid-template-columns: 1fr;
  }
  
  .testimonio-actions {
    justify-content: center;
  }
}
</style>