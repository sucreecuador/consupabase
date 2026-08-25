// web/productos/productos.js

// Estado global de la pantalla
let estadoActual = {
    vista: 'ventas', // 'ventas' | 'compras'
    criterio: 'nombre',
    valor: '',
    productosCache: []
};

document.addEventListener("DOMContentLoaded", () => {
    inicializarEventos();
    ejecutarBusqueda();
});

/**
 * Registra los escuchadores de eventos principales
 */
function inicializarEventos() {
    const inputValor = document.getElementById("searchValor");
    if (inputValor) {
        inputValor.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                ejecutarBusqueda();
            }
        });
    }

    const selectCriterio = document.getElementById("searchCriterio");
    if (selectCriterio) {
        selectCriterio.addEventListener("change", (e) => {
            estadoActual.criterio = e.target.value;
        });
    }
}

/**
 * Alterna entre 'Vista Ventas' y 'Vista Compras'
 */
function cambiarVista(nuevaVista) {
    if (estadoActual.vista === nuevaVista) return;

    estadoActual.vista = nuevaVista;

    // Actualizar botones de vista
    const btnVentas = document.getElementById("btnVistaVentas");
    const btnCompras = document.getElementById("btnVistaCompras");

    if (nuevaVista === 'ventas') {
        btnVentas?.classList.add("active");
        btnCompras?.classList.remove("active");
    } else {
        btnCompras?.classList.add("active");
        btnVentas?.classList.remove("active");
    }

    // Renderizar la tabla con las columnas correspondientes
    renderizarEncabezados();
    renderizarFilas(estadoActual.productosCache);
}

/**
 * Construye dinámicamente las cabeceras según la vista activa
 */
function renderizarEncabezados() {
    const headerRow = document.getElementById("tablaHeaderRow");
    if (!headerRow) return;

    if (estadoActual.vista === 'ventas') {
        headerRow.innerHTML = `
            <th>CÓDIGO ↕</th>
            <th>MARCA ↕</th>
            <th>DESCRIPCIÓN ↕</th>
            <th class="text-center">STOCK ↕</th>
            <th class="text-end">P.VENTA ↕</th>
            <th class="text-center">ACCIONES</th>
        `;
    } else {
        headerRow.innerHTML = `
            <th class="text-center">PRO1 ↕</th>
            <th class="text-center">PRO2 ↕</th>
            <th class="text-center">PRO3 ↕</th>
            <th>CÓD. PROV. ↕</th>
            <th>CÓDIGO ↕</th>
            <th>MARCA ↕</th>
            <th>DESCRIPCIÓN ↕</th>
            <th class="text-center">S.TEM ↕</th>
            <th class="text-end">COSTO ↕</th>
            <th class="text-end">P.VENTA ↕</th>
            <th class="text-center">ACCIONES</th>
        `;
    }
}

/**
 * Consulta la API Backend con el criterio y valor unificados
 */
async function ejecutarBusqueda() {
    const selectCriterio = document.getElementById("searchCriterio");
    const inputValor = document.getElementById("searchValor");

    const criterio = selectCriterio ? selectCriterio.value : "nombre";
    const valor = inputValor ? inputValor.value.trim() : "";

    estadoActual.criterio = criterio;
    estadoActual.valor = valor;

    const tbody = document.getElementById("tablaProductosBody");
    const totalCols = estadoActual.vista === 'ventas' ? 6 : 11;
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="${totalCols}" class="text-center py-4">Cargando catálogo...</td></tr>`;
    }

    try {
        const params = new URLSearchParams();
        if (criterio && valor) {
            params.append("criterio", criterio);
            params.append("valor", valor);
        }

        const response = await fetch(`/api/productos?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP Error status: ${response.status}`);

        const productos = await response.json();
        estadoActual.productosCache = productos;

        renderizarEncabezados();
        renderizarFilas(productos);

    } catch (error) {
        console.error("Error al buscar productos:", error);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="${totalCols}" class="text-center text-danger py-4">Error al obtener datos del servidor.</td></tr>`;
        }
    }
}

