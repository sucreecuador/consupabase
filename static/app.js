const API_URL = "https://consupabase-api.onrender.com";

let currentModule = "productos"; // "productos" o "contactos"
let currentVista = 1;            // 1 o 2 (para productos)
let currentPage = 0;
let totalPages = 1;

// Elementos del DOM
const btnModuleProductos = document.getElementById("btn-module-productos");
const btnModuleContactos = document.getElementById("btn-module-contactos");
const pageTitle = document.getElementById("page-title");
const searchContainer = document.getElementById("search-container");
const tableHeaders = document.getElementById("table-headers");
const tableBody = document.getElementById("table-body");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const pageInfo = document.getElementById("page-info");
const inputPage = document.getElementById("input-page");
const btnGoPage = document.getElementById("btn-go-page");

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    switchModule("productos");
});

function setupEventListeners() {
    btnModuleProductos.addEventListener("click", () => switchModule("productos"));
    btnModuleContactos.addEventListener("click", () => switchModule("contactos"));

    btnPrev.addEventListener("click", () => {
        if (currentPage > 0) {
            currentPage--;
            fetchData();
        }
    });

    btnNext.addEventListener("click", () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            fetchData();
        }
    });

    btnGoPage.addEventListener("click", () => {
        const p = parseInt(inputPage.value) - 1;
        if (!isNaN(p) && p >= 0 && p < totalPages) {
            currentPage = p;
            fetchData();
        } else {
            alert(`Por favor ingrese un número entre 1 y ${totalPages}`);
        }
    });
}

function switchModule(moduleName) {
    currentModule = moduleName;
    currentPage = 0;

    if (moduleName === "productos") {
        btnModuleProductos.classList.add("active");
        btnModuleContactos.classList.remove("active");
        pageTitle.textContent = "Consulta de Productos - Sucre";
        renderProductSearchForm();
    } else {
        btnModuleContactos.classList.add("active");
        btnModuleProductos.classList.remove("active");
        pageTitle.textContent = "Consulta de Contactos - Sucre";
        renderContactSearchForm();
    }

    fetchData();
}

function renderProductSearchForm() {
    searchContainer.innerHTML = `
        <div class="search-fields">
            <label>Descripción: <input type="text" id="input-desc"></label>
            <label>Código: <input type="text" id="input-codigo"></label>
            <label>Marca: <input type="text" id="input-marca"></label>
            <label>Proveedor: <input type="text" id="input-proveedor"></label>
            <button id="btn-vista1" class="btn-vista ${currentVista === 1 ? 'active-vista' : ''}">Vista 1</button>
            <button id="btn-vista2" class="btn-vista ${currentVista === 2 ? 'active-vista' : ''}">Vista 2</button>
        </div>
        <div class="search-buttons">
            <button onclick="triggerSearch('desc')">Buscar por descripción</button>
            <button onclick="triggerSearch('codigo')">Buscar por código</button>
            <button onclick="triggerSearch('marca')">Buscar por marca</button>
            <button onclick="triggerSearch('proveedor')">Buscar por proveedor</button>
            <button onclick="resetSearch()">Mostrar todos</button>
        </div>
    `;

    document.getElementById("btn-vista1").addEventListener("click", () => {
        currentVista = 1;
        renderProductSearchForm();
        renderHeaders();
        fetchData();
    });

    document.getElementById("btn-vista2").addEventListener("click", () => {
        currentVista = 2;
        renderProductSearchForm();
        renderHeaders();
        fetchData();
    });

    renderHeaders();
}

function renderContactSearchForm() {
    searchContainer.innerHTML = `
        <div class="search-fields">
            <label>Nombre / Razón Social: <input type="text" id="input-nombre"></label>
            <label>Código Cliente: <input type="text" id="input-codigo-cliente"></label>
        </div>
        <div class="search-buttons">
            <button onclick="triggerSearch('nombre')">Buscar por nombre</button>
            <button onclick="triggerSearch('codigo_cliente')">Buscar por código</button>
            <button onclick="resetSearch()">Mostrar todos</button>
        </div>
    `;

    renderHeaders();
}

