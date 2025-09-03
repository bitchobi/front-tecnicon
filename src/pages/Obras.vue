<template>
  <div class="obras-container">
    <div class="page-header">
      <button @click="$router.go(-1)" class="back-btn">← Volver</button>
      <h1>Gestión de Obras</h1>
      <button @click="abrirFormulario()" class="add-btn">+ Nueva Obra</button>
    </div>

    <!-- Formulario de obra (crear/editar) -->
    <div v-if="showForm" class="form-container">
      <h3>{{ editando ? 'Editar Obra' : 'Nueva Obra' }}</h3>
      <form @submit.prevent="guardarObra">
        <div class="form-group">
          <label>Nombre de la obra *</label>
          <input v-model="form.nombre" placeholder="Nombre de la obra" required />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Fecha de inicio *</label>
            <input v-model="form.fecha_inicio" type="date" required />
          </div>
          <div class="form-group">
            <label>Fecha de fin</label>
            <input v-model="form.fecha_fin" type="date" />
          </div>
        </div>

        <div class="form-group">
          <label>Estado</label>
          <select v-model="form.estado">
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
            <option value="completada">Completada</option>
            <option value="pausada">Pausada</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading">
            {{ loading ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear') }}
          </button>
          <button type="button" @click="cancelar">Cancelar</button>
        </div>
      </form>
      
      <div v-if="mensaje" :class="success ? 'alert success' : 'alert error'">
        {{ mensaje }}
      </div>
    </div>

    <!-- Lista de obras -->
    <div class="obras-list">
      <div v-for="obra in obras" :key="obra.id_obra" class="obra-card">
        <div class="obra-header">
          <h4>{{ obra.nombre }}</h4>
          <div class="obra-actions">
            <button @click="abrirFormulario(obra)" class="btn-edit" title="Editar">✏️</button>
            <button @click="confirmarEliminacion(obra)" class="btn-delete" title="Eliminar">🗑️</button>
          </div>
        </div>
        
        <div class="obra-info">
          <p><strong>Inicio:</strong> {{ formatDate(obra.fecha_inicio) }}</p>
          <p v-if="obra.fecha_fin"><strong>Fin:</strong> {{ formatDate(obra.fecha_fin) }}</p>
          <p><strong>Estado:</strong> 
            <span :class="getEstadoClass(obra.estado)">{{ obra.estado }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cerrarModalEliminar">
      <div class="modal-content" @click.stop>
        <h3>Confirmar Eliminación</h3>
        <p>¿Estás seguro de que quieres eliminar la obra "<strong>{{ obraAEliminar?.nombre }}</strong>"?</p>
        <p class="warning">Esta acción no se puede deshacer.</p>
        
        <div class="modal-actions">
          <button @click="eliminarObra" :disabled="loading" class="btn-danger">
            {{ loading ? 'Eliminando...' : 'Eliminar' }}
          </button>
          <button @click="cerrarModalEliminar" class="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getToken } from '../utils/auth.js';

const obras = ref([]);
const showForm = ref(false);
const showDeleteModal = ref(false);
const loading = ref(false);
const mensaje = ref('');
const success = ref(false);
const editando = ref(false);
const obraAEliminar = ref(null);

const form = ref({
  nombre: '',
  fecha_inicio: '',
  fecha_fin: '',
  estado: 'activa'
});

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

onMounted(() => {
  cargarObras();
});

async function cargarObras() {
  try {
    const res = await fetch(`${API_BASE}/obras`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (res.ok) {
      obras.value = await res.json();
    }
  } catch (error) {
    console.error('Error cargando obras:', error);
  }
}

function abrirFormulario(obra = null) {
  if (obra) {
    editando.value = true;
    form.value = {
      id_obra: obra.id_obra,
      nombre: obra.nombre,
      fecha_inicio: obra.fecha_inicio?.split('T')[0] || '',
      fecha_fin: obra.fecha_fin?.split('T')[0] || '',
      estado: obra.estado || 'activa'
    };
  } else {
    editando.value = false;
    form.value = {
      nombre: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'activa'
    };
  }
  showForm.value = true;
  mensaje.value = '';
}

async function guardarObra() {
  loading.value = true;
  mensaje.value = '';
  
  try {
    const url = editando.value 
      ? `${API_BASE}/obras/${form.value.id_obra}` 
      : `${API_BASE}/obras`;
    
    const method = editando.value ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(form.value)
    });
    
    if (res.ok) {
      success.value = true;
      mensaje.value = editando.value ? 'Obra actualizada correctamente' : 'Obra creada correctamente';
      await cargarObras();
      setTimeout(() => {
        cancelar();
      }, 2000);
    } else {
      const data = await res.json();
      success.value = false;
      mensaje.value = data.error || 'Error al guardar obra';
    }
  } catch (error) {
    success.value = false;
    mensaje.value = 'Error al guardar obra';
    console.error('Error:', error);
  }
  loading.value = false;
}

function confirmarEliminacion(obra) {
  obraAEliminar.value = obra;
  showDeleteModal.value = true;
}

async function eliminarObra() {
  loading.value = true;
  
  try {
    const res = await fetch(`${API_BASE}/obras/${obraAEliminar.value.id_obra}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    
    const data = await res.json();
    
    if (res.ok) {
      await cargarObras();
      cerrarModalEliminar();
    } else {
      alert(data.error || 'Error al eliminar obra');
    }
  } catch (error) {
    alert('Error al eliminar obra');
    console.error('Error:', error);
  }
  loading.value = false;
}

function cerrarModalEliminar() {
  showDeleteModal.value = false;
  obraAEliminar.value = null;
}

function cancelar() {
  showForm.value = false;
  mensaje.value = '';
  editando.value = false;
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-PY');
}

function getEstadoClass(estado) {
  const classes = {
    'activa': 'estado-activa',
    'inactiva': 'estado-inactiva', 
    'completada': 'estado-completada',
    'pausada': 'estado-pausada'
  };
  return classes[estado] || 'estado-default';
}
</script>

<style scoped>
.obras-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.back-btn, .add-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.back-btn {
  background: #6b7280;
  color: white;
}

.add-btn {
  background: #10b981;
  color: white;
}

.form-container {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.form-actions button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.form-actions button[type="submit"] {
  background: #3b82f6;
  color: white;
}

.form-actions button[type="button"] {
  background: #e5e7eb;
  color: #374151;
}

.alert {
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
}

.alert.success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.obras-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.obra-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.obra-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.obra-header h4 {
  margin: 0;
  color: #1f2937;
}

.obra-actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-edit {
  background: #e0e7ff;
  color: #3730a3;
}

.btn-delete {
  background: #fef2f2;
  color: #dc2626;
}

.obra-info {
  padding: 16px 20px 20px 20px;
}

.obra-info p {
  margin: 8px 0;
  color: #6b7280;
}

.estado-activa {
  color: #059669;
  font-weight: 600;
}

.estado-inactiva {
  color: #dc2626;
  font-weight: 600;
}

.estado-completada {
  color: #7c3aed;
  font-weight: 600;
}

.estado-pausada {
  color: #d97706;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
}

.warning {
  color: #dc2626;
  font-size: 14px;
  margin: 12px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-danger {
  background: #dc2626;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .obras-list {
    grid-template-columns: 1fr;
  }
}
</style>
