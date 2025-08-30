<template>
  <div class="presupuesto-container">
    <!-- Header con navegación -->
    <div class="page-header">
      <button @click="$router.go(-1)" class="back-btn">
        <span>←</span>
        <span>Volver</span>
      </button>
      <h1 class="page-title">Asignar Presupuesto</h1>
      <div class="header-spacer"></div>
    </div>

    <div class="form-container">
      <form @submit.prevent="enviar" class="presupuesto-form">
        <!-- Obra -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-text">Obra</span>
            <span class="required">*</span>
          </label>
          <select
            v-model="form.id_obra"
            class="form-select"
            :class="{ error: err.id_obra }"
          >
            <option value="">-- Selecciona una obra --</option>
            <option v-for="o in obras" :key="o.id_obra" :value="o.id_obra">
              {{ o.nombre }}
            </option>
          </select>
          <p v-if="err.id_obra" class="error-message">{{ err.id_obra }}</p>
        </div>

        <!-- Operador -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-text">Operador</span>
            <span class="required">*</span>
          </label>
          <select
            v-model="form.id_operador"
            class="form-select"
            :class="{ error: err.id_operador }"
          >
            <option value="">-- Selecciona un operador --</option>
            <option
              v-for="u in operadores"
              :key="u.id_usuario"
              :value="u.id_usuario"
            >
              {{ u.nombre }}
            </option>
          </select>
          <p v-if="err.id_operador" class="error-message">
            {{ err.id_operador }}
          </p>
        </div>

        <!-- Tipo -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-text">Tipo de Presupuesto</span>
          </label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                v-model="form.tipo"
                value="inicial"
                name="tipo"
              />
              <span class="radio-custom"></span>
              <span class="radio-label">Inicial</span>
            </label>
            <label class="radio-option">
              <input
                type="radio"
                v-model="form.tipo"
                value="adicional"
                name="tipo"
              />
              <span class="radio-custom"></span>
              <span class="radio-label">Adicional</span>
            </label>
          </div>
        </div>

        <!-- Monto -->
        <div class="form-group">
          <label class="form-label">
            <span class="label-text">Monto</span>
            <span class="required">*</span>
          </label>
          <div class="currency-input">
            <span class="currency-symbol">₲</span>
            <input
              v-model.number="form.monto"
              type="number"
              min="1"
              step="1"
              class="form-input money-input"
              :class="{ error: err.monto }"
              placeholder="Ingrese el monto"
            />
          </div>
          <p v-if="err.monto" class="error-message">{{ err.monto }}</p>
          <p v-if="form.monto" class="money-preview">
            {{ formatCurrency(form.monto) }}
          </p>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <button type="submit" :disabled="enviando" class="btn-primary">
            <span v-if="enviando" class="loading-spinner"></span>
            <span>{{ enviando ? "Asignando..." : "Asignar Presupuesto" }}</span>
          </button>
          <button type="button" class="btn-secondary" @click="resetForm">
            Limpiar
          </button>
        </div>

        <!-- Mensaje de error general -->
        <div v-if="msg && !ok" class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          <span>{{ msg }}</span>
        </div>
      </form>

      <!-- Panel de presupuestos recientes -->
      <div class="recent-assignments" v-if="recentAssignments.length">
        <h3 class="section-title">Asignaciones Recientes</h3>
        <div class="assignments-list">
          <div
            v-for="assignment in recentAssignments"
            :key="`${assignment.obra}-${assignment.operador}-${assignment.fecha}`"
            class="assignment-card"
          >
            <div class="assignment-info">
              <h4>{{ assignment.obra }}</h4>
              <p>{{ assignment.operador }} - {{ assignment.tipo }}</p>
            </div>
            <div class="assignment-amount">
              {{ formatCurrency(assignment.monto) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="modal.open" class="modal-overlay" @keydown.esc="cerrarModal">
      <div class="modal-content">
        <div class="modal-header success">
          <div class="success-icon">✅</div>
          <div class="success-content">
            <h3>¡Presupuesto Asignado!</h3>
            <p>La asignación se realizó correctamente</p>
          </div>
        </div>

        <div class="modal-body">
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Obra:</span>
              <span class="summary-value">{{ modal.datos.obra }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Operador:</span>
              <span class="summary-value">{{ modal.datos.operador }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Tipo:</span>
              <span class="summary-value capitalize">{{
                modal.datos.tipo
              }}</span>
            </div>
            <div class="summary-item highlight">
              <span class="summary-label">Monto:</span>
              <span class="summary-value">{{
                formatCurrency(modal.datos.monto)
              }}</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-outline" @click="asignarOtro">Asignar Otro</button>
          <button class="btn-primary" @click="irHome">Ir al Panel</button>
          <button class="modal-close" @click="cerrarModal" aria-label="Cerrar">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getToken } from "../utils/auth.js";

const router = useRouter();
const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:3000";

const obras = ref([]);
const operadores = ref([]);
const recentAssignments = ref([]);

const form = ref({
  id_obra: "",
  id_operador: "",
  tipo: "inicial",
  monto: null,
});

const err = ref({});
const enviando = ref(false);
const msg = ref("");
const ok = ref(false);

const modal = ref({
  open: false,
  datos: { obra: "", operador: "", tipo: "", monto: 0 },
});

const nf = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  maximumFractionDigits: 0,
});

onMounted(() => {
  cargarObras();
  cargarOperadores();
  cargarAsignacionesRecientes();
});

function formatCurrency(value) {
  const n = Number(value);
  return isNaN(n) ? value : nf.format(n);
}

async function cargarObras() {
  try {
    const res = await fetch(`${API}/obras`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    obras.value = res.ok ? await res.json() : [];
  } catch (e) {
    console.error("Error cargando obras:", e);
    obras.value = [];
  }
}

async function cargarOperadores() {
  try {
    const res = await fetch(`${API}/usuarios/operadores`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    operadores.value = res.ok ? await res.json() : [];
  } catch (e) {
    console.error("Error cargando operadores:", e);
    operadores.value = [];
  }
}

async function cargarAsignacionesRecientes() {
  try {
    const res = await fetch(`${API}/presupuestos/recientes?limit=5`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) {
      recentAssignments.value = await res.json();
    }
  } catch (e) {
    console.error("Error cargando asignaciones recientes:", e);
  }
}

function validar() {
  err.value = {};

  if (!form.value.id_obra) {
    err.value.id_obra = "Selecciona una obra";
  }

  if (!form.value.id_operador) {
    err.value.id_operador = "Selecciona un operador";
  }

  if (form.value.monto == null || form.value.monto <= 0) {
    err.value.monto = "El monto debe ser mayor a 0";
  }

  return Object.keys(err.value).length === 0;
}

async function enviar() {
  if (!validar()) return;

  enviando.value = true;
  msg.value = "";

  try {
    const res = await fetch(`${API}/presupuestos/obras/${form.value.id_obra}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(form.value),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al asignar presupuesto");
    }

    // Preparar datos para el modal
    const obra =
      obras.value.find((o) => o.id_obra === form.value.id_obra)?.nombre || "";
    const operador =
      operadores.value.find((u) => u.id_usuario === form.value.id_operador)
        ?.nombre || "";

    modal.value.datos = {
      obra,
      operador,
      tipo: form.value.tipo,
      monto: form.value.monto,
    };

    modal.value.open = true;
    ok.value = true;

    // Recargar asignaciones recientes
    cargarAsignacionesRecientes();
  } catch (e) {
    ok.value = false;
    msg.value = e.message;
  } finally {
    enviando.value = false;
  }
}

function resetForm() {
  form.value = {
    id_obra: "",
    id_operador: "",
    tipo: "inicial",
    monto: null,
  };
  err.value = {};
  msg.value = "";
}

function cerrarModal() {
  modal.value.open = false;
}

function asignarOtro() {
  modal.value.open = false;
  // Solo limpiar el monto para facilitar asignaciones múltiples
  form.value.monto = null;
}

function irHome() {
  modal.value.open = false;
  router.push("/");
}
</script>

<style scoped>
.presupuesto-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  background: white;
  padding: 20px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.back-btn:hover {
  transform: translateX(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-spacer {
  width: 120px;
}

.form-container {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.presupuesto-form {
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  max-width: 600px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
  font-size: 16px;
}

.form-select,
.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-select.error,
.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.currency-input {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 16px;
  font-weight: 700;
  color: #6b7280;
  font-size: 18px;
  z-index: 1;
}

.money-input {
  padding-left: 40px;
}

.money-preview {
  margin-top: 8px;
  font-size: 14px;
  color: #059669;
  font-weight: 600;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.radio-option:hover {
  border-color: #667eea;
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
}

.radio-option input[type="radio"]:checked + .radio-custom {
  border-color: #667eea;
  background: #667eea;
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.radio-label {
  font-weight: 600;
  color: #374151;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.error-message::before {
  content: "⚠️";
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.btn-primary {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: transparent;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: #d1d5db;
  color: #374151;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.alert {
  padding: 16px;
  border-radius: 12px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.alert-icon {
  font-size: 20px;
}

.recent-assignments {
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  min-width: 350px;
  height: fit-content;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.assignment-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.assignment-card:hover {
  border-color: #667eea;
  background: #f8faff;
}

.assignment-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.assignment-info p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.assignment-amount {
  font-weight: 700;
  color: #059669;
  font-size: 14px;
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  overflow: hidden;
  position: relative;
}

.modal-header {
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.modal-header.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.success-icon {
  font-size: 48px;
}

.success-content h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
}

.success-content p {
  margin: 0;
  opacity: 0.9;
}

.modal-body {
  padding: 32px;
}

.summary-grid {
  display: grid;
  gap: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.summary-item.highlight {
  background: #f0fdf4;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #bbf7d0;
  border-bottom: 1px solid #bbf7d0;
}

.summary-label {
  font-weight: 600;
  color: #374151;
}

.summary-value {
  font-weight: 600;
  color: #1f2937;
}

.summary-item.highlight .summary-value {
  color: #059669;
  font-size: 18px;
}

.capitalize {
  text-transform: capitalize;
}

.modal-actions {
  display: flex;
  gap: 16px;
  padding: 24px 32px;
  justify-content: center;
  position: relative;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.modal-close {
  position: absolute;
  top: -40px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.7);
}

@media (max-width: 768px) {
  .presupuesto-container {
    padding: 16px;
  }

  .page-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .header-spacer {
    display: none;
  }

  .form-container {
    grid-template-columns: 1fr;
  }

  .presupuesto-form {
    padding: 24px;
  }

  .form-actions {
    flex-direction: column;
  }

  .radio-group {
    flex-direction: column;
    gap: 12px;
  }

  .recent-assignments {
    min-width: auto;
  }

  .modal-content {
    margin: 20px;
    width: calc(100% - 40px);
  }

  .modal-header {
    padding: 24px;
    flex-direction: column;
    text-align: center;
  }

  .modal-actions {
    flex-direction: column;
    padding: 20px 24px;
  }
}
