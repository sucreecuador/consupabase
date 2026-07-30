let paginaActual = 0;
let pageSize = 50;
let totalPaginas = 0;
let productos = [];
let vistaActual = 1; // 1 = Vista Saldos, 2 = Vista Peso/Medidas
let filtroActivo = { tipo: "todos", valor: "" };
const API_URL = "http://localhost:8000/productos";

function cambiarVista(numVista) {
    vistaActual = numVista;
    
    document.getElementById("btnVista1")?.classList.toggle("active", numVista === 1);
    document.getElementById("btnVista2")?.classList.toggle("active", numVista === 2);
    
    actualizarCabecera();
    renderTabla();
}

function actualizarCabecera() {
    const col8 = document.getElementById("thCol8");
    const col9 = document.getElementById("thCol9");
    
    if (col8 && col9) {
        if (vistaActual === 1) {
            col8.textContent = "SALDO_BEXT";
            col9.textContent = "SALDO_TEMP";
        } else {
            col8.textContent = "PESO";
            col9.textContent = "MEDIDAS";
        }
    }
}

async function cargarProductos() {
    const tbody = document.getElementById("tablaCuerpo");
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="text-center">Cargando datos...</td></tr>';

    const params = new URLSearchParams({
        page: paginaActual,
        page_size: pageSize
    });

    if (filtroActivo.tipo !== "todos" && filtroActivo.valor) {
        params.append(filtroActivo.tipo, filtroActivo.valor);
    }

    try {
        const response = await fetch(API_URL + "?" + params.toString());
        if (!response.ok) throw new Error("HTTP Status: " + response.status);

        const res = await response.json();
        productos = res.data || [];
        totalPaginas = res.total_pages || 1;

        actualizarCabecera();
        renderTabla();
        actualizarPaginacion(res.total || 0, res.page || 0, totalPaginas);

    } catch (error) {
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center" style="color:red;">⚠️ No se pudo conectar con el servidor (http://localhost:8000).</td></tr>';
        }
    }
}

function renderTabla() {
    const tbody = document.getElementById("tablaCuerpo");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!productos || productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No se encontraron productos.</td></tr>';
        return;
    }

    const fragment = document.createDocumentFragment();

    productos.forEach(prod => {
        const fila = document.createElement("tr");

        const val = (v) => (v !== null && v !== undefined && v !== "") ? v : "0";
        const formatMoney = (v) => {
            if (v === null || v === undefined || isNaN(v)) return "0.00";
            return parseFloat(v).toFixed(2);
        };

        // Construcción estricta de exactamente 9 columnas
        if (vistaActual === 1) {
            fila.innerHTML = `
                <td><strong>${prod.codigo || ""}</strong></td>
                <td>${val(prod.codigo_proveedor)}</td>
                <td>${val(prod.marca)}</td>
                <td>${prod.descripcion || ""}</td>
                <td class="text-right">$${formatMoney(prod.precio_venta)}</td>
                <td class="text-right">$${formatMoney(prod.costo_prom)}</td>
                <td class="text-center">${val(prod.saldo)}</td>
                <td class="text-center">${val(prod.saldo_bext)}</td>
                <td class="text-center">${val(prod.saldo_temp)}</td>
            `;
        } else {
            fila.innerHTML = `
                <td><strong>${prod.codigo || ""}</strong></td>
                <td>${val(prod.codigo_proveedor)}</td>
                <td>${val(prod.marca)}</td>
                <td>${prod.descripcion || ""}</td>
                <td class="text-right">$${formatMoney(prod.precio_venta)}</td>
                <td class="text-right">$${formatMoney(prod.costo_prom)}</td>
                <td class="text-center">${val(prod.saldo)}</td>
                <td class="text-center">${val(prod.peso)}</td>
                <td class="text-center">${val(prod.medidas)}</td>
            `;
        }

        fragment.appendChild(fila);
    });

    tbody.appendChild(fragment);
}

function buscarPor(tipo) {
    paginaActual = 0;
    let inputId = "";

    if (tipo === "descripcion") inputId = "descInput";
    else if (tipo === "codigo") inputId = "codigoInput";
    else if (tipo === "marca") inputId = "marcaInput";
    else if (tipo === "proveedor") inputId = "proveedorInput";

    const valor = document.getElementById(inputId)?.value || "";
    filtroActivo = { tipo: tipo, valor: valor };
    cargarProductos();
}

function mostrarTodos() {
    paginaActual = 0;
    document.getElementById("descInput").value = "";
    document.getElementById("codigoInput").value = "";
    document.getElementById("marcaInput").value = "";
    document.getElementById("proveedorInput").value = "";

    filtroActivo = { tipo: "todos", valor: "" };
    cargarProductos();
}

function anterior() {
    if (paginaActual > 0) {
        paginaActual--;
        cargarProductos();
    }
}

function siguiente() {
    if (paginaActual < totalPaginas - 1) {
        paginaActual++;
        cargarProductos();
    }
}

function irAPagina() {
    const input = document.getElementById("irPaginaInput");
    const num = parseInt(input.value);

    if (num && num >= 1 && num <= totalPaginas) {
        paginaActual = num - 1;
        cargarProductos();
    } else {
        alert("Número de página inválido");
    }
}

function irAPaginaEnter(event) {
    if (event.key === "Enter") irAPagina();
}

function detectarEnter(event, tipo) {
    if (event.key === "Enter") {
        if (tipo === "desc") buscarPor("descripcion");
        else if (tipo === "codigo") buscarPor("codigo");
        else if (tipo === "marca") buscarPor("marca");
        else if (tipo === "prov") buscarPor("proveedor");
    }
}

function actualizarPaginacion(totalRecords, page, totalPages) {
    const infoSpan = document.getElementById("paginaInfo");
    const btnAnt = document.getElementById("btnAnterior");
    const btnSig = document.getElementById("btnSiguiente");

    if (infoSpan) infoSpan.textContent = "Página " + (page + 1) + " de " + (totalPages || 1);

    if (btnAnt) btnAnt.disabled = page <= 0;
    if (btnSig) btnSig.disabled = page >= totalPages - 1;
}

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});
