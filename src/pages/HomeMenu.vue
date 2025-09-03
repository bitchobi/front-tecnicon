<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <span class="logo">🏗️</span>
        <h1>TÉCNICON Control de Obra</h1>
      </div>
      <div class="user-actions">
        <div class="user-info">
          <span>{{ userName }} ({{ userRole }})</span>
        </div>
        <button class="btn danger" @click="logout">Cerrar sesión</button>
      </div>
    </header>

    <main class="content">
      <section class="menu-grid">
        <!-- Obras - Solo Admin -->
        <RouterLink v-if="isAdminUser" to="/obras" class="tile obras">
          <div class="icon">🏗️</div>
          <div class="info">
            <h3>Obras</h3>
            <p class="sub">Crear y gestionar obras</p>
          </div>
        </RouterLink>

        <!-- Asignar Presupuesto - Solo Admin -->
        <RouterLink v-if="isAdminUser" to="/asignar-presupuesto" class="tile budget">
          <div class="icon">💰</div>
          <div class="info">
            <h3>Asignar Presupuesto</h3>
            <p class="sub">Presupuesto por obra/operador</p>
          </div>
        </RouterLink>

        <!-- Registrar Gasto - Todos -->
        <RouterLink to="/gasto-operador" class="tile expenses">
          <div class="icon">��</div>
          <div class="info">
            <h3>Registrar Gasto</h3>
            <p class="sub">Nuevo gasto por operador</p>
          </div>
        </RouterLink>

        <!-- Ver Gastos - Todos -->
        <RouterLink to="/gastos" class="tile view">
          <div class="icon">📊</div>
          <div class="info">
            <h3>Ver Gastos</h3>
            <p class="sub">Consultar gastos por obra</p>
          </div>
        </RouterLink>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from "vue-router";
import { logout as authLogout, getUser } from "../utils/auth.js";

const router = useRouter();
const user = getUser();

const userName = computed(() => user?.nombre || 'Usuario');
const userRole = computed(() => user?.rol || 'Sin rol');
const isAdminUser = computed(() => user?.rol === 'admin');

function logout() {
  authLogout();
  router.push("/");
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-size: 32px;
}

.brand h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  font-weight: 600;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn.danger {
  background: #ef4444;
  color: white;
}

.content {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.tile {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.icon {
  font-size: 48px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.info .sub {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}
</style>
