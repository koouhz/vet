<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Módulo de Reportes de Gestión Vue 3</title>
    <!-- Carga de Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Carga de Vue 3 (Versión Global) -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .min-w-full { min-width: 100%; }
        /* Estilo para el spinner */
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="app" class="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
        <!-- El contenido de la aplicación Vue se montará aquí -->
    </div>

    <script>
        const { createApp, ref, computed, defineComponent } = Vue;

        // --- Datos Simulado de Base de Datos (Vistas) ---
        const mockReporteVentas = [
          { id: 101, cliente: "Juan Pérez", fecha: "2025-09-01", total: 450.00, item: "Alimento Premium 15kg", veterinario: "Dr. Ana Gómez" },
          { id: 102, cliente: "María López", fecha: "2025-09-02", total: 120.50, item: "Vacuna Triple Felina", veterinario: "Dr. Luis Torres" },
          { id: 103, cliente: "Carlos Ruiz", fecha: "2025-09-03", total: 890.00, item: "Medicina Especializada", veterinario: "Dr. Ana Gómez" },
          { id: 104, cliente: "Laura Díaz", fecha: "2025-09-04", total: 65.00, item: "Juguete para Perro", veterinario: "Dr. Ana Gómez" },
        ];
        const mockReporteHistorico = [
          { id: 501, cliente: "Juan Pérez", mascota: "Max", tipoAtencion: "Consulta General", fecha: "2025-09-01", diagnostico: "Revisión anual" },
          { id: 502, cliente: "María López", mascota: "Mona", tipoAtencion: "Vacunación", fecha: "2025-09-02", diagnostico: "Vacuna de refuerzo" },
          { id: 503, cliente: "Carlos Ruiz", mascota: "Toby", tipoAtencion: "Cirugía Menor", fecha: "2025-09-03", diagnostico: "Extracción de quiste" },
          { id: 504, cliente: "Laura Díaz", mascota: "Sasha", tipoAtencion: "Peluquería", fecha: "2025-09-04", diagnostico: "Baño y corte" },
        ];
        const mockReporteCitas = [
          { id: 801, veterinario: "Dr. Ana Gómez", cliente: "Felipe Soto", fecha: "2025-09-05", hora: "10:00", estado: "Confirmada", servicio: "Esterilización" },
          { id: 802, veterinario: "Dr. Luis Torres", cliente: "Elena Vidal", fecha: "2025-09-05", hora: "14:30", estado: "Pendiente", servicio: "Consulta general" },
          { id: 803, veterinario: "Dr. Ana Gómez", cliente: "Pedro Días", fecha: "2025-09-06", hora: "11:00", estado: "Completada", servicio: "Control post-cirugía" },
        ];

        // Componente Tab
        const Tab = {
            props: ['activeTab', 'tabId', 'title'],
            emits: ['update:tabId'],
            template: `
                <button
                :class="\`flex items-center space-x-2 py-3 px-6 text-sm font-medium transition-colors duration-200 border-b-2
                    \${activeTab === tabId
                    ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                    : 'text-gray-500 border-transparent hover:text-indigo-500 hover:border-gray-300'
                    } rounded-t-lg\`"
                @click="$emit('update:tabId', tabId)"
                >
                <!-- Iconos SVG simulados: DollarSign, UserCheck, Clock -->
                <svg v-if="tabId === 'ventas'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-2.485 0-4.5 2.015-4.5 4.5S9.515 17 12 17s4.5-2.015 4.5-4.5S14.485 8 12 8z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h18M3 21h18M12 3v18"></path></svg>
                <svg v-else-if="tabId === 'historico'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-6.168 0-10 4-10 7h20c0-3-3.832-7-10-7z"></path></svg>
                <svg v-else-if="tabId === 'citas'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{{ title }}</span>
                </button>
            `
        };

        // Componente FilterSection
        const FilterSection = {
            props: ['title'],
            template: `
                <div class="bg-white p-4 rounded-xl shadow-lg border border-gray-100 mb-6">
                <h3 class="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center">
                    <!-- Icono de Búsqueda simulado (Search) -->
                    <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    Filtros de Búsqueda para {{ title }}
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <slot></slot>
                </div>
                </div>
            `
        };

        // Componente FilterField
        const FilterField = {
            props: ['label', 'type', 'modelValue', 'options'],
            emits: ['update:modelValue'],
            template: `
                <div class="flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
                <div v-if="type === 'select'" class="relative">
                    <select
                    :value="modelValue"
                    @change="$emit('update:modelValue', $event.target.value)"
                    class="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-gray-800"
                    >
                    <option value="">Seleccione...</option>
                    <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <!-- Icono de ChevronDown simulado -->
                    <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                <input
                    v-else
                    :type="type || 'text'"
                    :value="modelValue"
                    @input="$emit('update:modelValue', $event.target.value)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                    :placeholder="'Buscar por ' + label.toLowerCase()"
                />
                </div>
            `
        };

        // Componente ResultsTable
        const ResultsTable = {
            props: ['data', 'title'],
            computed: {
                headers() {
                    // Intenta obtener las claves del primer objeto para las cabeceras
                    return this.data.length > 0 ? Object.keys(this.data[0]) : [];
                }
            },
            template: `
                <div class="bg-white p-6 rounded-xl shadow-lg mt-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Resultados: {{ title }} ({{ data.length }} registros)</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                        <th
                            v-for="header in headers"
                            :key="header"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            <!-- Formato legible para las cabeceras (e.g., tipoAtencion -> TIPO ATENCION) -->
                            {{ header.replace(/([A-Z])/g, ' $1').trim().toUpperCase() }}
                        </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(row, index) in data" :key="index" class="hover:bg-gray-50 transition-colors duration-150">
                        <td
                            v-for="header in headers"
                            :key="header"
                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                            <!-- Formato de moneda para el campo 'total' -->
                            <span v-if="header === 'total'">\${{ row[header].toFixed(2) }}</span>
                            <span v-else>{{ row[header] }}</span>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                <p v-if="data.length === 0" class="text-center py-8 text-gray-500">No hay datos que coincidan con los filtros aplicados.</p>
                </div>
            `
        };


        const App = {
            components: { Tab, FilterSection, FilterField, ResultsTable },
            setup() {
                // --- Estados Reactivos ---
                const activeTab = ref('ventas');
                const loading = ref(false);

                // --- Estados de Filtros para cada Reporte ---
                const filterParamsVentas = ref({
                    cliente: '',
                    fechaInicio: '',
                    fechaFin: '',
                    item: '',
                });

                const filterParamsHistorico = ref({
                    cliente: '',
                    fechaInicio: '',
                    fechaFin: '',
                    tipoAtencion: '',
                });

                const filterParamsCitas = ref({
                    veterinario: '',
                    cliente: '',
                    rangoFecha: '',
                    estadoCita: '',
                });

                // Estado para guardar los datos filtrados/ejecutados
                const ventasData = ref(mockReporteVentas);
                const historicoData = ref(mockReporteHistorico);
                const citasData = ref(mockReporteCitas);


                // --- Opciones para SELECTs de ejemplo ---
                const itemOptions = computed(() => [...new Set(mockReporteVentas.map(i => i.item))]);
                const atencionOptions = computed(() => [...new Set(mockReporteHistorico.map(i => i.tipoAtencion))]);
                const veterinarioOptions = computed(() => [...new Set(mockReporteCitas.map(i => i.veterinario))]);
                const estadoOptions = ['Confirmada', 'Pendiente', 'Completada', 'Cancelada'];


                // Función genérica para simular el proceso de búsqueda (API Call)
                const executeSearch = (reportName, filters, mockData) => {
                    loading.value = true;
                    console.log(`Ejecutando búsqueda para ${reportName} con filtros:`, filters);

                    return new Promise(resolve => {
                        setTimeout(() => {
                            // Simulación de filtrado básico en la UI por 'cliente'
                            const filteredData = mockData.filter(item => {
                                let matches = true;
                                // Solo implementamos un filtro de ejemplo por 'cliente'
                                if (filters.cliente && item.cliente && !item.cliente.toLowerCase().includes(filters.cliente.toLowerCase())) {
                                    matches = false;
                                }
                                return matches;
                            });

                            resolve(filteredData);
                            loading.value = false;
                        }, 1000);
                    });
                };

                // --- Funciones de Manejo de Reportes ---
                const handleExecuteVentas = async () => {
                    const data = await executeSearch('Notas de Venta', filterParamsVentas.value, mockReporteVentas);
                    ventasData.value = data;
                };

                const handleExecuteHistorico = async () => {
                    const data = await executeSearch('Historial Veterinario', filterParamsHistorico.value, mockReporteHistorico);
                    historicoData.value = data;
                };

                const handleExecuteCitas = async () => {
                    const data = await executeSearch('Citas Programadas', filterParamsCitas.value, mockReporteCitas);
                    citasData.value = data;
                };

                return {
                    activeTab, loading,
                    filterParamsVentas, filterParamsHistorico, filterParamsCitas,
                    ventasData, historicoData, citasData,
                    itemOptions, atencionOptions, veterinarioOptions, estadoOptions,
                    handleExecuteVentas, handleExecuteHistorico, handleExecuteCitas,
                };
            },
            template: `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                        <!-- Icono FileText simulado -->
                        <svg class="w-7 h-7 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Módulo de Reportes de Gestión
                    </h1>
                    <p class="text-gray-500 mb-8">Selecciona la vista de reporte que deseas ejecutar y aplica los filtros necesarios.</p>

                    <!-- --- Control de Pestañas --- -->
                    <div class="border-b border-gray-200">
                        <nav class="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                        <Tab
                            :activeTab="activeTab"
                            tabId="ventas"
                            title="1. Notas de Venta"
                            @update:tabId="activeTab = $event"
                        />
                        <Tab
                            :activeTab="activeTab"
                            tabId="historico"
                            title="2. Historial Veterinario"
                            @update:tabId="activeTab = $event"
                        />
                        <Tab
                            :activeTab="activeTab"
                            tabId="citas"
                            title="3. Citas Programadas"
                            @update:tabId="activeTab = $event"
                        />
                        </nav>
                    </div>

                    <!-- --- Contenido de la Pestaña Activa (Filtros y Resultados) --- -->
                    <div class="py-6">
                        <!-- Manejo de estado de carga -->
                        <div v-if="loading" class="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg mt-6">
                            <div class="flex flex-col items-center">
                                <!-- SVG Spinner -->
                                <svg class="animate-spin h-8 w-8 text-indigo-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p class="text-indigo-600 font-semibold">Cargando y aplicando filtros...</p>
                            </div>
                        </div>

                        <!-- Contenido de Reportes -->
                        <div v-else>
                            <!-- Reporte 1: Notas de Venta -->
                            <div v-if="activeTab === 'ventas'">
                                <FilterSection title="Notas de Venta">
                                    <!-- Uso de v-model para Two-Way Binding -->
                                    <FilterField
                                    label="Cliente (Búsqueda)"
                                    v-model="filterParamsVentas.cliente"
                                    />
                                    <FilterField
                                    label="Fecha de Inicio"
                                    type="date"
                                    v-model="filterParamsVentas.fechaInicio"
                                    />
                                    <FilterField
                                    label="Fecha de Fin"
                                    type="date"
                                    v-model="filterParamsVentas.fechaFin"
                                    />
                                    <FilterField
                                    label="Ítem Vendido"
                                    type="select"
                                    :options="itemOptions"
                                    v-model="filterParamsVentas.item"
                                    />
                                </FilterSection>
                                <button
                                    @click="handleExecuteVentas"
                                    class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.01] flex items-center mb-6"
                                >
                                    <!-- Icono de Búsqueda simulado -->
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    Ejecutar Búsqueda y Generar Reporte
                                </button>
                                <ResultsTable :data="ventasData" title="Notas de Venta" />
                            </div>

                            <!-- Reporte 2: Historial Veterinario -->
                            <div v-if="activeTab === 'historico'">
                                <FilterSection title="Historial Veterinario">
                                    <FilterField
                                    label="Cliente (Dueño)"
                                    v-model="filterParamsHistorico.cliente"
                                    />
                                    <FilterField
                                    label="Fecha de Inicio"
                                    type="date"
                                    v-model="filterParamsHistorico.fechaInicio"
                                    />
                                    <FilterField
                                    label="Fecha de Fin"
                                    type="date"
                                    v-model="filterParamsHistorico.fechaFin"
                                    />
                                    <FilterField
                                    label="Tipo de Atención"
                                    type="select"
                                    :options="atencionOptions"
                                    v-model="filterParamsHistorico.tipoAtencion"
                                    />
                                </FilterSection>
                                <button
                                    @click="handleExecuteHistorico"
                                    class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.01] flex items-center mb-6"
                                >
                                    <!-- Icono de Búsqueda simulado -->
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    Ejecutar Búsqueda y Generar Reporte
                                </button>
                                <ResultsTable :data="historicoData" title="Historial Veterinario" />
                            </div>

                            <!-- Reporte 3: Citas Programadas -->
                            <div v-if="activeTab === 'citas'">
                                <FilterSection title="Citas Programadas">
                                    <FilterField
                                    label="Veterinario"
                                    type="select"
                                    :options="veterinarioOptions"
                                    v-model="filterParamsCitas.veterinario"
                                    />
                                    <FilterField
                                    label="Cliente (Dueño)"
                                    v-model="filterParamsCitas.cliente"
                                    />
                                    <FilterField
                                    label="Estado de la Cita"
                                    type="select"
                                    :options="estadoOptions"
                                    v-model="filterParamsCitas.estadoCita"
                                    />
                                    <FilterField
                                    label="Rango de Fecha"
                                    type="date"
                                    v-model="filterParamsCitas.rangoFecha"
                                    />
                                </FilterSection>
                                <button
                                    @click="handleExecuteCitas"
                                    class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.01] flex items-center mb-6"
                                >
                                    <!-- Icono de Búsqueda simulado -->
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    Ejecutar Búsqueda y Generar Reporte
                                </button>
                                <ResultsTable :data="citasData" title="Citas Programadas" />
                            </div>
                        </div>
                    </div>
                </div>
            `
        };

        createApp(App).mount('#app');
    </script>
</body>
</html>
