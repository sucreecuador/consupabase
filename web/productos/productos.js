let paginaActual = 1;
let ordenColumna = 'codigo';
let ordenDireccion = 'asc';
let columnaBusqueda = 'descripcion';
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

    // listeners para los botones de vistas si existen
    const btnVista1 = document.getElementById('btnVista1');
    const btnVista2 = document.getElementById('btnVista2');

    if (btnVista1) btnVista1.addEventListener('click', () => cambiarVista('vista1'));
    if (btnVista2) btnVista2.addEventListener('click', () => cambiarVista('vista2'));

    renderizarEncabezados();
    cargarProductos();
});

function cambiarVista(vista) {
    vistaActual = vista;
    renderizarEncabezados();
    cargarProductos();
}

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

function seleccionarBuscador(columnaBD, nombreMostrar, e) {
    if (e) e.stopPropagation();
    
    columnaBusqueda = columnaBD;
    
    const badge = document.getElementById('search-badge');
    if (badge) badge.textContent = `🎯 Buscando en: ${nombreMostrar}`;
    
    const inputBuscar = document.getElementById('buscar');
    if (inputBuscar) inputBuscar.placeholder = `Escribe para buscar en ${nombreMostrar}...`;

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
        const btnClase = esBuscado ? 'background:#f59e0b; color:#78350f;' : 'background:rgba(255,255,255,0.25); color:white;';

        html += `
            <th>
                <div style="display:flex; align-items:center; justify-content:space-between; gap:4px;">
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
    const tbody = document.getElementById('tablaCuerpo');
    if (tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Cargando datos...</td></tr>';

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
        if (tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:red;">Error al cargar datos de la base de datos</td></tr>';
    }
}

function renderizarTabla(productos) {
    const tbody = document.getElementById('tablaCuerpo');
    if (!tbody) return;

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No se encontraron productos</td></tr>';
        return;
    }

    let html = '';
    productos.forEach(p => {
        html += '<tr>';
        if (vistaActual === 'vista1') {
            html += `
                <td><strong>${p.codigo || ''}</strong></td>
                <td>${p.naci || ''}</td>
                <td>${p.marca || ''}</td>
                <td>${p.descripcion || ''}</td>
                <td>${p.uni || ''}</td>
                <td>$${Number(p.pvp || 0).toFixed(2)}</td>
                <td>${p.saldo_temp || 0}</td>
            `;
        } else {
            html += `
                <td><strong>${p.codigo || ''}</strong></td>
                <td>${p.codigo_proveedor || ''}</td>
                <td>${p.descripcion || ''}</td>
                <td>${p.saldo_uio || 0}</td>
                <td>${p.saldo_gye || 0}</td>
                <td>$${Number(p.costo_prom || 0).toFixed(2)}</td>
                <td>${p.pro1 || 0}</td>
                <td>$${Number(p.pvp || 0).toFixed(2)}</td>
            `;
        }
        html += `
            <td style="text-align:center;">
                <button onclick="editarProducto('${p.codigo}')">✏️ Editar</button>
                <button onclick="eliminarProducto('${p.codigo}')">❌ Eliminar</button>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

function renderizarPaginacion(totalPaginas) {
    const divPaginacion = document.getElementById('paginacion');
    if (!divPaginacion) return;

    let html = '';
    if (paginaActual > 1) {
        html += `<button onclick="cambiarPagina(${paginaActual - 1})">Anterior</button> `;
    }
    
    html += `<span>Página ${paginaActual} de ${totalPaginas}</span> `;

    if (paginaActual < totalPaginas) {
        html += `<button onclick="cambiarPagina(${paginaActual + 1})">Siguiente</button>`;
    }

    divPaginacion.innerHTML = html;
}

function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    cargarProductos();
}