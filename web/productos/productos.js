// Estado local de la vista
let productosData = [];
let currentSortColumn = 'codigo';
let currentSortAscending = true;
let paginaActual = 1;
const registrosPorPagina = 15;

// Endpoint de la API
const API_URL = '/api/productos'; // Ajusta a tu ruta real (ej: 'https://consupabase-apiv2.onrender.com/api/productos')

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

    // Eventos de click para Ordenamiento (Sort)
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

    // Filtros de búsqueda en tiempo real
    const inputsBusqueda = ['buscarNombre', 'buscarMarca', 'buscarCodigo', 'buscarGeneral'];
    inputsBusqueda.forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => {
            paginaActual = 1;
            ordenarYRenderizar();
        });
    });

    // Botón "Mostrar todos"
    document.getElementById('btnMostrarTodos')?.addEventListener('click', () => {
        inputsBusqueda.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        paginaActual = 1;
        ordenarYRenderizar();
    });

    // Paginación
    document.getElementById('btnAnterior')?.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            document.getElementById('inputPagina').value = paginaActual;
            ordenarYRenderizar();
        }
    });

    document.getElementById('btnSiguiente')?.addEventListener('click', () => {
        const totalPaginas = Math.ceil(obtenerProductosFiltrados().length / registrosPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            document.getElementById('inputPagina').value = paginaActual;
            ordenarYRenderizar();
        }
    });

    document.getElementById('btnIrPagina')?.addEventListener('click', () => {
        const input = document.getElementById('inputPagina');
        const pageVal = parseInt(input.value);
        if (pageVal && pageVal > 0) {
            paginaActual = pageVal;
            ordenarYRenderizar();
        }
    });
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
            throw new Error(`HTTP Error Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Asignar los datos recibidos (acepta array directo o { data: [...] })
        productosData = Array.isArray(data) ? data : (data.data || []);
        
        ordenarYRenderizar();

    } catch (err) {
        console.error('Error al cargar productos:', err);
        tbody.innerHTML = `<tr><td colspan="12" class="text-center text-danger py-4">Error al cargar datos: ${err.message || 'No se pudo conectar con el servidor'}</td></tr>`;
    }
}

function obtenerProductosFiltrados() {
    const valNombre = document.getElementById('buscarNombre')?.value.toLowerCase().trim() || '';
    const valMarca = document.getElementById('buscarMarca')?.value.toLowerCase().trim() || '';
    const valCodigo = document.getElementById('buscarCodigo')?.value.toLowerCase().trim() || '';
    const valGeneral = document.getElementById('buscarGeneral')?.value.toLowerCase().trim() || '';

    return productosData.filter(p => {
        const matchNombre = !valNombre || (p.descripcion && p.descripcion.toLowerCase().includes(valNombre));
        const matchMarca = !valMarca || (p.marca && p.marca.toLowerCase().includes(valMarca));
        const matchCodigo = !valCodigo || (p.codigo && p.codigo.toLowerCase().includes(valCodigo));
        
        const matchGeneral = !valGeneral || 
            (p.codigo && p.codigo.toLowerCase().includes(valGeneral)) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(valGeneral)) ||
            (p.marca && p.marca.toLowerCase().includes(valGeneral));

        return matchNombre && matchMarca && matchCodigo && matchGeneral;
    });
}

function ordenarYRenderizar() {
    let filtrados = obtenerProductosFiltrados();

    // Lógica de ordenamiento dinámico por columna seleccionada
    filtrados.sort((a, b) => {
        let valA = a[currentSortColumn] ?? '';
        let valB = b[currentSortColumn] ?? '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return currentSortAscending ? -1 : 1;
        if (valA > valB) return currentSortAscending ? 1 : -1;
        return 0;
    });

    // Paginación local
    const desde = (paginaActual - 1) * registrosPorPagina;
    const paginados = filtrados.slice(desde, desde + registrosPorPagina);

    renderizarTabla(paginados, filtrados.length);
}

function renderizarTabla(productos, totalRegistros) {
    const tbody = document.getElementById('tbodyVentas');
    tbody.innerHTML = '';

    if (!productos || productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" class="text-center py-4 text-muted">No se encontraron productos registered.</td></tr>';
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