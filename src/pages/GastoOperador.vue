<template>
  <div class="gasto-operador-container">
    <!-- Header -->
    <div class="page-header">
      <button @click="$router.go(-1)" class="back-btn">
        <span>←</span>
        <span>Volver</span>
      </button>
      <h1 class="page-title">Registrar Gasto</h1>
      <div class="header-spacer"></div>
    </div>

    <div class="form-layout">
      <!-- Formulario principal -->
      <div class="form-container">
        <form @submit.prevent="enviar" class="gasto-form">
          <!-- Obra -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">Obra</span>
              <span class="required">*</span>
            </label>
            <select
              v-model="form.id_obra"
              class="form-select"
              :class="{ error: errores.id_obra }"
            >
              <option value="">-- Selecciona una obra --</option>
              <option
                v-for="o in obras"
                :key="o.id_obra || o.id"
                :value="o.id_obra || o.id"
              >
                {{ o.nombre }}
              </option>
            </select>
            <p v-if="errores.id_obra" class="error-message">
              {{ errores.id_obra }}
            </p>
          </div>

          <!-- Fecha y Hora en grid -->
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">
                <span class="label-text">Fecha</span>
                <span class="required">*</span>
              </label>
              <input
                v-model="form.fecha"
                type="date"
                class="form-input"
                :class="{ error: errores.fecha }"
              />
              <p v-if="errores.fecha" class="error-message">
                {{ errores.fecha }}
              </p>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-text">Hora</span>
                <span class="required">*</span>
              </label>
              <input
                v-model="form.hora"
                type="time"
                class="form-input"
                :class="{ error: errores.hora }"
              />
              <p v-if="errores.hora" class="error-message">
                {{ errores.hora }}
              </p>
            </div>
          </div>

          <!-- Categoría -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">Categoría</span>
              <span class="required">*</span>
            </label>
            <div class="categoria-grid">
              <label
                class="categoria-option"
                v-for="cat in categorias"
                :key="cat.value"
              >
                <input
                  type="radio"
                  v-model="form.categoria"
                  :value="cat.value"
                  name="categoria"
                />
                <div class="categoria-card">
                  <div class="categoria-icon">{{ cat.icon }}</div>
                  <span class="categoria-text">{{ cat.label }}</span>
                </div>
              </label>
            </div>
            <p v-if="errores.categoria" class="error-message">
              {{ errores.categoria }}
            </p>
          </div>

          <!-- Descripción -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">Descripción</span>
              <span class="required">*</span>
            </label>
            <textarea
              v-model="form.descripcion"
              rows="4"
              class="form-textarea"
              :class="{ error: errores.descripcion }"
              placeholder="Describe el gasto detalladamente..."
            ></textarea>
            <p v-if="errores.descripcion" class="error-message">
              {{ errores.descripcion }}
            </p>
            <div class="textarea-counter">
              {{ form.descripcion?.length || 0 }}/500 caracteres
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
                :class="{ error: errores.monto }"
                placeholder="0"
                @input="actualizarVistaPrevia"
              />
            </div>
            <p v-if="errores.monto" class="error-message">
              {{ errores.monto }}
            </p>
            <div v-if="form.monto" class="money-preview">
              {{ formatCurrency(form.monto) }}
            </div>
          </div>

          <!-- Archivos -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">Evidencias</span>
              <span class="optional">(Opcional - hasta 5 archivos)</span>
            </label>
            <div
              class="file-upload-area"
              @drop="onDrop"
              @dragover.prevent
              @dragenter.prevent
            >
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                @change="onFiles"
                class="file-input"
                id="file-input"
              />
              <label for="file-input" class="file-upload-label">
                <div class="upload-icon">📁</div>
                <div class="upload-text">
                  <p>Arrastra archivos aquí o haz clic para seleccionar</p>
                  <span>JPG, PNG, PDF - Máximo 5 archivos</span>
                </div>
              </label>
            </div>

            <!-- Lista de archivos -->
            <div v-if="archivos.length" class="files-list">
              <div
                v-for="(f, i) in archivos"
                :key="f._key || `${f.name}_${i}`"
                class="file-item"
              >
                <div class="file-info">
                  <div class="file-icon">{{ getFileIcon(f.name) }}</div>
                  <div class="file-details">
                    <span class="file-name">{{ f.name }}</span>
                    <span class="file-size">{{ prettySize(f.size) }}</span>
                  </div>
                </div>
                <button
                  type="button"
                  @click="quitarArchivo(i)"
                  class="remove-file-btn"
                >
                  ✕
                </button>
              </div>
            </div>

            <p v-if="errores.imagenes" class="error-message">
              {{ errores.imagenes }}
            </p>
          </div>

          <!-- Botones de acción -->
          <div class="form-actions">
            <button type="submit" :disabled="enviando" class="btn-primary">
              <span v-if="enviando" class="loading-spinner"></span>
              <span>{{ enviando ? "Guardando..." : "Guardar Gasto" }}</span>
            </button>
            <button type="button" class="btn-secondary" @click="resetForm">
              Limpiar
            </button>
          </div>

          <!-- Mensaje -->
          <div
            v-if="mensaje"
            :class="ok ? 'alert alert-success' : 'alert alert-error'"
          >
            <span class="alert-icon">{{ ok ? "✅" : "⚠️" }}</span>
            <span>{{ mensaje }}</span>
          </div>
        </form>
      </div>

      <!-- Panel lateral con información -->
      <div class="info-panel">
        <!-- Saldo disponible -->
        <div v-if="saldo !== null" class="saldo-card">
          <div class="saldo-header">
            <div class="saldo-icon">💰</div>
            <h3>Saldo Disponible</h3>
          </div>
          <div class="saldo-amount" :class="getSaldoClass(saldo)">
            {{ formatCurrency(saldo) }}
          </div>
          <div v-if="form.monto" class="saldo-preview">
            <div class="preview-item">
              <span>Después del gasto:</span>
              <span :class="getSaldoClass(saldo - (form.monto || 0))">
                {{ formatCurrency(saldo - (form.monto || 0)) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Consejos -->
        <div class="tips-card">
          <div class="tips-header">
            <div class="tips-icon">💡</div>
            <h3>Consejos</h3>
          </div>
          <div class="tips-list">
            <div class="tip-item">
              <span class="tip-bullet">•</span>
              <span>Describe claramente el propósito del gasto</span>
            </div>
            <div class="tip-item">
              <span class="tip-bullet">•</span>
              <span>Adjunta facturas o comprobantes</span>
            </div>
            <div class="tip-item">
              <span class="tip-bullet">•</span>
              <span>Verifica que el monto sea correcto</span>
            </div>
            <div class="tip-item">
              <span class="tip-bullet">•</span>
              <span>Selecciona la categoría apropiada</span>
            </div>
          </div>
        </div>

        <!-- Gastos recientes -->
        <div v-if="gastosRecientes.length" class="recent-gastos-card">
          <div class="recent-header">
            <div class="recent-icon">📋</div>
            <h3>Gastos Recientes</h3>
          </div>
          <div class="recent-list">
            <div
              v-for="gasto in gastosRecientes"
              :key="gasto.id"
              class="recent-item"
            >
              <div class="recent-info">
                <div class="recent-categoria">{{ gasto.categoria }}</div>
                <div class="recent-descripcion">{{ gasto.descripcion }}</div>
              </div>
              <div class="recent-monto">{{ formatCurrency(gasto.monto) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getToken, getUserId } from "../utils/auth.js";

const router = useRouter();
const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:3000";

const obras = ref([]);
const archivos = ref([]);
const gastosRecientes = ref([]);
const errores = ref({});
const enviando = ref(false);
const mensaje = ref("");
const ok = ref(false);
const saldo = ref(null);

// Obtener fecha y hora actuales
const hoy = new Date();
const yyyy = hoy.getFullYear();
const mm = String(hoy.getMonth() + 1).padStart(2, "0");
const dd = String(hoy.getDate()).padStart(2, "0");
const hh = String(hoy.getHours()).padStart(2, "0");
const mi = String(hoy.getMinutes()).padStart(2, "0");

const form = ref({
  id_obra: "",
  fecha: `${yyyy}-${mm}-${dd}`,
  hora: `${hh}:${mi}`,
  categoria: "",
  descripcion: "",
  monto: null,
});

const categorias = [
  { value: "material", label: "Material", icon: "🧱" },
  { value: "transporte", label: "Transporte", icon: "🚛" },
  { value: "mano de obra", label: "Mano de obra", icon: "👷" },
  { value: "viaticos", label: "Viáticos", icon: "🍽️" },
  { value: "otros", label: "Otros", icon: "📦" },
];

const nf = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  maximumFractionDigits: 0,
});

// Watchers
watch(
  () => form.value.id_obra,
  (nuevo) => {
    if (nuevo) {
      cargarSaldo();
    } else {
      saldo.value = null;
    }
  }
);

onMounted(() => {
  cargarObras();
  cargarGastosRecientes();
});

function formatCurrency(value) {
  const n = Number(value);
  return isNaN(n) ? "₲ 0" : nf.format(n);
}

async function cargarObras() {
  try {
    const res = await fetch(`${API}/obras`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    obras.value = await res.json();
  } catch (e) {
    console.error("Error cargando obras:", e);
  }
}

async function cargarSaldo() {
  try {
    const id_operador = getUserId();
    if (!id_operador || !form.value.id_obra) {
      saldo.value = null;
      return;
    }

    const url = `${API}/presupuestos/disponible/check?id_obra=${form.value.id_obra}&id_operador=${id_operador}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const data = res.ok ? await res.json() : null;
    saldo.value =
      data && typeof data.presupuesto_disponible !== "undefined"
        ? Number(data.presupuesto_disponible) || 0
        : 0;
  } catch (e) {
    console.error("Error cargando saldo:", e);
    saldo.value = 0;
  }
}

async function cargarGastosRecientes() {
  try {
    const res = await fetch(`${API}/gastos/recientes?limit=3`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) {
      gastosRecientes.value = await res.json();
    }
  } catch (e) {
    console.error("Error cargando gastos recientes:", e);
  }
}

function onFiles(e) {
  const nuevos = Array.from(e.target.files || []);
  agregarArchivos(nuevos);
  e.target.value = "";
}

function onDrop(e) {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files || []);
  agregarArchivos(files);
}

function agregarArchivos(nuevos) {
  const existentes = archivos.value.map((f) => f.name + ":" + f.size);
  const filtrados = nuevos.filter(
    (f) => !existentes.includes(f.name + ":" + f.size)
  );
  const combinados = [...archivos.value, ...filtrados].slice(0, 5);

  archivos.value = combinados.map((f, idx) => {
    if (!("_key" in f)) {
      Object.defineProperty(f, "_key", {
        value: `${f.name}-${f.size}-${Date.now()}-${idx}`,
      });
    }
    return f;
  });

  if (archivos.value.length >= 5 && nuevos.length > 0) {
    errores.value.imagenes = "Se permiten hasta 5 archivos.";
  } else {
    errores.value.imagenes = "";
  }
}

function quitarArchivo(i) {
  archivos.value.splice(i, 1);
  if (archivos.value.length < 5) errores.value.imagenes = "";
}

function getFileIcon(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const icons = {
    pdf: "📄",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
  };
  return icons[ext] || "📎";
}

function prettySize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getSaldoClass(amount) {
  if (amount <= 0) return "saldo-critical";
  if (amount < 100000) return "saldo-low";
  if (amount < 500000) return "saldo-medium";
  return "saldo-good";
}

function actualizarVistaPrevia() {
  // Forzar reactividad para la vista previa del monto
}

function validar() {
  errores.value = {};

  if (!form.value.id_obra) errores.value.id_obra = "Selecciona una obra.";
  if (!form.value.fecha) errores.value.fecha = "La fecha es obligatoria.";
  if (!form.value.hora) errores.value.hora = "La hora es obligatoria.";
  if (!form.value.categoria)
    errores.value.categoria = "Selecciona una categoría.";
  if (!form.value.descripcion?.trim())
    errores.value.descripcion = "La descripción es obligatoria.";
  if (form.value.monto == null || form.value.monto <= 0)
    errores.value.monto = "El monto debe ser mayor a 0.";

  // Validar contra saldo
  if (
    saldo.value != null &&
    Number.isFinite(Number(form.value.monto)) &&
    Number(form.value.monto) > Number(saldo.value)
  ) {
    errores.value.monto = `El monto supera el saldo disponible (${formatCurrency(
      saldo.value
    )}).`;
  }

  return Object.keys(errores.value).length === 0;
}

async function enviar() {
  if (!validar()) return;

  try {
    enviando.value = true;
    mensaje.value = "";

    const fechaHora = `${form.value.fecha}T${form.value.hora}:00`;

    const fd = new FormData();
    fd.append("id_obra", form.value.id_obra);
    fd.append("fecha", fechaHora);
    fd.append("monto", String(form.value.monto));
    fd.append("descripcion", form.value.descripcion);
    fd.append("categoria", form.value.categoria);
    archivos.value.forEach((f) => fd.append("imagenes", f));

    const res = await fetch(`${API}/gastos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al registrar gasto");

    ok.value = true;
    mensaje.value = "Gasto registrado correctamente.";

    // Limpiar formulario parcialmente
    form.value.categoria = "";
    form.value.descripcion = "";
    form.value.monto = null;
    archivos.value = [];

    // Recargar datos
    cargarSaldo();
    cargarGastosRecientes();

    setTimeout(() => {
      router.push("/gastos");
    }, 1500);
  } catch (e) {
    ok.value = false;
    mensaje.value = e.message || "Error al registrar gasto";
  } finally {
    enviando.value = false;
  }
}

function resetForm() {
  form.value = {
    id_obra: "",
    fecha: `${yyyy}-${mm}-${dd}`,
    hora: `${hh}:${mi}`,
    categoria: "",
    descripcion: "",
    monto: null,
  };
  archivos.value = [];
  errores.value = {};
  mensaje.value = "";
  saldo.value = null;
}
</script>

<style scoped>
.gasto-operador-container {
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

.form-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.form-container {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.gasto-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
  font-size: 16px;
}

.optional {
  color: #6b7280;
  font-size: 14px;
  font-weight: 400;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-select,
.form-input,
.form-textarea {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-select.error,
.form-input.error,
.form-textarea.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.textarea-counter {
  text-align: right;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
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
  padding-left: 45px;
}

.money-preview {
  margin-top: 8px;
  font-size: 16px;
  color: #059669;
  font-weight: 600;
  padding: 8px 12px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

.categoria-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.categoria-option {
  cursor: pointer;
}

.categoria-option input[type="radio"] {
  display: none;
}

.categoria-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: white;
}

.categoria-option input[type="radio"]:checked + .categoria-card {
  border-color: #667eea;
  background: #f0f4ff;
}

.categoria-card:hover {
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.categoria-icon {
  font-size: 24px;
}

.categoria-text {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: center;
}

.file-upload-area {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
  background: #fafafa;
}

.file-upload-area:hover {
  border-color: #667eea;
  background: #f8faff;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.upload-icon {
  font-size: 32px;
  color: #6b7280;
}

.upload-text p {
  margin: 0;
  font-weight: 600;
  color: #374151;
}

.upload-text span {
  font-size: 14px;
  color: #6b7280;
}

.files-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.file-item:hover {
  background: #f1f5f9;
  border-color: #d1d5db;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  font-size: 20px;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
}

.remove-file-btn {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.3s ease;
}

.remove-file-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
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

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.alert-icon {
  font-size: 20px;
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.saldo-card,
.tips-card,
.recent-gastos-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.saldo-header,
.tips-header,
.recent-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.saldo-icon,
.tips-icon,
.recent-icon {
  font-size: 20px;
}

.saldo-header h3,
.tips-header h3,
.recent-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.saldo-amount {
  padding: 24px;
  text-align: center;
  font-size: 32px;
  font-weight: 700;
}

.saldo-good {
  color: #059669;
}
.saldo-medium {
  color: #d97706;
}
.saldo-low {
  color: #dc2626;
}
.saldo-critical {
  color: #b91c1c;
}

.saldo-preview {
  padding: 0 24px 24px;
  border-top: 1px solid #f3f4f6;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 14px;
}

.tips-list {
  padding: 20px 24px;
}

.tip-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #374151;
  align-items: flex-start;
}

.tip-bullet {
  color: #667eea;
  font-weight: bold;
  margin-top: 2px;
}

.recent-list {
  padding: 0 24px 24px;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-info {
  flex: 1;
}

.recent-categoria {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
}

.recent-descripcion {
  font-size: 14px;
  color: #374151;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.recent-monto {
  font-size: 14px;
  font-weight: 600;
  color: #dc2626;
}

@media (max-width: 1024px) {
  .form-layout {
    grid-template-columns: 1fr;
  }

  .info-panel {
    order: -1;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .categoria-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .gasto-operador-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .header-spacer {
    display: none;
  }

  .form-container {
    padding: 24px;
  }

  .form-actions {
    flex-direction: column;
  }

  .categoria-grid {
    grid-template-columns: 1fr;
  }
}
