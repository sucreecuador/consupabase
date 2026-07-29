// URL base de la API en Render
const API_URL = "https://consupabase-api.onrender.com/productos";

// Paginación
let currentPage = 0;
const pageSize = 50;

// Carga inicial al abrir la página
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function getTableBody() {
    return document.getElementById("tableBody") || 
           document.getElementById("tablaBody") || 
           document.getElementById("cuerpoTabla") || 
           document.querySelector("table tbody") || 
           document.querySelector("tbody");
}

function initApp() {
    // Escuchar eventos de búsqueda
    const btnDesc = document.getElementById("btnBuscarDescripcion");
    const btnCod = document.getElementById("btnBuscarCodigo");
    const btnMar = document.getElementById("btnBuscarMarca");
    const btnProv = document.getElementById("btnBuscarProveedor");
    const btnTodos = document.getElementById("btnMostrarTodos");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");
    const btnIr = document.getElementById("btnIrPagina");

    if (btnDesc) btnDesc.onclick = () => realizarBusqueda();
    if (btnCod) btnCod.onclick = () => realizarBusqueda();
    if (btnMar) btnMar.onclick = () => realizarBusqueda();
    if (btnProv) btnProv.onclick = () => realizarBusqueda();

    if (btnTodos) {
        btnTodos.onclick = () => {
            limpiarInputs();
            currentPage = 0;
            fetchProductos(0);
        };
    }

    if (btnPrev) {
        btnPrev.onclick = () => {
            if (currentPage > 0) {
                currentPage--;
                fetchProductos(currentPage);
            }
        };
    }

    if (btnNext) {
        btnNext.onclick = () => {
            currentPage++;
            fetchProductos(currentPage);
        };
    }

    if (btnIr) {
        btnIr.onclick = () => {
            const inputIr = document.getElementById("irPagina");
            if (inputIr) {
                const pag = parseInt(inputIr.value);
                if (!isNaN(pag) && pag > 0) {
                    currentPage = pag - 1;
                    fetchProductos(currentPage);
                }
            }
        };
    }

    // Primera carga de datos
    fetchProductos(0);
}

function limpiarInputs() {
    ["descripcion", "codigo", "marca", "proveedor"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function realizarBusqueda() {
    currentPage = 0;
    fetchProductos(0);
}

async function fetchProductos(page = 0) {
    const tbody = getTableBody();
    if (!tbody) {
        console.error("No se encontró la etiqueta <tbody> o la tabla en la página.");
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align: center; padding: 25px; font-weight: bold; color: #0056b3;">
                Conectando con Render y Supabase... (si el servidor estaba inactivo, puede tardar hasta 40 segundos)
            </td>
        </tr>
    `;

    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    };

    const params = new URLSearchParams({
        page: page,
        page_size: pageSize,
        descripcion: getVal("descripcion"),
        codigo: getVal("codigo"),
        marca: getVal("marca"),
        proveedor: getVal("proveedor")
    });

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Error en el servidor: HTTP ${response.status}`);
        }

        const result = await response.json();
        renderTable(result.data || []);
        updatePaginationUI(result.page, result.total_pages, result.total);

    } catch (error) {
        console.error("Error al obtener productos:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; color: red; padding: 20px; font-weight: bold;">
                    Error de conexión: ${error.message}.<br>
                    Verifica que la API en Render esté activa.
                </td>
            </tr>
        `;
    }
}

function renderTable(productos) {
    const tbody = getTableBody();
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 20px; color: #666;">
                    No se encontraron productos registrados.
                </td>
            </tr>
        `;
        return;
    }

    productos.forEach((item) => {
        const row = document.createElement("tr");

        const codigo = item.codigo || item.CODIGO || "";
        const codProv = item.codigo_proveedor || item.CODIGO_PROVEEDOR || "";
        const marca = item.marca || item.MARCA || "";
        const desc = item.descripcion || item.DESCRIPCION || "";
        const precio = item.precio_venta || item.PRECIO_VENTA || item.precio || 0;
        const costo = item.costo_prom || item.COSTO_PROM || 0;
        const saldo = item.saldo || item.SALDO || 0;
        const saldoBext = item.saldo_bext || item.SALDO_BEXT || 0;
        const saldoTemp = item.saldo_temp || item.SALDO_TEMP || 0;

        row.innerHTML = `
            <td><strong>${codigo}</strong></td>
            <td>${codProv}</td>
            <td>${marca}</td>
            <td>${desc}</td>
            <td>$${parseFloat(precio).toFixed(2)}</td>
            <td>$${parseFloat(costo).toFixed(2)}</td>
            <td>${saldo}</td>
            <td>${saldoBext}</td>
            <td>${saldoTemp}</td>
        `;

        tbody.appendChild(row);
    });
}

function updatePaginationUI(page, totalPages, totalRecords) {
    const pageIndicatorEl = document.getElementById("pageIndicator");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");

    if (pageIndicatorEl) {
        const displayPage = totalPages === 0 ? 0 : page + 1;
        pageIndicatorEl.textContent = `Página ${displayPage} de ${totalPages || 1}`;
    }

    if (btnPrev) btnPrev.disabled = page <= 0;
    if (btnNext) btnNext.disabled = page + 1 >= totalPages || totalPages === 0;
}