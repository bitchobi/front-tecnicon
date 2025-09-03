<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <button @click="$router.go(-1)" class="back-btn">
          <span>←</span>
          <span>Volver</span>
        </button>
        <h1 class="dashboard-title">Dashboard de Obra</h1>
        <div class="header-actions">
          <button @click="refreshData" class="refresh-btn" :disabled="loading">
            <span>🔄</span>
            <span>{{ loading ? "Actualizando..." : "Actualizar" }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Estadísticas básicas -->
    <div class="stats-grid" v-if="stats">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>Total Operadores</h3>
          <p class="stat-value">{{ operadores.length }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Presupuesto Total</h3>
          <p class="stat-value">{{ formatNumber(stats.presupuestoTotal) }}</p>
        </div>
      </div>
    </div>

    <!-- Mensaje de carga -->
    <div v-if="loading" class="loading-message">
      <div class="spinner"></div>
      <p>Cargando datos del dashboard...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="fetchDashboard" class="retry-btn">Reintentar</button>
    </div>

    <!-- Lista básica de operadores -->
    <div v-if="operadores.length && !loading" class="operators-list">
      <h3>Operadores</h3>
      <div v-for="op in operadores" :key="op.id_operador" class="operator-card">
        <h4>{{ op.operador }}</h4>
        <p>Presupuesto: {{ formatNumber(op.presupuesto_total) }}</p>
        <p>Gastado: {{ formatNumber(op.total_gastado) }}</p>
        <p>Consumo: {{ op.porcentaje_consumido }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getToken } from "../utils/auth.js";

const router = useRouter();
const operadores = ref([]);
const loading = ref(false);
const error = ref("");

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const stats = computed(() => {
  if (!operadores.value.length) return null;

  const presupuestoTotal = operadores.value.reduce(
    (sum, op) => sum + (op.presupuesto_total || 0),
    0
  );
  const totalGastado = operadores.value.reduce(
    (sum, op) => sum + (op.total_gastado || 0),
    0
  );

  return {
    presupuestoTotal,
    totalGastado,
  };
});

onMounted(() => {
  fetchDashboard();
});

async function fetchDashboard() {
  loading.value = true;
  error.value = "";

  try {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const response = await fetch(`${API_BASE}/dashboard/resumen/1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    operadores.value = await response.json();
  } catch (err) {
    error.value = err.message || "Error al cargar los datos del dashboard";
    console.error("Error fetching dashboard:", err);
  } finally {
    loading.value = false;
  }
}

function refreshData() {
  fetchDashboard();
}

function formatNumber(num) {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(num || 0);
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.dashboard-header {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
}

.back-btn, .refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.loading-message, .error-message {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.operators-list {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.operator-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
}
</style>
