import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import HomeMenu from '../pages/HomeMenu.vue';
import AdminDashboard from '../pages/AdminDashboard.vue';

const routes = [
  { path: '/', component: LoginForm },
  { path: '/home', component: HomeMenu },
  { path: '/admin', component: AdminDashboard },
  { path: '/gastos', component: () => import('../pages/Gastos.vue') },
  { path: '/reportes', component: () => import('../pages/Reportes.vue') },
  { path: '/exportaciones', component: () => import('../pages/Exportaciones.vue') },
  { path: '/configuracion', component: () => import('../pages/Configuracion.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
