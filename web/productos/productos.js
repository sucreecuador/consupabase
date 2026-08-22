let paginaActual = 1;
let ordenColumna = 'codigo';
let ordenDireccion = 'asc';

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    // Evento de búsqueda en vivo
    const inputBuscar = document.getElementById('buscar');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', () => {
            paginaActual = 1;
            cargarProductos();
        });
    }

    // Configurar eventos de clic en las cabeceras de la tabla
    configurarCabeceras();
});

function configurarCabeceras() {
    const cabeceras = document.querySelectorAll('.erp-table th');
    // Mapeo del índice de la columna a su campo real en la base de datos
    const mapaColumnas = [
        'codigo',            // Columna 0: Código
        'descripcion',       // Columna 1: Descripción
        'marca',             // Columna 2: Marca
        'codigo_proveedor',  // Columna 3: Proveedor (código proveedor)
        'saldo_temp',        // Columna 4: Stock (saldo temporal)
        'precio_venta'       // Columna 5: Precio (precio venta)
    ];

    cabeceras.forEach((th, index) => {
        if (index < mapaColumnas.length) {
            th.style.cursor = 'pointer';
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
        
        let lista = [];
        let totalPaginas = 1;

        if (Array.isArray(resultado)) {
            lista = resultado;
        } else if (resultado && Array.isArray(resultado.data)) {
            lista = resultado.data;
            totalPaginas = resultado.totalPaginas || 1;
        }

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
        // Omite el registro redundante del encabezado importado de Excel
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
    paginaActual = 1; // Reiniciar a la primera página al ordenar
    cargarProductos();
}

function editarProducto(id) {
    alert('Editar producto ID: ' + id);
}

function eliminarProducto(id) {
    if (confirm('¿Desea eliminar el producto ID ' + id + '?')) {
        fetch(`/api/productos/${id}`, { method: 'DELETE' })
            .then(() => cargarProductos());
    }
}