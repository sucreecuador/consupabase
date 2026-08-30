const API_BASE_URL = window.location.origin;

let chartVentasInstancia = null;
let chartCategoriasInstancia = null;

document.addEventListener('DOMContentLoaded', () => {
  cargarIndicadores();
  document.getElementById('btnRefrescar')?.addEventListener('click', cargarIndicadores);
});

async function cargarIndicadores() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dashboard/resumen`);
    if (!res.ok) throw new Error('Endpoint no disponible');
    const data = await res.json();
    
    actualizarKPIs(data);
    renderizarGraficos(data.ventas_mensuales, data.categorias);
  } catch (err) {
    console.warn('Backend endpoint no responde, cargando datos mock de visualización:', err);
    
    // Mock Data de Resguardo
    const mockData = {
      ventas_total: 12450.80,
      facturas_total: 48,
      stock_total: 320,
      contactos_total: 15,
      ventas_mensuales: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
        valores: [1200, 1900, 3000, 2500, 2200, 3100, 4200, 3800]
      },
      categorias: {
        labels: ['Equipos', 'Herramientas', 'Accesorios', 'Servicios'],
        valores: [40, 25, 20, 15]
      }
    };

    actualizarKPIs(mockData);
    renderizarGraficos(mockData.ventas_mensuales, mockData.categorias);
  }
}

function actualizarKPIs(data) {
  document.getElementById('kpiVentas').textContent = `$${(data.ventas_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  document.getElementById('kpiFacturas').textContent = data.facturas_total || 0;
  document.getElementById('kpiStock').textContent = data.stock_total || 0;
  document.getElementById('kpiContactos').textContent = data.contactos_total || 0;
}

function renderizarGraficos(ventas, categorias) {
  // Gráfico de Líneas (Ventas)
  const ctxVentas = document.getElementById('chartVentas').getContext('2d');
  if (chartVentasInstancia) chartVentasInstancia.destroy();
  
  chartVentasInstancia = new Chart(ctxVentas, {
    type: 'line',
    data: {
      labels: ventas.labels,
      datasets: [{
        label: 'Ventas ($)',
        data: ventas.valores,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // Gráfico Dona (Categorías)
  const ctxCat = document.getElementById('chartCategorias').getContext('2d');
  if (chartCategoriasInstancia) chartCategoriasInstancia.destroy();

  chartCategoriasInstancia = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: categorias.labels,
      datasets: [{
        data: categorias.valores,
        backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#0dcaf0']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}