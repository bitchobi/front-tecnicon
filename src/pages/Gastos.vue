<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-center text-slate-700">Gastos</h1>

    <div v-if="gastos.length > 0" class="overflow-x-auto mb-4">
      <table class="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead class="bg-gray-200">
          <tr>
            <th class="px-4 py-2 border">Fecha</th>
            <th class="px-4 py-2 border">Obra</th>
            <th class="px-4 py-2 border">Operador</th>
            <th class="px-4 py-2 border">Categoría</th>
            <th class="px-4 py-2 border">Descripción</th>
            <th class="px-4 py-2 border">Monto</th>
            <th class="px-4 py-2 border">Imágenes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in gastos" :key="g.id_gasto">
            <td class="px-4 py-2 border whitespace-nowrap">
              {{ fFecha(g.fecha) }}
            </td>
            <td class="px-4 py-2 border">{{ g.obra_nombre || "—" }}</td>
            <td class="px-4 py-2 border">{{ g.operador_nombre || "—" }}</td>
            <td class="px-4 py-2 border capitalize">{{ g.categoria }}</td>
            <td class="px-4 py-2 border">{{ g.descripcion }}</td>
            <td class="px-4 py-2 border text-right">{{ fGs(g.monto) }}</td>
            <td class="px-4 py-2 border text-center">
              <span v-if="g.imagenes?.length">{{ g.imagenes.length }}</span>
              <span v-else>0</span>
              <!-- Botón para abrir modal -->
              <button
                v-if="g.imagenes?.length"
                class="ml-2 text-blue-600 underline"
                @click="verImagen(g.imagenes[0].ruta_archivo)"
              >
                ver
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-500 text-center">No hay gastos registrados.</p>

    <div class="text-center mt-4" v-if="gastos.length > 0">
      <button
        @click="exportar"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Exportar a Excel
      </button>
    </div>

    <!-- Modal -->
    <div
      v-if="modalImagen"
      class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
    >
      <div class="bg-white p-4 rounded-lg max-w-3xl w-full relative">
        <button
          class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          @click="modalImagen = null"
        >
          Cerrar ✖
        </button>
        <img
          :src="fileUrl(modalImagen)"
          alt="Imagen del gasto"
          class="max-h-[80vh] mx-auto"
        />
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  name: "Gastos",
  data() {
    return {
      gastos: [],
      modalImagen: null, // para guardar la imagen que se abre
      API: import.meta.env.VITE_API_BASE || "http://127.0.0.1:3000",
      dtf: new Intl.DateTimeFormat("es-PY", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      nf: new Intl.NumberFormat("es-PY", {
        style: "currency",
        currency: "PYG",
        maximumFractionDigits: 0,
      }),
    };
  },
  mounted() {
    this.cargarGastos();
  },
  methods: {
    async cargarGastos() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${this.API}/gastos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.gastos = await res.json();
      } catch (error) {
        console.error("Error cargando gastos:", error);
        this.gastos = [];
      }
    },
    fFecha(iso) {
      try {
        return this.dtf.format(new Date(iso));
      } catch {
        return iso;
      }
    },
    fGs(valor) {
      const n = Number(valor);
      return isNaN(n) ? valor : this.nf.format(n);
    },
    fileUrl(path) {
      if (!path) return "#";
      return path.startsWith("http") ? path : `${this.API}/${path}`;
    },
    verImagen(ruta) {
      this.modalImagen = ruta;
    },
    exportar() {
      const rows = this.gastos.map((g) => ({
        Fecha: this.fFecha(g.fecha),
        Obra: g.obra_nombre || "",
        Operador: g.operador_nombre || "",
        Categoría: g.categoria || "",
        Descripción: g.descripcion || "",
        Monto_Gs: Number(g.monto || 0),
        Imagenes: (g.imagenes || []).length,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Gastos");
      const hoy = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `gastos_${hoy}.xlsx`);
    },
  },
};
</script>
