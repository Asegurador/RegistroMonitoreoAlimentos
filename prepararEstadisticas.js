function prepararEstadisticas() {
  const data = SHEETS_DATA.registros || [];

  const resumen = document.getElementById("resumenEstadisticas");
  const canvas = document.getElementById("graficoRecetasFrecuentes");

  if (!data.length) {
    resumen.innerHTML = `<p class="text-gray-500 col-span-3">No hay registros para mostrar estadísticas.</p>`;
    canvas.classList.add("hidden");
    return;
  }

  let totalRecetas = 0;
  let totalParticipantes = 0;
  let totalCosto = 0;
  const frecuencia = {};

  data.forEach(r => {
    totalRecetas++;
    totalParticipantes += parseInt(r.Participantes || 0);
    totalCosto += parseInt(r.ValorTotal || 0);
    const receta = r.Receta || "Desconocida";
    frecuencia[receta] = (frecuencia[receta] || 0) + 1;
  });

  // Tarjetas resumen
  resumen.innerHTML = `
    <div class="bg-blue-100 p-4 rounded-lg shadow text-center">
      <p class="text-sm text-blue-800 mb-1">Recetas Preparadas</p>
      <p class="text-2xl font-bold text-blue-900">${totalRecetas}</p>
    </div>
    <div class="bg-green-100 p-4 rounded-lg shadow text-center">
      <p class="text-sm text-green-800 mb-1">Participantes Atendidos</p>
      <p class="text-2xl font-bold text-green-900">${totalParticipantes}</p>
    </div>
    <div class="bg-yellow-100 p-4 rounded-lg shadow text-center">
      <p class="text-sm text-yellow-800 mb-1">Costo Total Invertido</p>
      <p class="text-2xl font-bold text-yellow-900">$${totalCosto.toLocaleString()}</p>
    </div>
  `;

  // Preparar gráfico
  const labels = Object.keys(frecuencia);
  const valores = Object.values(frecuencia);

  canvas.classList.remove("hidden");
  const ctx = canvas.getContext("2d");
  if (window.estadisticaChart) window.estadisticaChart.destroy();

  window.estadisticaChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Frecuencia de recetas',
        data: valores,
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Cantidad' }
        },
        x: {
          title: { display: true, text: 'Recetas' }
        }
      }
    }
  });
}
