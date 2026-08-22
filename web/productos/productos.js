let paginaActual = 1;
let ordenColumna = 'codigo';
let ordenDireccion = 'asc';
let columnaBusqueda = 'descripcion'; // Nombre por defecto en BD

// Mapeo obligatorio de títulos de interfaz a nombres reales de columnas en Supabase
const MAPEO_COLUMNAS = {
    'CÓDIGO': 'codigo',
    'NAC': 'naci',
    'MARCA': 'marca',
    'NOMBRE': 'descripcion',
    'UNI': 'uni',
    'PVP': 'pvp',
    'PRECIO': 'pvp',
    'S.TEM': 'saldo_temp',
    'COD.PROV': 'codigo_proveedor',
    'S.UIO': 'saldo_uio',
    'S.GYE': 'saldo_gye',
    'COSTO_PROM': 'costo_prom',
    'PRO1': 'pro1'
};

document.addEventListener('DOMContentLoaded', () => {
    const inputBuscar = document.getElementById('buscar');
    if (inputBuscar) {
        // Evento que ejecuta la búsqueda al escribir
        inputBuscar.addEventListener('input', () => {
            paginaActual = 1;
            cargarProductos();
        });
    }
    cargarProductos();
});

// Función para cambiar la columna de búsqueda desde la tabla
function seleccionarColumnaBusqueda(nombreColumnaUI) {
    const colBD = MAPEO_COLUMNAS[nombreColumnaUI] || 'descripcion';
    columnaBusqueda = colBD;
    
    const badge = document.getElementById('badgeColumna');
    if (badge) {
        badge.textContent = `🎯 Buscando en: ${nombreColumnaUI}`;
    }
    
    paginaActual = 1;
    cargarProductos();
}

async function cargarProductos() {
    const inputBuscar = document.getElementById('buscar');
    const valor = inputBuscar ? inputBuscar.value.trim() : '';

    // Construcción de los parámetros hacia FastAPI
    const params = new URLSearchParams({
        pagina: paginaActual,
        porPagina: 20,
        ordenColumna: ordenColumna,
        ordenDireccion: ordenDireccion
    });

    if (valor !== '') {
        params.append('columnaFiltro', columnaBusqueda);
        params.append('valorFiltro', valor);
    }

    try {
        const res = await fetch(`/api/productos?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const respuesta = await res.json();
        renderizarTabla(respuesta.data || []);
        renderizarPaginacion(respuesta.totalPaginas || 1);
    } catch (err) {
        console.error("Error al cargar productos:", err);
    }
}