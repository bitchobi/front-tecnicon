import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import HomeMenu from '../pages/HomeMenu.vue';
import AdminDashboard from '../pages/AdminDashboard.vue';
import { isLoggedIn } from '../utils/auth.js';

const routes = [
  { path: '/', component: LoginForm },
  { path: '/home', component: HomeMenu },
  { path: '/admin', component: AdminDashboard },
  { path: '/gastos', component: () => import('../pages/Gastos.vue') },
  { path: '/reportes', component: () => import('../pages/Reportes.vue') },
  { path: '/exportaciones', component: () => import('../pages/Exportaciones.vue') },
  { path: '/configuracion', component: () => import('../pages/Configuracion.vue') },
  { path: '/gastos/nuevo', component: () => import('../pages/GastoOperador.vue') },
  { path: '/presupuestos/asignar', component: () => import('../pages/AsignarPresupuesto.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  if (to.path === '/') return next();
  if (!isLoggedIn()) return next('/');
  next();
});
export default router;
