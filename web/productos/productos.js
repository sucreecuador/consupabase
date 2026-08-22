let paginaActual = 1;
let ordenColumna = 'nacionalidad';
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

    const formProducto = document.getElementById('formProducto');
    if (formProducto) {
        formProducto.addEventListener('submit', guardarProducto);
    }
});

function cambiarVista(nombreVista, btnElem) {
    vistaActual = nombreVista;

    document.querySelectorAll('.btn-view').forEach(btn => btn.classList.remove('active'));
    if (btnElem) btnElem.classList.add('active');

    if (vistaActual === 'vista1') {
        ordenColumna = 'nacionalidad';
    } else if (vistaActual === 'vista2') {
        ordenColumna = 'codigo';
    }

    renderizarEncabezados();
    renderizarTabla(datosActuales);
}

function renderizarEncabezados() {
    const thead = document.getElementById('tablaHeader');
    if (!thead) return;

    let html = '<tr>';

    if (vistaActual === 'vista1') {
        html += `
            <th onclick="ordenar('nacionalidad')">NACIONALIDAD ⇕</th>
            <th onclick="ordenar('marca')">MARCA ⇕</th>
            <th onclick="ordenar('descripcion')">NOMBRE ⇕</th>
            <th onclick="ordenar('uni')">UNI ⇕</th>
            <th onclick="ordenar('pvp')">PVP ⇕</th>
            <th onclick="ordenar('saldo_temp')">S.TEM ⇕</th>
            <th>Acciones</th>
        `;
    } else if (vistaActual === 'vista2') {
        html += `
            <th onclick="ordenar('codigo')">CODIGO ⇕</th>
            <th onclick="ordenar('codigo_proveedor')">COD.PROV ⇕</th>
            <th onclick="ordenar('descripcion')">NOMBRE ⇕</th>
            <th onclick="ordenar('saldo_uio')">S.UIO ⇕</th>
            <th onclick="ordenar('saldo_gye')">S.GYE ⇕</th>
            <th onclick="ordenar('costo_prom')">COSTO_PROM ⇕</th>
            <th onclick="ordenar('pro1')">PRO1 ⇕</th>
            <th>Acciones</th>
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
        let totalPaginas = resultado.totalPaginas || 1;

        renderizarTabla(datosActuales);
        renderizarPaginacion(totalPaginas);

    } catch (error) {
        console.error('Error al cargar productos:', error);
        const tbody = document.getElementById('tablaProductos');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: #d9534f; padding: 15px; font-weight: bold;">Error al obtener datos.</td></tr>`;
        }
    }
}

