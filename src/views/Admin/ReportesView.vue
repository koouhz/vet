  <template>
    <div class="reportes-admin-container">
      <AppSidebar />

      <main class="main-content">
        <div class="page-header">
          <h1>Reportes</h1>
          <p class="subtitle">Visualiza y descarga estadísticas del sistema.</p>
        </div>

        <div class="content-area">
          <div class="reportes-grid">
            <div
              v-for="reporte in reportes"
              :key="reporte.id"
              class="reporte-card"
            >
              <h3>{{ reporte.titulo }}</h3>
              <p>{{ reporte.descripcion }}</p>

              <div class="card-footer">
                <button
                  @click="toggleGrafica(reporte.id)"
                  class="btn btn--success"
                  :aria-expanded="!!graficaVisible[reporte.id]"
                >
                  {{ graficaVisible[reporte.id] ? 'Ocultar Gráfica' : 'Ver Gráfica' }}
                </button>
                <button
                  @click="descargarPDF(reporte)"
                  class="btn btn--outline"
                  :disabled="pdfLoading[reporte.id]"
                >
                  {{ pdfLoading[reporte.id] ? 'Generando...' : 'Descargar PDF' }}
                </button>
              </div>

              <div
                v-show="graficaVisible[reporte.id]"
                class="grafica-container"
              >
                <canvas :ref="el => chartRefs[reporte.id] = el"></canvas>
              </div>

              <div v-if="errores[reporte.id]" class="error-message">
                {{ errores[reporte.id] }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>

  <script setup>
  import { ref, onBeforeUnmount, nextTick } from 'vue'
  import AppSidebar from '@/components/layouts/AppSidebar.vue'
  import { Chart, registerables } from 'chart.js'
  import { jsPDF } from 'jspdf'
  import 'jspdf-autotable'
  import { supabase } from '@/lib/supabaseClient'

  Chart.register(...registerables)

  const reportes = ref([
    { id: 1, titulo: 'Reporte de Ventas', descripcion: 'Ventas mensuales y productos más vendidos.' },
    { id: 2, titulo: 'Reporte Veterinarios', descripcion: 'Citas por veterinario y tipo de atención.' },
    { id: 3, titulo: 'Reporte Citas', descripcion: 'Cantidad de citas por estado.' }
  ])

  const graficaVisible = ref({})
  const chartInstances = ref({})
  const chartRefs = ref({})
  const pdfLoading = ref({})
  const errores = ref({})

  const logData = (id, data) => {
    console.log(`[Reporte ${id}] Datos recibidos:`, data)
  }

  const fetchReportData = async (id) => {
    try {
      if (id === 1) {
        const { data, error } = await supabase.rpc('ventas_mensuales_agregadas')
        if (error) throw error
        if (!data || data.length === 0) {
          errores.value[id] = 'No hay ventas registradas.'
          return null
        }
        const result = {
          labels: data.map(d => d.mes),
          ingresos: data.map(d => parseFloat(d.total_mes) || 0),
          productos: data.map(d => parseInt(d.cantidad_total) || 0)
        }
        logData(id, result)
        return result
      }

      if (id === 2) {
        const { data, error } = await supabase.rpc('citas_por_veterinario')
        if (error) throw error
        if (!data || data.length === 0) {
          errores.value[id] = 'No hay citas asignadas a veterinarios.'
          return null
        }
        const result = {
          labels: data.map(d => d.nombre_veterinario),
          completadas: data.map(d => parseInt(d.completadas) || 0),
          canceladas: data.map(d => parseInt(d.canceladas) || 0),
          programadas: data.map(d => parseInt(d.programadas) || 0)
        }
        logData(id, result)
        return result
      }

      if (id === 3) {
        const { data, error } = await supabase
          .from('citasmascotas')
          .select('estado')
          .not('estado', 'is', null)
        if (error) throw error
        if (!data || data.length === 0) {
          errores.value[id] = 'No hay citas registradas.'
          return null
        }

        const counts = data.reduce((acc, cita) => {
          const key = String(cita.estado || 'Sin estado')
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {})

        const labels = Object.keys(counts)
        const dataValues = Object.values(counts)
        const colors = ['#145A32', '#0F4C28', '#1E3A2B', '#94A3B8', '#22C55E', '#F59E0B', '#EF4444']

        const result = { labels,  dataValues, colors }
        logData(id, result)
        return result
      }

      return null
    } catch (error) {
      const msg = `Error: ${error.message || 'Desconocido'}`
      console.error(`[Reporte ${id}]`, msg)
      errores.value[id] = msg
      return null
    }
  }

  const crearGrafica = async (id) => {
    errores.value[id] = null
    const data = await fetchReportData(id)
    if (!data) return

    const canvas = chartRefs.value[id]
    if (!canvas) {
      errores.value[id] = 'Canvas no disponible.'
      return
    }

    if (chartInstances.value[id]) {
      chartInstances.value[id].destroy()
    }

    try {
      if (id === 1) {
        chartInstances.value[id] = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [
              {
                label: 'Ingresos ($)',
                data: data.ingresos,
                backgroundColor: '#145A32'
              },
              {
                label: 'Productos vendidos',
                data: data.productos,
                backgroundColor: '#0F4C28'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { position: 'top' } }
          }
        })
      } else if (id === 2) {
        chartInstances.value[id] = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [
              {
                label: 'Citas completadas',
                data: data.completadas,
                backgroundColor: '#145A32'
              },
              {
                label: 'Citas canceladas',
                data: data.canceladas,
                backgroundColor: '#EF4444'
              },
              {
                label: 'Citas programadas',
                data: data.programadas,
                backgroundColor: '#1E3A2B'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { position: 'top' } }
          }
        })
      } else if (id === 3) {
        chartInstances.value[id] = new Chart(canvas, {
          type: 'pie',
          data: {
            labels: data.labels,
            datasets: [
              {
                data: data.dataValues,
                backgroundColor: data.colors.slice(0, data.labels.length)
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } }
          }
        })
      }
    } catch (err) {
      errores.value[id] = `Error al crear gráfica: ${err.message}`
      console.error(err)
    }
  }

  const toggleGrafica = async (id) => {
    graficaVisible.value[id] = !graficaVisible.value[id]
    if (graficaVisible.value[id]) {
      await nextTick()
      await crearGrafica(id)
    }
  }

  const descargarPDF = async (reporte) => {
    pdfLoading.value[reporte.id] = true
    errores.value[reporte.id] = null

    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const now = new Date().toLocaleDateString('es-ES')

      // Encabezado
      doc.setFontSize(20)
      doc.setTextColor(20, 90, 50)
      doc.text('Clínica Veterinaria', 14, 20)

      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generado el: ${now}`, pageWidth - 14, 20, { align: 'right' })

      // Título del reporte
      doc.setFontSize(16)
      doc.setTextColor(0)
      doc.text(reporte.titulo, 14, 35)

      // Línea
      doc.setDrawColor(20, 90, 50)
      doc.setLineWidth(0.5)
      doc.line(14, 40, pageWidth - 14, 40)

      doc.setFontSize(11)
      doc.setTextColor(80)
      doc.text(reporte.descripcion, 14, 48)

      const data = await fetchReportData(reporte.id)
      let finalY = 58

      if (!data) {
        doc.setFontSize(12)
        doc.setTextColor(200)
        doc.text('No hay datos disponibles para este reporte.', 14, finalY)
      } else {
        let tableData = []
        let head = []

        if (reporte.id === 1) {
          head = [['Mes', 'Ingresos ($)', 'Productos vendidos']]
          tableData = data.labels.map((mes, i) => [
            mes,
            `$${data.ingresos[i].toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            data.productos[i].toLocaleString()
          ])
        } else if (reporte.id === 2) {
          head = [['Veterinario', 'Completadas', 'Canceladas', 'Programadas']]
          tableData = data.labels.map((vet, i) => [
            vet,
            data.completadas[i].toString(),
            data.canceladas[i].toString(),
            data.programadas[i].toString()
          ])
        } else if (reporte.id === 3) {
          head = [['Estado de la Cita', 'Cantidad']]
          tableData = data.labels.map((estado, i) => [estado, data.data[i].toString()])
        }

        const table = doc.autoTable({
          head,
          body: tableData,
          startY: finalY,
          theme: 'striped',
          headStyles: {
            fillColor: [20, 90, 50],
            fontSize: 11,
            textColor: 255
          },
          styles: {
            fontSize: 10,
            cellPadding: 6
          },
          alternateRowStyles: {
            fillColor: [245, 247, 249]
          }
        })

        finalY = table.finalY
      }

      // Pie de página
      doc.setFontSize(9)
      doc.setTextColor(150)
      doc.text('© Clínica Veterinaria - Sistema de Gestión', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' })

      doc.save(`${reporte.titulo.replace(/\s+/g, '_')}_${now.replace(/\//g, '-')}.pdf`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      errores.value[reporte.id] = `Error PDF: ${error.message}`
      alert('Error al generar el PDF. Revisa la consola.')
    } finally {
      pdfLoading.value[reporte.id] = false
    }
  }

  onBeforeUnmount(() => {
    Object.values(chartInstances.value).forEach(chart => {
      if (chart?.destroy) chart.destroy()
    })
  })
  </script>

  <style scoped>
  .reportes-admin-container {
    display: flex;
    min-height: 100vh;
    background-color: #f8fafc;
  }

  .main-content {
    flex: 1;
    padding: 2rem;
    margin-left: 240px;
    transition: margin-left 0.3s ease;
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
      padding: 1.25rem;
    }
  }

  .page-header h1 {
    font-size: 1.875rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
  }

  .subtitle {
    color: #64748b;
    font-size: 1.05rem;
    margin-top: 0.35rem;
    font-weight: 500;
  }

  .reportes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 2rem;
    margin-top: 1.5rem;
  }

  .reporte-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .reporte-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
  }

  .reporte-card h3 {
    font-size: 1.35rem;
    color: #1e293b;
    margin-bottom: 0.75rem;
    font-weight: 700;
  }

  .reporte-card p {
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .grafica-container {
    height: 320px;
    width: 100%;
    margin-top: 1.5rem;
    background: #fafafa;
    border-radius: 12px;
    padding: 10px;
    box-shadow: inset 0 0 8px rgba(0,0,0,0.03);
  }

  @media (min-width: 768px) {
    .grafica-container {
      height: 420px;
    }
  }

  .card-footer {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.25rem;
  }

  .btn {
    padding: 0.7rem 1.4rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.925rem;
    cursor: pointer;
    border: none;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 130px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  .btn--success {
    background: linear-gradient(135deg, #145a32, #0f4c28);
    color: white;
    box-shadow: 0 4px 6px rgba(20, 90, 50, 0.3);
  }

  .btn--success:hover:not(:disabled) {
    background: linear-gradient(135deg, #0f4c28, #0a3a1e);
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(20, 90, 50, 0.4);
  }

  .btn--outline {
    background: white;
    color: #1e293b;
    border: 2px solid #cbd5e1;
    font-weight: 600;
  }

  .btn--outline:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #94a3b8;
    transform: translateY(-2px);
  }

  .error-message {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fef2f2;
    color: #dc2626;
    border-radius: 8px;
    font-size: 0.875rem;
    border-left: 4px solid #ef4444;
  }

  @media (max-width: 768px) {
    .reportes-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .reporte-card {
      padding: 1.5rem;
    }

    .card-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .btn {
      width: 100%;
      justify-content: center;
    }
  }
  </style>
