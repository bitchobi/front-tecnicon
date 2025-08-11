<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <h1 class="text-2xl font-bold text-center mb-6">Dashboard de Obra</h1>

    <div class="flex justify-end mb-4 gap-2">
      <button
        @click="exportExcel"
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        📊 Exportar Excel
      </button>
      <button
        @click="exportPDF"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        📄 Exportar PDF
      </button>
    </div>

    <table class="min-w-full bg-white rounded shadow overflow-hidden">
      <thead class="bg-gray-200 text-gray-700">
        <tr>
          <th class="py-2 px-4 text-left">Operador</th>
          <th class="py-2 px-4 text-right">Presupuesto Total</th>
          <th class="py-2 px-4 text-right">Total Gastado</th>
          <th class="py-2 px-4 text-center">Consumo (%)</th>
          <th class="py-2 px-4 text-center">Semáforo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="op in operadores" :key="op.id_operador" class="border-b">
          <td class="py-2 px-4">{{ op.operador }}</td>
          <td class="py-2 px-4 text-right">
            {{ formatNumber(op.presupuesto_total) }}
          </td>
          <td class="py-2 px-4 text-right">
            {{ formatNumber(op.total_gastado) }}
          </td>
          <td class="py-2 px-4 text-center">{{ op.porcentaje_consumido }}%</td>
          <td class="py-2 px-4 text-center">
            <span
              class="inline-block w-4 h-4 rounded-full"
              :class="{
                'bg-green-500': op.color_semaforo === 'verde',
                'bg-yellow-400': op.color_semaforo === 'amarillo',
                'bg-orange-500': op.color_semaforo === 'naranja',
                'bg-red-600': op.color_semaforo === 'rojo',
                'bg-gray-400': op.color_semaforo === 'gris',
              }"
            ></span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      operadores: [],
    };
  },
  methods: {
    async fetchDashboard() {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/dashboard/resumen/1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.operadores = await res.json();
    },
    formatNumber(num) {
      return new Intl.NumberFormat("es-PY").format(num);
    },
    exportExcel() {
      const token = localStorage.getItem("token");
      window.open(
        `http://localhost:3000/dashboard/resumen/1/excel?token=${token}`
      );
    },
    exportPDF() {
      const token = localStorage.getItem("token");
      window.open(
        `http://localhost:3000/dashboard/resumen/1/pdf?token=${token}`
      );
    },
  },
  mounted() {
    this.fetchDashboard();
  },
};
</script>