function renderizarTabla(productos) {
    const tbody = document.getElementById('tablaProductos');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (!productos || productos.length === 0) {
        const colSpan = vistaActual === 'vista2' ? 8 : 7;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; padding: 15px;">No se encontraron registros.</td></tr>`;
        return;
    }

    productos.forEach(p => {
        if (p.codigo === 'CODIGO') return;

        const tr = document.createElement('tr');
        const id = p.id;

        if (vistaActual === 'vista1') {
            // Lee 'nacionalidad' o 'naci' en caso de venir de la BD
            const nacionalidad = p.nacionalidad || p.naci || '—';
            const marca = p.marca || 'N/A';
            const nombre = p.descripcion || '—';
            const uni = p.uni || 'UND';
            const pvp = parseFloat(p.pvp || 0).toFixed(2);
            const sTem = p.saldo_temp ?? 0;

            tr.innerHTML = `
                <td class="excel-code">${nacionalidad}</td>
                <td><span class="excel-badge">${marca}</span></td>
                <td>${nombre}</td>
                <td>${uni}</td>
                <td class="excel-number">$${pvp}</td>
                <td class="excel-number">${sTem}</td>
                <td style="text-align:center;">
                    <button class="btn-accion" onclick="editarProducto('${id}')">✏️ Editar</button>
                    <button class="btn-accion" onclick="eliminarProducto('${id}')">❌ Eliminar</button>
                </td>
            `;
        } else if (vistaActual === 'vista2') {
            const codigo = p.codigo || '—';
            const codProv = p.codigo_proveedor || '—';
            const nombre = p.descripcion || '—';
            const sUio = p.saldo_uio ?? 0;
            const sGye = p.saldo_gye ?? 0;
            const costoProm = parseFloat(p.costo_prom || 0).toFixed(2);
            const pro1 = p.pro1 || '—';

            tr.innerHTML = `
                <td class="excel-code">${codigo}</td>
                <td>${codProv}</td>
                <td>${nombre}</td>
                <td class="excel-number">${sUio}</td>
                <td class="excel-number">${sGye}</td>
                <td class="excel-number">$${costoProm}</td>
                <td>${pro1}</td>
                <td style="text-align:center;">
                    <button class="btn-accion" onclick="editarProducto('${id}')">✏️ Editar</button>
                    <button class="btn-accion" onclick="eliminarProducto('${id}')">❌ Eliminar</button>
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

function abrirModalCrear() {
    document.getElementById('modalTitulo').textContent = '➕ Nuevo Producto';
    document.getElementById('prod_id').value = '';
    document.getElementById('prod_codigo').value = '';
    document.getElementById('prod_nacionalidad').value = '';
    document.getElementById('prod_descripcion').value = '';
    document.getElementById('prod_marca').value = '';
    document.getElementById('prod_codigo_proveedor').value = '';
    document.getElementById('prod_uni').value = 'UND';
    document.getElementById('prod_pvp').value = '0.00';
    document.getElementById('prod_costo_prom').value = '0.00';
    document.getElementById('prod_saldo_temp').value = '0';
    document.getElementById('prod_saldo_uio').value = '0';
    document.getElementById('prod_saldo_gye').value = '0';
    document.getElementById('prod_pro1').value = '';

    document.getElementById('modalProducto').style.display = 'flex';
}

async function editarProducto(id) {
    try {
        const res = await fetch(`/api/productos/${id}`);
        if (!res.ok) throw new Error('No se pudo obtener el producto');
        const data = await res.json();

        document.getElementById('modalTitulo').textContent = '✏️ Editar Producto';
        document.getElementById('prod_id').value = data.id;
        document.getElementById('prod_codigo').value = data.codigo || '';
        document.getElementById('prod_nacionalidad').value = data.nacionalidad || data.naci || '';
        document.getElementById('prod_descripcion').value = data.descripcion || '';
        document.getElementById('prod_marca').value = data.marca || '';
        document.getElementById('prod_codigo_proveedor').value = data.codigo_proveedor || '';
        document.getElementById('prod_uni').value = data.uni || '';
        document.getElementById('prod_pvp').value = data.pvp ?? 0;
        document.getElementById('prod_costo_prom').value = data.costo_prom ?? 0;
        document.getElementById('prod_saldo_temp').value = data.saldo_temp ?? 0;
        document.getElementById('prod_saldo_uio').value = data.saldo_uio ?? 0;
        document.getElementById('prod_saldo_gye').value = data.saldo_gye ?? 0;
        document.getElementById('prod_pro1').value = data.pro1 || '';

        document.getElementById('modalProducto').style.display = 'flex';
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

function cerrarModal() {
    document.getElementById('modalProducto').style.display = 'none';
}

async function guardarProducto(e) {
    e.preventDefault();

    const id = document.getElementById('prod_id').value;
    const esEdicion = Boolean(id);

    const payload = {
        codigo: document.getElementById('prod_codigo').value.trim(),
        nacionalidad: document.getElementById('prod_nacionalidad').value.trim(),
        descripcion: document.getElementById('prod_descripcion').value.trim(),
        marca: document.getElementById('prod_marca').value.trim(),
        codigo_proveedor: document.getElementById('prod_codigo_proveedor').value.trim(),
        uni: document.getElementById('prod_uni').value.trim(),
        pvp: parseFloat(document.getElementById('prod_pvp').value) || 0,
        costo_prom: parseFloat(document.getElementById('prod_costo_prom').value) || 0,
        saldo_temp: parseFloat(document.getElementById('prod_saldo_temp').value) || 0,
        saldo_uio: parseFloat(document.getElementById('prod_saldo_uio').value) || 0,
        saldo_gye: parseFloat(document.getElementById('prod_saldo_gye').value) || 0,
        pro1: document.getElementById('prod_pro1').value.trim()
    };

    const url = esEdicion ? `/api/productos/${id}` : '/api/productos';
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Error al guardar el registro');

        cerrarModal();
        cargarProductos();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function eliminarProducto(id) {
    if (confirm('¿Desea eliminar este producto?')) {
        fetch(`/api/productos/${id}`, { method: 'DELETE' })
            .then(() => cargarProductos());
    }
}