const API_BASE_URL = "https://consupabase-api.onrender.com";

let currentModule = "productos"; // "productos" o "contactos"
let currentPage = 0;
let totalPages = 1;

// Elementos del DOM
const btnModProductos = document.getElementById("btn-mod-productos");
const btnModContactos = document.getElementById("btn-mod-contactos");
const mainTitle = document.getElementById("main-title");
const filterContainer = document.getElementById("filter-container");
const actionButtons = document.getElementById("action-buttons");
const tableHeaders = document.getElementById("table-headers");
const tableBody = document.querySelector("tbody");
const pageInfo = document.getElementById("page-info");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const inputGoPage = document.getElementById("input-go-page");
const btnGo = document.getElementById("btn-go");

// Eventos de Pestañas
btnModProductos.addEventListener("click", () => switchModule("productos"));
btnModContactos.addEventListener("click", () => switchModule("contactos"));

// Eventos de Paginación
btnPrev.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;
        loadData();
    }
});

btnNext.addEventListener("click", () => {
    if (currentPage < totalPages - 1) {
        currentPage++;
        loadData();
    }
});

btnGo.addEventListener("click", () => {
    const pageNum = parseInt(inputGoPage.value) - 1;
    if (pageNum >= 0 && pageNum < totalPages) {
        currentPage = pageNum;
        loadData();
    }
});

function switchModule(module) {
    currentModule = module;
    currentPage = 0;

    if (module === "productos") {
        btnModProductos.className = "btn-module btn-module-active";
        btnModContactos.className = "btn-module btn-module-inactive";
        mainTitle.innerText = "Consulta de Productos - Sucre";
        renderProductoFilters();
    } else {
        btnModProductos.className = "btn-module btn-module-inactive";
        btnModContactos.className = "btn-module btn-module-active";
        mainTitle.innerText = "Consulta de Contactos - Sucre";
        renderContactoFilters();
    }

    loadData();
}

function renderProductoFilters() {
    filterContainer.innerHTML = `
        <label>Descripción:</label>
        <input type="text" id="f-desc" style="width: 120px;">
        <label>Código:</label>
        <input type="text" id="f-cod" style="width: 80px;">
        <label>Marca:</label>
        <input type="text" id="f-marca" style="width: 80px;">
        <label>Proveedor:</label>
        <input type="text" id="f-prov" style="width: 80px;">
        <button class="btn-yellow">Vista 1</button>
        <button class="btn-yellow">Vista 2</button>
    `;

    actionButtons.innerHTML = `
        <button class="btn-blue" onclick="triggerSearch()">Buscar por descripción</button>
        <button class="btn-blue" onclick="triggerSearch()">Buscar por código</button>
        <button class="btn-blue" onclick="triggerSearch()">Buscar por marca</button>
        <button class="btn-blue" onclick="triggerSearch()">Buscar por proveedor</button>
        <button class="btn-blue" onclick="clearFilters()">Mostrar todos</button>
    `;

    tableHeaders.innerHTML = `
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
}

function renderContactoFilters() {
    filterContainer.innerHTML = `
        <label>Nombre:</label>
        <input type="text" id="f-nombre" style="width: 140px;">
        <label>C.C./R.U.C.:</label>
        <input type="text" id="f-ruc" style="width: 100px;">
        <label>Código:</label>
        <input type="text" id="f-cod-cli" style="width: 80px;">
    `;

    actionButtons.innerHTML = `
        <button class="btn-blue" onclick="triggerSearch()">Buscar por nombre</button>
        <button class="btn-blue" onclick="triggerSearch()">Buscar por RUC/C.C.</button>
        <button class="btn-blue" onclick="triggerSearch()">Buscar por código</button>
        <button class="btn-blue" onclick="clearFilters()">Mostrar todos</button>
    `;

    tableHeaders.innerHTML = `
        <th>CODIGO</th>
        <th>C.C. o R.U.C.</th>
        <th>NOMBRE APELLIDO</th>
        <th>CALLE Y NUMERO</th>
        <th>TELEFONO</th>
        <th>CORR.ELECTRONICO</th>
        <th>CIUDAD</th>
        <th>TIPO CONTACTO</th>
    `;
}

function triggerSearch() {
    currentPage = 0;
    loadData();
}

function clearFilters() {
    if (currentModule === "productos") {
        document.getElementById("f-desc").value = "";
        document.getElementById("f-cod").value = "";
        document.getElementById("f-marca").value = "";
        document.getElementById("f-prov").value = "";
    } else {
        document.getElementById("f-nombre").value = "";
        document.getElementById("f-ruc").value = "";
        document.getElementById("f-cod-cli").value = "";
    }
    currentPage = 0;
    loadData();
}

async function loadData() {
    tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;">Cargando datos...</td></tr>`;

    let url = `${API_BASE_URL}/${currentModule}?page=${currentPage}&page_size=50`;

    if (currentModule === "productos") {
        const desc = document.getElementById("f-desc")?.value || "";
        const cod = document.getElementById("f-cod")?.value || "";
        const marca = document.getElementById("f-marca")?.value || "";
        const prov = document.getElementById("f-prov")?.value || "";

        if (desc) url += `&descripcion=${encodeURIComponent(desc)}`;
        if (cod) url += `&codigo=${encodeURIComponent(cod)}`;
        if (marca) url += `&marca=${encodeURIComponent(marca)}`;
        if (prov) url += `&proveedor=${encodeURIComponent(prov)}`;
    } else {
        const nombre = document.getElementById("f-nombre")?.value || "";
        const ruc = document.getElementById("f-ruc")?.value || "";
        const cod = document.getElementById("f-cod-cli")?.value || "";

        if (nombre) url += `&nombre=${encodeURIComponent(nombre)}`;
        if (ruc) url += `&ruc=${encodeURIComponent(ruc)}`;
        if (cod) url += `&codigo=${encodeURIComponent(cod)}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error en la respuesta de la red");

        const result = await response.json();
        totalPages = result.total_pages || 1;
        pageInfo.innerText = `Página ${currentPage + 1} de ${totalPages}`;

        renderTableData(result.data || []);
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:red; font-weight:bold;">Error al cargar datos del servidor.</td></tr>`;
    }
}

function renderTableData(data) {
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No se encontraron registros.</td></tr>`;
        return;
    }

    data.forEach(item => {
        const tr = document.createElement("tr");

        if (currentModule === "productos") {
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
            const cod = item.codigo_cliente || item.codigo || item.id || '';
            const ruc = item.ruc || item.cedula || item.identificacion || '';
            const nom = item.nombre || item.nombre_apellido || item.razon_social || '';
            const dir = item.direccion || item.calle || item.calle_y_numero || '';
            const tel = item.telefono || item.celular || '';
            const email = item.email || item.corr_electronico || item.correo || '';
            const ciudad = item.ciudad || '';
            const tipo = item.tipo_contacto || item.tipo || '';

            tr.innerHTML = `
                <td><strong>${cod}</strong></td>
                <td>${ruc}</td>
                <td>${nom}</td>
                <td>${dir}</td>
                <td>${tel}</td>
                <td>${email}</td>
                <td>${ciudad}</td>
                <td>${tipo}</td>
            `;
        }

        tableBody.appendChild(tr);
    });
}

// Inicializar la vista de productos
switchModule("productos");