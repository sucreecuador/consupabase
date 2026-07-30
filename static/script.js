// ===============================
//  CONFIGURACIÓN
// ===============================
const API_URL = "/productos";
let currentPage = 0;
let pageSize = 50;

// ===============================
//  FUNCIÓN PRINCIPAL DE CONSULTA
// ===============================
async function fetchProductos(params = "") {
    try {
        const response = await fetch(`${API_URL}?page=${currentPage}&page_size=${pageSize}${params}`);
        const data = await response.json();

        if (data.error) {
            console.error("Error en respuesta API:", data.error);
            alert("Error: " + data.error);
            return;
        }

        renderTable(data.data);
        updatePagination(data.count);
    } catch (error) {
        console.error("Error general:", error);
        alert("Error general: " + error);
    }
}

// ===============================
//  RENDER DE TABLA
// ===============================
function renderTable(items) {
    const tbody = document.getElementById("tabla-body");
    tbody.innerHTML = "";

    items.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.codigo ?? ""}</td>
            <td>${item.descripcion ?? ""}</td>
            <td>${item.marca ?? ""}</td>
            <td>${item.proveedor ?? ""}</td>
        `;

        tbody.appendChild(row);
    });
}

// ===============================
//  PAGINACIÓN
// ===============================
function updatePagination(count) {
    document.getElementById("pagina-info").innerText = `Página ${currentPage + 1}`;
}

function siguientePagina() {
    currentPage++;
    fetchProductos();
}

function anteriorPagina() {
    if (currentPage > 0) currentPage--;
    fetchProductos();
}

function irPagina() {
    const num = parseInt(document.getElementById("ir-input").value);
    if (!isNaN(num) && num > 0) {
        currentPage = num - 1;
        fetchProductos();
    }
}

// ===============================
//  FILTROS
// ===============================
function buscarDescripcion() {
    const val = document.getElementById("descripcion").value;
    fetchProductos(`&descripcion=${encodeURIComponent(val)}`);
}

function buscarCodigo() {
    const val = document.getElementById("codigo").value;
    fetchProductos(`&codigo=${encodeURIComponent(val)}`);
}

function buscarMarca() {
    const val = document.getElementById("marca").value;
    fetchProductos(`&marca=${encodeURIComponent(val)}`);
}

function buscarProveedor() {
    const val = document.getElementById("proveedor").value;
    fetchProductos(`&proveedor=${encodeURIComponent(val)}`);
}

function mostrarTodos() {
    fetchProductos("");
}

// ===============================
//  INICIO AUTOMÁTICO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    fetchProductos();
});
