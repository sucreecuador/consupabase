let paginaActual = 1;
let ordenColumna = 'codigo';
let ordenDireccion = 'asc';
let columnaBusqueda = 'descripcion'; // Por defecto busca por Nombre / Descripción
let vistaActual = 'vista1';
let datosActuales = [];

document.addEventListener('DOMContentLoaded', () => {
    renderizarEncabezados();
    cargarProductos();

    const inputBuscar = document.getElementById('buscar');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', () => {
            paginaActual = 1;
            cargarProductos();
        });
    }
});

function cambiarVista(nombreVista, btnElem) {
    vistaActual = nombreVista;

    document.querySelectorAll('.btn-view').forEach(btn => btn.classList.remove('active'));
    if (btnElem) btnElem.classList.add('active');

    // Resetear orden y columna de búsqueda al valor por defecto
    ordenColumna = 'codigo';
    columnaBusqueda = 'descripcion';
    
    actualizarIndicadorBuscador('NOMBRE');
    renderizarEncabezados();
    cargarProductos();
}

function seleccionarColumnaBusqueda(columna, etiqueta) {
    columnaBusqueda = columna;
    paginaActual = 1;

    actualizarIndicadorBuscador(etiqueta);
    renderizarEncabezados();
    cargarProductos();
}

function actualizarIndicadorBuscador(etiqueta) {
    const inputBuscar = document.getElementById('buscar');
    if (inputBuscar) {
        inputBuscar.placeholder = `Buscar por ${etiqueta}...`;
    }
    
    let badge = document.getElementById('search-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.id = 'search-badge';
        badge.style.cssText = 'background:#10b981; color:white; font-size:12px; font-weight:bold; padding:4px 10px; border-radius:15px; margin-left:10px; display:inline-block;';
        inputBuscar.parentNode.appendChild(badge);
    }
    badge.textContent = `🎯 Buscando en: ${etiqueta}`;
}

function renderizarEncabezados() {
    const thead = document.getElementById('tablaHeader');
    if (!thead) return;

    let html = '<tr>';

    if (vistaActual === 'vista1') {
        html += `
            <th class="${columnaBusqueda === 'codigo' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('codigo', 'CÓDIGO')">CÓDIGO ⇕</th>
            <th class="${columnaBusqueda === 'naci' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('naci', 'NAC')">NAC ⇕</th>
            <th class="${columnaBusqueda === 'marca' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('marca', 'MARCA')">MARCA ⇕</th>
            <th class="${columnaBusqueda === 'descripcion' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('descripcion', 'NOMBRE')">NOMBRE ⇕</th>
            <th class="${columnaBusqueda === 'uni' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('uni', 'UNI')">UNI ⇕</th>
            <th class="${columnaBusqueda === 'pvp' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('pvp', 'PVP')">PVP ⇕</th>
            <th class="${columnaBusqueda === 'saldo_temp' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('saldo_temp', 'S.TEM')">S.TEM ⇕</th>
            <th>ACCIONES</th>
        `;
    } else {
        html += `
            <th class="${columnaBusqueda === 'codigo' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('codigo', 'CÓDIGO')">CÓDIGO ⇕</th>
            <th class="${columnaBusqueda === 'codigo_proveedor' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('codigo_proveedor', 'COD.PROV')">COD.PROV ⇕</th>
            <th class="${columnaBusqueda === 'descripcion' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('descripcion', 'NOMBRE')">NOMBRE ⇕</th>
            <th class="${columnaBusqueda === 'saldo_uio' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('saldo_uio', 'S.UIO')">S.UIO ⇕</th>
            <th class="${columnaBusqueda === 'saldo_gye' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('saldo_gye', 'S.GYE')">S.GYE ⇕</th>
            <th class="${columnaBusqueda === 'costo_prom' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('costo_prom', 'COSTO_PROM')">COSTO_PROM ⇕</th>
            <th class="${columnaBusqueda === 'pro1' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('pro1', 'PRO1')">PRO1 ⇕</th>
            <th class="${columnaBusqueda === 'pvp' ? 'selected-col' : ''}" onclick="seleccionarColumnaBusqueda('pvp', 'PRECIO')">PRECIO ⇕</th>
            <th>ACCIONES</th>
        `;
    }

    html += '</tr>';
    thead.innerHTML = html;
}

async function cargarProductos() {
    const buscarElem = document.getElementById('buscar');
    const buscar = buscarElem ? buscarElem.value.trim() : '';
    
    let url = `/api/productos?pagina=${paginaActual}&porPagina=20&ordenColumna=${ordenColumna}&ordenDireccion=${ordenDireccion}`;
    
    if (buscar !== '') {
        // Pasa el parámetro dinámico según la columna seleccionada
        url += `&columnaFiltro=${columnaBusqueda}&valorFiltro=${encodeURIComponent(buscar)}`;
    }

    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
        
        const resultado = await respuesta.json();
        datosActuales = resultado.data || [];
        
        renderizarTabla(datosActuales);
        renderizarPaginacion(resultado.totalPaginas || 1);

    } catch (error) {
        console.error('Error al cargar productos:', error);
        const tbody = document.getElementById('tablaProductos');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: #d9534f; padding: 15px;">Error al conectar con la base de datos.</td></tr>`;
        }
    }
}

