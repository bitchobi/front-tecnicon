<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-md w-80">
      <h1 class="text-xl font-bold mb-4 text-center">Login TECNICON</h1>

      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="border p-2 w-full mb-3 rounded"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="border p-2 w-full mb-3 rounded"
      />

      <button
        @click="login"
        class="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600"
      >
        Ingresar
      </button>

      <p v-if="error" class="text-red-500 mt-3">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { setSession } from '../utils/auth.js';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: '',
    };
  },
  methods: {
    async login() {
      try {
        const API = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:3000';

        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

        // ✅ Guarda token + expiración (30 min por defecto)
        setSession(data.token, 30);
        // (opcional) guardar rol
        localStorage.setItem('rol', data.rol || '');

        // Redirige al menú principal
        this.$router.push('/home');
      } catch (err) {
        this.error = err.message;
      }
    },
  },
};
</script>
