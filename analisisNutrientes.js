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

// Carga recetas sólidas al seleccionar
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

    let detalle = `<h4 class="mt-4 font-semibold text-blue-600">Ingrediente: ${ing}</h4>`;
    for (const clave of NUTRIENTES_CLAVE) {
      const n = nutrientes[clave];
      if (n) {
        detalle += `<p><strong>${NOMBRES_NUTRIENTES[clave] || clave}:</strong> ${n.quantity.toFixed(2)} ${n.unit}</p>`;
        total[clave] = (total[clave] || 0) + n.quantity;
      }
    }
    detallesPorIngrediente.push(detalle);
  }

  mostrarResultadoDetallado(receta.Nombre, total, detallesPorIngrediente);
}

// Mostrar todos los nutrientes + gráfico
function mostrarResultadoDetallado(nombre, total, detallesPorIngrediente) {
  const div = document.getElementById("resultadoNutricional");
  let html = `<h3 class="text-lg font-bold">🧪 Nutrientes totales de "${nombre}"</h3>`;

  for (const clave of NUTRIENTES_CLAVE) {
    if (total[clave]) {
      const label = NOMBRES_NUTRIENTES[clave] || clave;
      html += `<p><strong>${label}:</strong> ${total[clave].toFixed(2)}</p>`;
    }
  }

  html += detallesPorIngrediente.join("");
  div.innerHTML = html;

  mostrarGraficoNutricional(total);
}

// Gráfico macronutrientes
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

document.addEventListener("DOMContentLoaded", () => {
  cargarRecetasAnalisis();
});
