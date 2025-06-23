function prepararEstadisticas() {
  const data = SHEETS_DATA.registros || [];
  const recetasCatalogo = SHEETS_DATA.recetas || [];

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

  // Mapa de ID de receta → Nombre
  const mapaRecetas = {};
  recetasCatalogo.forEach(r => {
    mapaRecetas[r.ID_Receta] = r.Nombre;
  });

data.forEach(r => {
  const participantes = parseInt(r.Num_Participantes || 0);
  const costo = parseFloat(r.Valor_Estimado_Total || 0); // <- CORRECTO AHORA

  totalParticipantes += participantes;
  totalCosto += costo;

    // Procesar receta principal
    const recetaID = r.Receta_ID;
    if (recetaID) {
      const nombreReceta = mapaRecetas[recetaID] || recetaID;
      if (!frecuencia[nombreReceta]) {
        frecuencia[nombreReceta] = { veces: 0, participantes: 0 };
      }
      frecuencia[nombreReceta].veces++;
      frecuencia[nombreReceta].participantes += participantes;
      totalRecetas++;
    }

    // Procesar bebida si existe
    const bebidaID = r.Bebida_ID;
    if (bebidaID) {
      const nombreBebida = mapaRecetas[bebidaID] || bebidaID;
      if (!frecuencia[nombreBebida]) {
        frecuencia[nombreBebida] = { veces: 0, participantes: 0 };
      }
      frecuencia[nombreBebida].veces++;
      frecuencia[nombreBebida].participantes += participantes;
      totalRecetas++;
    }
  });

  // Resumen superior
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
  const valores = labels.map(k => frecuencia[k].veces);

  canvas.classList.remove("hidden");
  const ctx = canvas.getContext("2d");
  if (window.estadisticaChart) window.estadisticaChart.destroy();

  window.estadisticaChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Frecuencia de recetas y bebidas',
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
          title: { display: true, text: 'Recetas y Bebidas' }
        }
      }
    }
  });
}
