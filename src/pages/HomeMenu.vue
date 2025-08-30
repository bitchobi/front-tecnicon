<template>
  <div class="app-shell">
    <!-- Topbar -->
    <header class="topbar">
      <div class="brand">
        <span class="logo">⚙️</span>
        <h1>Panel TÉCNICON</h1>
      </div>
      <div class="user-actions">
        <div class="user-info" v-if="username">
          <span class="hi">Hola,</span>
          <strong>{{ username }}</strong>
        </div>
        <button
          class="btn outline"
          @click="goToConfig"
          title="Configuración del sistema"
        >
          <span>⚙️</span>
          <span class="label">Config</span>
        </button>
        <button class="btn danger" @click="confirmLogout" title="Cerrar sesión">
          <span>⎋</span>
          <span class="label">Cerrar sesión</span>
        </button>
      </div>
    </header>

    <!-- Menú principal -->
    <main class="content">
      <!-- Breadcrumb para navegación -->
      <nav class="breadcrumb" v-if="currentPath !== '/'">
        <button @click="goBack" class="back-btn">
          <span>←</span>
          <span>Volver</span>
        </button>
        <span class="separator">|</span>
        <span class="current">{{ getCurrentPageTitle() }}</span>
      </nav>

      <section class="menu-grid">
        <!-- Dashboard -->
        <RouterLink
          to="/admin"
          class="tile dashboard"
          :class="{ active: isCurrentRoute('/admin') }"
        >
          <div class="icon">📊</div>
          <div class="info">
            <h3>Dashboard</h3>
            <p class="sub">Indicadores y métricas</p>
          </div>
          <div class="chev">›</div>
          <div class="status-dot active"></div>
        </RouterLink>

        <!-- Presupuesto -->
        <RouterLink
          to="/asignar-presupuesto"
          class="tile budget"
          :class="{ active: isCurrentRoute('/asignar-presupuesto') }"
          v-if="isAdmin"
        >
          <div class="icon">📋</div>
          <div class="info">
            <h3>Asignar Presupuesto</h3>
            <p class="sub">Centros de costo</p>
          </div>
          <div class="chev">›</div>
          <div class="status-dot active"></div>
        </RouterLink>

        <!-- Gastos -->
        <RouterLink
          to="/gastos"
          class="tile expenses"
          :class="{ active: isCurrentRoute('/gastos') }"
        >
          <div class="icon">💸</div>
          <div class="info">
            <h3>Gastos</h3>
            <p class="sub">Ver y administrar</p>
          </div>
          <div class="chev">›</div>
          <div class="status-dot active"></div>
        </RouterLink>

        <!-- Cargar Gasto por Operador -->
        <RouterLink
          to="/gasto-operador"
          class="tile operator"
          :class="{ active: isCurrentRoute('/gasto-operador') }"
        >
          <div class="icon">👷</div>
          <div class="info">
            <h3>Cargar Gasto</h3>
            <p class="sub">Registrar nuevo gasto</p>
          </div>
          <div class="chev">›</div>
          <div class="status-dot active"></div>
        </RouterLink>

        <!-- Reportes -->
        <RouterLink
          to="/reportes"
          class="tile reports"
          :class="{ active: isCurrentRoute('/reportes') }"
        >
          <div class="icon">📈</div>
          <div class="info">
            <h3>Reportes</h3>
            <p class="sub">Análisis y KPI</p>
          </div>
          <div class="chev">›</div>
          <div class="status-dot active"></div>
        </RouterLink>

        <!-- Exportaciones -->
        <RouterLink
          to="/exportaciones"
          class="tile exports"
          :class="{ active: isCurrentRoute('/exportaciones') }"
        >
          <div class="icon">📤</div>
          <div class="info">
            <h3>Exportaciones</h3>
            <p class="sub">Excel / CSV</p>
          </div>
          <div class="chev">›</div>
          <div class="status-dot active"></div>
        </RouterLink>

        <!-- Configuración -->
        <RouterLink
          to="/configuracion"
          class="tile config"
          :class="{ active: isCurrentRoute('/configuracion') }"
        >
          <div class="icon">🛠️</div>
          <div class="info">
            <h3>Configuración</h3>
            <p class="sub">Parámetros del sistema</p>
          </div>
          <div class="chev">›</div>
          <div class="status-dot active"></div>
        </RouterLink>
      </section>

      <!-- Stats rápidas -->
      <section class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <h4>Total Gastado</h4>
            <p class="stat-value">{{ formatCurrency(totalSpent) }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h4>Presupuesto Disponible</h4>
            <p class="stat-value">{{ formatCurrency(availableBudget) }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h4>Operadores Activos</h4>
            <p class="stat-value">{{ activeOperators }}</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Modal de confirmación para logout -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="cancelLogout">
      <div class="modal" @click.stop>
        <h3>¿Cerrar sesión?</h3>
        <p>¿Estás seguro de que quieres cerrar la sesión?</p>
        <div class="modal-actions">
          <button class="btn outline" @click="cancelLogout">Cancelar</button>
          <button class="btn danger" @click="logout">Cerrar sesión</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";

const router = useRouter();
const route = useRoute();
const username = ref("");
const showLogoutModal = ref(false);

// Stats de ejemplo - reemplaza con datos reales de tu API
const totalSpent = ref(125000);
const availableBudget = ref(875000);
const activeOperators = ref(12);

const currentPath = computed(() => route.path);

// Verificar rol del usuario
const isAdmin = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.rol === "admin" || user?.role === "admin";
  } catch {
    return false;
  }
});

