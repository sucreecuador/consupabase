// ===============================
//  CONEXIÓN REAL A SUPABASE
// ===============================
let clientSupabase = null;

if (typeof supabase !== 'undefined' && supabase.createClient) {
    const SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts";

    clientSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ===============================
//  VARIABLES GLOBALES
// ===============================
let productosCompras = [];
let productosFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 15;
let ordenColumna = 'codigo';
let ordenAscendente = true;

// ===============================
//  INICIO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    inicializarEventos();
    cargarDatosCompras();
});

// ===============================
//  EVENTOS
// ===============================
function inicializarEventos() {

    const btnToggle = document.getElementById("btnToggleSidebar");
    if (btnToggle) {
        btnToggle.addEventListener("click", () => {
            const sidebar = document.getElementById("sidebar");
            sidebar.classList.toggle("d-none");
            btnToggle.textContent = sidebar.classList.contains("d-none")
                ? "Mostrar menú"
                : "Ocultar menú";
        });
    }

    document.getElementById("buscarNombre").addEventListener("input", aplicarFiltros);
    document.getElementById("buscarMarca").addEventListener("input", aplicarFiltros);
    document.getElementById("buscarCodigo").addEventListener("input", aplicarFiltros);
    document.getElementById("buscarGeneral").addEventListener("input", aplicarFiltros);

    document.getElementById("btnMostrarTodos").addEventListener("click", () => {
        document.getElementById("buscarNombre").value = "";
        document.getElementById("buscarMarca").value = "";
        document.getElementById("buscarCodigo").value = "";
        document.getElementById("buscarGeneral").value = "";
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
        const inputPag = parseInt(document.getElementById("inputPagina").value);
        const totalPaginas = Math.ceil(productosFiltrados.length / registrosPorPagina);
        if (inputPag >= 1 && inputPag <= totalPaginas) {
            paginaActual = inputPag;
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
            ordenarDatos();
            renderizarTabla();
        });
    });
}

// ===============================
//  CARGA DE DATOS DESDE SUPABASE
// ===============================
async function cargarDatosCompras() {
    let datosCargados = false;

    if (clientSupabase) {
        try {
            const { data, error } = await clientSupabase
                .from('productos')
                .select('*');

            if (!error && data && data.length > 0) {
                productosCompras = data;
                datosCargados = true;
            }
        } catch (e) {
            console.warn("Error consultando Supabase, usando datos de prueba", e);
        }
    }

    if (!datosCargados) {
        productosCompras = obtenerDatosPrueba();
    }

    productosFiltrados = [...productosCompras];
    ordenarDatos();
    renderizarTabla();
}

// ===============================
//  FILTROS
// ===============================
function aplicarFiltros() {
    const nom = document.getElementById("buscarNombre").value.toLowerCase().trim();
    const mar = document.getElementById("buscarMarca").value.toLowerCase().trim();
    const cod = document.getElementById("buscarCodigo").value.toLowerCase().trim();
    const gen = document.getElementById("buscarGeneral").value.toLowerCase().trim();

    productosFiltrados = productosCompras.filter(item => {
        const desc = (item.descripcion || item.nombre || "").toLowerCase();
        const marca = (item.marca || "").toLowerCase();
        const codigo = (item.codigo || "").toLowerCase();
        const naci = (item.naci || "").toLowerCase();

        const cumpleNom = !nom || desc.includes(nom);
        const cumpleMar = !mar || marca.includes(mar);
        const cumpleCod = !cod || codigo.includes(cod);

        const cumpleGen = !gen || (
            codigo.includes(gen) ||
            desc.includes(gen) ||
            marca.includes(gen) ||
            naci.includes(gen)
        );

        return cumpleNom && cumpleMar && cumpleCod && cumpleGen;
    });

    paginaActual = 1;
    ordenarDatos();
    renderizarTabla();
}

// ===============================
//  ORDENAMIENTO
// ===============================
function ordenarDatos() {
    productosFiltrados.sort((a, b) => {
        let valA = a[ordenColumna] ?? '';
        let valB = b[ordenColumna] ?? '';

        if (typeof valA === 'number' && typeof valB === 'number') {
            return ordenAscendente ? valA - valB : valB - valA;
        }

        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();

        if (valA < valB) return ordenAscendente ? -1 : 1;
        if (valA > valB) return ordenAscendente ? 1 : -1;
        return 0;
    });
}

