<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold mb-8 text-center text-gray-800">
      Menú Principal
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Gastos -->
      <router-link
        to="/gastos"
        class="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-xl transition duration-300"
      >
        <span class="text-4xl mb-4">💰</span>
        <h2 class="text-lg font-semibold text-gray-700">Gastos</h2>
        <p class="text-sm text-gray-500 mt-2 text-center">
          Administra y visualiza todos tus gastos.
        </p>
      </router-link>

      <!-- Reportes -->
      <router-link
        to="/reportes"
        class="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-xl transition duration-300"
      >
        <span class="text-4xl mb-4">📊</span>
        <h2 class="text-lg font-semibold text-gray-700">Reportes</h2>
        <p class="text-sm text-gray-500 mt-2 text-center">
          Consulta reportes detallados y gráficos.
        </p>
      </router-link>

      <!-- Exportaciones -->
      <router-link
        to="/exportaciones"
        class="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-xl transition duration-300"
      >
        <span class="text-4xl mb-4">📂</span>
        <h2 class="text-lg font-semibold text-gray-700">Exportaciones</h2>
        <p class="text-sm text-gray-500 mt-2 text-center">
          Descarga datos solo cuando estén listos.
        </p>
      </router-link>

      <!-- Configuración -->
      <router-link
        to="/configuracion"
        class="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-xl transition duration-300"
      >
        <span class="text-4xl mb-4">⚙️</span>
        <h2 class="text-lg font-semibold text-gray-700">Configuración</h2>
        <p class="text-sm text-gray-500 mt-2 text-center">
          Ajusta parámetros y preferencias de la app.
        </p>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeMenu",
};
</script>