onMounted(() => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    username.value = user?.nombre || user?.username || user?.email || "Usuario";

    // Cargar stats si es necesario
    loadQuickStats();
  } catch {
    username.value = "Usuario";
  }
});

// Watch para cambios de ruta
watch(route, (newRoute) => {
  // Aquí puedes actualizar stats específicos según la ruta
  console.log(`Navegando a: ${newRoute.path}`);
});

function isCurrentRoute(path) {
  return route.path === path;
}

function getCurrentPageTitle() {
  const titles = {
    "/admin": "Dashboard",
    "/asignar-presupuesto": "Asignar Presupuesto",
    "/gastos": "Gastos",
    "/gasto-operador": "Gasto por Operador",
    "/reportes": "Reportes",
    "/exportaciones": "Exportaciones",
    "/configuracion": "Configuración",
  };
  return titles[route.path] || "Panel Principal";
}

function goBack() {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push("/");
  }
}

function confirmLogout() {
  showLogoutModal.value = true;
}

function cancelLogout() {
  showLogoutModal.value = false;
}

function logout() {
  // Limpiar todos los datos de autenticación
  localStorage.removeItem("auth_token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userSession");

  // Limpiar sessionStorage también
  sessionStorage.clear();

  showLogoutModal.value = false;

  // Redirigir al login con reemplazo para evitar volver atrás
  router.replace("/login");
}

function goToConfig() {
  router.push("/configuracion");
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(amount);
}

async function loadQuickStats() {
  try {
    // Aquí cargarías los datos reales de tu API
    // const response = await fetch('/api/dashboard/stats');
    // const data = await response.json();
    // totalSpent.value = data.totalSpent;
    // availableBudget.value = data.availableBudget;
    // activeOperators.value = data.activeOperators;
  } catch (error) {
    console.error("Error cargando estadísticas:", error);
  }
}
</script>

<style scoped>
:root {
  --bg: #0f172a;
  --card: #111827;
  --muted: #9aa3b2;
  --fg: #e5e7eb;
  --brand: #22c55e;
  --danger: #ef4444;
  --border: #1f2937;
  --success: #10b981;
  --warning: #f59e0b;
}

.app-shell {
  min-height: 100vh;
  background: radial-gradient(
      1200px 600px at 10% -10%,
      rgba(34, 197, 94, 0.08),
      transparent
    ),
    radial-gradient(
      1200px 600px at 110% 10%,
      rgba(59, 130, 246, 0.08),
      transparent
    ),
    var(--bg);
  color: var(--fg);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(
    180deg,
    rgba(17, 24, 39, 0.95),
    rgba(17, 24, 39, 0.85)
  );
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: default;
}

.brand .logo {
  font-size: 24px;
}

.brand h1 {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.3px;
  margin: 0;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-info {
  margin-right: 8px;
  color: var(--muted);
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info .hi {
  margin-right: 6px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #0b1220;
  color: var(--fg);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn:hover {
  border-color: #2b3748;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn.danger {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
  color: #fca5a5;
}

.btn.danger:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.5);
}

.btn.outline {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn.outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

.content {
  max-width: 1400px;
  margin: 28px auto;
  padding: 0 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: var(--brand);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(34, 197, 94, 0.25);
  transform: translateX(-2px);
}

.separator {
  color: var(--muted);
}

.current {
  font-weight: 600;
  color: var(--brand);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.tile {
  position: relative;
  display: grid;
  grid-template-columns: 60px 1fr 20px;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid var(--border);
  text-decoration: none;
  color: var(--fg);
  transition: all 0.3s ease;
  overflow: hidden;
}

.tile::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.tile:hover::before {
  left: 100%;
}

.tile:hover {
  border-color: #374151;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.tile.active {
  border-color: var(--brand);
  background: linear-gradient(
    145deg,
    rgba(34, 197, 94, 0.1),
    rgba(34, 197, 94, 0.05)
  );
}

.icon {
  font-size: 28px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.35);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  transition: all 0.3s ease;
}

.tile:hover .icon {
  transform: scale(1.05);
  background: rgba(34, 197, 94, 0.25);
}

.info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.info .sub {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.4;
}

.chev {
  justify-self: end;
  font-size: 20px;
  color: var(--muted);
  transition: all 0.3s ease;
}

.tile:hover .chev {
  color: var(--brand);
  transform: translateX(4px);
}

.status-dot {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--muted);
}

.status-dot.active {
  background: var(--success);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

/* Colores específicos para cada tile */
.tile.dashboard .icon {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.35);
}
.tile.budget .icon {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.35);
}
.tile.expenses .icon {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.35);
}
.tile.operator .icon {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.35);
}
.tile.reports .icon {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.35);
}
.tile.exports .icon {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.35);
}
.tile.config .icon {
  background: rgba(107, 114, 128, 0.15);
  border-color: rgba(107, 114, 128, 0.35);
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--brand);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(34, 197, 94, 0.15);
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.stat-info h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: var(--muted);
  font-weight: 500;
}

.stat-value {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--brand);
}

/* Modal */
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

.modal {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: var(--fg);
}

.modal p {
  margin: 0 0 24px 0;
  color: var(--muted);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

@media (max-width: 768px) {
  .topbar {
    padding: 12px 16px;
  }

  .brand h1 {
    display: none;
  }

  .btn .label {
    display: none;
  }

  .user-info {
    display: none;
  }

  .menu-grid {
    grid-template-columns: 1fr;
  }

  .content {
    padding: 0 16px;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .tile {
    padding: 16px;
  }

  .icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .info h3 {
    font-size: 15px;
  }
}
</style>