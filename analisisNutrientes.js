const NUTRIENTES_CLAVE = [
  "ENERC_KCAL", "FAT", "FASAT", "FATRN", "FAMS", "FAPU",
  "PROCNT", "CHOCDF", "SUGAR", "FIBTG", "CHOLE", "NA", "K",
  "CA", "FE", "MG", "ZN", "P", "VITA_RAE", "VITC", "VITD",
  "TOCPHA", "VITK1", "VITB6A", "VITB12", "THIA", "RIBF", "NIA"
];

const NOMBRES_NUTRIENTES = {
  ENERC_KCAL: "Calorías",
  FAT: "Grasa Total",
  FASAT: "Grasa Saturada",
  FATRN: "Grasa Trans",
  FAMS: "Grasa Monoinsaturada",
  FAPU: "Grasa Poliinsaturada",
  PROCNT: "Proteína",
  CHOCDF: "Carbohidratos Totales",
  SUGAR: "Azúcares",
  FIBTG: "Fibra",
  CHOLE: "Colesterol",
  NA: "Sodio",
  K: "Potasio",
  CA: "Calcio",
  FE: "Hierro",
  MG: "Magnesio",
  ZN: "Zinc",
  P: "Fósforo",
  VITA_RAE: "Vitamina A",
  VITC: "Vitamina C",
  VITD: "Vitamina D",
  TOCPHA: "Vitamina E",
  VITK1: "Vitamina K",
  VITB6A: "Vitamina B6",
  VITB12: "Vitamina B12",
  THIA: "Tiamina (B1)",
  RIBF: "Riboflavina (B2)",
  NIA: "Niacina (B3)"
};

// Traducción rápida básica
function traducirIngrediente(ing) {
  return ing
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/vegetal/g, "vegetable")
    .replace(/pollo/g, "chicken")
    .replace(/arroz/g, "rice")
    .replace(/sal/g, "salt")
    .replace(/manzana/g, "apple")
    .replace(/huevo/g, "egg")
    .replace(/pan/g, "bread")
    .replace(/azucar/g, "sugar")
    .replace(/leche/g, "milk")
    .replace(/platano/g, "banana")
    .replace(/tomate/g, "tomato")
    .replace(/papa/g, "potato")
    .replace(/aceite/g, "oil");
}

// Cargar recetas sólidas en el select
function cargarRecetasAnalisis() {
  const select = document.getElementById("selectRecetaAnalisis");
  if (!SHEETS_DATA || !Array.isArray(SHEETS_DATA.recetas)) return;

  const solidas = SHEETS_DATA.recetas.filter(r => r.Tipo === "Solido");
  select.innerHTML = '<option value="">Selecciona una receta...</option>' +
    solidas.map(r => `<option value="${r.ID_Receta}">${r.Nombre}</option>`).join("");
}

// Análisis completo
async function analizarRecetaNutricion() {
  const select = document.getElementById("selectRecetaAnalisis");
  const id = select.value;
  const receta = SHEETS_DATA.recetas.find(r => r.ID_Receta === id);
  if (!receta) return alert("Receta no válida");

  let ingredientes;
  try {
    ingredientes = JSON.parse(receta.Ingredientes_JSON || "[]");
  } catch {
    return alert("Error al leer los ingredientes.");
  }

  const traducidos = ingredientes.map(traducirIngrediente);
  const app_id = "129bd7ff";
  const app_key = "3f59edb6a0405a5c28da5b1282c48b29";

  const total = {};
  const detallesPorIngrediente = [];

  for (const ing of traducidos) {
    const url = `https://api.edamam.com/api/nutrition-data?app_id=${app_id}&app_key=${app_key}&ingr=${encodeURIComponent(ing)}`;
    const res = await fetch(url);
    const data = await res.json();
    const nutrientes = data.totalNutrients || {};

    let tablaIngrediente = { nombre: ing, nutrientes: [] };

    for (const clave of NUTRIENTES_CLAVE) {
      const n = nutrientes[clave];
      if (n) {
        tablaIngrediente.nutrientes.push({
          nombre: `${NOMBRES_NUTRIENTES[clave] || clave}`,
          valor: `${n.quantity.toFixed(2)} ${n.unit}`
        });
        total[clave] = (total[clave] || 0) + n.quantity;
      }
    }

    detallesPorIngrediente.push(tablaIngrediente);
  }

  mostrarResultadoDetallado(receta.Nombre, total, detallesPorIngrediente);
}

