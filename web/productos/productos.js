// web/productos/productos.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar la lista inicial de productos
    buscarProductos();

    // 2. Listener para enter en Contacto / Proveedor
    const inputContacto = document.getElementById("searchContacto");
    if (inputContacto) {
        inputContacto.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                buscarProductos();
            }
        });
    }
});

/**
 * Consulta los datos en la API y refresca la tabla
 */
async function buscarProductos() {
    const nombre = document.getElementById("searchNombre")?.value.trim() || "";
    const marca = document.getElementById("searchMarca")?.value.trim() || "";
    const codigo = document.getElementById("searchCodigo")?.value.trim() || "";
    const contacto = document.getElementById("searchContacto")?.value.trim() || "";

    const params = new URLSearchParams();
    if (nombre) params.append("nombre", nombre);
    if (marca) params.append("marca", marca);
    if (codigo) params.append("codigo", codigo);
    if (contacto) params.append("contacto", contacto);

    const tbody = document.getElementById("tablaProductosBody");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center py-4">Cargando productos...</td></tr>`;
    }

    try {
        const response = await fetch(`/api/productos?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const productos = await response.json();
        renderizarTablaProductos(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="11" class="text-center text-danger py-4">Error al cargar datos: ${error.message}</td></tr>`;
        }
    }
}

/**
 * Construye el cuerpo de la tabla HTML
 */
function renderizarTablaProductos(productos) {
    const tbody = document.getElementById("tablaProductosBody");
    if (!tbody) return;

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center py-4">No se encontraron productos registrados.</td></tr>`;
        return;
    }

    let html = "";
    productos.forEach(p => {
        const pro1 = p.pro1 ?? "—";
        const pro2 = p.pro2 ?? "—";
        const pro3 = p.pro3 ?? "—";
        const codProv = p.codigo_proveedor || p.cod_prov || "0";
        const codigo = p.codigo || "—";
        const marca = p.marca || "—";
        const descripcion = p.descripcion || "—";
        const stock = p.stock_total ?? p.stem ?? 0;
        const costo = p.costo !== undefined && p.costo !== null ? parseFloat(p.costo).toFixed(2) : "0.00";
        const pVenta = p.precio_venta !== undefined && p.precio_venta !== null ? parseFloat(p.precio_venta).toFixed(2) : "0.00";

        html += `
            <tr>
                <td class="text-center">${pro1}</td>
                <td class="text-center">${pro2}</td>
                <td class="text-center">${pro3}</td>
                <td class="fw-bold">${codProv}</td>
                <td class="fw-bold">${codigo}</td>
                <td>${marca}</td>
                <td>${descripcion}</td>
                <td class="text-center">${stock}</td>
                <td class="text-end">$${costo}</td>
                <td class="text-end">$${pVenta}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editarProducto(${p.id})" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${p.id})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

/**
 * Restablece los filtros de búsqueda
 */
function mostrarTodos() {
    ["searchNombre", "searchMarca", "searchCodigo", "searchContacto"].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = "";
    });
    buscarProductos();
}

/**
 * Función encargada de solicitar la descarga del Excel al Backend
 */
function descargarExcelProveedor() {
    const contacto = document.getElementById("searchContacto")?.value.trim() || "";

    if (!contacto) {
        alert("Por favor ingresa un código de proveedor en el campo 'Contacto / Proveedor' (ejemplo: 319).");
        return;
    }

    // Inicia la descarga mediante el endpoint del servidor
    window.location.href = `/api/productos/exportar-excel?contacto=${encodeURIComponent(contacto)}`;
}