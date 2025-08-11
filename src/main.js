import { createApp } from 'vue';
import App from './App.vue';
import './style.css'; // Tailwind

import router from './router/index.js'; // ✅ Asegúrate que apunta al index.js

createApp(App).use(router).mount('#app');
