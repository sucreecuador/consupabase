// Configuración de Supabase (ajustar con credenciales del proyecto)
const SUPABASE_URL = "https://tu-proyecto.supabase.co";
const SUPABASE_KEY = "tu-anon-key";
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Estado local para paginación y ordenamiento
let productosCompras = [];
let productosFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 15;
let ordenColumna = 'codigo';
let ordenAscendente = true;

document.addEventListener("DOMContentLoaded", () => {
    inicializarEventos();
    cargarDatosCompras();
});

function inicializarEventos() {
    // Alternar visibilidad de Sidebar
    const btnToggle = document.getElementById("btnToggleSidebar");
    if (btnToggle) {
        btnToggle.addEventListener("click", () => {
            const sidebar = document.getElementById("sidebar");
            sidebar.classList.toggle("d-none");
            btnToggle.textContent = sidebar.classList.contains("d-none") ? "Mostrar menú" : "Ocultar menú";
        });
    }

    // Buscadores
    document.getElementById("buscarNombre").addEventListener("input", aplicarFiltros);
    document.getElementById("buscarMarca").addEventListener("input", aplicarFiltros);
    document.getElementById("buscarCodigo").addEventListener("input", aplicarFiltros);
    document.getElementById("buscarGeneral").addEventListener("input", aplicarFiltros);

    // Botón Limpiar/Mostrar Todos
    document.getElementById("btnMostrarTodos").addEventListener("click", () => {
        document.getElementById("buscarNombre").value = "";
        document.getElementById("buscarMarca").value = "";
        document.getElementById("buscarCodigo").value = "";
        document.getElementById("buscarGeneral").value = "";
        aplicarFiltros();
    });

    // Paginación
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

    // Eventos de ordenamiento en headers
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

// Carga de Datos desde Supabase
async function cargarDatosCompras() {
    try {
        if (!supabase) {
            console.warn("Supabase no inicializado. Cargando datos de prueba.");
            productosCompras = obtenerDatosPrueba();
        } else {
            const { data, error } = await supabase.from('productos').select('*');
            if (error) throw error;
            productosCompras = data || [];
        }
        productosFiltrados = [...productosCompras];
        ordenarDatos();
        renderizarTabla();
    } catch (err) {
        console.error("Error al cargar datos de compras:", err);
    }
}

// Aplicación de Filtros Multicriterio
function aplicarFiltros() {
    const nom = document.getElementById("buscarNombre").value.toLowerCase();
    const mar = document.getElementById("buscarMarca").value.toLowerCase();
    const cod = document.getElementById("buscarCodigo").value.toLowerCase();
    const gen = document.getElementById("buscarGeneral").value.toLowerCase();

    productosFiltrados = productosCompras.filter(item => {
        const cumpleNom = !nom || (item.descripcion && item.descripcion.toLowerCase().includes(nom));
        const cumpleMar = !mar || (item.marca && item.marca.toLowerCase().includes(mar));
        const cumpleCod = !cod || (item.codigo && item.codigo.toLowerCase().includes(cod));
        
        const cumpleGen = !gen || (
            (item.codigo && item.codigo.toLowerCase().includes(gen)) ||
            (item.descripcion && item.descripcion.toLowerCase().includes(gen)) ||
            (item.marca && item.marca.toLowerCase().includes(gen)) ||
            (item.naci && item.naci.toLowerCase().includes(gen))
        );

        return cumpleNom && cumpleMar && cumpleCod && cumpleGen;
    });

    paginaActual = 1;
    ordenarDatos();
    renderizarTabla();
}

// Ordenamiento de Datos
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

// Renderizado de Filas
function renderizarTabla() {
    const tbody = document.getElementById("tbodyCompras");
    tbody.innerHTML = "";

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const paginaData = productosFiltrados.slice(inicio, fin);

    if (paginaData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center text-muted py-3">No se encontraron productos de compras.</td></tr>`;
        return;
    }

    paginaData.forEach(p => {
        const costo = parseFloat(p.costo_compra || p.precio_compra || 0).toFixed(2);
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${p.codigo || ''}</strong></td>
            <td>${p.naci || ''}</td>
            <td>${p.marca || ''}</td>
            <td>${p.descripcion || p.nombre || ''}</td>
            <td>${p.unidad || 'UNI'}</td>
            <td>$${costo}</td>
            <td>${p.saldo_temp || 0}</td>
            <td>${p.saldo || 0}</td>
            <td>${p.saldo_bext || 0}</td>
            <td>${p.peso || 0}</td>
            <td>${p.medidas || '-'}</td>
            <td class="text-center">
                <button class="action-btn me-1" onclick="editarProducto('${p.codigo}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn" onclick="eliminarProducto('${p.codigo}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("inputPagina").value = paginaActual;
}

// Funciones de Acción
function editarProducto(codigo) {
    console.log("Editar ítem compras:", codigo);
}

function eliminarProducto(codigo) {
    console.log("Eliminar ítem compras:", codigo);
}

// Dataset de Respaldo
function obtenerDatosPrueba() {
    return [
        { codigo: "ABR013", naci: "TWN", marca: "SH.MC", descripcion: "ABRAZADERA CUADRO MTB 34.9 MM C/BLOQ.", unidad: "UNI", costo_compra: 1.80, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR015", naci: "TWN", marca: "SHIMANO", descripcion: "ABRAZADERA P/REDUCIR PASACAT.34.9 A 31.8", unidad: "UNI", costo_compra: 0.60, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR019", naci: "TWN", marca: "ZOOMN", descripcion: "ABRAZADERA CUADRO BMX ALUMINIO 25.4 MM", unidad: "UNI", costo_compra: 0.55, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR022", naci: "TWN", marca: "EPOCH MAK", descripcion: "ABRAZADERA CUADRO MTB 34.9 MM ALUMINIO", unidad: "UNI", costo_compra: 2.20, saldo_temp: 0, saldo: 0, saldo_bext: 0, peso: 0, medidas: "0" }
    ];
}