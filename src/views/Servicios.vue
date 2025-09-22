<template>
  <div class="servicios-admin">
    <section class="admin-hero">
      <h1>Gestión de Servicios</h1>
      <p>Administra los servicios de la clínica: crea, edita y elimina con facilidad.</p>
      <button class="btn-primary" @click="mostrarFormularioCrear">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nuevo Servicio
      </button>
    </section>

    <div class="status-messages">
      <p v-if="loading" class="status-message loading-message">Cargando servicios...</p>
      <p v-if="error" class="status-message error-message">Error: {{ error.message }}</p>
      <p v-if="successMessage" class="status-message success-message">{{ successMessage }}</p>
    </div>

    <div v-if="formularioVisible" class="form-overlay">
      <form @submit.prevent="handleSubmit" class="service-form">
        <h2>{{ servicioActual.id ? 'Editar Servicio' : 'Nuevo Servicio' }}</h2>
        <div class="form-group">
          <label for="titulo">Título</label>
          <input type="text" id="titulo" v-model="servicioActual.titulo" required />
        </div>
        <div class="form-group">
          <label for="descripcion">Descripción</label>
          <textarea id="descripcion" v-model="servicioActual.descripcion" required></textarea>
        </div>
        <div class="form-group">
          <label for="duracion">Duración (minutos)</label>
          <input type="number" id="duracion" v-model.number="servicioActual.duracion_minutos" required />
        </div>
        <div class="form-group">
          <label for="precio">Precio ($)</label>
          <input type="number" id="precio" v-model.number="servicioActual.precio" step="0.01" required />
        </div>
        <div class="form-group">
          <label for="categoria">Categoría</label>
          <select id="categoria" v-model="servicioActual.categoria" required>
            <option value="consulta">Consulta</option>
            <option value="procedimiento">Procedimiento</option>
            <option value="cuidado">Cuidado</option>
            <option value="emergencia">Emergencia</option>
          </select>
        </div>
        <div class="form-group">
          <label for="foto">Foto</label>
          <input type="file" id="foto" ref="fileInput" @change="handleFileChange" accept="image/*" />
        </div>
        <div v-if="servicioActual.foto_url" class="current-image-preview">
          <p>Imagen actual:</p>
          <img :src="servicioActual.foto_url" alt="Imagen del servicio" style="max-width: 150px; border-radius: 8px;" />
        </div>
        <div class="form-group checkbox-group">
          <input type="checkbox" id="activo" v-model="servicioActual.is_activo" />
          <label for="activo">Servicio activo</label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">{{ servicioActual.id ? 'Actualizar' : 'Crear' }}</button>
          <button type="button" class="btn-secondary" @click="cerrarFormulario">Cancelar</button>
        </div>
      </form>
    </div>

    <section class="services-table-section">
      <table class="services-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6">Cargando...</td>
          </tr>
          <tr v-else-if="servicios.length === 0">
            <td colspan="6">No hay servicios registrados.</td>
          </tr>
          <tr v-for="servicio in servicios" :key="servicio.id">
            <td>{{ servicio.id }}</td>
            <td>{{ servicio.titulo }}</td>
            <td>${{ servicio.precio.toFixed(2) }}</td>
            <td>{{ servicio.is_activo ? 'Sí' : 'No' }}</td>
            <td class="action-buttons">
              <button @click="editarServicio(servicio)" class="btn-edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
              <button @click="eliminarServicio(servicio)" class="btn-delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const servicios = ref([]);
const loading = ref(true);
const error = ref(null);
const formularioVisible = ref(false);
const successMessage = ref('');
const fileInput = ref(null);
const uploadedFile = ref(null);

const servicioActual = ref({
  id: null,
  titulo: '',
  descripcion: '',
  duracion_minutos: 0,
  precio: 0,
  categoria: 'consulta',
  icono: null,
  foto_url: '',
  is_activo: true,
});

