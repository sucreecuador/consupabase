// URL base apuntando a la API en Render
const API_URL = "https://consupabase-api.onrender.com/productos";

// Estado global de la paginación y filtros
let currentPage = 0;
const pageSize = 50;

// Elementos del DOM
const searchForm = document.getElementById("searchForm");
const inputDescripcion = document.getElementById("descripcion");
const inputCodigo = document.getElementById("codigo");
const inputMarca = document.getElementById("marca");
const inputProveedor = document.getElementById("proveedor");

const tableBody = document.getElementById("tableBody");
const totalRecordsEl = document.getElementById("totalRecords");
const pageIndicatorEl = document.getElementById("pageIndicator");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const loadingSpinner = document.getElementById("loadingSpinner");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    fetchProductos(currentPage);
});

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    currentPage = 0; // Reiniciar a la primera página en cada nueva búsqueda
    fetchProductos(currentPage);
});

btnPrev.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;
        fetchProductos(currentPage);
    }
});

btnNext.addEventListener("click", () => {
    currentPage++;
    fetchProductos(currentPage);
});

/**
 * Función principal para obtener productos desde la API de FastAPI
 */
async function fetchProductos(page = 0) {
    showLoading(true);

    // Construcción de parámetros de consulta (Query Params)
    const params = new URLSearchParams({
        page: page,
        page_size: pageSize,
        descripcion: inputDescripcion.value.trim(),
        codigo: inputCodigo.value.trim(),
        marca: inputMarca.value.trim(),
        proveedor: inputProveedor.value.trim()
    });

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        const result = await response.json();
        
        // Renderizar datos en la tabla
        renderTable(result.data);
        
        // Actualizar controles de paginación e información de totales
        updatePaginationUI(result.page, result.total_pages, result.total);

    } catch (error) {
        console.error("Error al obtener productos:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: red;">
                    Error al cargar los datos. Asegúrate de que el servidor en Render esté activo.
                </td>
            </tr>
        `;
    } finally {
        showLoading(false);
    }
}

/**
 * Dibuja las filas de la tabla con los productos recibidos
 */
function renderTable(productos) {
    tableBody.innerHTML = "";

    if (!productos || productos.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">No se encontraron resultados.</td>
            </tr>
        `;
        return;
    }

    productos.forEach((item) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.id ?? ''}</td>
            <td><strong>${item.codigo ?? ''}</strong></td>
            <td>${item.descripcion ?? ''}</td>
            <td>${item.marca ?? ''}</td>
            <td>${item.codigo_proveedor ?? ''}</td>
            <td>$${item.precio ? parseFloat(item.precio).toFixed(2) : '0.00'}</td>
        `;

        tableBody.appendChild(row);
    });
}

/**
 * Actualizar estados de botones e indicadores de página
 */
function updatePaginationUI(page, totalPages, totalRecords) {
    totalRecordsEl.textContent = totalRecords.toLocaleString();
    
    const displayPage = totalPages === 0 ? 0 : page + 1;
    pageIndicatorEl.textContent = `Página ${displayPage} de ${totalPages}`;

    btnPrev.disabled = page <= 0;
    btnNext.disabled = page + 1 >= totalPages || totalPages === 0;
}

/**
 * Muestra u oculta el spinner de carga
 */
function showLoading(isLoading) {
    if (isLoading) {
        loadingSpinner.style.display = "block";
        tableBody.style.opacity = "0.5";
    } else {
        loadingSpinner.style.display = "none";
        tableBody.style.opacity = "1";
    }
}