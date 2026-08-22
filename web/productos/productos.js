let paginaActual = 1;
let ordenColumna = 'codigo';
let ordenDireccion = 'asc';
let columnaBusqueda = 'descripcion'; // Campo activo por defecto
let vistaActual = 'vista1';

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
        inputBuscar.addEventListener('input', () => {
            paginaActual = 1;
            cargarProductos();
        });
    }
    renderizarEncabezados();
    cargarProductos();
});

// 1. Lógica para ORDENAR (Ascendente / Descendente)
function cambiarOrden(columnaBD) {
    if (ordenColumna === columnaBD) {
        ordenDireccion = ordenDireccion === 'asc' ? 'desc' : 'asc';
    } else {
        ordenColumna = columnaBD;
        ordenDireccion = 'asc';
    }
    renderizarEncabezados();
    cargarProductos();
}

// 2. Lógica para SELECCIONAR BÚSQUEDA
function seleccionarBuscador(columnaBD, nombreMostrar, e) {
    if (e) e.stopPropagation(); // Evita que se active el ordenamiento al hacer clic en la lupa
    
    columnaBusqueda = columnaBD;
    
    const badge = document.getElementById('search-badge');
    if (badge) badge.textContent = `🎯 Buscando en: ${nombreMostrar}`;
    
    const inputBuscar = document.getElementById('buscar');
    if (inputBuscar) inputBuscar.placeholder = `Buscar por ${nombreMostrar}...`;

    renderizarEncabezados();
    paginaActual = 1;
    cargarProductos();
}

function obtenerFlecha(columnaBD) {
    if (ordenColumna !== columnaBD) return '⇕';
    return ordenDireccion === 'asc' ? '⬆️' : '⬇️';
}

function renderizarEncabezados() {
    const thead = document.getElementById('tablaHeader');
    if (!thead) return;

    const columnasVista1 = [
        { label: 'CÓDIGO', key: 'codigo' },
        { label: 'NAC', key: 'naci' },
        { label: 'MARCA', key: 'marca' },
        { label: 'NOMBRE', key: 'descripcion' },
        { label: 'UNI', key: 'uni' },
        { label: 'PVP', key: 'pvp' },
        { label: 'S.TEM', key: 'saldo_temp' }
    ];

    const columnasVista2 = [
        { label: 'CÓDIGO', key: 'codigo' },
        { label: 'COD.PROV', key: 'codigo_proveedor' },
        { label: 'NOMBRE', key: 'descripcion' },
        { label: 'S.UIO', key: 'saldo_uio' },
        { label: 'S.GYE', key: 'saldo_gye' },
        { label: 'COSTO_PROM', key: 'costo_prom' },
        { label: 'PRO1', key: 'pro1' },
        { label: 'PRECIO', key: 'pvp' }
    ];

    const columnas = vistaActual === 'vista1' ? columnasVista1 : columnasVista2;

    let html = '<tr>';
    columnas.forEach(col => {
        const esBuscado = columnaBusqueda === col.key;
        const claseTh = esBuscado ? 'style="background-color: #065f46;"' : '';
        const btnClase = esBuscado ? 'background:#f59e0b; color:#78350f; font-weight:bold;' : 'background:rgba(255,255,255,0.2); color:white;';

        html += `
            <th ${claseTh}>
                <div style="display:flex; align-items:center; justify-content:space-between; gap:5px;">
                    <span onclick="cambiarOrden('${col.key}')" style="cursor:pointer; flex-grow:1;">
                        ${col.label} ${obtenerFlecha(col.key)}
                    </span>
                    <button onclick="seleccionarBuscador('${col.key}', '${col.label}', event)" 
                            style="border:none; border-radius:3px; padding:2px 5px; font-size:10px; cursor:pointer; ${btnClase}">
                        ${esBuscado ? '🎯' : '🔍'}
                    </button>
                </div>
            </th>
        `;
    });

    html += '<th style="text-align:center;">ACCIONES</th></tr>';
    thead.innerHTML = html;
}

async function cargarProductos() {
    const inputBuscar = document.getElementById('buscar');
    const valor = inputBuscar ? inputBuscar.value.trim() : '';

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