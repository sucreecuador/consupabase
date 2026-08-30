const API_BASE_URL = window.location.origin;
let datosActuales = [];

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnGenerar').addEventListener('click', generarReporte);
  document.getElementById('btnExportExcel').addEventListener('click', exportarExcel);
  document.getElementById('btnExportPDF').addEventListener('click', exportarPDF);
});

async function generarReporte() {
  const tipo = document.getElementById('tipoReporte').value;
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;

  const endpointMap = {
    contactos: '/api/contactos',
    productos: '/api/productos',
    ventas: '/api/facturas',
    inventario: '/api/inventario'
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpointMap[tipo]}`);
    if (!res.ok) throw new Error('Error consultando la API');
    datosActuales = await res.json();
    
    renderizarTabla(tipo, datosActuales);
  } catch (err) {
    console.warn('Fallo petición API, mostrando datos mock:', err);
    datosActuales = obtenerDatosMock(tipo);
    renderizarTabla(tipo, datosActuales);
  }
}

function renderizarTabla(tipo, data) {
  const thead = document.getElementById('theadReporte');
  const tbody = document.getElementById('tbodyReporte');
  const titulo = document.getElementById('tituloReporte');
  
  titulo.textContent = `Reporte de ${tipo.toUpperCase()} (${data.length} registros)`;
  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No se encontraron registros.</td></tr>';
    return;
  }

  const keys = Object.keys(data[0]);
  
  // Encabezados
  let headerRow = '<tr>';
  keys.forEach(k => headerRow += `<th class="text-capitalize">${k.replace('_', ' ')}</th>`);
  headerRow += '</tr>';
  thead.innerHTML = headerRow;

  // Filas
  data.forEach(row => {
    let bodyRow = '<tr>';
    keys.forEach(k => bodyRow += `<td>${row[k] ?? ''}</td>`);
    bodyRow += '</tr>';
    tbody.innerHTML += bodyRow;
  });
}

// Exportación a Excel mediante SheetJS
function exportarExcel() {
  if (datosActuales.length === 0) return alert('Genera un reporte primero');
  const ws = XLSX.utils.json_to_sheet(datosActuales);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, `Reporte_${document.getElementById('tipoReporte').value}.xlsx`);
}

// Exportación a PDF mediante jsPDF
function exportarPDF() {
  if (datosActuales.length === 0) return alert('Genera un reporte primero');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text(`Reporte ERP SUCRE - ${document.getElementById('tipoReporte').value.toUpperCase()}`, 14, 15);
  
  const headers = [Object.keys(datosActuales[0])];
  const rows = datosActuales.map(obj => Object.values(obj));

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 20,
    theme: 'grid'
  });

  doc.save(`Reporte_${document.getElementById('tipoReporte').value}.pdf`);
}

// Datos de prueba si el backend aún no responde
function obtenerDatosMock(tipo) {
  if (tipo === 'contactos') {
    return [
      { id: 1, nombre: 'Juan Pérez', ruc: '0999999999001', tipo: 'Cliente', telefono: '0991234567' },
      { id: 2, nombre: 'Comercial ABC', ruc: '1791234567001', tipo: 'Proveedor', telefono: '0998765432' }
    ];
  }
  return [
    { id: 1, codigo: 'PROD-01', descripcion: 'Item General', precio: 10.50, stock: 100 }
  ];
}