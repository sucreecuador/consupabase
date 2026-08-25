// Configuración de Supabase (Sustituye con las llaves de tu proyecto)
const SUPABASE_URL = 'https://consupabase-apiv2.onrender.com'; // O la URL de tu proyecto Supabase
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables de Estado
let currentSortColumn = 'id';
let currentSortAscending = true;
let paginaActual = 1;
const registrosPorPagina = 15;

document.addEventListener('DOMContentLoaded', () => {
    inicializarEventos();
    cargarProductos();
});

function inicializarEventos() {
    // Toggle Sidebar
    const btnToggle = document.getElementById('btnToggleSidebar');
    const sidebar = document.getElementById('sidebar');
    btnToggle.addEventListener('click', () => {
        if (sidebar.style.display === 'none') {
            sidebar.style.display = 'block';
            btnToggle.textContent = 'Ocultar menú';
        } else {
            sidebar.style.display = 'none';
            btnToggle.textContent = 'Mostrar menú';
        }
    });

    // Ordenamiento por Encabezados
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
            cargarProductos();
        });
    });

    // Buscador "Mostrar Todos" / Restablecer
    document.getElementById('btnMostrarTodos')?.addEventListener('click', () => {
        document.getElementById('buscarNombre').value = '';
        document.getElementById('buscarMarca').value = '';
        document.getElementById('buscarCodigo').value = '';
        document.getElementById('buscarGeneral').value = '';
        paginaActual = 1;
        cargarProductos();
    });

    // Paginación
    document.getElementById('btnAnterior')?.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            document.getElementById('inputPagina').value = paginaActual;
            cargarProductos();
        }
    });

    document.getElementById('btnSiguiente')?.addEventListener('click', () => {
        paginaActual++;
        document.getElementById('inputPagina').value = paginaActual;
        cargarProductos();
    });

    document.getElementById('btnIrPagina')?.addEventListener('click', () => {
        const pageInput = parseInt(document.getElementById('inputPagina').value);
        if (pageInput && pageInput > 0) {
            paginaActual = pageInput;
            cargarProductos();
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
        const desde = (paginaActual - 1) * registrosPorPagina;
        const hasta = desde + registrosPorPagina - 1;

        const valNombre = document.getElementById('buscarNombre').value.trim();
        const valMarca = document.getElementById('buscarMarca').value.trim();
        const valCodigo = document.getElementById('buscarCodigo').value.trim();
        const valGeneral = document.getElementById('buscarGeneral').value.trim();

        let query = supabaseClient
            .from('productos')
            .select('*')
            .order(currentSortColumn, { ascending: currentSortAscending })
            .range(desde, hasta);

        // Filtros específicos
        if (valNombre) query = query.ilike('descripcion', `%${valNombre}%`);
        if (valMarca) query = query.ilike('marca', `%${valMarca}%`);
        if (valCodigo) query = query.ilike('codigo', `%${valCodigo}%`);
        if (valGeneral) {
            query = query.or(`codigo.ilike.%${valGeneral}%,descripcion.ilike.%${valGeneral}%,marca.ilike.%${valGeneral}%`);
        }

        const { data: productos, error } = await query;

        if (error) throw error;

        renderizarTabla(productos);

    } catch (err) {
        console.error('Error al consultar Supabase:', err);
        tbody.innerHTML = `<tr><td colspan="12" class="text-center text-danger py-4">Error al cargar datos: ${err.message}</td></tr>`;
    }
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