/**
 * Renders las filas dentro del tbody según la Vista seleccionada
 */
function renderizarFilas(productos) {
    const tbody = document.getElementById("tablaProductosBody");
    if (!tbody) return;

    const totalCols = estadoActual.vista === 'ventas' ? 6 : 11;

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${totalCols}" class="text-center py-4 text-muted">No se encontraron productos registrados.</td></tr>`;
        return;
    }

    let html = "";
    productos.forEach(p => {
        const pro1 = p.pro1 ?? "—";
        const pro2 = p.pro2 ?? "—";
        const pro3 = p.pro3 ?? "—";
        const codProv = p.cod_prov || p.codigo_proveedor || "—";
        const codigo = p.codigo || "—";
        const marca = p.marca || "—";
        const descripcion = p.descripcion || "—";
        const stock = p.s_tem ?? p.stock_total ?? 0;
        const costo = p.costo !== undefined ? parseFloat(p.costo).toFixed(2) : "0.00";
        const pVenta = p.precio_venta !== undefined ? parseFloat(p.precio_venta).toFixed(2) : "0.00";

        if (estadoActual.vista === 'ventas') {
            html += `
                <tr>
                    <td class="fw-bold">${codigo}</td>
                    <td>${marca}</td>
                    <td>${descripcion}</td>
                    <td class="text-center fw-semibold">${stock}</td>
                    <td class="text-end fw-bold text-success">$${pVenta}</td>
                    <td class="text-center">
                        <button class="btn-action-icon" onclick="editarProducto(${p.id})" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="btn-action-icon" onclick="eliminarProducto(${p.id})" title="Eliminar"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
        } else {
            // Vista Compras
            html += `
                <tr>
                    <td class="text-center">${pro1}</td>
                    <td class="text-center">${pro2}</td>
                    <td class="text-center">${pro3}</td>
                    <td class="fw-bold">${codProv}</td>
                    <td class="fw-bold">${codigo}</td>
                    <td>${marca}</td>
                    <td>${descripcion}</td>
                    <td class="text-center fw-semibold">${stock}</td>
                    <td class="text-end">$${costo}</td>
                    <td class="text-end">$${pVenta}</td>
                    <td class="text-center">
                        <button class="btn-action-icon" onclick="editarProducto(${p.id})" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="btn-action-icon" onclick="eliminarProducto(${p.id})" title="Eliminar"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `;
        }
    });

    tbody.innerHTML = html;
}

/**
 * Limpia los filtros y muestra todos los registros
 */
function mostrarTodos() {
    const inputValor = document.getElementById("searchValor");
    if (inputValor) inputValor.value = "";
    
    estadoActual.valor = "";
    ejecutarBusqueda();
}

/**
 * Solicita la generación y descarga del reporte Excel según el criterio y vista activa
 */
function generarExcel() {
    const params = new URLSearchParams();
    
    if (estadoActual.criterio && estadoActual.valor) {
        params.append("criterio", estadoActual.criterio);
        params.append("valor", estadoActual.valor);
    }
    params.append("vista", estadoActual.vista);

    // Inicia la descarga mediante el endpoint dinámico
    window.location.href = `/api/productos/exportar-excel?${params.toString()}`;
}

/**
 * Toggle lateral para ocultar o mostrar la barra
 */
function toggleSidebar() {
    const sidebar = document.getElementById("sidebarMenu");
    if (sidebar) {
        sidebar.classList.toggle("d-none");
    }
}

function nuevoProducto() {
    alert("Formulario de creación de producto");
}

function editarProducto(id) {
    alert(`Editar producto con ID: ${id}`);
}

function eliminarProducto(id) {
    if (confirm(`¿Desea eliminar el producto con ID: ${id}?`)) {
        alert("Producto eliminado.");
    }
}