// URL base de la API en Render
const API_URL = "https://consupabase-api.onrender.com/productos";

// Estado global de la paginación
let currentPage = 0;
const pageSize = 50;

// Elementos del DOM
const inputDescripcion = document.getElementById("descripcion");
const inputCodigo = document.getElementById("codigo");
const inputMarca = document.getElementById("marca");
const inputProveedor = document.getElementById("proveedor");

const btnBuscarDescripcion = document.getElementById("btnBuscarDescripcion");
const btnBuscarCodigo = document.getElementById("btnBuscarCodigo");
const btnBuscarMarca = document.getElementById("btnBuscarMarca");
const btnBuscarProveedor = document.getElementById("btnBuscarProveedor");
const btnMostrarTodos = document.getElementById("btnMostrarTodos");

const tableBody = document.getElementById("tableBody");
const pageIndicatorEl = document.getElementById("pageIndicator");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const inputIrPagina = document.getElementById("irPagina");
const btnIrPagina = document.getElementById("btnIrPagina");

// Carga inicial
document.addEventListener("DOMContentLoaded", () => {
    fetchProductos(0);
});

// Eventos de botones de búsqueda
if (btnBuscarDescripcion) btnBuscarDescripcion.addEventListener("click", () => realizarBusqueda());
if (btnBuscarCodigo) btnBuscarCodigo.addEventListener("click", () => realizarBusqueda());
if (btnBuscarMarca) btnBuscarMarca.addEventListener("click", () => realizarBusqueda());
if (btnBuscarProveedor) btnBuscarProveedor.addEventListener("click", () => realizarBusqueda());

if (btnMostrarTodos) {
    btnMostrarTodos.addEventListener("click", () => {
        limpiarInputs();
        currentPage = 0;
        fetchProductos(0);
    });
}

// Paginación
if (btnPrev) {
    btnPrev.addEventListener("click", () => {
        if (currentPage > 0) {
            currentPage--;
            fetchProductos(currentPage);
        }
    });
}

if (btnNext) {
    btnNext.addEventListener("click", () => {
        currentPage++;
        fetchProductos(currentPage);
    });
}

if (btnIrPagina) {
    btnIrPagina.addEventListener("click", () => {
        const numPag = parseInt(inputIrPagina.value);
        if (!isNaN(numPag) && numPag > 0) {
            currentPage = numPag - 1;
            fetchProductos(currentPage);
        }
    });
}

function limpiarInputs() {
    if (inputDescripcion) inputDescripcion.value = "";
    if (inputCodigo) inputCodigo.value = "";
    if (inputMarca) inputMarca.value = "";
    if (inputProveedor) inputProveedor.value = "";
}

function realizarBusqueda() {
    currentPage = 0;
    fetchProductos(0);
}

/**
 * Petición principal a la API
 */
async function fetchProductos(page = 0) {
    showLoading();

    const params = new URLSearchParams({
        page: page,
        page_size: pageSize,
        descripcion: inputDescripcion ? inputDescripcion.value.trim() : "",
        codigo: inputCodigo ? inputCodigo.value.trim() : "",
        marca: inputMarca ? inputMarca.value.trim() : "",
        proveedor: inputProveedor ? inputProveedor.value.trim() : ""
    });

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();
        
        renderTable(result.data || []);
        updatePaginationUI(result.page, result.total_pages, result.total);

    } catch (error) {
        console.error("Error cargando productos:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; color: red; padding: 20px;">
                    Error al conectar con la API en Render. Verifica que el backend esté activo.
                </td>
            </tr>
        `;
    }
}

/**
 * Genera las filas de la tabla respetando los campos reales
 */
function renderTable(productos) {
    tableBody.innerHTML = "";

    if (!productos || productos.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 20px;">
                    No se encontraron productos.
                </td>
            </tr>
        `;
        return;
    }

    productos.forEach((item) => {
        const row = document.createElement("tr");

        // Mapeo seguro con nombres de columnas estándar o alternativos de Supabase
        const codigo = item.codigo || item.CODIGO || "";
        const codProveedor = item.codigo_proveedor || item.CODIGO_PROVEEDOR || "";
        const marca = item.marca || item.MARCA || "";
        const descripcion = item.descripcion || item.DESCRIPCION || "";
        const precio = item.precio_venta || item.PRECIO_VENTA || item.precio || 0;
        const costo = item.costo_prom || item.COSTO_PROM || 0;
        const saldo = item.saldo || item.SALDO || 0;
        const saldoBext = item.saldo_bext || item.SALDO_BEXT || 0;
        const saldoTemp = item.saldo_temp || item.SALDO_TEMP || 0;

        row.innerHTML = `
            <td><strong>${codigo}</strong></td>
            <td>${codProveedor}</td>
            <td>${marca}</td>
            <td>${descripcion}</td>
            <td>$${parseFloat(precio).toFixed(2)}</td>
            <td>$${parseFloat(costo).toFixed(2)}</td>
            <td>${saldo}</td>
            <td>${saldoBext}</td>
            <td>${saldoTemp}</td>
        `;

        tableBody.appendChild(row);
    });
}

/**
 * Actualiza la barra de paginación
 */
function updatePaginationUI(page, totalPages, totalRecords) {
    if (pageIndicatorEl) {
        const displayPage = totalPages === 0 ? 0 : page + 1;
        pageIndicatorEl.textContent = `Página ${displayPage} de ${totalPages || 1}`;
    }

    if (btnPrev) btnPrev.disabled = page <= 0;
    if (btnNext) btnNext.disabled = page + 1 >= totalPages || totalPages === 0;
}

function showLoading() {
    tableBody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align: center; padding: 20px; color: #555;">
                Cargando productos...
            </td>
        </tr>
    `;
}