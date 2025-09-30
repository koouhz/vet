<template>
  <!--
    Contenedor Principal:
    1. Padding: Usa p-4 en móviles y p-8 en pantallas medianas+.
    2. Margen Izquierdo (md:ml-[260px]): Aplica un margen izquierdo de 260px SOLO a partir del breakpoint 'md'.
       Esto asegura que el contenido no se oculte detrás del sidebar fijo en escritorio,
       pero en móvil (donde el sidebar probablemente se oculta o se superpone) ocupa todo el ancho.
    3. Transición: Mantiene la animación si el sidebar se colapsa/expande.
  -->
  <div class="p-4 sm:p-8 md:ml-[260px] transition-all duration-300 min-h-screen bg-gray-50">

    <div class="max-w-7xl mx-auto">

      <!-- Encabezado de la página -->
      <header class="mb-8 md:mb-12">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-indigo-800 tracking-tight">
          Reportes de Gestión
        </h2>
        <p class="mt-2 text-base sm:text-lg text-gray-500">
          Selecciona el reporte que deseas ejecutar y aplica los filtros necesarios.
        </p>
      </header>

      <!-- Grid de Tarjetas de Reporte: Totalmente responsivo (1, 2 o 3 columnas) -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

        <ReportCard
          title="Notas de Venta"
          description="Filtra y exporta el detalle de ventas por período y cliente."
          iconClass="ph-currency-circle-dollar"
          @click="selectReport('ventas')"
        />

        <ReportCard
          title="Historial Clínico"
          description="Consulta el historial médico de pacientes por veterinario o fecha."
          iconClass="ph-stethoscope"
          @click="selectReport('clinico')"
        />

        <ReportCard
          title="Citas Programadas"
          titleColor="text-green-700"
          description="Visualiza las citas pendientes y completadas por rango de fecha."
          iconClass="ph-calendar-check"
          @click="selectReport('citas')"
        />

        <ReportCard
          title="Inventario de Productos"
          titleColor="text-amber-700"
          description="Stock actual, movimientos y alertas de productos."
          iconClass="ph-package"
          @click="selectReport('inventario')"
        />

      </section>

      <!-- Vista de Detalle del Reporte Seleccionado -->
      <div v-if="selectedReport" class="mt-10 sm:mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h3 class="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
          Detalle del Reporte: {{ reportTitle }}
        </h3>

        <!-- Bloque de Filtros: Se ajusta a 1 columna en móvil y 3 en desktop -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
             <input type="text" placeholder="Buscar por Cliente" class="p-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
             <input type="date" class="p-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
             <button class="bg-indigo-600 text-white font-medium p-3 rounded-lg hover:bg-indigo-700 transition">
                <i class="ph ph-sliders mr-2"></i>Aplicar Filtros
             </button>
        </div>

        <p class="text-gray-600">
            Mostrando resultados del reporte <span class="font-bold text-indigo-600">{{ reportTitle }}</span>.
        </p>

        <!-- Mockup de tabla/resultados: Asegura desplazamiento horizontal si es necesario -->
        <div class="mt-6 overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg">
                <thead class="bg-indigo-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Fecha</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Descripción</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Monto</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr><td class="px-6 py-4 whitespace-nowrap">2023-01-15</td><td class="px-6 py-4 whitespace-nowrap">Consulta de rutina</td><td class="px-6 py-4 whitespace-nowrap">$45.00</td></tr>
                    <tr><td class="px-6 py-4 whitespace-nowrap">2023-01-16</td><td class="px-6 py-4 whitespace-nowrap">Venta de alimento</td><td class="px-6 py-4 whitespace-nowrap">$75.50</td></tr>
                </tbody>
            </table>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ReportCard from '@/components/ReportCard.vue'; // Debe existir este componente.

const selectedReport = ref('ventas'); // Iniciar con uno seleccionado

const reportTitles = {
  ventas: 'Notas de Venta',
  clinico: 'Historial Clínico',
  citas: 'Citas Programadas',
  inventario: 'Inventario de Productos',
};

const selectReport = (key) => {
  selectedReport.value = key;
};

const reportTitle = computed(() => reportTitles[selectedReport.value] || 'Seleccione un Reporte');

</script>

<style scoped>
/* No se requiere CSS adicional, Tailwind CSS maneja el responsive y diseño. */
</style>
