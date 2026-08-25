// web/productos/productos.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar productos al iniciar
    buscarProductos();

    // 2. Inyectar botón de Excel dinámicamente en el DOM
    inyectarBotonExcel();

    // 3. Listener para la tecla Enter en Contacto / Proveedor
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
 * Inyecta el botón 'Generar Excel' directamente en la pantalla
 */
function inyectarBotonExcel() {
    if (document.getElementById("btnExcelDinamico")) return;

    const btnExcel = document.createElement("button");
    btnExcel.id = "btnExcelDinamico";
    btnExcel.type = "button";
    btnExcel.className = "btn btn-outline-success ms-2 fw-bold";
    btnExcel.innerHTML = '<i class="bi bi-file-earmark-excel me-1"></i> Generar Excel';
    btnExcel.onclick = descargarExcelProveedor;

    // Intentar colocarlo al lado del botón "+ Nuevo"
    const btnNuevo = Array.from(document.querySelectorAll("button")).find(
        btn => btn.textContent.includes("Nuevo") || btn.textContent.includes("+")
    );

    if (btnNuevo && btnNuevo.parentNode) {
        btnNuevo.parentNode.insertBefore(btnExcel, btnNuevo);
        return;
    }

    // Si no encuentra el botón "+ Nuevo", colocarlo al lado del botón "Buscar"
    const btnBuscar = Array.from(document.querySelectorAll("button")).find(
        btn => btn.textContent.includes("Buscar")
    );

    if (btnBuscar && btnBuscar.parentNode) {
        btnBuscar.parentNode.appendChild(btnExcel);
        return;
    }

    // Como último recurso, colocarlo en la cabecera principal
    const header = document.querySelector(".d-flex.justify-content-between");
    if (header) {
        header.appendChild(btnExcel);
    }
}

/**
 * Consulta la API y renderiza la tabla de productos
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

    const tbody = document.getElementById("tablaProductosBody") || document.querySelector("tbody");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center py-4">Cargando productos...</td></tr>`;
    }

    try {
        const response = await fetch(`/api/productos?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const productos = await response.json();
        renderizarTablaProductos(productos);
    } catch (error) {
        console.error("Error al buscar productos:", error);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="11" class="text-center text-danger py-4">Error al cargar datos: ${error.message}</td></tr>`;
        }
    }
}

/**
 * Renderiza los productos en la tabla
 */
function renderizarTablaProductos(productos) {
    const tbody = document.getElementById("tablaProductosBody") || document.querySelector("tbody");
    if (!tbody) return;

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center py-4">No se encontraron productos.</td></tr>`;
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
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editarProducto(${p.id})">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${p.id})">
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
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    buscarProductos();
}

/**
 * Descarga directamente el archivo Excel desde el endpoint backend
 */
function descargarExcelProveedor() {
    const contacto = document.getElementById("searchContacto")?.value.trim() || "";

    if (!contacto) {
        alert("Por favor ingresa un código de proveedor en el campo 'Contacto / Proveedor' (ejemplo: 319).");
        return;
    }

    window.location.href = `/api/productos/exportar-excel?contacto=${encodeURIComponent(contacto)}`;
}