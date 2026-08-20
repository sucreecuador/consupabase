const API_URL = "/productos";
let currentPage = 0;
let pageSize = 50;

async function fetchProductos(params = "") {
    const response = await fetch(`${API_URL}?page=${currentPage}&page_size=${pageSize}${params}`);
    const data = await response.json();
    renderTable(data.data);
    updatePagination(data.count);
}

function renderTable(items) {
    const tbody = document.getElementById("tabla-body");
    tbody.innerHTML = "";

    items.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.codigo}</td>
            <td>${item.descripcion}</td>
            <td>${item.marca}</td>
            <td>${item.proveedor}</td>
        `;
        tbody.appendChild(row);
    });
}

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

// CRUD botones
function abrirNuevo() {
    const codigo = prompt("Código:");
    const descripcion = prompt("Descripción:");
    const marca = prompt("Marca:");
    const proveedor = prompt("Proveedor:");

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, descripcion, marca, proveedor })
    }).then(() => fetchProductos());
}

function abrirModificar() {
    const codigo = prompt("Código a modificar:");
    const descripcion = prompt("Nueva descripción:");
    const marca = prompt("Nueva marca:");
    const proveedor = prompt("Nuevo proveedor:");

    fetch(`${API_URL}/${codigo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion, marca, proveedor })
    }).then(() => fetchProductos());
}

function abrirEliminar() {
    const codigo = prompt("Código a eliminar:");

    fetch(`${API_URL}/${codigo}`, {
        method: "DELETE"
    }).then(() => fetchProductos());
}

document.addEventListener("DOMContentLoaded", () => {
    fetchProductos();
});
