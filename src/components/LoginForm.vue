<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-100"
  >
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
export default {
  data() {
    return {
      email: "",
      password: "",
      error: "",
    };
  },
  methods: {
    async login() {
      try {
        const res = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);

        // ✅ Ahora enviamos siempre al menú principal
        this.$router.push("/home");
      } catch (err) {
        this.error = err.message;
      }
    },
  },
};
</script>