// Mostrar resultados en tabla y gráfica
function mostrarResultadoDetallado(nombre, total, detallesPorIngrediente) {
  const div = document.getElementById("resultadoNutricional");
  html += `<div class="mt-6 bg-green-50 border border-green-200 p-4 rounded">
  <h4 class="text-md font-semibold text-green-700 mb-2">💡 Retroalimentación nutricional:</h4>
  ${generarRetroalimentacion(total)}
</div>`;

  // Tabla total
  let html = `
    <h3 class="text-xl font-bold mb-4">🧪 Nutrientes totales de "${nombre}"</h3>
    <table class="w-full text-sm mb-6 border border-gray-300">
      <thead class="bg-gray-100">
        <tr><th class="p-2 text-left">Nutriente</th><th class="p-2 text-left">Cantidad total</th></tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
  `;

  for (const clave of NUTRIENTES_CLAVE) {
    if (total[clave]) {
      html += `<tr><td class="p-2">${NOMBRES_NUTRIENTES[clave]}</td><td class="p-2">${total[clave].toFixed(2)}</td></tr>`;
    }
  }

  html += "</tbody></table>";

  // Tabla por ingrediente
  detallesPorIngrediente.forEach(({ nombre, nutrientes }) => {
    html += `<h4 class="text-md font-semibold mt-6 text-blue-600">Ingrediente: ${nombre}</h4>`;
    html += `
      <table class="w-full text-sm mb-4 border border-gray-200">
        <thead class="bg-blue-50">
          <tr><th class="p-2 text-left">Nutriente</th><th class="p-2 text-left">Cantidad</th></tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
    `;
    nutrientes.forEach(n => {
      html += `<tr><td class="p-2">${n.nombre}</td><td class="p-2">${n.valor}</td></tr>`;
    });
    html += "</tbody></table>";
  });

  div.innerHTML = html;

  mostrarGraficoNutricional(total);
}

// Gráfico
function mostrarGraficoNutricional(total) {
  const canvas = document.getElementById("graficoNutricional");
  canvas.classList.remove("hidden");

  const data = {
    labels: ["Calorías", "Proteína", "Grasa Total", "Carbohidratos"],
    datasets: [{
      label: "Totales",
      data: [
        total.ENERC_KCAL || 0,
        total.PROCNT || 0,
        total.FAT || 0,
        total.CHOCDF || 0
      ],
      backgroundColor: ["#6366f1", "#34d399", "#facc15", "#fb923c"]
    }]
  };

  if (window.nutriChart) window.nutriChart.destroy();
  const ctx = canvas.getContext("2d");
  window.nutriChart = new Chart(ctx, {
    type: "bar",
    data,
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Exportar como PDF
function exportarAnalisisPDF() {
  const contenedor = document.getElementById("contenedorAnalisis");

  const opt = {
    margin: 0.3,
    filename: 'analisis_nutricional.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true
    },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(contenedor).save();
}
function generarRetroalimentacion(total) {
  const comentarios = [];

  const calorias = total.ENERC_KCAL || 0;
  const azucares = total.SUGAR || 0;
  const grasa = total.FAT || 0;
  const grasaSat = total.FASAT || 0;
  const sodio = total.NA || 0;
  const proteina = total.PROCNT || 0;
  const calcio = total.CA || 0;
  const hierro = total.FE || 0;
  const fibra = total.FIBTG || 0;

  // 🍼 Calorías
  if (calorias < 100) {
    comentarios.push("⚠️ Esta receta es baja en calorías. Puede no ser suficiente para el crecimiento infantil.");
  } else if (calorias > 400) {
    comentarios.push("❗ Esta receta es alta en calorías. Úsala en niños activos o adolescentes.");
  } else {
    comentarios.push("✅ Buena densidad calórica para una porción infantil o maternal.");
  }

  // 🍬 Azúcar
  if (azucares > 25) {
    comentarios.push("❌ Contiene exceso de azúcares. Limita su uso en bebés, lactantes y niños pequeños.");
  } else if (azucares > 15) {
    comentarios.push("⚠️ Moderadamente alta en azúcares. Úsala con precaución.");
  } else {
    comentarios.push("✅ Bajo contenido de azúcares añadidos.");
  }

  // 🧂 Sodio
  if (sodio > 500) {
    comentarios.push("❌ Alto contenido de sodio. No recomendable para bebés ni hipertensos.");
  } else if (sodio > 200) {
    comentarios.push("⚠️ Revisa el uso de sal y condimentos.");
  } else {
    comentarios.push("✅ Contenido adecuado de sodio.");
  }

  // 🥩 Proteína
  if (proteina < 5) {
    comentarios.push("⚠️ Aporte proteico bajo. Considera combinar con huevo, carne o legumbres.");
  } else {
    comentarios.push("✅ Buen contenido de proteína para desarrollo muscular.");
  }

  // 🧈 Grasas Saturadas
  if (grasaSat > 5) {
    comentarios.push("❗ Grasas saturadas elevadas. Evitar para bebés y lactantes.");
  } else {
    comentarios.push("✅ Grasas dentro del rango saludable.");
  }

  // 🦴 Calcio
  if (calcio < 100) {
    comentarios.push("⚠️ Bajo en calcio. Recomendado acompañar con lácteos o vegetales verdes.");
  } else {
    comentarios.push("✅ Contribuye a la salud ósea.");
  }

  // 💉 Hierro
  if (hierro < 3) {
    comentarios.push("⚠️ Bajo aporte de hierro. Útil reforzarlo con carnes o lentejas.");
  } else {
    comentarios.push("✅ Aporte aceptable de hierro para la prevención de anemia.");
  }

  // 🌾 Fibra
  if (fibra < 2) {
    comentarios.push("⚠️ Poca fibra. Puede afectar la digestión en niños.");
  } else {
    comentarios.push("✅ Contribuye a una digestión saludable.");
  }

  return comentarios.map(c => `<p class="text-sm text-gray-800 mb-1">🔎 ${c}</p>`).join("");
}
