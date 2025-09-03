import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import HomeMenu from '../pages/HomeMenu.vue';
import { isAuthenticated } from '../utils/auth.js';

const routes = [
  { path: '/', component: LoginForm },
  { path: '/home', component: HomeMenu },
  { path: '/obras', component: () => import('../pages/Obras.vue') },
  { path: '/asignar-presupuesto', component: () => import('../pages/AsignarPresupuesto.vue') },
  { path: '/gasto-operador', component: () => import('../pages/GastoOperador.vue') },
  { path: '/gastos', component: () => import('../pages/Gastos.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.path === '/') return next();
  if (!isAuthenticated()) return next('/');
  next();
});

export default router;