const resetFormulario = () => {
  servicioActual.value = {
    id: null,
    titulo: '',
    descripcion: '',
    duracion_minutos: 0,
    precio: 0,
    categoria: 'consulta',
    icono: null,
    foto_url: '',
    is_activo: true,
  };
  uploadedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const mostrarFormularioCrear = () => {
  resetFormulario();
  formularioVisible.value = true;
};

const cerrarFormulario = () => {
  formularioVisible.value = false;
  successMessage.value = '';
};

const editarServicio = (servicio) => {
  servicioActual.value = { ...servicio };
  formularioVisible.value = true;
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  uploadedFile.value = file;
};

const fetchServices = async () => {
  loading.value = true;
  error.value = null;
  const { data, error: dbError } = await supabase
    .from('servicios')
    .select('*')
    .order('creado_en', { ascending: false });

  if (dbError) {
    console.error('Error al cargar los servicios:', dbError.message);
    error.value = dbError;
  } else {
    servicios.value = data;
  }
  loading.value = false;
};

const handleSubmit = async () => {
  let publicUrl = servicioActual.value.foto_url;
  if (uploadedFile.value) {
    const filePath = `servicios/${uuidv4()}-${uploadedFile.value.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from('servicios')
      .upload(filePath, uploadedFile.value);

    if (uploadError) {
      error.value = uploadError;
      return;
    }
    const { data: publicUrlData } = supabase.storage
      .from('servicios')
      .getPublicUrl(filePath);
    publicUrl = publicUrlData.publicUrl;
  }
  servicioActual.value.foto_url = publicUrl;

  if (servicioActual.value.id) {
    await actualizarServicio();
  } else {
    await agregarServicio();
  }
};

const agregarServicio = async () => {
  const { id, ...newServiceData } = servicioActual.value;
  const { data, error: insertError } = await supabase
    .from('servicios')
    .insert([newServiceData])
    .select();

  if (insertError) {
    error.value = insertError;
  } else {
    servicios.value.unshift(data[0]);
    successMessage.value = '¡Servicio creado exitosamente!';
    cerrarFormulario();
  }
};

const actualizarServicio = async () => {
  const { id, ...updateData } = servicioActual.value;
  const { error: updateError } = await supabase
    .from('servicios')
    .update(updateData)
    .eq('id', id);

  if (updateError) {
    error.value = updateError;
  } else {
    const index = servicios.value.findIndex(s => s.id === id);
    if (index !== -1) {
      servicios.value[index] = { ...servicioActual.value };
    }
    successMessage.value = '¡Servicio actualizado exitosamente!';
    cerrarFormulario();
  }
};

const eliminarServicio = async (servicio) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;

  if (servicio.foto_url) {
    const fileName = servicio.foto_url.split('/').pop();
    const { error: deleteFileError } = await supabase.storage
      .from('servicios')
      .remove([`servicios/${fileName}`]);
    
    if (deleteFileError) {
      console.warn('Error al eliminar la imagen del almacenamiento:', deleteFileError.message);
    }
  }

  const { error: deleteError } = await supabase
    .from('servicios')
    .delete()
    .eq('id', servicio.id);

  if (deleteError) {
    error.value = deleteError;
  } else {
    servicios.value = servicios.value.filter(s => s.id !== servicio.id);
    successMessage.value = '¡Servicio eliminado exitosamente!';
  }
};

onMounted(() => {
  fetchServices();
});
</script>

---

<style scoped>
/*
  =================================
  ESTILOS ACTUALIZADOS PARA MAYOR CONTRASTE
  =================================
*/

.servicios-admin {
  padding: 2rem;
  background-color: #141f23; /* Fondo oscuro */
  min-height: 100vh;
  color: #f1f5f9; /* Texto claro */
}

.admin-hero {
  text-align: center;
  margin-bottom: 2rem;
}

.admin-hero h1 {
  font-size: 2.5rem;
  color: #90d33b; /* Tono verde */
  margin-bottom: 0.5rem;
}

.admin-hero p {
  color: #a4b3b8;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.admin-hero .btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #559b1f; /* Verde para el botón */
  color: white;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  border: none;
  cursor: pointer;
}

.admin-hero .btn-primary:hover {
  background-color: #3f7b16; /* Verde oscuro al pasar el cursor */
}

.status-messages {
  margin-bottom: 1rem;
  text-align: center;
}

.status-message {
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
}

.loading-message {
  color: #90d33b;
}

.error-message {
  background-color: #ff5252;
  color: white;
  border: 1px solid #d32f2f;
}

.success-message {
  background-color: #4caf50;
  color: white;
  border: 1px solid #388e3c;
}

/* Formulario */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.service-form {
  background-color: #2c3e50; /* Fondo oscuro para el formulario */
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 600px;
  overflow-y: auto;
  max-height: 90vh;
}

.service-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #90d33b;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #a4b3b8; /* Texto de la etiqueta más claro */
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #4a5568; /* Borde oscuro */
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
  background-color: #1a2327; /* Fondo del campo de entrada oscuro */
  color: #f1f5f9; /* Texto del campo de entrada claro */
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  background-color: #4a5568; /* Gris oscuro para el botón secundario */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #3f4753;
}

/* Tabla de servicios */
.services-table-section {
  background-color: #1a2327; /* Fondo de la tabla oscuro */
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  overflow-x: auto;
}

.services-table {
  width: 100%;
  border-collapse: collapse;
}

.services-table th,
.services-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #4a5568; /* Líneas divisorias oscuras */
}

.services-table th {
  background-color: #2c3e50;
  font-weight: bold;
  color: #a4b3b8;
}

.services-table tr:hover {
  background-color: #2c3e50;
}

.action-buttons {
  white-space: nowrap;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  margin: 0 5px;
  transition: transform 0.2s;
}

.btn-edit svg {
  color: #90d33b; /* Icono de editar verde */
}

.btn-delete svg {
  color: #ff5252; /* Icono de eliminar rojo */
}

.btn-edit:hover, .btn-delete:hover {
  transform: scale(1.1);
}
</style>