let paginaActual = 1;
let ordenColumna = 'codigo';
let ordenDireccion = 'asc';
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

    ordenColumna = 'codigo';

    renderizarEncabezados();
    renderizarTabla(datosActuales);
}

function renderizarEncabezados() {
    const thead = document.getElementById('tablaHeader');
    if (!thead) return;

    let html = '<tr>';

    if (vistaActual === 'vista1') {
        html += `
            <th onclick="ordenar('codigo')">CÓDIGO ⇕</th>
            <th onclick="ordenar('naci')">NAC ⇕</th>
            <th onclick="ordenar('marca')">MARCA ⇕</th>
            <th onclick="ordenar('descripcion')">NOMBRE ⇕</th>
            <th onclick="ordenar('uni')">UNI ⇕</th>
            <th onclick="ordenar('pvp')">PVP ⇕</th>
            <th onclick="ordenar('saldo_temp')">S.TEM ⇕</th>
            <th>ACCIONES</th>
        `;
    } else {
        html += `
            <th onclick="ordenar('codigo')">CÓDIGO ⇕</th>
            <th onclick="ordenar('codigo_proveedor')">COD.PROV ⇕</th>
            <th onclick="ordenar('descripcion')">NOMBRE ⇕</th>
            <th onclick="ordenar('saldo_uio')">S.UIO ⇕</th>
            <th onclick="ordenar('saldo_gye')">S.GYE ⇕</th>
            <th onclick="ordenar('costo_prom')">COSTO_PROM ⇕</th>
            <th onclick="ordenar('pro1')">PRO1 ⇕</th>
            <th onclick="ordenar('pvp')">PRECIO ⇕</th>
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
        url += `&descripcion=${encodeURIComponent(buscar)}`;
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
                <td class="excel-code">${codigo}</td>
                <td>${nac}</td>
                <td><span class="excel-badge">${marca}</span></td>
                <td>${nombre}</td>
                <td>${uni}</td>
                <td style="text-align:right;">$${pvp}</td>
                <td style="text-align:right;">${sTem}</td>
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
                <td class="excel-code">${codigo}</td>
                <td>${codProv}</td>
                <td>${nombre}</td>
                <td style="text-align:right;">${sUio}</td>
                <td style="text-align:right;">${sGye}</td>
                <td style="text-align:right;">$${costoProm}</td>
                <td>${pro1}</td>
                <td style="text-align:right;">$${precioVenta}</td>
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

function ordenar(columna) {
    if (ordenColumna === columna) {
        ordenDireccion = ordenDireccion === 'asc' ? 'desc' : 'asc';
    } else {
        ordenColumna = columna;
        ordenDireccion = 'asc';
    }
    paginaActual = 1;
    cargarProductos();
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