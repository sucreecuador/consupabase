let paginaActual = 1;
let ordenColumna = 'descripcion';
let ordenDireccion = 'asc';

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    document.getElementById('buscar').addEventListener('input', () => {
        paginaActual = 1;
        cargarProductos();
    });
});

async function cargarProductos() {
    const buscar = document.getElementById('buscar').value.trim();
    
    // Construcción dinámica de la URL para omitir la búsqueda si está vacía
    let url = `/api/productos?pagina=${paginaActual}&porPagina=20&ordenColumna=${ordenColumna}&ordenDireccion=${ordenDireccion}`;
    
    if (buscar !== '') {
        url += `&descripcion=${encodeURIComponent(buscar)}`;
    }

    try {
        const respuesta = await fetch(url);
        
        if (!respuesta.ok) {
            throw new Error(`Código ${respuesta.status}`);
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
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: #d9534f; padding: 15px; font-weight: bold;">Error al obtener datos (${error.message}).</td></tr>`;
    }
}

function renderizarTabla(productos) {
    const tbody = document.getElementById('tablaProductos');
    tbody.innerHTML = '';

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 15px;">No se encontraron registros.</td></tr>`;
        return;
    }

    productos.forEach(p => {
        const tr = document.createElement('tr');
        
        const codigo = p.codigo || p.code || '—';
        const descripcion = p.descripcion || p.description || '—';
        const marca = p.marca || p.brand || 'N/A';
        const proveedor = p.proveedor || p.provider || '—';
        const stock = p.stock ?? p.cantidad ?? 0;
        const precio = parseFloat(p.precio || p.price || 0).toFixed(2);
        const id = p.id || p.codigo;

        tr.innerHTML = `
            <td class="excel-code">${codigo}</td>
            <td>${descripcion}</td>
            <td><span class="excel-badge">${marca}</span></td>
            <td>${proveedor}</td>
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
    cargarProductos();
}

function editarProducto(id) {
    alert('Editar producto ID: ' + id);
}

function eliminarProducto(id) {
    if (confirm('¿Eliminar producto ID ' + id + '?')) {
        fetch(`/api/productos/${id}`, { method: 'DELETE' })
            .then(() => cargarProductos());
    }
}