<template>
  <div class="gastos-container">
    <!-- Header con navegación y controles -->
    <div class="gastos-header">
      <div class="header-left">
        <button @click="$router.go(-1)" class="back-btn">
          <span>←</span>
          <span>Volver</span>
        </button>
        <h1 class="page-title">Gestión de Gastos</h1>
      </div>
      <div class="header-right">
        <button @click="refreshData" class="refresh-btn" :disabled="loading">
          <span>🔄</span>
          <span>{{ loading ? "Actualizando..." : "Actualizar" }}</span>
        </button>
        <button @click="$router.push('/gasto-operador')" class="add-btn">
          <span>➕</span>
          <span>Nuevo Gasto</span>
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section" v-if="gastos.length > 0">
      <div class="filters-grid">
        <div class="filter-group">
          <label>Filtrar por operador:</label>
          <select
            v-model="filtros.operador"
            @change="aplicarFiltros"
            class="filter-select"
          >
            <option value="">Todos los operadores</option>
            <option v-for="op in operadoresUnicos" :key="op" :value="op">
              {{ op }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Filtrar por obra:</label>
          <select
            v-model="filtros.obra"
            @change="aplicarFiltros"
            class="filter-select"
          >
            <option value="">Todas las obras</option>
            <option v-for="obra in obrasUnicas" :key="obra" :value="obra">
              {{ obra }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Filtrar por categoría:</label>
          <select
            v-model="filtros.categoria"
            @change="aplicarFiltros"
            class="filter-select"
          >
            <option value="">Todas las categorías</option>
            <option v-for="cat in categoriasUnicas" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <button @click="limpiarFiltros" class="clear-filters-btn">
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Resumen estadístico -->
    <div class="stats-section" v-if="gastosFiltrados.length > 0">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💸</div>
          <div class="stat-info">
            <h3>Total Gastado</h3>
            <p>{{ formatCurrency(totalGastado) }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <h3>Gastos Registrados</h3>
            <p>{{ gastosFiltrados.length }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <h3>Promedio por Gasto</h3>
            <p>{{ formatCurrency(promedioGasto) }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔢</div>
          <div class="stat-info">
            <h3>Total Evidencias</h3>
            <p>{{ totalImagenes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando gastos...</p>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="cargarGastos" class="retry-btn">Reintentar</button>
    </div>

    <!-- Tabla de gastos -->
    <div v-if="gastosFiltrados.length > 0 && !loading" class="table-container">
      <div class="table-actions">
        <div class="results-info">
          Mostrando {{ gastosFiltrados.length }} de {{ gastos.length }} gastos
        </div>
        <button @click="exportar" class="export-btn">
          <span>📊</span>
          <span>Exportar Excel</span>
        </button>
      </div>

      <div class="table-wrapper">
        <table class="gastos-table">
          <thead>
            <tr>
              <th class="sortable" @click="ordenar('fecha')">
                Fecha/Hora
                <span
                  class="sort-indicator"
                  v-if="ordenActual.campo === 'fecha'"
                >
                  {{ ordenActual.direccion === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th class="sortable" @click="ordenar('obra_nombre')">
                Obra
                <span
                  class="sort-indicator"
                  v-if="ordenActual.campo === 'obra_nombre'"
                >
                  {{ ordenActual.direccion === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th class="sortable" @click="ordenar('operador_nombre')">
                Operador
                <span
                  class="sort-indicator"
                  v-if="ordenActual.campo === 'operador_nombre'"
                >
                  {{ ordenActual.direccion === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th class="sortable" @click="ordenar('categoria')">
                Categoría
                <span
                  class="sort-indicator"
                  v-if="ordenActual.campo === 'categoria'"
                >
                  {{ ordenActual.direccion === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th>Descripción</th>
              <th class="sortable text-right" @click="ordenar('monto')">
                Monto
                <span
                  class="sort-indicator"
                  v-if="ordenActual.campo === 'monto'"
                >
                  {{ ordenActual.direccion === "asc" ? "↑" : "↓" }}
                </span>
              </th>
              <th class="text-right">Saldo Disp.</th>
              <th class="text-center">Evidencias</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="g in gastosFiltrados"
              :key="g.id_gasto"
              class="table-row"
            >
              <td class="fecha-cell">
                <div class="fecha-info">
                  <div class="fecha">{{ formatFecha(g.fecha) }}</div>
                  <div class="hora">{{ formatHora(g.fecha) }}</div>
                </div>
              </td>
              <td class="obra-cell">
                <div class="obra-badge">{{ g.obra_nombre || "—" }}</div>
              </td>
              <td class="operador-cell">
                <div class="operador-info">
                  <div class="operador-avatar">
                    {{ (g.operador_nombre || "?").charAt(0).toUpperCase() }}
                  </div>
                  <span>{{ g.operador_nombre || "—" }}</span>
                </div>
              </td>
              <td class="categoria-cell">
                <span
                  class="categoria-badge"
                  :class="getCategoriaClass(g.categoria)"
                >
                  {{ g.categoria }}
                </span>
              </td>
              <td class="descripcion-cell">
                <div class="descripcion-text" :title="g.descripcion">
                  {{ g.descripcion }}
                </div>
              </td>
              <td class="monto-cell text-right">
                <span class="monto-value">{{ formatCurrency(g.monto) }}</span>
              </td>
              <td class="saldo-cell text-right">
                <span
                  v-if="saldoDe(g) != null"
                  class="saldo-value"
                  :class="getSaldoClass(saldoDe(g))"
                >
                  {{ formatCurrency(saldoDe(g)) }}
                </span>
                <span v-else class="saldo-empty">—</span>
              </td>
              <td class="imagenes-cell text-center">
                <div class="imagenes-info">
                  <span class="imagenes-count">{{
                    g.imagenes?.length || 0
                  }}</span>
                  <button
                    v-if="g.imagenes?.length"
                    class="imagenes-btn"
                    @click="openGallery(g.imagenes)"
                  >
                    Ver
                  </button>
                </div>
              </td>
              <td class="acciones-cell text-center">
                <div class="action-buttons">
                  <button
                    @click="verDetalle(g)"
                    class="action-btn view"
                    title="Ver detalles"
                  >
                    👁️
                  </button>
                  <button
                    v-if="g.imagenes?.length"
                    @click="openGallery(g.imagenes)"
                    class="action-btn gallery"
                    title="Ver evidencias"
                  >
                    🖼️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!gastos.length && !loading && !error" class="empty-container">
      <div class="empty-icon">💸</div>
      <h3>No hay gastos registrados</h3>
      <p>Comienza registrando tu primer gasto</p>
      <button @click="$router.push('/gasto-operador')" class="btn-primary">
        Registrar Primer Gasto
      </button>
    </div>

    <!-- Modal de galería -->
    <div v-if="gallery.open" class="modal-overlay" @keydown.esc="closeGallery">
      <div class="gallery-modal">
        <div class="gallery-header">
          <h3>Evidencias del Gasto</h3>
          <button @click="closeGallery" class="modal-close">✕</button>
        </div>

        <div class="gallery-controls">
          <button
            @click="prev"
            :disabled="!gallery.items.length"
            class="gallery-btn"
          >
            ← Anterior
          </button>
          <div class="gallery-counter">
            {{ gallery.index + 1 }} / {{ gallery.items.length }}
          </div>
          <button
            @click="next"
            :disabled="!gallery.items.length"
            class="gallery-btn"
          >
            Siguiente →
          </button>
        </div>

        <div class="gallery-content">
          <template v-if="currentItem">
            <iframe
              v-if="isPdf(currentItem.ruta_archivo)"
              :src="fileUrl(currentItem.ruta_archivo)"
              class="gallery-pdf"
            ></iframe>
            <img
              v-else
              :src="fileUrl(currentItem.ruta_archivo)"
              alt="Evidencia de gasto"
              class="gallery-image"
            />
          </template>
          <div v-else class="gallery-empty">Sin contenido disponible</div>
        </div>

        <div class="gallery-thumbnails" v-if="gallery.items.length > 1">
          <button
            v-for="(item, i) in gallery.items"
            :key="item.id_imagen || i"
            class="thumbnail-btn"
            :class="{ active: i === gallery.index }"
            @click="goTo(i)"
          >
            <div v-if="isPdf(item.ruta_archivo)" class="thumbnail-pdf">PDF</div>
            <img
              v-else
              :src="fileUrl(item.ruta_archivo)"
              alt=""
              class="thumbnail-img"
            />
          </button>
        </div>

        <div class="gallery-footer">
          <a
            v-if="currentItem"
            :href="fileUrl(currentItem.ruta_archivo)"
            target="_blank"
            rel="noopener"
            class="download-link"
          >
            Abrir en nueva pestaña
          </a>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="detalleModal.open" class="modal-overlay" @click="cerrarDetalle">
      <div class="detalle-modal" @click.stop>
        <div class="detalle-header">
          <h3>Detalle del Gasto</h3>
          <button @click="cerrarDetalle" class="modal-close">✕</button>
        </div>
        <div class="detalle-content" v-if="detalleModal.gasto">
          <div class="detalle-grid">
            <div class="detalle-item">
              <span class="detalle-label">Fecha:</span>
              <span>{{ formatFecha(detalleModal.gasto.fecha) }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Hora:</span>
              <span>{{ formatHora(detalleModal.gasto.fecha) }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Obra:</span>
              <span>{{ detalleModal.gasto.obra_nombre || "—" }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Operador:</span>
              <span>{{ detalleModal.gasto.operador_nombre || "—" }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Categoría:</span>
              <span
                class="categoria-badge"
                :class="getCategoriaClass(detalleModal.gasto.categoria)"
              >
                {{ detalleModal.gasto.categoria }}
              </span>
            </div>
            <div class="detalle-item full-width">
              <span class="detalle-label">Descripción:</span>
              <p class="detalle-descripcion">
                {{ detalleModal.gasto.descripcion }}
              </p>
            </div>
            <div class="detalle-item highlight">
              <span class="detalle-label">Monto:</span>
              <span class="detalle-monto">{{
                formatCurrency(detalleModal.gasto.monto)
              }}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Evidencias:</span>
              <span
                >{{ detalleModal.gasto.imagenes?.length || 0 }} archivo(s)</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import * as XLSX from "xlsx";
import { getToken } from "../utils/auth.js";

const route = useRoute();
const gastos = ref([]);
const loading = ref(false);
const error = ref("");
const saldos = ref({});

const filtros = ref({
  operador: "",
  obra: "",
  categoria: "",
});

const ordenActual = ref({
  campo: "fecha",
  direccion: "desc",
});

const gallery = ref({
  open: false,
  items: [],
  index: 0,
});

const detalleModal = ref({
  open: false,
  gasto: null,
});

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:3000";

const dtf = new Intl.DateTimeFormat("es-PY", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dtfTime = new Intl.DateTimeFormat("es-PY", {
  hour: "2-digit",
  minute: "2-digit",
});

const nf = new Intl.NumberFormat("es-PY", {
  style: "currency",
  currency: "PYG",
  maximumFractionDigits: 0,
});

// Computed properties
const gastosFiltrados = computed(() => {
  let resultado = [...gastos.value];

  // Aplicar filtros
  if (filtros.value.operador) {
    resultado = resultado.filter(
      (g) => g.operador_nombre === filtros.value.operador
    );
  }
  if (filtros.value.obra) {
    resultado = resultado.filter((g) => g.obra_nombre === filtros.value.obra);
  }
  if (filtros.value.categoria) {
    resultado = resultado.filter(
      (g) => g.categoria === filtros.value.categoria
    );
  }

  // Aplicar ordenamiento
  resultado.sort((a, b) => {
    const campo = ordenActual.value.campo;
    const direccion = ordenActual.value.direccion === "asc" ? 1 : -1;

    let valorA = a[campo];
    let valorB = b[campo];

    if (campo === "monto") {
      valorA = Number(valorA) || 0;
      valorB = Number(valorB) || 0;
    }

    if (valorA < valorB) return -1 * direccion;
    if (valorA > valorB) return 1 * direccion;
    return 0;
  });

  return resultado;
});

const operadoresUnicos = computed(() => {
  return [
    ...new Set(gastos.value.map((g) => g.operador_nombre).filter(Boolean)),
  ];
});

const obrasUnicas = computed(() => {
  return [...new Set(gastos.value.map((g) => g.obra_nombre).filter(Boolean))];
});

const categoriasUnicas = computed(() => {
  return [...new Set(gastos.value.map((g) => g.categoria).filter(Boolean))];
});

const totalGastado = computed(() => {
  return gastosFiltrados.value.reduce(
    (sum, g) => sum + (Number(g.monto) || 0),
    0
  );
});

const promedioGasto = computed(() => {
  const total = totalGastado.value;
  const count = gastosFiltrados.value.length;
  return count > 0 ? total / count : 0;
});

const totalImagenes = computed(() => {
  return gastosFiltrados.value.reduce(
    (sum, g) => sum + (g.imagenes || []).length,
    0
  );
});

const currentItem = computed(() => {
  const { items, index } = gallery.value;
  return items && items.length ? items[index] : null;
});

onMounted(() => {
  cargarGastos();
  // Aplicar filtro de operador desde URL si existe
  if (route.query.operador) {
    filtros.value.operador = route.query.operador;
  }
  window.addEventListener("keydown", handleKeys);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeys);
});

async function cargarGastos() {
  loading.value = true;
  error.value = "";

  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró token de autenticación");
    }

    const res = await fetch(`${API}/gastos`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    gastos.value = await res.json();
    await precargarSaldos();
  } catch (err) {
    error.value = err.message || "Error al cargar los gastos";
    console.error("Error cargando gastos:", err);
  } finally {
    loading.value = false;
  }
}

async function precargarSaldos() {
  const token = getToken();
  const pares = new Set(
    gastos.value
      .filter((g) => g.id_obra && g.id_operador)
      .map((g) => `${g.id_obra}-${g.id_operador}`)
  );

  const peticiones = [...pares].map(async (key) => {
    const [id_obra, id_operador] = key.split("-");
    const url = `${API}/presupuestos/disponible/check?id_obra=${id_obra}&id_operador=${id_operador}`;

    try {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = r.ok ? await r.json() : null;
      const disp = data?.presupuesto_disponible ?? 0;
      saldos.value[key] = disp;
    } catch {
      saldos.value[key] = 0;
    }
  });

  await Promise.all(peticiones);
}

function refreshData() {
  cargarGastos();
}

function saldoDe(g) {
  const key = `${g.id_obra}-${g.id_operador}`;
  const v = saldos.value[key];
  return typeof v === "number" ? v : null;
}

function formatFecha(iso) {
  try {
    return dtf.format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatHora(iso) {
  try {
    return dtfTime.format(new Date(iso));
  } catch {
    return "";
  }
}

function formatCurrency(v) {
  const n = Number(v);
  return isNaN(n) ? v : nf.format(n);
}

function getCategoriaClass(categoria) {
  const classes = {
    material: "categoria-material",
    transporte: "categoria-transporte",
    "mano de obra": "categoria-mano-obra",
    viaticos: "categoria-viaticos",
    otros: "categoria-otros",
  };
  return classes[categoria] || "categoria-default";
}

function getSaldoClass(saldo) {
  if (saldo <= 0) return "saldo-agotado";
  if (saldo < 100000) return "saldo-bajo";
  return "saldo-normal";
}

function fileUrl(path) {
  if (!path) return "#";
  return path.startsWith("http") ? path : `${API}/${path}`;
}

function isPdf(path) {
  return /\.pdf($|\?)/i.test(path || "");
}

function aplicarFiltros() {
  // Los filtros se aplican automáticamente via computed
}

function limpiarFiltros() {
  filtros.value = {
    operador: "",
    obra: "",
    categoria: "",
  };
}

function ordenar(campo) {
  if (ordenActual.value.campo === campo) {
    ordenActual.value.direccion =
      ordenActual.value.direccion === "asc" ? "desc" : "asc";
  } else {
    ordenActual.value.campo = campo;
    ordenActual.value.direccion = "asc";
  }
}

function verDetalle(gasto) {
  detalleModal.value.gasto = gasto;
  detalleModal.value.open = true;
}

function cerrarDetalle() {
  detalleModal.value.open = false;
  detalleModal.value.gasto = null;
}

function openGallery(imagenes = []) {
  gallery.value.items = Array.isArray(imagenes) ? imagenes : [];
  gallery.value.index = 0;
  gallery.value.open = true;
}

function closeGallery() {
  gallery.value.open = false;
  gallery.value.items = [];
  gallery.value.index = 0;
}

function next() {
  if (!gallery.value.items.length) return;
  gallery.value.index = (gallery.value.index + 1) % gallery.value.items.length;
}

function prev() {
  if (!gallery.value.items.length) return;
  gallery.value.index =
    (gallery.value.index - 1 + gallery.value.items.length) %
    gallery.value.items.length;
}

function goTo(i) {
  if (i >= 0 && i < gallery.value.items.length) {
    gallery.value.index = i;
  }
}

function handleKeys(e) {
  if (!gallery.value.open) return;
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
  if (e.key === "Escape") closeGallery();
}

function exportar() {
  const rows = gastosFiltrados.value.map((g) => ({
    Fecha: formatFecha(g.fecha),
    Hora: formatHora(g.fecha),
    Obra: g.obra_nombre || "",
    Operador: g.operador_nombre || "",
    Categoria: g.categoria || "",
    Descripcion: g.descripcion || "",
    Monto_Gs: Number(g.monto || 0),
    Saldo_Disponible: saldoDe(g) ?? 0,
    Evidencias: (g.imagenes || []).length,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Gastos");

  const hoy = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `gastos_${hoy}.xlsx`);
}
</script>

<style scoped>
.gastos-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.gastos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
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

.header-right {
  display: flex;
  gap: 12px;
}

.refresh-btn,
.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.refresh-btn {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
  border: 1px solid #e5e7eb;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(107, 114, 128, 0.2);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.filters-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-filters-btn {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.stats-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 28px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
}

.stat-info h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.stat-info p {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.loading-container,
.error-container,
.empty-container {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
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

.error-icon,
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn,
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn:hover,
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.empty-container h3 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 24px;
}

.empty-container p {
  margin: 0 0 24px 0;
  color: #6b7280;
}

.table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.results-info {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.table-wrapper {
  overflow-x: auto;
}

.gastos-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.gastos-table th {
  background: #f8fafc;
  padding: 16px 12px;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
}

.sortable:hover {
  background: #f1f5f9;
}

.sort-indicator {
  margin-left: 8px;
  font-size: 12px;
  color: #667eea;
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
}

.gastos-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
}

.fecha-cell {
  min-width: 120px;
}

.fecha-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fecha {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.hora {
  font-size: 12px;
  color: #6b7280;
}

.obra-badge {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.operador-cell {
  min-width: 150px;
}

.operador-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.operador-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

.categoria-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.categoria-material {
  background: #fef3c7;
  color: #92400e;
}
.categoria-transporte {
  background: #dbeafe;
  color: #1e40af;
}
.categoria-mano-obra {
  background: #d1fae5;
  color: #065f46;
}
.categoria-viaticos {
  background: #fce7f3;
  color: #be185d;
}
.categoria-otros {
  background: #f3f4f6;
  color: #374151;
}
.categoria-default {
  background: #f3f4f6;
  color: #374151;
}

.descripcion-cell {
  max-width: 200px;
}

.descripcion-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #374151;
}

.monto-value {
  font-weight: 700;
  color: #dc2626;
  font-size: 14px;
}

.saldo-value {
  font-weight: 600;
  font-size: 14px;
}

.saldo-normal {
  color: #059669;
}
.saldo-bajo {
  color: #d97706;
}
.saldo-agotado {
  color: #dc2626;
}
.saldo-empty {
  color: #9ca3af;
}

.imagenes-cell {
  min-width: 100px;
}

.imagenes-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.imagenes-count {
  font-weight: 600;
  color: #374151;
}

.imagenes-btn {
  background: #eff6ff;
  color: #1d4ed8;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
}

.imagenes-btn:hover {
  background: #dbeafe;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-btn.view {
  background: #eff6ff;
  color: #1d4ed8;
}

.action-btn.view:hover {
  background: #dbeafe;
}

.action-btn.gallery {
  background: #fef3c7;
  color: #92400e;
}

.action-btn.gallery:hover {
  background: #fde68a;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.gallery-modal,
.detalle-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.gallery-modal {
  width: 1000px;
}

.detalle-modal {
  width: 600px;
}

.gallery-header,
.detalle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.gallery-header h3,
.detalle-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: #ef4444;
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
  background: #dc2626;
}

.gallery-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.gallery-btn {
  background: #f3f4f6;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.gallery-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.gallery-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gallery-counter {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.gallery-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f8fafc;
  min-height: 400px;
}

.gallery-pdf {
  width: 100%;
  height: 500px;
  border: none;
  border-radius: 8px;
}

.gallery-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.gallery-empty {
  color: #9ca3af;
  font-size: 16px;
}

.gallery-thumbnails {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  overflow-x: auto;
  border-top: 1px solid #e5e7eb;
}

.thumbnail-btn {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.thumbnail-btn.active {
  border-color: #667eea;
}

.thumbnail-btn:hover {
  border-color: #d1d5db;
}

.thumbnail-pdf {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.download-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.download-link:hover {
  text-decoration: underline;
}

.detalle-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.detalle-grid {
  display: grid;
  gap: 16px;
}

.detalle-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detalle-item.full-width {
  flex-direction: column;
  gap: 8px;
}

.detalle-item.highlight {
  background: #f0fdf4;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  border-bottom: 1px solid #bbf7d0;
}

.detalle-label {
  font-weight: 600;
  color: #374151;
  min-width: 120px;
}

.detalle-descripcion {
  margin: 0;
  color: #1f2937;
  line-height: 1.5;
}

.detalle-monto {
  font-size: 18px;
  font-weight: 700;
  color: #059669;
}

@media (max-width: 768px) {
  .gastos-container {
    padding: 16px;
  }

  .gastos-header {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .header-right {
    width: 100%;
    justify-content: center;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-actions {
    flex-direction: column;
    gap: 12px;
  }

  .gallery-modal {
    width: 95vw;
    height: 95vh;
  }

  .detalle-modal {
    width: 95vw;
    max-height: 95vh;
  }

  .gallery-controls {
    padding: 12px 16px;
  }

  .gallery-content {
    padding: 16px;
    min-height: 300px;
  }

  .gallery-image {
    max-height: 350px;
  }
}
