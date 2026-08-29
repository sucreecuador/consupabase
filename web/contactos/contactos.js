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
let contactosFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 15;
let totalRegistros = 0;
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

    // Toggle Sidebar (Ocultar / Mostrar menú)
    const btnToggle = document.getElementById("btnToggleSidebar");
    const sidebar = document.getElementById("sidebar");

    if (btnToggle && sidebar) {
        btnToggle.addEventListener("click", () => {
            sidebar.classList.toggle("d-none");
            btnToggle.textContent = sidebar.classList.contains("d-none")
                ? "Mostrar menú"
                : "Ocultar menú";
        });
    }

    // Filtros de búsqueda
    const filtros = ["buscarNombre", "buscarCedula", "buscarCodigo", "buscarGeneral"];
    filtros.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener("input", () => {
                paginaActual = 1;
                cargarPagina();
            });
        }
    });

    // Botón Mostrar Todos
    const btnMostrarTodos = document.getElementById("btnMostrarTodos");
    if (btnMostrarTodos) {
        btnMostrarTodos.addEventListener("click", () => {
            filtros.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = "";
            });
            paginaActual = 1;
            cargarPagina();
        });
    }

    // Paginación
    const btnAnterior = document.getElementById("btnAnterior");
    if (btnAnterior) {
        btnAnterior.addEventListener("click", () => {
            if (paginaActual > 1) {
                paginaActual--;
                cargarPagina();
            }
        });
    }

    const btnSiguiente = document.getElementById("btnSiguiente");
    if (btnSiguiente) {
        btnSiguiente.addEventListener("click", () => {
            if ((paginaActual * registrosPorPagina) < totalRegistros) {
                paginaActual++;
                cargarPagina();
            }
        });
    }

    const btnIrPagina = document.getElementById("btnIrPagina");
    if (btnIrPagina) {
        btnIrPagina.addEventListener("click", () => {
            const inputPagina = document.getElementById("inputPagina");
            if (inputPagina) {
                const pag = parseInt(inputPagina.value);
                if (pag >= 1) {
                    paginaActual = pag;
                    cargarPagina();
                }
            }
        });
    }

    // Ordenamiento de columnas
    const headers = document.querySelectorAll("#tablaContactos thead th[data-column]");
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
    if (!clientSupabase) {
        console.error("Cliente de Supabase no inicializado.");
        return;
    }

    const nomInput = document.getElementById("buscarNombre");
    const cedInput = document.getElementById("buscarCedula");
    const codInput = document.getElementById("buscarCodigo");
    const genInput = document.getElementById("buscarGeneral");

    const nom = nomInput ? nomInput.value.trim() : "";
    const ced = cedInput ? cedInput.value.trim() : "";
    const cod = codInput ? codInput.value.trim() : "";
    const gen = genInput ? genInput.value.trim() : "";

    let query = clientSupabase
        .from("contactos")
        .select("*", { count: "exact" })
        .order(ordenColumna, { ascending: ordenAscendente })
        .range(
            (paginaActual - 1) * registrosPorPagina,
            paginaActual * registrosPorPagina - 1
        );

    if (nom !== "") query = query.ilike("nombre", `%${nom}%`);
    if (ced !== "") query = query.or(`cedula_ruc.ilike.%${ced}%,ruc.ilike.%${ced}%`);
    if (cod !== "") query = query.ilike("codigo", `%${cod}%`);

    // FIX: Búsqueda general incluyendo cédula y ruc
    if (gen !== "") {
        query = query.or(
            `codigo.ilike.%${gen}%,nombre.ilike.%${gen}%,cedula_ruc.ilike.%${gen}%,ruc.ilike.%${gen}%,telefono.ilike.%${gen}%`
        );
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("Error cargando contactos:", error);
        return;
    }

    contactosFiltrados = data || [];
    totalRegistros = count || 0;
    
    renderizarTabla();
    actualizarInfoPaginacion();

    const inputPagina = document.getElementById("inputPagina");
    if (inputPagina) {
        inputPagina.value = paginaActual;
    }
}

// ===============================
//  TABLA
// ===============================
function renderizarTabla() {
    const tbody = document.getElementById("tbodyContactos");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!contactosFiltrados || contactosFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No se encontraron contactos.</td></tr>`;
        return;
    }

    contactosFiltrados.forEach(c => {
        const identificacion = c.cedula_ruc || c.ruc || c.cedula || "-";
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${c.codigo || ''}</strong></td>
            <td>${c.cat || c.categoria || 'E'}</td>
            <td><strong>${c.nombre || c.razon_social || ''}</strong></td>
            <td>${c.telefono || '-'}</td>
            <td>${identificacion}</td>
            <td>${c.banco || '-'}</td>
            <td>${c.transporte || '-'}</td>
            <td class="text-center">
                <button class="action-btn me-1" onclick="editarContacto('${c.codigo}')"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn" onclick="eliminarContacto('${c.codigo}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarInfoPaginacion() {
    const infoPaginacion = document.getElementById("infoPaginacion");
    if (!infoPaginacion) return;

    const desde = totalRegistros === 0 ? 0 : (paginaActual - 1) * registrosPorPagina + 1;
    const hasta = Math.min(paginaActual * registrosPorPagina, totalRegistros);
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina) || 1;

    infoPaginacion.textContent = `Mostrando ${desde}-${hasta} de ${totalRegistros} registros (Página ${paginaActual} de ${totalPaginas})`;
}

// ===============================
//  EDITAR / ELIMINAR
// ===============================
function editarContacto(codigo) {
    console.log("Editar contacto:", codigo);
}

function eliminarContacto(codigo) {
    console.log("Eliminar contacto:", codigo);
}