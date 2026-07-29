// Al dejar API_URL vacío o usar window.location.origin, se conecta automáticamente al mismo servidor
const API_URL = window.location.origin;

let currentModule = "productos"; // "productos" o "contactos"
let currentVista = 1;            // 1 o 2
let currentPage = 0;
let totalPages = 1;

// Elementos del DOM
const btnModuleProductos = document.getElementById("btn-productos") || document.querySelector(".module-nav button:first-child");
const btnModuleContactos = document.getElementById("btn-contactos") || document.querySelector(".module-nav button:last-child");
const mainTitle = document.getElementById("main-title");
const filterContainer = document.getElementById("filter-container");
const actionButtons = document.getElementById("action-buttons");

// Paginación
const btnPrev = document.getElementById("btn-prev") || document.querySelector(".pagination-row button:first-child");
const btnNext = document.getElementById("btn-next");
const inputPage = document.querySelector(".pagination-row input[type='number']");
const btnGoPage = document.querySelector(".pagination-row button:last-child");

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    switchModule("productos");
});

function setupEventListeners() {
    if (btnModuleProductos) btnModuleProductos.onclick = () => switchModule("productos");
    if (btnModuleContactos) btnModuleContactos.onclick = () => switchModule("contactos");

    if (btnPrev) {
        btnPrev.onclick = () => {
            if (currentPage > 0) {
                currentPage--;
                fetchData();
            }
        };
    }

    if (btnNext) {
        btnNext.onclick = () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                fetchData();
            }
        };
    }

    if (btnGoPage && inputPage) {
        btnGoPage.onclick = () => {
            const p = parseInt(inputPage.value) - 1;
            if (!isNaN(p) && p >= 0 && p < totalPages) {
                currentPage = p;
                fetchData();
            } else {
                alert(`Por favor ingrese un número entre 1 y ${totalPages}`);
            }
        };
    }
}

function switchModule(moduleName) {
    currentModule = moduleName;
    currentPage = 0;

    if (mainTitle) {
        mainTitle.textContent = moduleName === "productos" 
            ? "Consulta de Productos - Sucre" 
            : "Consulta de Contactos - Sucre";
    }

    renderSearchForm();
    fetchData();
}

function renderSearchForm() {
    if (!filterContainer || !actionButtons) return;

    if (currentModule === "productos") {
        filterContainer.innerHTML = `
            <label>Descripción: <input type="text" id="input-desc"></label>
            <label>Código: <input type="text" id="input-codigo"></label>
            <label>Marca: <input type="text" id="input-marca"></label>
            <label>Proveedor: <input type="text" id="input-proveedor"></label>
            <button id="btn-vista1" style="font-weight:${currentVista === 1 ? 'bold' : 'normal'}">Vista 1</button>
            <button id="btn-vista2" style="font-weight:${currentVista === 2 ? 'bold' : 'normal'}">Vista 2</button>
        `;

        actionButtons.innerHTML = `
            <button onclick="triggerSearch('desc')">Buscar por descripción</button>
            <button onclick="triggerSearch('codigo')">Buscar por código</button>
            <button onclick="triggerSearch('marca')">Buscar por marca</button>
            <button onclick="triggerSearch('proveedor')">Buscar por proveedor</button>
            <button onclick="resetSearch()">Mostrar todos</button>
        `;

        document.getElementById("btn-vista1").onclick = () => { currentVista = 1; renderSearchForm(); fetchData(); };
        document.getElementById("btn-vista2").onclick = () => { currentVista = 2; renderSearchForm(); fetchData(); };

    } else {
        filterContainer.innerHTML = `
            <label>Nombre / Razón Social: <input type="text" id="input-nombre"></label>
            <label>Código Cliente: <input type="text" id="input-codigo-cliente"></label>
        `;

        actionButtons.innerHTML = `
            <button onclick="triggerSearch('nombre')">Buscar por nombre</button>
            <button onclick="triggerSearch('codigo_cliente')">Buscar por código</button>
            <button onclick="resetSearch()">Mostrar todos</button>
        `;
    }
}

function triggerSearch(type) {
    currentPage = 0;
    fetchData(type);
}

function resetSearch() {
    if (currentModule === "productos") {
        document.getElementById("input-desc").value = "";
        document.getElementById("input-codigo").value = "";
        document.getElementById("input-marca").value = "";
        document.getElementById("input-proveedor").value = "";
    } else {
        document.getElementById("input-nombre").value = "";
        document.getElementById("input-codigo-cliente").value = "";
    }
    currentPage = 0;
    fetchData();
}

