<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-100"
  >
    <div class="bg-white p-8 rounded-lg shadow-lg w-96">
      <!-- Header mejorado -->
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🏗️</div>
        <h1 class="text-2xl font-bold text-gray-800 mb-1">TÉCNICON</h1>
        <p class="text-gray-600 text-sm">Control de Obra</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="login">
        <div class="mb-4">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
            :disabled="loading"
            class="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            :class="{
              'border-red-500 focus:ring-red-500': errors.email,
              'bg-gray-100 cursor-not-allowed': loading,
            }"
          />
          <p v-if="errors.email" class="text-red-500 text-sm mt-1">
            {{ errors.email }}
          </p>
        </div>

        <div class="mb-4">
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Contraseña"
              required
              :disabled="loading"
              class="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
              :class="{
                'border-red-500 focus:ring-red-500': errors.password,
                'bg-gray-100 cursor-not-allowed': loading,
              }"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :disabled="loading"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {{ showPassword ? "🙈" : "👁️" }}
            </button>
          </div>
          <p v-if="errors.password" class="text-red-500 text-sm mt-1">
            {{ errors.password }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="loading || !email || !password"
          class="bg-blue-500 text-white w-full p-3 rounded-lg hover:bg-blue-600 transition-all font-semibold flex items-center justify-center gap-2"
          :class="{
            'opacity-50 cursor-not-allowed': loading || !email || !password,
            'hover:shadow-lg transform hover:scale-[1.02]':
              !loading && email && password,
          }"
        >
          <div
            v-if="loading"
            class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></div>
          {{ loading ? "Iniciando sesión..." : "Ingresar" }}
        </button>
      </form>

      <!-- Mensajes de error mejorados -->
      <div
        v-if="error"
        class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
      >
        <div class="flex items-center gap-2">
          <span class="text-red-500">⚠️</span>
          <p class="text-red-700 text-sm">{{ error }}</p>
        </div>
      </div>

      <!-- Mensaje de éxito -->
      <div
        v-if="success"
        class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
      >
        <div class="flex items-center gap-2">
          <span class="text-green-500">✅</span>
          <p class="text-green-700 text-sm">{{ success }}</p>
        </div>
      </div>

      <!-- Credenciales de prueba -->
      <div class="mt-6 pt-4 border-t border-gray-200">
        <p class="text-gray-600 text-xs text-center mb-3">
          Credenciales de prueba:
        </p>
        <div class="space-y-2">
          <div
            @click="quickLogin('admin@tecnicon.com', 'admin123')"
            class="bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <p class="text-xs text-gray-700">
              <strong>Admin:</strong> admin@tecnicon.com / admin123
            </p>
          </div>
          <div
            @click="quickLogin('operador@tecnicon.com', 'operador123')"
            class="bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <p class="text-xs text-gray-700">
              <strong>Operador:</strong> operador@tecnicon.com / operador123
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { setSession, setUser, isAuthenticated } from "../utils/auth.js";

export default {
  name: "LoginForm",
  data() {
    return {
      email: "",
      password: "",
      error: "",
      success: "",
      loading: false,
      showPassword: false,
      errors: {},
    };
  },
  mounted() {
    // Redirigir si ya está autenticado
    if (isAuthenticated()) {
      this.$router.push("/");
    }
  },
  methods: {
    validateForm() {
      this.errors = {};

      if (!this.email) {
        this.errors.email = "El email es requerido";
      } else if (!/\S+@\S+\.\S+/.test(this.email)) {
        this.errors.email = "El email no es válido";
      }

      if (!this.password) {
        this.errors.password = "La contraseña es requerida";
      } else if (this.password.length < 6) {
        this.errors.password = "La contraseña debe tener al menos 6 caracteres";
      }

      return Object.keys(this.errors).length === 0;
    },

    async login() {
      // Limpiar mensajes previos
      this.error = "";
      this.success = "";

      // Validar formulario
      if (!this.validateForm()) {
        return;
      }

      this.loading = true;

      try {
        const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

        const res = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Error al iniciar sesión");
        }

        // Guardar sesión (mantiene tu lógica actual)
        setSession(data.token, 30);

        // Guardar datos del usuario
        setUser({
          id_usuario: data.id_usuario,
          nombre: data.nombre,
          email: this.email,
          rol: data.rol,
        });

        // También guardar rol por separado (compatibilidad con tu código)
        localStorage.setItem("rol", data.rol || "");

        // Mostrar éxito brevemente
        this.success = "Inicio de sesión exitoso";

        // Redirigir después de un momento
        setTimeout(() => {
          // Usa tu ruta actual o cambia a '/' si prefieres
          this.$router.push("/home");
        }, 1000);
      } catch (err) {
        console.error("Error en login:", err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    // Función para login rápido con credenciales de prueba
    quickLogin(email, password) {
      this.email = email;
      this.password = password;
      this.login();
    },
  },
};
</script>

<style scoped>
/* Animación del spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>