function renderizarTabla(productos) {
    const tbody = document.getElementById('tablaProductos');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (!productos || productos.length === 0) {
        const colSpan = vistaActual === 'vista2' ? 9 : 8;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; padding: 15px;">No se encontraron registros.</td></tr>`;
        return;
    }

    productos.forEach(p => {
        if (p.codigo === 'CODIGO') return;

        const tr = document.createElement('tr');
        const id = p.id;

        if (vistaActual === 'vista1') {
            const codigo = p.codigo || '—';
            const nac = p.naci || p.nacionalidad || '—';
            const marca = p.marca || 'N/A';
            const nombre = p.descripcion || '—';
            const uni = p.uni || 'UND';
            const pvp = parseFloat(p.pvp || p.precio_venta || 0).toFixed(2);
            const sTem = p.saldo_temp ?? 0;

            tr.innerHTML = `
                <td class="${columnaBusqueda === 'codigo' ? 'highlight-cell' : ''}">${codigo}</td>
                <td class="${columnaBusqueda === 'naci' ? 'highlight-cell' : ''}">${nac}</td>
                <td class="${columnaBusqueda === 'marca' ? 'highlight-cell' : ''}"><span class="excel-badge">${marca}</span></td>
                <td class="${columnaBusqueda === 'descripcion' ? 'highlight-cell' : ''}">${nombre}</td>
                <td class="${columnaBusqueda === 'uni' ? 'highlight-cell' : ''}">${uni}</td>
                <td class="${columnaBusqueda === 'pvp' ? 'highlight-cell' : ''}" style="text-align:right;">$${pvp}</td>
                <td class="${columnaBusqueda === 'saldo_temp' ? 'highlight-cell' : ''}" style="text-align:right;">${sTem}</td>
                <td style="text-align:center;">
                    <button onclick="editarProducto('${id}')">✏️ Editar</button>
                    <button onclick="eliminarProducto('${id}')">❌ Eliminar</button>
                </td>
            `;
        } else {
            const codigo = p.codigo || '—';
            const codProv = p.codigo_proveedor || '—';
            const nombre = p.descripcion || '—';
            const sUio = p.saldo_uio ?? 0;
            const sGye = p.saldo_gye ?? 0;
            const costoProm = parseFloat(p.costo_prom || 0).toFixed(2);
            const pro1 = p.pro1 || '—';
            const precioVenta = parseFloat(p.precio_venta || p.pvp || 0).toFixed(2);

            tr.innerHTML = `
                <td class="${columnaBusqueda === 'codigo' ? 'highlight-cell' : ''}">${codigo}</td>
                <td class="${columnaBusqueda === 'codigo_proveedor' ? 'highlight-cell' : ''}">${codProv}</td>
                <td class="${columnaBusqueda === 'descripcion' ? 'highlight-cell' : ''}">${nombre}</td>
                <td class="${columnaBusqueda === 'saldo_uio' ? 'highlight-cell' : ''}" style="text-align:right;">${sUio}</td>
                <td class="${columnaBusqueda === 'saldo_gye' ? 'highlight-cell' : ''}" style="text-align:right;">${sGye}</td>
                <td class="${columnaBusqueda === 'costo_prom' ? 'highlight-cell' : ''}" style="text-align:right;">$${costoProm}</td>
                <td class="${columnaBusqueda === 'pro1' ? 'highlight-cell' : ''}" style="text-align:center;">${pro1}</td>
                <td class="${columnaBusqueda === 'pvp' ? 'highlight-cell' : ''}" style="text-align:right;">$${precioVenta}</td>
                <td style="text-align:center;">
                    <button onclick="editarProducto('${id}')">✏️ Editar</button>
                    <button onclick="eliminarProducto('${id}')">❌ Eliminar</button>
                </td>
            `;
        }

        tbody.appendChild(tr);
    });
}

function renderizarPaginacion(totalPaginas) {
    const div = document.getElementById('paginacion');
    if (!div) return;
    div.innerHTML = '';
    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        if (i === paginaActual) btn.classList.add('activo');
        btn.onclick = () => {
            paginaActual = i;
            cargarProductos();
        };
        div.appendChild(btn);
    }
}

function editarProducto(id) {
    console.log("Editar producto ID:", id);
}

function eliminarProducto(id) {
    if (confirm("¿Está seguro de eliminar este producto?")) {
        console.log("Eliminar producto ID:", id);
    }
}

function abrirModalCrear() {
    console.log("Abrir modal nuevo producto");
}