async function fetchData(searchType = null) {
    const tableContainer = document.querySelector(".table-container");
    if (!tableContainer) return;

    tableContainer.innerHTML = `<p style="text-align:center; padding: 20px;">Cargando datos...</p>`;

    let url = `${API_URL}/${currentModule}?page=${currentPage}&page_size=50`;

    if (currentModule === "productos") {
        const desc = document.getElementById("input-desc")?.value.trim() || "";
        const cod = document.getElementById("input-codigo")?.value.trim() || "";
        const marca = document.getElementById("input-marca")?.value.trim() || "";
        const prov = document.getElementById("input-proveedor")?.value.trim() || "";

        if (searchType === "desc" && desc) url += `&descripcion=${encodeURIComponent(desc)}`;
        else if (searchType === "codigo" && cod) url += `&codigo=${encodeURIComponent(cod)}`;
        else if (searchType === "marca" && marca) url += `&marca=${encodeURIComponent(marca)}`;
        else if (searchType === "proveedor" && prov) url += `&proveedor=${encodeURIComponent(prov)}`;
        else if (!searchType) {
            if (desc) url += `&descripcion=${encodeURIComponent(desc)}`;
            if (cod) url += `&codigo=${encodeURIComponent(cod)}`;
            if (marca) url += `&marca=${encodeURIComponent(marca)}`;
            if (prov) url += `&proveedor=${encodeURIComponent(prov)}`;
        }
    } else {
        const nombre = document.getElementById("input-nombre")?.value.trim() || "";
        const codClient = document.getElementById("input-codigo-cliente")?.value.trim() || "";

        if (searchType === "nombre" && nombre) url += `&nombre=${encodeURIComponent(nombre)}`;
        else if (searchType === "codigo_cliente" && codClient) url += `&codigo=${encodeURIComponent(codClient)}`;
        else if (!searchType) {
            if (nombre) url += `&nombre=${encodeURIComponent(nombre)}`;
            if (codClient) url += `&codigo=${encodeURIComponent(codClient)}`;
        }
    }

    try {
        const response = await fetch(url);
        const resData = await response.json();

        if (!response.ok) {
            // Captura el mensaje exacto de error que envía FastAPI en resData.detail
            const errorMessage = resData.detail || resData.error || "Error no especificado en el servidor";
            throw new Error(errorMessage);
        }

        totalPages = resData.total_pages || 1;
        updatePaginationUI();
        buildTableHTML(tableContainer, resData.data || []);
    } catch (err) {
        console.error("Error al cargar datos:", err);
        tableContainer.innerHTML = `<p style="text-align:center; color:red; padding: 20px; font-weight:bold;">Error: ${err.message}</p>`;
    }
}

function updatePaginationUI() {
    const pageInfoSpan = document.querySelector(".pagination-row span") || document.getElementById("page-info");
    if (pageInfoSpan) {
        pageInfoSpan.textContent = `Página ${currentPage + 1} de ${totalPages}`;
    }
    if (inputPage) inputPage.value = currentPage + 1;
}

function buildTableHTML(container, data) {
    if (!data || data.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding: 20px;">No se encontraron registros.</p>`;
        return;
    }

    let headersHTML = "";
    if (currentModule === "productos") {
        if (currentVista === 1) {
            headersHTML = `
                <th>CODIGO</th><th>CODIGO_PROVEEDOR</th><th>MARCA</th>
                <th>DESCRIPCION</th><th>PRECIO_VENTA</th><th>COSTO_PROM</th>
                <th>SALDO</th><th>SALDO_BEXT</th><th>SALDO_TEMP</th>`;
        } else {
            headersHTML = `
                <th>CODIGO</th><th>CODIGO_PROVEEDOR</th><th>MARCA</th>
                <th>DESCRIPCION</th><th>PRECIO_VENTA</th><th>COSTO_PROM</th>
                <th>SALDO</th><th>PESO</th><th>MEDIDAS</th>`;
        }
    } else {
        headersHTML = `<th>CODIGO</th><th>CATEGORIA</th><th>NOMBRE</th><th>RAZON SOCIAL</th>`;
    }

    let rowsHTML = "";
    data.forEach(item => {
        if (currentModule === "productos") {
            if (currentVista === 1) {
                rowsHTML += `
                    <tr>
                        <td><strong>${item.codigo || ''}</strong></td>
                        <td>${item.codigo_proveedor || item.cod_prov || ''}</td>
                        <td>${item.marca || ''}</td>
                        <td>${item.descripcion || ''}</td>
                        <td>$${Number(item.precio_venta || 0).toFixed(2)}</td>
                        <td>$${Number(item.costo_prom || 0).toFixed(2)}</td>
                        <td>${item.saldo || 0}</td>
                        <td>${item.saldo_bext || 0}</td>
                        <td>${item.saldo_temp || 0}</td>
                    </tr>`;
            } else {
                rowsHTML += `
                    <tr>
                        <td><strong>${item.codigo || ''}</strong></td>
                        <td>${item.codigo_proveedor || item.cod_prov || ''}</td>
                        <td>${item.marca || ''}</td>
                        <td>${item.descripcion || ''}</td>
                        <td>$${Number(item.precio_venta || 0).toFixed(2)}</td>
                        <td>$${Number(item.costo_prom || 0).toFixed(2)}</td>
                        <td>${item.saldo || 0}</td>
                        <td>${item.peso || ''}</td>
                        <td>${item.medidas || item.medida || ''}</td>
                    </tr>`;
            }
        } else {
            rowsHTML += `
                <tr>
                    <td><strong>${item.codigo_cliente || item.id || ''}</strong></td>
                    <td>${item.categoria || ''}</td>
                    <td>${item.nombre || ''}</td>
                    <td>${item.razon_social || ''}</td>
                </tr>`;
        }
    });

    container.innerHTML = `
        <table border="1" style="width:100%; border-collapse:collapse;">
            <thead><tr>${headersHTML}</tr></thead>
            <tbody>${rowsHTML}</tbody>
        </table>
    `;
}