// ===============================
//  TABLA
// ===============================
function renderizarTabla() {
    const tbody = document.getElementById("tbodyCompras");
    tbody.innerHTML = "";

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const paginaData = productosFiltrados.slice(inicio, fin);

    if (paginaData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center text-muted py-4">No se encontraron productos registrados.</td></tr>`;
        return;
    }

    paginaData.forEach(p => {
        const costoVal = p.costo_compra ?? p.costo ?? p.precio_venta ?? 0;
        const costoFormateado = parseFloat(costoVal).toFixed(2);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${p.codigo || ''}</strong></td>
            <td>${p.naci || 'TWN'}</td>
            <td>${p.marca || ''}</td>
            <td>${p.descripcion || p.nombre || ''}</td>
            <td>${p.unidad || 'UNI'}</td>
            <td>${costoFormateado}</td>
            <td>${p.saldo_temp || 0}</td>
            <td>${p.saldo || 0}</td>
            <td>${p.saldo_bext || 0}</td>
            <td>${p.peso || 0}</td>
            <td>${p.medidas || '0'}</td>
            <td class="text-center">
                <button class="action-btn me-1" onclick="editarProducto('${p.codigo}')"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn" onclick="eliminarProducto('${p.codigo}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("inputPagina").value = paginaActual;
}

// ===============================
//  EXPORTAR A EXCEL
// ===============================
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
        saldo_gye: p.saldo_bext ?? 0,
        peso: p.peso ?? 0,
        medidas: p.medidas || ""
    }));

    let csv = "CÓDIGO,ORI,MARCA,NOMBRE,UNI,COSTO,S.TEM,S.UIO,S.GYE,PESO,MEDIDAS\n";

    filas.forEach(f => {
        const codigo = `"${String(f.codigo).replace(/"/g, '""')}"`;
        const origen = `"${String(f.origen).replace(/"/g, '""')}"`;
        const marca = `"${String(f.marca).replace(/"/g, '""')}"`;
        const descripcion = `"${String(f.descripcion).replace(/"/g, '""')}"`;
        const unidad = `"${String(f.unidad).replace(/"/g, '""')}"`;
        const costo = f.costo;
        const saldo_temp = f.saldo_temp;
        const saldo_uio = f.saldo_uio;
        const saldo_gye = f.saldo_gye;
        const peso = f.peso;
        const medidas = `"${String(f.medidas).replace(/"/g, '""')}"`;

        csv += [
            codigo, origen, marca, descripcion, unidad,
            costo, saldo_temp, saldo_uio, saldo_gye, peso, medidas
        ].join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "compras_sucre.csv";
    a.click();
    URL.revokeObjectURL(url);
}

// ===============================
//  EDITAR / ELIMINAR
// ===============================
function editarProducto(codigo) {
    console.log("Editar ítem compras:", codigo);
}

function eliminarProducto(codigo) {
    console.log("Eliminar ítem compras:", codigo);
}

// ===============================
//  DATOS DE PRUEBA
// ===============================
function obtenerDatosPrueba() {
    return [
        { codigo: "ABR013", naci: "TWN", marca: "SH.MC", descripcion: "ABRAZADERA CUADRO MTB 34.9 MM C/BLOQ.", unidad: "UNI", costo_compra: 3.00, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR015", naci: "TWN", marca: "SHIMANO", descripcion: "ABRAZADERA P/REDUCIR PASACAT.34.9 A 31.8", unidad: "UNI", costo_compra: 1.00, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR019", naci: "TWN", marca: "ZOOMN", descripcion: "ABRAZADERA CUADRO BMX ALUMINIO 25.4 MM", unidad: "UNI", costo_compra: 1.00, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR022", naci: "TWN", marca: "EPOCH MAK", descripcion: "ABRAZADERA CUADRO MTB 34.9 MM ALUMINIO", unidad: "UNI", costo_compra: 4.00, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR024", naci: "TWN", marca: "ZOOM", descripcion: "ABRAZADERA CUADRO MTB 31.8 MM ALUMINIO", unidad: "UNI", costo_compra: 3.00, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR029", naci: "TWN", marca: "ZOOM", descripcion: "ABRAZADERA CUADRO MTB 34.9 MM C/BLOQ.", unidad: "UNI", costo_compra: 3.00, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR030", naci: "TWN", marca: "SH.MC", descripcion: "ABRAZADERA CABLE UNIV.PLAST.150mm", unidad: "UNI", costo_compra: 0.00, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR032", naci: "TWN", marca: "CYCLERS", descripcion: "ABRAZADERA VELCRO MANGUERA CAMELBAG", unidad: "UNI", costo_compra: 1.00, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" }
    ];
}
