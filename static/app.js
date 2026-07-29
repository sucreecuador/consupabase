// Endpoints de API en Render
const API_PRODUCTOS_URL = "https://consupabase-api.onrender.com/productos";
const API_CONTACTOS_URL = "https://consupabase-api.onrender.com/contactos"; // Asegúrate de tener este endpoint en tu Flask/FastAPI

// Estado Global
let currentModule = "productos"; // 'productos' | 'contactos'
let currentPage = 0;
const pageSize = 50;
let currentVista = 1; // 1: Saldos extra | 2: Peso y Medidas (solo productos)
let currentSortColumn = "codigo";
let sortAscending = true;
let cachedData = [];

document.addEventListener("DOMContentLoaded", () => {
    initModuleUI();
    initEvents();
    fetchData(0);
});

function getTableBody() {
    return document.querySelector("table tbody") || document.querySelector("tbody");
}

function initModuleUI() {
    const title = document.getElementById("main-title");
    const headerRow = document.getElementById("table-headers");
    const btnModProd = document.getElementById("btn-mod-productos");
    const btnModCont = document.getElementById("btn-mod-contactos");

    if (currentModule === "productos") {
        if (title) title.textContent = "Consulta de Productos - Sucre";
        if (btnModProd) btnModProd.style.backgroundColor = "#0056b3";
        if (btnModCont) btnModCont.style.backgroundColor = "#6c757d";

        if (headerRow) {
            const lastCol1 = currentVista === 2 ? "PESO" : "SALDO_BEXT";
            const lastCol2 = currentVista === 2 ? "MEDIDAS" : "SALDO_TEMP";
            headerRow.innerHTML = `
                <th>CODIGO</th>
                <th>CODIGO_PROVEEDOR</th>
                <th>MARCA</th>
                <th>DESCRIPCION</th>
                <th>PRECIO_VENTA</th>
                <th>COSTO_PROM</th>
                <th>SALDO</th>
                <th>${lastCol1}</th>
                <th>${lastCol2}</th>
            `;
        }
    } else {
        if (title) title.textContent = "Consulta de Contactos - Sucre";
        if (btnModProd) btnModProd.style.backgroundColor = "#6c757d";
        if (btnModCont) btnModCont.style.backgroundColor = "#0056b3";

        if (headerRow) {
            headerRow.innerHTML = `
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
    }
}

function initEvents() {
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("button, input[type='button'], input[type='submit']");
        
        // Cambio de Módulo
        if (e.target.id === "btn-mod-productos") {
            currentModule = "productos";
            currentPage = 0;
            initModuleUI();
            fetchData(0);
            return;
        }
        if (e.target.id === "btn-mod-contactos") {
            currentModule = "contactos";
            currentPage = 0;
            initModuleUI();
            fetchData(0);
            return;
        }

        // Clic en Encabezados para Ordenar
        const th = e.target.closest("th");
        if (th) {
            handleHeaderClick(th.textContent.trim().toUpperCase());
            return;
        }

        if (!btn) return;
        const text = btn.textContent.trim().toLowerCase();

        // Botones de Vistas
        if (text.includes("vista 1") && currentModule === "productos") {
            currentVista = 1;
            initModuleUI();
            renderTable(cachedData);
        } else if (text.includes("vista 2") && currentModule === "productos") {
            currentVista = 2;
            initModuleUI();
            renderTable(cachedData);
        } 
        // Búsqueda genérica
        else if (text.includes("buscar") || text.includes("mostrar todos")) {
            currentPage = 0;
            fetchData(0);
        } 
        // Paginación
        else if (text.includes("anterior") || text.includes("←")) {
            if (currentPage > 0) {
                currentPage--;
                fetchData(currentPage);
            }
        } else if (text.includes("siguiente") || text.includes("→")) {
            currentPage++;
            fetchData(currentPage);
        } else if (text === "ir" || btn.id === "btn-go") {
            procesarIrPagina();
        }
    });
}

function handleHeaderClick(colHeader) {
    let mapCols = {};
    if (currentModule === "productos") {
        mapCols = {
            "CODIGO": "codigo",
            "CODIGO_PROVEEDOR": "codigo_proveedor",
            "MARCA": "marca",
            "DESCRIPCION": "descripcion",
            "PRECIO_VENTA": "precio_venta",
            "COSTO_PROM": "costo_prom",
            "SALDO": "saldo",
            "SALDO_BEXT": "saldo_bext",
            "SALDO_TEMP": "saldo_temp",
            "PESO": "peso",
            "MEDIDAS": "medidas"
        };
    } else {
        mapCols = {
            "CODIGO": "codigo_cliente",
            "C.C. O R.U.C.": "ruc",
            "NOMBRE APELLIDO": "nombre",
            "CALLE Y NUMERO": "direccion",
            "TELEFONO": "telefono1",
            "CORR.ELECTRONICO": "email",
            "CIUDAD": "ciudad",
            "TIPO CONTACTO": "categoria"
        };
    }

    const targetCol = mapCols[colHeader] || colHeader.toLowerCase();

    if (currentSortColumn === targetCol) {
        sortAscending = !sortAscending;
    } else {
        currentSortColumn = targetCol;
        sortAscending = true;
    }

    sortAndRenderLocal();
}

function sortAndRenderLocal() {
    if (!cachedData || cachedData.length === 0) return;

    cachedData.sort((a, b) => {
        let valA = a[currentSortColumn] ?? a[currentSortColumn.toUpperCase()] ?? "";
        let valB = b[currentSortColumn] ?? b[currentSortColumn.toUpperCase()] ?? "";

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortAscending ? -1 : 1;
        if (valA > valB) return sortAscending ? 1 : -1;
        return 0;
    });

    renderTable(cachedData);
}

function procesarIrPagina() {
    const inputPag = document.getElementById("input-go-page");
    if (inputPag) {
        const pag = parseInt(inputPag.value);
        if (!isNaN(pag) && pag > 0) {
            currentPage = pag - 1;
            fetchData(currentPage);
        }
    }
}

async function fetchData(page = 0) {
    const tbody = getTableBody();
    if (!tbody) return;

    const totalCols = currentModule === "productos" ? 9 : 8;

    tbody.innerHTML = `
        <tr>
            <td colspan="${totalCols}" style="text-align: center; padding: 20px; font-weight: bold; color: #0056b3;">
                Cargando información...
            </td>
        </tr>
    `;

    const url = currentModule === "productos" ? API_PRODUCTOS_URL : API_CONTACTOS_URL;
    const params = new URLSearchParams({
        page: page,
        page_size: pageSize
    });

    try {
        const response = await fetch(`${url}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        cachedData = result.data || [];
        
        sortAndRenderLocal();
        updatePaginationUI(result.page, result.total_pages);

    } catch (error) {
        console.error("Error al obtener datos:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="${totalCols}" style="text-align: center; color: red; padding: 20px; font-weight: bold;">
                    Error al cargar datos del servidor.
                </td>
            </tr>
        `;
    }
}

function renderTable(data) {
    const tbody = getTableBody();
    if (!tbody) return;

    tbody.innerHTML = "";
    const totalCols = currentModule === "productos" ? 9 : 8;

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="${totalCols}" style="text-align: center; padding: 20px; color: #666;">
                    No se encontraron registros.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach((item) => {
        const row = document.createElement("tr");

        if (currentModule === "productos") {
            const codigo = item.codigo || item.CODIGO || "";
            const codProv = item.codigo_proveedor || item.CODIGO_PROVEEDOR || "";
            const marca = item.marca || item.MARCA || "";
            const desc = item.descripcion || item.DESCRIPCION || "";
            const precio = item.precio_venta || item.PRECIO_VENTA || 0;
            const costo = item.costo_prom || item.COSTO_PROM || 0;
            const saldo = item.saldo || item.SALDO || 0;

            let col8Val = currentVista === 2 ? (item.peso || item.PESO || "-") : (item.saldo_bext || item.SALDO_BEXT || 0);
            let col9Val = currentVista === 2 ? (item.medidas || item.MEDIDAS || "-") : (item.saldo_temp || item.SALDO_TEMP || 0);

            row.innerHTML = `
                <td><strong>${codigo}</strong></td>
                <td>${codProv}</td>
                <td>${marca}</td>
                <td>${desc}</td>
                <td>$${parseFloat(precio).toFixed(2)}</td>
                <td>$${parseFloat(costo).toFixed(2)}</td>
                <td>${saldo}</td>
                <td>${col8Val}</td>
                <td>${col9Val}</td>
            `;
        } else {
            // Módulo Contactos
            const codCliente = item.codigo_cliente || item.CODIGO_CLIENTE || "";
            const ruc = item.ruc || item.RUC || "";
            const nombre = item.nombre || item.razon_social || item.NOMBRE || "";
            const direccion = item.direccion || item.DIRECCION || "";
            const telefono = item.telefono1 || item.TELEFONO1 || item.telefono || "";
            const email = item.email || item.EMAIL || "";
            const ciudad = item.ciudad || item.CIUDAD || "-";
            const categoria = item.categoria || item.CATEGORIA || "-";

            row.innerHTML = `
                <td><strong>${codCliente}</strong></td>
                <td>${ruc}</td>
                <td>${nombre}</td>
                <td>${direccion}</td>
                <td>${telefono}</td>
                <td>${email}</td>
                <td>${ciudad}</td>
                <td>${categoria}</td>
            `;
        }

        tbody.appendChild(row);
    });
}

function updatePaginationUI(page, totalPages) {
    const pageInfo = document.getElementById("page-info");
    if (pageInfo) {
        const displayPage = totalPages === 0 ? 0 : page + 1;
        pageInfo.textContent = `Página ${displayPage} de ${totalPages || 1}`;
    }
}