function renderHeaders() {
    tableHeaders.innerHTML = "";
    const tr = document.createElement("tr");

    if (currentModule === "productos") {
        if (currentVista === 1) {
            tr.innerHTML = `
                <th>CODIGO</th>
                <th>CODIGO_PROVEEDOR</th>
                <th>MARCA</th>
                <th>DESCRIPCION</th>
                <th>PRECIO_VENTA</th>
                <th>COSTO_PROM</th>
                <th>SALDO</th>
                <th>SALDO_BEXT</th>
                <th>SALDO_TEMP</th>
            `;
        } else {
            tr.innerHTML = `
                <th>CODIGO</th>
                <th>CODIGO_PROVEEDOR</th>
                <th>MARCA</th>
                <th>DESCRIPCION</th>
                <th>PRECIO_VENTA</th>
                <th>COSTO_PROM</th>
                <th>SALDO</th>
                <th>PESO</th>
                <th>MEDIDAS</th>
            `;
        }
    } else {
        tr.innerHTML = `
            <th>CODIGO</th>
            <th>CATEGORIA</th>
            <th>NOMBRE</th>
            <th>RAZON SOCIAL</th>
        `;
    }

    tableHeaders.appendChild(tr);
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
    tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;">Cargando datos...</td></tr>`;

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
            throw new Error(resData.error || "Error en el servidor");
        }

        totalPages = resData.total_pages || 1;
        updatePaginationUI();
        renderTableData(resData.data || []);
    } catch (err) {
        console.error("Error al cargar datos:", err);
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:red;">Error al obtener información: ${err.message}</td></tr>`;
    }
}

function updatePaginationUI() {
    pageInfo.textContent = `Página ${currentPage + 1} de ${totalPages}`;
    inputPage.value = currentPage + 1;
    btnPrev.disabled = currentPage === 0;
    btnNext.disabled = currentPage >= totalPages - 1;
}

function renderTableData(data) {
    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No se encontraron registros.</td></tr>`;
        return;
    }

    data.forEach(item => {
        const tr = document.createElement("tr");

        if (currentModule === "productos") {
            if (currentVista === 1) {
                tr.innerHTML = `
                    <td><strong>${item.codigo || ''}</strong></td>
                    <td>${item.codigo_proveedor || item.cod_prov || ''}</td>
                    <td>${item.marca || ''}</td>
                    <td>${item.descripcion || ''}</td>
                    <td>$${Number(item.precio_venta || 0).toFixed(2)}</td>
                    <td>$${Number(item.costo_prom || 0).toFixed(2)}</td>
                    <td>${item.saldo || 0}</td>
                    <td>${item.saldo_bext || 0}</td>
                    <td>${item.saldo_temp || 0}</td>
                `;
            } else {
                tr.innerHTML = `
                    <td><strong>${item.codigo || ''}</strong></td>
                    <td>${item.codigo_proveedor || item.cod_prov || ''}</td>
                    <td>${item.marca || ''}</td>
                    <td>${item.descripcion || ''}</td>
                    <td>$${Number(item.precio_venta || 0).toFixed(2)}</td>
                    <td>$${Number(item.costo_prom || 0).toFixed(2)}</td>
                    <td>${item.saldo || 0}</td>
                    <td>${item.peso || ''}</td>
                    <td>${item.medidas || item.medida || ''}</td>
                `;
            }
        } else {
            tr.innerHTML = `
                <td><strong>${item.codigo_cliente || item.id || ''}</strong></td>
                <td>${item.categoria || ''}</td>
                <td>${item.nombre || ''}</td>
                <td>${item.razon_social || ''}</td>
            `;
        }

        tableBody.appendChild(tr);
    });
}