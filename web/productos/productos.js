let paginaActual = 1;
let ordenColumna = 'codigo';
let ordenDireccion = 'asc';

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    const inputBuscar = document.getElementById('buscar');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', () => {
            paginaActual = 1;
            cargarProductos();
        });
    }

    configurarCabeceras();

    const formProducto = document.getElementById('formProducto');
    if (formProducto) {
        formProducto.addEventListener('submit', guardarProducto);
    }
});

function configurarCabeceras() {
    const cabeceras = document.querySelectorAll('.erp-table th');
    const mapaColumnas = [
        'codigo',            // Columna 0: Código
        'descripcion',       // Columna 1: Descripción
        'marca',             // Columna 2: Marca
        'codigo_proveedor',  // Columna 3: Proveedor
        'saldo_temp',        // Columna 4: Stock
        'precio_venta'       // Columna 5: Precio
    ];

    cabeceras.forEach((th, index) => {
        if (index < mapaColumnas.length) {
            th.style.cursor = 'pointer';
            th.title = 'Haz clic para ordenar por este campo';
            th.onclick = () => ordenar(mapaColumnas[index]);
        }
    });
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
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const resultado = await respuesta.json();
        
        if (resultado.error) {
            console.error('Error reportado desde el servidor:', resultado.error);
        }

        let lista = resultado.data || [];
        let totalPaginas = resultado.totalPaginas || 1;

        renderizarTabla(lista);
        renderizarPaginacion(totalPaginas);

    } catch (error) {
        console.error('Error al cargar productos:', error);
        const tbody = document.getElementById('tablaProductos');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: #d9534f; padding: 15px; font-weight: bold;">Error al obtener datos (${error.message}).</td></tr>`;
        }
    }
}

function renderizarTabla(productos) {
    const tbody = document.getElementById('tablaProductos');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 15px;">No se encontraron registros.</td></tr>`;
        return;
    }

    productos.forEach(p => {
        if (p.codigo === 'CODIGO') return;

        const tr = document.createElement('tr');
        
        const codigo = p.codigo || '—';
        const descripcion = p.descripcion || '—';
        const marca = p.marca || 'N/A';
        const codProveedor = p.codigo_proveedor || '—';
        const stock = p.saldo_temp ?? 0;
        const precio = parseFloat(p.precio_venta || 0).toFixed(2);
        const id = p.id;

        tr.innerHTML = `
            <td class="excel-code">${codigo}</td>
            <td>${descripcion}</td>
            <td><span class="excel-badge">${marca}</span></td>
            <td>${codProveedor}</td>
            <td class="excel-number">${stock}</td>
            <td class="excel-number">$${precio}</td>
            <td style="text-align:center;">
                <button class="btn-accion" onclick="editarProducto('${id}')">✏️ Editar</button>
                <button class="btn-accion" onclick="eliminarProducto('${id}')">❌ Eliminar</button>
            </td>
        `;
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
    document.getElementById('prod_descripcion').value = '';
    document.getElementById('prod_marca').value = '';
    document.getElementById('prod_codigo_proveedor').value = '';
    document.getElementById('prod_saldo_temp').value = '0';
    document.getElementById('prod_precio_venta').value = '0.00';

    document.getElementById('modalProducto').style.display = 'flex';
}

async function editarProducto(id) {
    try {
        const res = await fetch(`/api/productos/${id}`);
        if (!res.ok) throw new Error('No se pudo obtener la información del producto');
        const data = await res.json();

        document.getElementById('modalTitulo').textContent = '✏️ Editar Producto';
        document.getElementById('prod_id').value = data.id;
        document.getElementById('prod_codigo').value = data.codigo || '';
        document.getElementById('prod_descripcion').value = data.descripcion || '';
        document.getElementById('prod_marca').value = data.marca || '';
        document.getElementById('prod_codigo_proveedor').value = data.codigo_proveedor || '';
        document.getElementById('prod_saldo_temp').value = data.saldo_temp ?? 0;
        document.getElementById('prod_precio_venta').value = data.precio_venta ?? 0;

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
        descripcion: document.getElementById('prod_descripcion').value.trim(),
        marca: document.getElementById('prod_marca').value.trim(),
        codigo_proveedor: document.getElementById('prod_codigo_proveedor').value.trim(),
        saldo_temp: parseFloat(document.getElementById('prod_saldo_temp').value) || 0,
        precio_venta: parseFloat(document.getElementById('prod_precio_venta').value) || 0
    };

    const url = esEdicion ? `/api/productos/${id}` : '/api/productos';
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || 'Error al guardar producto');
        }

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