/* ============================================================
   ERP SUCRE – Módulo de Compras (Versión PRO)
   Conexión real a Supabase (tabla: productos)
   Exportación a Excel (CSV)
   Modal de edición
   Modal de eliminación
   ============================================================ */

let clientSupabase = null;

if (typeof supabase !== "undefined" && supabase.createClient) {
    clientSupabase = supabase.createClient(
        "https://utcqgkeiyqvfxfhjupfc.supabase.co",   // URL REAL
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts"
    );
}

let productosData = [];
let productosFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 15;

let ordenColumna = "codigo";
let ordenAscendente = true;

let debounceTimer = null;
let codigoAEliminar = null;

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

    document.getElementById("btnExportExcel").addEventListener("click", exportarExcel);
    document.getElementById("btnGuardarEdicion").addEventListener("click", guardarEdicionProducto);
    document.getElementById("btnConfirmarEliminar").addEventListener("click", confirmarEliminarProducto);
}

/* ============================
   CARGA REAL DESDE SUPABASE
   ============================ */
async function cargarDatosCompras() {
    try {
        const { data, error } = await clientSupabase
            .from("productos")
            .select("*")
            .order("codigo", { ascending: true })
            .limit(50000);

        if (error) {
            alert("Supabase bloqueó la lectura. Revisa RLS.");
            console.error(error);
            return;
        }

        if (!data || data.length === 0) {
            alert("La tabla 'productos' está vacía.");
            return;
        }

        productosData = data;

        ordenarDatosGlobales();
        aplicarFiltros();

    } catch (e) {
        alert("No se pudo conectar a Supabase.");
        console.error(e);
    }
}

/* ============================
   ORDENAMIENTO GLOBAL
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
   FILTROS
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
   RENDERIZADO
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
                <button class="action-btn me-1" onclick="editarProducto('${p.codigo}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn" onclick="eliminarProducto('${p.codigo}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
    document.getElementById("inputPagina").value = paginaActual;
}

/* ============================
   EXPORTAR A EXCEL (CSV)
   ============================ */
function exportarExcel() {
    const filas = productosFiltrados.map(p => ({
        codigo: p.codigo || "",
        origen: p.naci || "",
        marca: p.marca || "",
        descripcion: p.descripcion || p.nombre || "",
        unidad: p.unidad || "",
        costo: p.precio_compra ?? p.costo ?? 0,
        saldo_temp: p.saldo_temp ?? 0,
        saldo_uio: p.saldo ?? 0,
        saldo_gye: p.saldobext ?? p.saldo_bext ?? 0,
        peso: p.peso ?? 0,
        medidas: p.medidas || "0"
    }));

    let csv = "CÓDIGO,ORI,MARCA,NOMBRE,UNI,COSTO,S.TEM,S.UIO,S.GYE,PESO,MEDIDAS\n";

    filas.forEach(f => {
        csv += `${f.codigo},${f.origen},${f.marca},${f.descripcion},${f.unidad},${f.costo},${f.saldo_temp},${f.saldo_uio},${f.saldo_gye},${f.peso},${f.medidas}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "compras_sucre.csv";
    a.click();
    URL.revokeObjectURL(url);
}

/* ============================
   EDICIÓN
   ============================ */
function editarProducto(codigo) {
    const p = productosData.find(x => x.codigo === codigo);
    if (!p) return;

    document.getElementById("editCodigo").value = p.codigo || "";
    document.getElementById("editMarca").value = p.marca || "";
    document.getElementById("editNaci").value = p.naci || "";
    document.getElementById("editDescripcion").value = p.descripcion || p.nombre || "";
    document.getElementById("editCosto").value = p.precio_compra ?? p.costo ?? 0;

    const modal = new bootstrap.Modal(document.getElementById("modalEditar"));
    modal.show();
}

async function guardarEdicionProducto() {
    const codigo = document.getElementById("editCodigo").value.trim();

    const cambios = {
        marca: document.getElementById("editMarca").value.trim(),
        naci: document.getElementById("editNaci").value.trim(),
        descripcion: document.getElementById("editDescripcion").value.trim(),
        precio_compra: parseFloat(document.getElementById("editCosto").value)
    };

    const { error } = await clientSupabase
        .from("productos")
        .update(cambios)
        .eq("codigo", codigo);

    if (error) {
        alert("Error al guardar cambios");
        console.error(error);
        return;
    }

    alert("Producto actualizado");
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditar"));
    if (modal) modal.hide();
    cargarDatosCompras();
}

/* ============================
   ELIMINACIÓN
   ============================ */
function eliminarProducto(codigo) {
    codigoAEliminar = codigo;
    document.getElementById("elimCodigo").textContent = codigo;
    const modal = new bootstrap.Modal(document.getElementById("modalEliminar"));
    modal.show();
}

async function confirmarEliminarProducto() {
    if (!codigoAEliminar) return;

    const { error } = await clientSupabase
        .from("productos")
        .delete()
        .eq("codigo", codigoAEliminar);

    if (error) {
        alert("Error al eliminar");
        console.error(error);
        return;
    }

    alert("Producto eliminado");
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEliminar"));
    if (modal) modal.hide();
    codigoAEliminar = null;
    cargarDatosCompras();
}
