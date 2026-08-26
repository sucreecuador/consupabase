/* ============================================================
   ERP SUCRE – Módulo de Compras (Versión PRO)
   Optimizado para rendimiento, ordenamiento global, filtros
   avanzados y paginación inteligente.
   ============================================================ */

let clientSupabase = null;
if (typeof supabase !== "undefined" && supabase.createClient) {
    clientSupabase = supabase.createClient(
        "https://tu-proyecto.supabase.co",
        "tu-anon-key"
    );
}

/* ============================
   ESTADO GLOBAL
   ============================ */
let productosData = [];
let productosFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 15;

let ordenColumna = "codigo";
let ordenAscendente = true;

let debounceTimer = null;

/* ============================
   INICIO
   ============================ */
document.addEventListener("DOMContentLoaded", () => {
    inicializarEventos();
    cargarDatosCompras();
});

/* ============================
   EVENTOS
   ============================ */
function inicializarEventos() {
    const filtros = ["buscarNombre", "buscarMarca", "buscarCodigo", "buscarGeneral"];

    filtros.forEach(id => {
        document.getElementById(id).addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(aplicarFiltros, 180);
        });
    });

    document.getElementById("btnMostrarTodos").addEventListener("click", () => {
        filtros.forEach(id => document.getElementById(id).value = "");
        aplicarFiltros();
    });

    document.getElementById("btnAnterior").addEventListener("click", () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarTabla();
        }
    });

    document.getElementById("btnSiguiente").addEventListener("click", () => {
        const totalPaginas = Math.ceil(productosFiltrados.length / registrosPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarTabla();
        }
    });

    document.getElementById("btnIrPagina").addEventListener("click", () => {
        const pag = parseInt(document.getElementById("inputPagina").value);
        const totalPaginas = Math.ceil(productosFiltrados.length / registrosPorPagina);
        if (pag >= 1 && pag <= totalPaginas) {
            paginaActual = pag;
            renderizarTabla();
        }
    });

    // Ordenamiento por columnas
    const headers = document.querySelectorAll("#tablaProductosCompras thead th[data-column]");
    headers.forEach(header => {
        header.addEventListener("click", () => {
            const columna = header.getAttribute("data-column");

            if (ordenColumna === columna) {
                ordenAscendente = !ordenAscendente;
            } else {
                ordenColumna = columna;
                ordenAscendente = true;
            }

            headers.forEach(h => {
                const icon = h.querySelector(".sort-icon");
                if (icon) icon.textContent = "↕";
            });

            const icon = header.querySelector(".sort-icon");
            if (icon) icon.textContent = ordenAscendente ? "▲" : "▼";

            ordenarDatosGlobales();
            aplicarFiltros();
        });
    });
}

/* ============================
   CARGA DE DATOS
   ============================ */
async function cargarDatosCompras() {
    let datosCargados = false;

    if (clientSupabase) {
        try {
            const { data, error } = await clientSupabase
                .from("productos")
                .select("*")
                .range(0, 99999);

            if (!error && data && data.length > 0) {
                productosData = data;
                datosCargados = true;
                localStorage.setItem("cacheCompras", JSON.stringify(data));
            }
        } catch (e) {
            console.warn("Supabase falló, usando cache local si existe.");
        }
    }

    if (!datosCargados) {
        const cache = localStorage.getItem("cacheCompras");
        productosData = cache ? JSON.parse(cache) : obtenerDatosPrueba();
    }

    ordenarDatosGlobales();
    aplicarFiltros();
}

/* ============================
   OBTENER VALOR DE CAMPO
   ============================ */
function obtenerValorCampo(obj, col) {
    const map = {
        codigo: obj.codigo ?? "",
        naci: obj.naci ?? "",
        marca: obj.marca ?? "",
        descripcion: obj.descripcion ?? obj.nombre ?? "",
        unidad: obj.unidad ?? "",
        precio_compra: obj.precio_compra ?? obj.costo ?? 0,
        precio_venta: obj.precio_venta ?? obj.pvp ?? 0,
        saldo_temp: obj.saldo_temp ?? 0,
        saldo: obj.saldo ?? 0,
        saldobext: obj.saldobext ?? obj.saldo_bext ?? 0,
        peso: obj.peso ?? 0,
        medidas: obj.medidas ?? "0"
    };
    return map[col] ?? "";
}

