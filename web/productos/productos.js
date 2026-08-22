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
    const buscar = document.getElementById('buscar').value;
    
    // Nombres de parámetros ajustados a snake_case para FastAPI
    const url = `/productos?descripcion=${encodeURIComponent(buscar)}&pagina=${paginaActual}&por_pagina=20&orden_columna=${ordenColumna}&orden_direccion=${ordenDireccion}`;

    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        const resultado = await respuesta.json();
        
        // Admite respuesta directa como array o estructura paginada { data, totalPaginas }
        const lista = Array.isArray(resultado) ? resultado : (resultado.data || []);
        const totalPaginas = resultado.totalPaginas || 1;

        renderizarTabla(lista);
        renderizarPaginacion(totalPaginas);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        const tbody = document.getElementById('tablaProductos');
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red; padding: 15px;">Error al conectar con el servidor backend.</td></tr>`;
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
        tr.innerHTML = `
            <td class="excel-code">${p.codigo || '—'}</td>
            <td>${p.descripcion || '—'}</td>
            <td><span class="excel-badge">${p.marca || 'N/A'}</span></td>
            <td>${p.proveedor || '—'}</td>
            <td class="excel-number">${p.stock ?? 0}</td>
            <td class="excel-number">$${parseFloat(p.precio || 0).toFixed(2)}</td>
            <td style="text-align:center;">
                <button class="btn-accion" onclick="editarProducto(${p.id})">✏️ Editar</button>
                <button class="btn-accion" onclick="eliminarProducto(${p.id})">❌ Eliminar</button>
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
    if (confirm('¿Desea eliminar el producto ID ' + id + '?')) {
        fetch(`/productos/${id}`, { method: 'DELETE' })
            .then(() => cargarProductos());
    }
}