// Estado global de la aplicación
let productosData = [];
let currentSortColumn = 'codigo';
let currentSortAscending = true;
let paginaActual = 1;
const registrosPorPagina = 15;

// Endpoint de la API
const API_URL = '/api/productos';

document.addEventListener('DOMContentLoaded', () => {
    inicializarEventos();
    cargarProductos();
});

function inicializarEventos() {
    // Toggle Sidebar
    const btnToggle = document.getElementById('btnToggleSidebar');
    const sidebar = document.getElementById('sidebar');
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            const isHidden = sidebar.style.display === 'none';
            sidebar.style.display = isHidden ? 'block' : 'none';
            btnToggle.textContent = isHidden ? 'Ocultar menú' : 'Mostrar menú';
        });
    }

    // Ordenamiento por clic en encabezados (Sort)
    const headers = document.querySelectorAll('#tablaProductosVentas thead th[data-column]');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-column');
            
            if (currentSortColumn === column) {
                currentSortAscending = !currentSortAscending;
            } else {
                currentSortColumn = column;
                currentSortAscending = true;
            }

            actualizarIconosOrdenamiento(headers, header);
            ordenarYRenderizar();
        });
    });

    // Escuchar eventos de entrada en campos de búsqueda
    const inputsBusqueda = ['buscarNombre', 'buscarMarca', 'buscarCodigo', 'buscarGeneral'];
    inputsBusqueda.forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => {
            resetearPaginacion();
            ordenarYRenderizar();
        });
    });

    // Botón "Mostrar todos"
    document.getElementById('btnMostrarTodos')?.addEventListener('click', () => {
        inputsBusqueda.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        resetearPaginacion();
        ordenarYRenderizar();
    });

    // Paginación
    document.getElementById('btnAnterior')?.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            actualizarInputPagina();
            ordenarYRenderizar();
        }
    });

    document.getElementById('btnSiguiente')?.addEventListener('click', () => {
        const totalPaginas = Math.ceil(obtenerProductosFiltrados().length / registrosPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            actualizarInputPagina();
            ordenarYRenderizar();
        }
    });

    document.getElementById('btnIrPagina')?.addEventListener('click', () => {
        const input = document.getElementById('inputPagina');
        const pageVal = parseInt(input.value);
        const totalPaginas = Math.ceil(obtenerProductosFiltrados().length / registrosPorPagina) || 1;
        
        if (pageVal && pageVal >= 1 && pageVal <= totalPaginas) {
            paginaActual = pageVal;
            ordenarYRenderizar();
        } else {
            actualizarInputPagina();
        }
    });
}

function resetearPaginacion() {
    paginaActual = 1;
    actualizarInputPagina();
}

function actualizarInputPagina() {
    const input = document.getElementById('inputPagina');
    if (input) input.value = paginaActual;
}

function actualizarIconosOrdenamiento(headers, selectedHeader) {
    headers.forEach(h => {
        const icon = h.querySelector('.sort-icon');
        if (icon) icon.textContent = '↕';
    });

    const activeIcon = selectedHeader.querySelector('.sort-icon');
    if (activeIcon) {
        activeIcon.textContent = currentSortAscending ? '▲' : '▼';
    }
}

async function cargarProductos() {
    const tbody = document.getElementById('tbodyVentas');
    tbody.innerHTML = '<tr><td colspan="12" class="text-center py-4 text-muted">Cargando productos...</td></tr>';

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: No se pudo obtener la información.`);
        }

        const data = await response.json();
        productosData = Array.isArray(data) ? data : (data.data || []);
        
        resetearPaginacion();
        ordenarYRenderizar();

    } catch (err) {
        console.error('Error al cargar productos:', err);
        tbody.innerHTML = `<tr><td colspan="12" class="text-center text-danger py-4">Error al cargar datos: ${err.message}</td></tr>`;
    }
}

function obtenerProductosFiltrados() {
    const valNombre = document.getElementById('buscarNombre')?.value.toLowerCase().trim() || '';
    const valMarca = document.getElementById('buscarMarca')?.value.toLowerCase().trim() || '';
    const valCodigo = document.getElementById('buscarCodigo')?.value.toLowerCase().trim() || '';
    const valGeneral = document.getElementById('buscarGeneral')?.value.toLowerCase().trim() || '';

    return productosData.filter(p => {
        const descripcion = (p.descripcion || '').toLowerCase();
        const marca = (p.marca || '').toLowerCase();
        const codigo = (p.codigo || '').toLowerCase();

        const matchNombre = !valNombre || descripcion.includes(valNombre);
        const matchMarca = !valMarca || marca.includes(valMarca);
        const matchCodigo = !valCodigo || codigo.includes(valCodigo);
        
        const matchGeneral = !valGeneral || 
            codigo.includes(valGeneral) ||
            descripcion.includes(valGeneral) ||
            marca.includes(valGeneral);

        return matchNombre && matchMarca && matchCodigo && matchGeneral;
    });
}

function ordenarYRenderizar() {
    let filtrados = obtenerProductosFiltrados();

    // Ordenamiento dinámico
    filtrados.sort((a, b) => {
        let valA = a[currentSortColumn] ?? '';
        let valB = b[currentSortColumn] ?? '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return currentSortAscending ? -1 : 1;
        if (valA > valB) return currentSortAscending ? 1 : -1;
        return 0;
    });

    // Paginación local garantizada
    const desde = (paginaActual - 1) * registrosPorPagina;
    const paginados = filtrados.slice(desde, desde + registrosPorPagina);

    renderizarTabla(paginados);
}

function renderizarTabla(productos) {
    const tbody = document.getElementById('tbodyVentas');
    tbody.innerHTML = '';

    if (!productos || productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" class="text-center py-4 text-muted">No se encontraron productos registrados.</td></tr>';
        return;
    }

    productos.forEach(p => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td class="fw-semibold text-dark">${p.codigo || '-'}</td>
            <td>${p.naci || '-'}</td>
            <td>${p.marca || '-'}</td>
            <td class="fw-bold text-dark">${p.descripcion || '-'}</td>
            <td>${p.unidad || '-'}</td>
            <td class="fw-semibold">${p.precio_venta ? Number(p.precio_venta).toFixed(2) : '0.00'}</td>
            <td>${p.saldo_temp ?? '-'}</td>
            <td>${p.saldo ?? '-'}</td>
            <td>${p.saldo_bext ?? '-'}</td>
            <td>${p.peso ?? '-'}</td>
            <td>${p.medidas ?? '-'}</td>
            <td class="text-center">
                <button class="action-btn me-1" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                <button class="action-btn" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}