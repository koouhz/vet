<template>
  <div class="configuracion-admin-container">
    <div class="main-content">
      <!-- Header -->
      <div class="admin-header">
        <h1 class="admin-title">Configuración y Horarios</h1>
      </div>

      <!-- Tabs de navegación -->
      <div class="tabs-container">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Contenido según tab seleccionado -->
      <div class="tab-content">
        <!-- Tab: Configuración del Sistema -->
        <div v-if="activeTab === 'configuracion'" class="config-tab">
          <div class="action-header">
            <div class="search-box">
              <input 
                type="text" 
                v-model="busquedaConfig" 
                placeholder="Buscar por clave o descripción..." 
                @input="filtrarConfiguraciones"
              />
              <i class="fas fa-search search-icon"></i>
            </div>
            <button @click="openCrearConfiguracionModal" class="btn-primary">
              <i class="fas fa-plus"></i> Nueva Configuración
            </button>
          </div>

          <!-- Estado de carga -->
          <div v-if="loadingConfig" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando configuraciones del sistema...</p>
          </div>

          <!-- Lista de configuraciones -->
          <div v-else class="configuraciones-lista">
            <div v-if="configuracionesFiltradas.length === 0" class="no-data">
              <i class="fas fa-cog"></i>
              <p>No se encontraron configuraciones</p>
            </div>
            <div v-else class="configuraciones-grid">
              <div v-for="config in configuracionesFiltradas" :key="config.clave" class="configuracion-card">
                <div class="configuracion-header">
                  <h3>{{ config.clave }}</h3>
                  <div class="configuracion-meta">
                    <span v-if="config.actualizado_por" class="badge badge-usuario">
                      Actualizado por: {{ getNombreUsuario(config.actualizado_por) }}
                    </span>
                    <span v-if="config.actualizado_en" class="badge badge-fecha">
                      {{ new Date(config.actualizado_en).toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div v-if="config.descripcion" class="configuracion-descripcion">
                  <p><strong>Descripción:</strong> {{ config.descripcion }}</p>
                </div>
                <div class="configuracion-valor">
                  <h4>Valor (JSON):</h4>
                  <pre class="json-value">{{ formatearJSON(config.valor) }}</pre>
                </div>
                <div class="configuracion-actions">
                  <button @click="editarConfiguracion(config)" class="btn-action btn-edit">
                    <i class="fas fa-edit"></i>
                    <span>Editar</span>
                  </button>
                  <button @click="eliminarConfiguracion(config.clave)" class="btn-action btn-delete">
                    <i class="fas fa-trash"></i>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Asignación a Veterinarios -->
        <div v-if="activeTab === 'asignacion-veterinarios'" class="asignacion-tab">
          <div class="action-header">
            <select v-model="veterinarioSeleccionado" @change="cargarHorariosVeterinario">
              <option value="">Seleccionar Veterinario</option>
              <option v-for="vet in veterinarios" :key="vet.id" :value="vet.id">
                {{ vet.nombre_completo }} - {{ vet.especialidad_nombre }}
              </option>
            </select>
            <button v-if="veterinarioSeleccionado" @click="openCrearHorarioModal" class="btn-primary">
              <i class="fas fa-plus"></i> Agregar Horario Personalizado
            </button>
          </div>

          <!-- Estado de carga -->
          <div v-if="loadingAsignacion" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando horarios...</p>
          </div>

          <!-- Vista de asignación por días -->
          <div v-else-if="veterinarioSeleccionado" class="asignacion-container">
            <h3 class="veterinario-title">
              Horarios para: {{ getNombreVeterinario(veterinarioSeleccionado) }}
            </h3>
            
            <div class="dias-semana-grid">
              <div 
                v-for="dia in diasSemana" 
                :key="dia.value" 
                class="dia-columna"
              >
                <div class="dia-header">
                  <h4>{{ dia.label }}</h4>
                </div>
                <div class="horarios-dia">
                  <div 
                    v-for="horario in getHorariosPorDia(dia.value)" 
                    :key="horario.id" 
                    class="horario-veterinario-item"
                    :class="{ 'disponible': horario.es_disponible, 'no-disponible': !horario.es_disponible }"
                  >
                    <div class="horario-info">
                      <div class="horario-hora">
                        {{ formatHora(horario.hora_inicio) }} - {{ formatHora(horario.hora_fin) }}
                      </div>
                      <div class="horario-duracion">
                        {{ calcularDuracion(horario.hora_inicio, horario.hora_fin) }} min
                      </div>
                    </div>
                    <div class="horario-actions">
                      <button 
                        @click="toggleDisponibilidad(horario)" 
                        class="btn-action" 
                        :class="horario.es_disponible ? 'btn-inactivo' : 'btn-activo'"
                      >
                        <i class="fas fa-toggle-on"></i>
                        <span>{{ horario.es_disponible ? 'Desactivar' : 'Activar' }}</span>
                      </button>
                      <button @click="eliminarHorario(horario.id)" class="btn-action btn-delete">
                        <i class="fas fa-trash"></i>
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                  <div v-if="getHorariosPorDia(dia.value).length === 0" class="no-horarios-dia">
                    <p>No hay horarios asignados</p>
                    <button @click="crearHorarioParaDia(dia.value)" class="btn-secondary">
                      <i class="fas fa-plus"></i> Agregar horario para {{ dia.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="seleccion-veterinario">
            <i class="fas fa-user-md"></i>
            <p>Selecciona un veterinario para gestionar sus horarios</p>
          </div>
        </div>
      </div>

      <!-- Modal Crear/Editar Configuración -->
      <div v-if="modalConfigVisible" class="modal-overlay" @click.self="cerrarModalConfig">
        <div class="modal-contenido">
          <div class="modal-header">
            <h2>{{ modoEdicionConfig ? 'Editar Configuración' : 'Crear Nueva Configuración' }}</h2>
            <button class="btn-close" @click="cerrarModalConfig">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardarConfiguracion" class="form-configuracion">
              <div class="form-group">
                <label for="clave">Clave *</label>
                <input 
                  type="text" 
                  id="clave" 
                  v-model="configuracionForm.clave" 
                  :disabled="modoEdicionConfig"
                  :class="{ 'input-error': errorClave }"
                  required 
                  placeholder="Ej. sistema_horario_atencion"
                />
                <div v-if="errorClave" class="error-message">
                  {{ errorClave }}
                </div>
              </div>
              <div class="form-group">
                <label for="descripcion">Descripción</label>
                <textarea 
                  id="descripcion" 
                  v-model="configuracionForm.descripcion" 
                  placeholder="Descripción de la configuración"
                  rows="3"
                ></textarea>
              </div>
              <div class="form-group">
                <label for="valor">Valor (JSON) *</label>
                <textarea 
                  id="valor" 
                  v-model="configuracionForm.valor" 
                  :class="{ 'input-error': errorValor }"
                  required 
                  placeholder='Ej. { "horario_inicio": "08:00", "horario_fin": "18:00" }'
                  rows="6"
                ></textarea>
                <div v-if="errorValor" class="error-message">
                  {{ errorValor }}
                </div>
                <p class="help-text">El valor debe ser un JSON válido</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-secondary" @click="cerrarModalConfig">Cancelar</button>
                <button type="submit" class="btn-primary">
                  {{ modoEdicionConfig ? 'Actualizar' : 'Crear' }} Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Crear Horario Personalizado -->
      <div v-if="modalHorarioVisible" class="modal-overlay" @click.self="cerrarModalHorario">
        <div class="modal-contenido">
          <div class="modal-header">
            <h2>Crear Nuevo Horario Personalizado</h2>
            <button class="btn-close" @click="cerrarModalHorario">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="crearHorario" class="form-horario">
              <div class="form-group">
                <label for="dia_semana">Día de la semana *</label>
                <select id="dia_semana" v-model="horarioForm.dia_semana" required>
                  <option value="">Seleccionar día</option>
                  <option value="lunes">Lunes</option>
                  <option value="martes">Martes</option>
                  <option value="miércoles">Miércoles</option>
                  <option value="jueves">Jueves</option>
                  <option value="viernes">Viernes</option>
                  <option value="sábado">Sábado</option>
                  <option value="domingo">Domingo</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="hora_inicio">Hora de inicio *</label>
                  <input 
                    type="time" 
                    id="hora_inicio" 
                    v-model="horarioForm.hora_inicio" 
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="hora_fin">Hora de fin *</label>
                  <input 
                    type="time" 
                    id="hora_fin" 
                    v-model="horarioForm.hora_fin" 
                    required
                  />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-secondary" @click="cerrarModalHorario">Cancelar</button>
                <button type="submit" class="btn-primary">
                  Crear Horario
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación Eliminar Configuración -->
      <div v-if="modalEliminarConfigVisible" class="modal-overlay" @click.self="cerrarModalEliminarConfig">
        <div class="modal-confirmacion">
          <div class="modal-header">
            <h3>Confirmar Eliminación</h3>
            <button class="btn-close" @click="cerrarModalEliminarConfig">&times;</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar la configuración <strong>{{ configuracionEliminar?.clave }}</strong>?</p>
            <p>Esta acción no se puede deshacer y podría afectar el funcionamiento del sistema.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="cerrarModalEliminarConfig">Cancelar</button>
            <button class="btn-delete" @click="confirmarEliminarConfig">Eliminar</button>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación Eliminar Horario -->
      <div v-if="modalEliminarHorarioVisible" class="modal-overlay" @click.self="cerrarModalEliminarHorario">
        <div class="modal-confirmacion">
          <div class="modal-header">
            <h3>Confirmar Eliminación</h3>
            <button class="btn-close" @click="cerrarModalEliminarHorario">&times;</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar el horario <strong>{{ formatHora(horarioEliminar?.hora_inicio) }} - {{ formatHora(horarioEliminar?.hora_fin) }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="cerrarModalEliminarHorario">Cancelar</button>
            <button class="btn-delete" @click="confirmarEliminarHorario">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// Estado general
const activeTab = ref('configuracion')
const tabs = [
  { id: 'configuracion', label: 'Configuración', icon: 'fas fa-cog' },
  { id: 'asignacion-veterinarios', label: 'Asignación Veterinarios', icon: 'fas fa-user-md' }
]

// --- CONFIGURACIÓN DEL SISTEMA ---
const configuraciones = ref([])
const usuarios = ref([])
const busquedaConfig = ref('')
const modalConfigVisible = ref(false)
const modalEliminarConfigVisible = ref(false)
const modoEdicionConfig = ref(false)
const loadingConfig = ref(true)
const errorClave = ref('')
const errorValor = ref('')
const configuracionForm = ref({
  clave: '',
  descripcion: '',
  valor: ''
})
const configuracionEliminar = ref(null)

// --- ASIGNACIÓN A VETERINARIOS ---
const veterinarios = ref([])
const veterinarioSeleccionado = ref('')
const horariosVeterinario = ref([])
const loadingAsignacion = ref(true)
const modalHorarioVisible = ref(false)
const modalEliminarHorarioVisible = ref(false)
const horarioForm = ref({
  dia_semana: '',
  hora_inicio: '',
  hora_fin: ''
})
const horarioEliminar = ref(null)
const diasSemana = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miércoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sábado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
]

// Cargar datos de configuración
const cargarConfiguraciones = async () => {
  loadingConfig.value = true
  
  try {
    const {  configData, error: configError } = await supabase
      .from('configuracionesistema')
      .select(`
        clave,
        valor,
        descripcion,
        actualizado_por,
        actualizado_en
      `)
      .order('clave', { ascending: true })
    
    if (configError) throw configError
    configuraciones.value = configData || []
    
    // Cargar usuarios
    const {  usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre_completo')
    
    if (usuariosError) throw usuariosError
    usuarios.value = usuariosData || []
    
  } catch (error) {
    console.error('Error al cargar configuraciones:', error)
    alert('Error al cargar las configuraciones: ' + error.message)
  } finally {
    loadingConfig.value = false
  }
}

// Cargar datos de veterinarios
const cargarVeterinarios = async () => {
  try {
    // Paso 1: Cargar solo los IDs de veterinarios activos
    const { data: veterinariosData, error: veterinariosError } = await supabase
      .from('veterinarios')
      .select('id, usuario_id, especialidad_id')
      .eq('is_activo', true)
    
    if (veterinariosError) {
      console.error('Error al cargar veterinarios:', veterinariosError)
      alert('Error al cargar los veterinarios: ' + veterinariosError.message)
      return
    }
    
    if (!veterinariosData || veterinariosData.length === 0) {
      veterinarios.value = []
      return
    }
    
    // Extraer los IDs
    const usuarioIds = [...new Set(veterinariosData.map(v => v.usuario_id))]
    const especialidadIds = [...new Set(veterinariosData.map(v => v.especialidad_id))]
    
    // Paso 2: Cargar usuarios
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre_completo')
      .in('id', usuarioIds)
    
    if (usuariosError) {
      console.error('Error al cargar usuarios:', usuariosError)
      // Continuamos aunque falle
    }
    
    // Paso 3: Cargar especialidades
    const { data: especialidadesData, error: especialidadesError } = await supabase
      .from('especialidades')
      .select('id, nombre')
      .in('id', especialidadIds)
    
    if (especialidadesError) {
      console.error('Error al cargar especialidades:', especialidadesError)
      // Continuamos aunque falle
    }
    
    // Crear mapas para acceso rápido
    const usuariosMap = new Map()
    if (usuariosData) {
      usuariosData.forEach(u => usuariosMap.set(u.id, u.nombre_completo))
    }
    
    const especialidadesMap = new Map()
    if (especialidadesData) {
      especialidadesData.forEach(e => especialidadesMap.set(e.id, e.nombre))
    }
    
    // Construir el array final
    veterinarios.value = veterinariosData.map(vet => ({
      id: vet.id,
      usuario_id: vet.usuario_id,
      especialidad_id: vet.especialidad_id,
      nombre_completo: usuariosMap.get(vet.usuario_id) || 'Sin nombre',
      especialidad_nombre: especialidadesMap.get(vet.especialidad_id) || 'Sin especialidad'
    })).sort((a, b) => {
      const nameA = a.nombre_completo.toLowerCase()
      const nameB = b.nombre_completo.toLowerCase()
      if (nameA < nameB) return -1
      if (nameA > nameB) return 1
      return 0
    })
    
    console.log('Veterinarios cargados:', veterinarios.value)
    
  } catch (error) {
    console.error('Error inesperado al cargar veterinarios:', error)
    alert('Error inesperado al cargar los veterinarios: ' + error.message)
  }
}

// Cargar horarios del veterinario seleccionado
const cargarHorariosVeterinario = async () => {
  if (!veterinarioSeleccionado.value) {
    horariosVeterinario.value = []
    return
  }
  
  loadingAsignacion.value = true
  
  try {
    const {  horariosVetData, error: horariosVetError } = await supabase
      .from('horarios_veterinarios')
      .select('*')
      .eq('veterinario_id', veterinarioSeleccionado.value)
    
    if (horariosVetError) {
      console.error('Error Supabase al cargar horarios:', horariosVetError)
      alert('Error al cargar los horarios del veterinario: ' + horariosVetError.message)
      return
    }
    
    if (!horariosVetData || !Array.isArray(horariosVetData)) {
      horariosVeterinario.value = []
      return
    }
    
    horariosVeterinario.value = horariosVetData
  } catch (error) {
    console.error('Error inesperado al cargar horarios:', error)
    alert('Error inesperado al cargar los horarios: ' + error.message)
  } finally {
    loadingAsignacion.value = false
  }
}

// --- CONFIGURACIÓN: Métodos ---
const configuracionesFiltradas = computed(() => {
  return configuraciones.value.filter(config => {
    const coincideBusqueda = !busquedaConfig.value || 
      config.clave.toLowerCase().includes(busquedaConfig.value.toLowerCase()) ||
      (config.descripcion && config.descripcion.toLowerCase().includes(busquedaConfig.value.toLowerCase()))
    
    return coincideBusqueda
  })
})

const getNombreUsuario = (usuarioId) => {
  const usuario = usuarios.value.find(u => u.id === usuarioId)
  return usuario ? usuario.nombre_completo : 'Usuario no encontrado'
}

const formatearJSON = (valor) => {
  try {
    if (typeof valor === 'string') {
      return JSON.stringify(JSON.parse(valor), null, 2)
    }
    return JSON.stringify(valor, null, 2)
  } catch (error) {
    return JSON.stringify(valor)
  }
}

const openCrearConfiguracionModal = () => {
  modoEdicionConfig.value = false
  errorClave.value = ''
  errorValor.value = ''
  configuracionForm.value = {
    clave: '',
    descripcion: '',
    valor: '{\n  "ejemplo": "valor"\n}'
  }
  modalConfigVisible.value = true
}

const editarConfiguracion = (config) => {
  modoEdicionConfig.value = true
  errorClave.value = ''
  errorValor.value = ''
  configuracionForm.value = {
    clave: config.clave,
    descripcion: config.descripcion || '',
    valor: typeof config.valor === 'string' ? config.valor : JSON.stringify(config.valor, null, 2)
  }
  modalConfigVisible.value = true
}

const cerrarModalConfig = () => {
  modalConfigVisible.value = false
}

const guardarConfiguracion = async () => {
  errorClave.value = ''
  errorValor.value = ''
  
  if (!configuracionForm.value.clave.trim()) {
    errorClave.value = 'La clave es requerida'
    return
  }
  
  try {
    JSON.parse(configuracionForm.value.valor)
  } catch (error) {
    errorValor.value = 'El valor debe ser un JSON válido'
    return
  }
  
  try {
    if (modoEdicionConfig.value) {
      const { data, error } = await supabase
        .from('configuracionesistema')
        .update({
          valor: JSON.parse(configuracionForm.value.valor),
          descripcion: configuracionForm.value.descripcion,
          actualizado_por: (await supabase.auth.getUser()).data.user?.id,
          actualizado_en: new Date().toISOString()
        })
        .eq('clave', configuracionForm.value.clave)
        .select()
        .single()
      
      if (error) throw error
      
      const index = configuraciones.value.findIndex(c => c.clave === configuracionForm.value.clave)
      if (index !== -1) {
        configuraciones.value[index] = { ...data }
      }
      
      alert('Configuración actualizada exitosamente')
    } else {
      const { data, error } = await supabase
        .from('configuracionesistema')
        .insert({
          clave: configuracionForm.value.clave,
          valor: JSON.parse(configuracionForm.value.valor),
          descripcion: configuracionForm.value.descripcion,
          actualizado_por: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      configuraciones.value.push(data)
      alert('Configuración creada exitosamente')
    }
    
    cerrarModalConfig()
  } catch (error) {
    console.error('Error al guardar configuración:', error)
    alert('Error al guardar la configuración: ' + error.message)
  }
}

const eliminarConfiguracion = (clave) => {
  const config = configuraciones.value.find(c => c.clave === clave)
  if (config) {
    configuracionEliminar.value = config
    modalEliminarConfigVisible.value = true
  }
}

const cerrarModalEliminarConfig = () => {
  modalEliminarConfigVisible.value = false
  configuracionEliminar.value = null
}

const confirmarEliminarConfig = async () => {
  try {
    const { error } = await supabase
      .from('configuracionesistema')
      .delete()
      .eq('clave', configuracionEliminar.value.clave)
    
    if (error) throw error
    
    configuraciones.value = configuraciones.value.filter(c => c.clave !== configuracionEliminar.value.clave)
    alert('Configuración eliminada exitosamente')
    cerrarModalEliminarConfig()
  } catch (error) {
    console.error('Error al eliminar configuración:', error)
    alert('Error al eliminar la configuración: ' + error.message)
  }
}

const filtrarConfiguraciones = () => {
  // Se maneja con computed property
}

// --- ASIGNACIÓN A VETERINARIOS: Métodos ---
const getHorariosPorDia = (dia) => {
  return horariosVeterinario.value.filter(h => h.dia_semana === dia)
}

const getNombreVeterinario = (id) => {
  const vet = veterinarios.value.find(v => v.id === id)
  return vet ? vet.nombre_completo : 'Veterinario no encontrado'
}

const formatHora = (hora) => {
  if (!hora) return ''
  const [time] = hora.split('.')
  return time
}

const calcularDuracion = (inicio, fin) => {
  if (!inicio || !fin) return 0
  
  const [horaIni, minIni] = inicio.split(':').map(Number)
  const [horaFin, minFin] = fin.split(':').map(Number)
  
  const inicioMinutos = horaIni * 60 + minIni
  const finMinutos = horaFin * 60 + minFin
  
  return finMinutos - inicioMinutos
}

const openCrearHorarioModal = () => {
  horarioForm.value = {
    dia_semana: '',
    hora_inicio: '',
    hora_fin: ''
  }
  modalHorarioVisible.value = true
}

const crearHorarioParaDia = (dia) => {
  horarioForm.value = {
    dia_semana: dia,
    hora_inicio: '',
    hora_fin: ''
  }
  modalHorarioVisible.value = true
}

const cerrarModalHorario = () => {
  modalHorarioVisible.value = false
}

const crearHorario = async () => {
  try {
    const { data, error } = await supabase
      .from('horarios_veterinarios')
      .insert({
        veterinario_id: veterinarioSeleccionado.value,
        dia_semana: horarioForm.value.dia_semana,
        hora_inicio: horarioForm.value.hora_inicio,
        hora_fin: horarioForm.value.hora_fin,
        es_disponible: true
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Agregar a la lista local
    horariosVeterinario.value.push(data)
    
    alert('Horario personalizado creado exitosamente')
    cerrarModalHorario()
  } catch (error) {
    console.error('Error al crear horario:', error)
    alert('Error al crear el horario: ' + error.message)
  }
}

const toggleDisponibilidad = async (horario) => {
  try {
    const nuevoEstado = !horario.es_disponible
    const { data, error } = await supabase
      .from('horarios_veterinarios')
      .update({
        es_disponible: nuevoEstado,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', horario.id)
      .select()
      .single()
    
    if (error) throw error
    
    const index = horariosVeterinario.value.findIndex(h => h.id === horario.id)
    if (index !== -1) {
      horariosVeterinario.value[index] = { ...data }
    }
    
    alert(`Horario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`)
  } catch (error) {
    console.error('Error al cambiar disponibilidad:', error)
    alert('Error al cambiar la disponibilidad: ' + error.message)
  }
}

const eliminarHorario = (id) => {
  const horario = horariosVeterinario.value.find(h => h.id === id)
  if (horario) {
    horarioEliminar.value = horario
    modalEliminarHorarioVisible.value = true
  }
}

const cerrarModalEliminarHorario = () => {
  modalEliminarHorarioVisible.value = false
  horarioEliminar.value = null
}

const confirmarEliminarHorario = async () => {
  try {
    const { error } = await supabase
      .from('horarios_veterinarios')
      .delete()
      .eq('id', horarioEliminar.value.id)
    
    if (error) throw error
    
    horariosVeterinario.value = horariosVeterinario.value.filter(h => h.id !== horarioEliminar.value.id)
    alert('Horario eliminado exitosamente')
    cerrarModalEliminarHorario()
  } catch (error) {
    console.error('Error al eliminar horario:', error)
    alert('Error al eliminar el horario: ' + error.message)
  }
}

// Cargar todos los datos al montar
onMounted(async () => {
  await cargarConfiguraciones()
  await cargarVeterinarios()
})
</script>

<style scoped>
.configuracion-admin-container {
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

.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #bdc3c7;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.tab-button.active {
  background: #3498db;
  color: white;
  transform: translateY(-1px);
}

.tab-button i {
  font-size: 1.1rem;
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  min-width: 300px;
  flex: 1;
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

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
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

.configuraciones-lista {
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

.configuraciones-grid {
  display: grid;
  gap: 1.5rem;
  padding: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}

.configuracion-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.configuracion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.configuracion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.configuracion-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #ecf0f1;
  word-break: break-all;
}

.configuracion-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
}

.badge-usuario {
  background-color: rgba(52, 152, 219, 0.2);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.badge-fecha {
  background-color: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.configuracion-descripcion {
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 3px solid #3498db;
}

.configuracion-descripcion p {
  margin: 0;
  color: #ecf0f1;
}

.configuracion-descripcion strong {
  color: #3498db;
}

.configuracion-valor {
  background: rgba(46, 204, 113, 0.05);
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #2ecc71;
  margin-bottom: 1.5rem;
}

.configuracion-valor h4 {
  margin: 0 0 0.5rem 0;
  color: #2ecc71;
  font-size: 1rem;
}

.json-value {
  margin: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  color: #f1c40f;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  overflow-x: auto;
}

.configuracion-actions {
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

.asignacion-tab {
  /* Estilos específicos para esta pestaña */
}

.asignacion-container {
  /* Estilos específicos para esta pestaña */
}

.seleccion-veterinario {
  text-align: center;
  padding: 4rem 2rem;
  color: #bdc3c7;
}

.seleccion-veterinario i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #3498db;
}

.veterinario-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ecf0f1;
  margin: 2rem 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dias-semana-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.dia-columna {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dia-header {
  text-align: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dia-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #3498db;
  font-weight: 600;
}

.horarios-dia {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.horario-veterinario-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.horario-veterinario-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.horario-veterinario-item.disponible {
  border-left: 4px solid #2ecc71;
}

.horario-veterinario-item.no-disponible {
  border-left: 4px solid #e74c3c;
  opacity: 0.7;
}

.horario-info {
  margin-bottom: 0.75rem;
}

.horario-hora {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ecf0f1;
  margin-bottom: 0.25rem;
}

.horario-duracion {
  font-size: 0.875rem;
  color: #bdc3c7;
}

.horario-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
}

.btn-activo {
  background-color: #2ecc71;
}

.btn-activo:hover {
  background-color: #27ae60;
  transform: translateY(-1px);
}

.btn-inactivo {
  background-color: #f39c12;
}

.btn-inactivo:hover {
  background-color: #e67e22;
  transform: translateY(-1px);
}

.btn-delete {
  background-color: #e74c3c;
}

.btn-delete:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
}

.no-horarios-dia {
  text-align: center;
  padding: 2rem 1rem;
  color: #7f8c8d;
  font-style: italic;
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
  max-width: 700px;
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

.form-configuracion,
.form-horario {
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

.input-error {
  border-color: #e74c3c !important;
  background-color: rgba(231, 76, 60, 0.1) !important;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.help-text {
  color: #7f8c8d;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
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
  transform: translateY(-1px);
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
  
  .tabs-container {
    flex-direction: column;
  }
  
  .action-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: 200px;
  }
  
  .modal-contenido,
  .modal-confirmacion {
    margin: 1rem;
    max-width: none;
  }
  
  .configuraciones-grid,
  .dias-semana-grid {
    grid-template-columns: 1fr;
  }
  
  .configuracion-actions,
  .horario-actions {
    justify-content: center;
  }
}
</style>