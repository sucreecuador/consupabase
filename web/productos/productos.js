let paginaActual = 1;
let ordenColumna = 'codigo';
let ordenDireccion = 'asc';
let columnaBusqueda = 'descripcion';
let vistaActual = 'vista1';

document.addEventListener('DOMContentLoaded', () => {
    const inputBuscar = document.getElementById('buscar');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', () => {
            paginaActual = 1;
            cargarProductos();
        });
    }

    const btnVista1 = document.getElementById('btnVista1');
    const btnVista2 = document.getElementById('btnVista2');

    if (btnVista1) {
        btnVista1.addEventListener('click', () => {
            btnVista1.classList.add('vista1-activo');
            if (btnVista2) btnVista2.classList.remove('vista2-activo');
            cambiarVista('vista1');
        });
    }

    if (btnVista2) {
        btnVista2.addEventListener('click', () => {
            btnVista2.classList.add('vista2-activo');
            if (btnVista1) btnVista1.classList.remove('vista1-activo');
            cambiarVista('vista2');
        });
    }

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
        if (tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:red;">Error de conexión con el servidor</td></tr>';
    }
}

function renderizarTabla(productos) {
    const tbody = document.getElementById('tablaCuerpo');
    if (!tbody) return;

    if (!Array.isArray(productos) || productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No se encontraron productos</td></tr>';
        return;
    }

    try {
        let html = '';
        productos.forEach(p => {
            const cod = p.codigo || p.CODIGO || '';
            const desc = p.descripcion || p.DESCRIPCION || p.NOMBRE || '';
            const pvpVal = Number(p.pvp || p.PVP || 0).toFixed(2);
            const costoVal = Number(p.costo_prom || p.COSTO_PROM || 0).toFixed(2);

            html += '<tr>';
            if (vistaActual === 'vista1') {
                html += `
                    <td><strong>${cod}</strong></td>
                    <td>${p.naci || p.NAC || ''}</td>
                    <td>${p.marca || p.MARCA || ''}</td>
                    <td>${desc}</td>
                    <td>${p.uni || p.UNI || ''}</td>
                    <td>$${pvpVal}</td>
                    <td>${p.saldo_temp || p.S_TEM || 0}</td>
                `;
            } else {
                html += `
                    <td><strong>${cod}</strong></td>
                    <td>${p.codigo_proveedor || p.COD_PROV || '0'}</td>
                    <td>${desc}</td>
                    <td>${p.saldo_uio || p.S_UIO || 0}</td>
                    <td>${p.saldo_gye || p.S_GYE || 0}</td>
                    <td>$${costoVal}</td>
                    <td>${p.pro1 || p.PRO1 || 0}</td>
                    <td>$${pvpVal}</td>
                `;
            }
            html += `
                <td style="text-align:center;">
                    <button onclick="editarProducto('${cod}')" class="btn-editar">✏️ Editar</button>
                    <button onclick="eliminarProducto('${cod}')" class="btn-eliminar">❌ Eliminar</button>
                </td>
            </tr>`;
        });

        tbody.innerHTML = html;
    } catch (e) {
        console.error("Error renderizando filas:", e);
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:red;">Error al procesar formato de datos</td></tr>';
    }
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

function editarProducto(codigo) {
    alert(`Editar producto: ${codigo}`);
}

function eliminarProducto(codigo) {
    if (confirm(`¿Desea eliminar el producto ${codigo}?`)) {
        // Implementar acción de eliminación
    }
}

function nuevoProducto() {
    alert("Función nuevo producto");
}