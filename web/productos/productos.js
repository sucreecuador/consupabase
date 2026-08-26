// ===============================
//  CONEXIÓN REAL A SUPABASE (PRO)
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
let productosFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 15;
let ordenColumna = "codigo";
let ordenAscendente = true;

// ===============================
//  INICIO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    inicializarEventos();
    cargarPagina();
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

    const filtros = ["buscarNombre", "buscarMarca", "buscarCodigo", "buscarGeneral"];
    filtros.forEach(id => {
        document.getElementById(id).addEventListener("input", () => {
            paginaActual = 1;
            cargarPagina();
        });
    });

    document.getElementById("btnMostrarTodos").addEventListener("click", () => {
        filtros.forEach(id => document.getElementById(id).value = "");
        paginaActual = 1;
        cargarPagina();
    });

    document.getElementById("btnAnterior").addEventListener("click", () => {
        if (paginaActual > 1) {
            paginaActual--;
            cargarPagina();
        }
    });

    document.getElementById("btnSiguiente").addEventListener("click", () => {
        paginaActual++;
        cargarPagina();
    });

    document.getElementById("btnIrPagina").addEventListener("click", () => {
        const pag = parseInt(document.getElementById("inputPagina").value);
        if (pag >= 1) {
            paginaActual = pag;
            cargarPagina();
        }
    });

    const headers = document.querySelectorAll("#tablaProductosVentas thead th[data-column]");
    headers.forEach(header => {
        header.addEventListener("click", () => {
            const columna = header.getAttribute("data-column");

            if (ordenColumna === columna) {
                ordenAscendente = !ordenAscendente;
            } else {
                ordenColumna = columna;
                ordenAscendente = true;
            }

            paginaActual = 1;
            cargarPagina();
        });
    });
}

// ===============================
//  CONSULTA PRO A SUPABASE
// ===============================
async function cargarPagina() {

    const nom = document.getElementById("buscarNombre").value.trim();
    const mar = document.getElementById("buscarMarca").value.trim();
    const cod = document.getElementById("buscarCodigo").value.trim();
    const gen = document.getElementById("buscarGeneral").value.trim();

    let query = clientSupabase
        .from("productos")
        .select("*", { count: "exact" })
        .order(ordenColumna, { ascending: ordenAscendente })
        .range(
            (paginaActual - 1) * registrosPorPagina,
            paginaActual * registrosPorPagina - 1
        );

    if (nom !== "") query = query.ilike("descripcion", `%${nom}%`);
    if (mar !== "") query = query.ilike("marca", `%${mar}%`);
    if (cod !== "") query = query.ilike("codigo", `%${cod}%`);

    if (gen !== "") {
        query = query.or(
            `codigo.ilike.%${gen}%,descripcion.ilike.%${gen}%,marca.ilike.%${gen}%,naci.ilike.%${gen}%`
        );
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("Error cargando productos:", error);
        return;
    }

    productosFiltrados = data;
    renderizarTabla();

    document.getElementById("inputPagina").value = paginaActual;
}

// ===============================
//  TABLA
// ===============================
function renderizarTabla() {
    const tbody = document.getElementById("tbodyVentas");
    tbody.innerHTML = "";

    if (!productosFiltrados || productosFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center text-muted py-4">No se encontraron productos.</td></tr>`;
        return;
    }

    productosFiltrados.forEach(p => {
        const precioVal = p.precio_venta ?? p.pvp ?? 0;
        const pvpFormateado = parseFloat(precioVal).toFixed(2);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${p.codigo || ''}</strong></td>
            <td>${p.naci || 'TWN'}</td>
            <td>${p.marca || ''}</td>
            <td>${p.descripcion || p.nombre || ''}</td>
            <td>${p.unidad || 'UNI'}</td>
            <td>${pvpFormateado}</td>
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
}

// ===============================
//  EDITAR / ELIMINAR
// ===============================
function editarProducto(codigo) {
    console.log("Editar ítem ventas:", codigo);
}

function eliminarProducto(codigo) {
    console.log("Eliminar ítem ventas:", codigo);
}
