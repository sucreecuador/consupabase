const ejemploProductos = [
  {
    codigo: "BDO001",
    ori: "COL",
    marca: "HABY",
    nombre: "BABY DOLL COPA TRIANGULAR, SIN ARO CARGA",
    uni: "UNI",
    pvp: 26.0,
    stock_tem: 0,
    stock_uio: 0,
    stock_gye: 0,
    peso: 0,
    medidas: "www.haby.com.co",
    creado_en: null
  },
  {
    codigo: "AUD001",
    ori: "CHP",
    marca: "SH.MC",
    nombre: "AUDIFONO GOTA BLUETOOTH",
    uni: "UNI",
    pvp: 6.0,
    stock_tem: 4,
    stock_uio: 2,
    stock_gye: 2,
    peso: 0.01,
    medidas: "importadorasucre",
    creado_en: null
  },
  {
    codigo: "ASC001",
    ori: "CHP",
    marca: "XINDA",
    nombre: "ASCENDEDOR PARA ESCALADA",
    uni: "UNI",
    pvp: 76.0,
    stock_tem: 0,
    stock_uio: 1,
    stock_gye: 0,
    peso: 0.19,
    medidas: "20 X 9 X 2 cm",
    creado_en: null
  },
  {
    codigo: "ARO149",
    ori: "CHP",
    marca: "ALEX RIM",
    nombre: "ARO SOLO 26 X 1.75 ALUM 36H.D/C NEGRO",
    uni: "UNI",
    pvp: 20.0,
    stock_tem: 0,
    stock_uio: 0,
    stock_gye: 0,
    peso: 0,
    medidas: "0",
    creado_en: null
  }
];

let productosVentas = [];
let sortState = { key: null, direction: 'asc' };
let filtroStockActual = "todos";

function calcularStockTotal(p) {
    return (p.stock_tem || 0) + (p.stock_uio || 0) + (p.stock_gye || 0);
}

// Carga de datos unificada (Local + Fallback API Supabase)
async function cargarProductos() {
    try {
        const res = await fetch('/api/productos');
        if (res.ok) {
            const dataApi = await res.json();
            if (Array.isArray(dataApi) && dataApi.length > 0) {
                // Mapeo del schema de la base de datos al schema de la interfaz
                productosVentas = dataApi.map(item => ({
                    codigo: item.codigo,
                    marca: item.marca || "",
                    nombre: item.descripcion || "",
                    pvp: item.pventa || 0,
                    stock_tem: item.stem || 0,
                    stock_uio: 0,
                    stock_gye: 0,
                    peso: 0,
                    medidas: "",
                    creado_en: null
                }));
            } else {
                productosVentas = [...ejemploProductos];
            }
        } else {
            productosVentas = [...ejemploProductos];
        }
    } catch (err) {
        productosVentas = [...ejemploProductos];
    }
    procesarYRenderizar();
}

function renderTablaVentas(data) {
    const tbody = document.getElementById("tbodyVentas");
    tbody.innerHTML = "";

    data.forEach(p => {
        const stockTotal = calcularStockTotal(p);
        const stockClass = stockTotal > 0 ? "stock-total-ok" : "stock-total-zero";

        tbody.innerHTML += `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.marca}</td>
                <td>${p.nombre}</td>
                <td><span class="text-success fw-semibold">$${p.pvp.toFixed(2)}</span></td>
                <td>
                    <span class="stock-total-badge ${stockClass}">
                        ${stockTotal}
                    </span>
                </td>
                <td>
                    <span class="stock-location-badge">UIO: ${p.stock_uio}</span>
                </td>
                <td>
                    <span class="stock-location-badge">GYE: ${p.stock_gye}</span>
                </td>
                <td>${p.peso}</td>
                <td>${p.medidas}</td>
                <td class="erp-actions">
                    <button class="btn btn-sm btn-outline-info">👁️</button>
                    <button class="btn btn-sm btn-outline-warning">✏️</button>
                    <button class="btn btn-sm btn-outline-danger">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// Función de ordenamiento
function ordenarColeccion(arr, key, direction) {
    return [...arr].sort((a, b) => {
        let valA = key === 'stock_total' ? calcularStockTotal(a) : a[key];
        let valB = key === 'stock_total' ? calcularStockTotal(b) : b[key];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

function actualizarIndicadoresOrdenamiento() {
    document.querySelectorAll('#tablaVentas th.sortable').forEach(th => {
        const colKey = th.getAttribute('data-sort');
        const iconSpan = th.querySelector('.sort-icon');
        
        if (colKey === sortState.key) {
            th.classList.add('active');
            iconSpan.textContent = sortState.direction === 'asc' ? '↑' : '↓';
        } else {
            th.classList.remove('active');
            iconSpan.textContent = '↕';
        }
    });
}

function procesarYRenderizar() {
    const texto = (document.getElementById("buscarGlobal")?.value || "").toLowerCase();

    // 1. Filtrar
    let resultado = productosVentas.filter(p => {
        const matchTexto =
            p.codigo.toLowerCase().includes(texto) ||
            p.marca.toLowerCase().includes(texto) ||
            p.nombre.toLowerCase().includes(texto);

        const stockTotal = calcularStockTotal(p);

        if (filtroStockActual === "con-stock") return matchTexto && stockTotal > 0;
        if (filtroStockActual === "sin-stock") return matchTexto && stockTotal === 0;
        return matchTexto;
    });

    // 2. Ordenar
    if (sortState.key) {
        resultado = ordenarColeccion(resultado, sortState.key, sortState.direction);
    }

    // 3. Renderizar y actualizar iconos
    renderTablaVentas(resultado);
    actualizarIndicadoresOrdenamiento();
}

// Gestión del menú lateral y LocalStorage
function initSidebarToggle() {
    const btnToggleMenu = document.getElementById("btnToggleMenu");
    const sidebar = document.getElementById("sidebar");

    // Aplicar estado guardado
    const savedState = localStorage.getItem("sidebarState");
    if (savedState === "collapsed") {
        sidebar.classList.add("collapsed");
    }

    btnToggleMenu.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        const isCollapsed = sidebar.classList.contains("collapsed");
        localStorage.setItem("sidebarState", isCollapsed ? "collapsed" : "expanded");
    });
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    initSidebarToggle();
    cargarProductos();

    const buscarGlobal = document.getElementById("buscarGlobal");
    const filtroButtons = document.querySelectorAll(".erp-search-filters button");

    buscarGlobal.addEventListener("input", () => {
        procesarYRenderizar();
    });

    filtroButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filtroButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filtroStockActual = btn.getAttribute("data-filter");
            procesarYRenderizar();
        });
    });

    // Evento delegatorio para ordenamiento
    document.querySelectorAll('#tablaVentas th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const columnKey = th.getAttribute('data-sort');
            if (sortState.key === columnKey) {
                sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.key = columnKey;
                sortState.direction = 'asc';
            }
            procesarYRenderizar();
        });
    });
});