/* ============================
   ORDENAMIENTO GLOBAL PRO
   ============================ */
function ordenarDatosGlobales() {
    productosData.sort((a, b) => {
        let valA = obtenerValorCampo(a, ordenColumna);
        let valB = obtenerValorCampo(b, ordenColumna);

        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        const ambosNumericos = !isNaN(numA) && !isNaN(numB);

        if (ambosNumericos) {
            return ordenAscendente ? numA - numB : numB - numA;
        }

        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();

        return ordenAscendente
            ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: "base" })
            : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: "base" });
    });
}

/* ============================
   FILTROS AVANZADOS PRO
   ============================ */
function aplicarFiltros() {
    const nom = document.getElementById("buscarNombre").value.toLowerCase().trim();
    const mar = document.getElementById("buscarMarca").value.toLowerCase().trim();
    const cod = document.getElementById("buscarCodigo").value.toLowerCase().trim();
    const gen = document.getElementById("buscarGeneral").value.toLowerCase().trim();

    productosFiltrados = productosData.filter(item => {
        const desc = (item.descripcion || item.nombre || "").toLowerCase();
        const marca = (item.marca || "").toLowerCase();
        const codigo = (item.codigo || "").toLowerCase();
        const naci = (item.naci || "").toLowerCase();

        const cumpleNom = !nom || desc.includes(nom);
        const cumpleMar = !mar || marca.includes(mar);
        const cumpleCod = !cod || codigo.includes(cod);

        const cumpleGen =
            !gen ||
            codigo.includes(gen) ||
            desc.includes(gen) ||
            marca.includes(gen) ||
            naci.includes(gen);

        return cumpleNom && cumpleMar && cumpleCod && cumpleGen;
    });

    paginaActual = 1;
    renderizarTabla();
}

/* ============================
   RENDERIZADO PRO
   ============================ */
function renderizarTabla() {
    const tbody = document.getElementById("tbodyCompras");
    tbody.innerHTML = "";

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const paginaData = productosFiltrados.slice(inicio, fin);

    if (paginaData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center text-muted py-4">No se encontraron productos.</td></tr>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    paginaData.forEach(p => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><strong>${p.codigo || ""}</strong></td>
            <td>${p.naci || "TWN"}</td>
            <td>${p.marca || ""}</td>
            <td>${p.descripcion || p.nombre || ""}</td>
            <td>${p.unidad || "UNI"}</td>
            <td>${(p.precio_compra ?? p.costo ?? 0).toFixed(2)}</td>
            <td>${p.saldo_temp || 0}</td>
            <td>${p.saldo || 0}</td>
            <td>${p.saldobext ?? p.saldo_bext ?? 0}</td>
            <td>${p.peso || 0}</td>
            <td>${p.medidas || "0"}</td>
            <td class="text-center">
                <button class="action-btn me-1" onclick="editarProducto('${p.codigo}')"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn" onclick="eliminarProducto('${p.codigo}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
    document.getElementById("inputPagina").value = paginaActual;
}

/* ============================
   ACCIONES
   ============================ */
function editarProducto(codigo) {
    console.log("Editar:", codigo);
}

function eliminarProducto(codigo) {
    console.log("Eliminar:", codigo);
}

/* ============================
   DATOS DE PRUEBA
   ============================ */
function obtenerDatosPrueba() {
    return [
        { codigo: "ABR013", naci: "TWN", marca: "SH.MC", descripcion: "ABRAZADERA CUADRO MTB 34.9 MM C/BLOQ.", unidad: "UNI", precio_compra: 3.00, precio_venta: 5.00, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR015", naci: "TWN", marca: "SHIMANO", descripcion: "ABRAZADERA P/REDUCIR PASACAT.34.9 A 31.8", unidad: "UNI", precio_compra: 1.00, precio_venta: 2.00, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR019", naci: "TWN", marca: "ZOOMN", descripcion: "ABRAZADERA CUADRO BMX ALUMINIO 25.4 MM", unidad: "UNI", precio_compra: 1.00, precio_venta: 2.50, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR022", naci: "TWN", marca: "EPOCH MAK", descripcion: "ABRAZADERA CUADRO MTB 34.9 MM ALUMINIO", unidad: "UNI", precio_compra: 4.00, precio_venta: 7.00, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" }
    ];
}
