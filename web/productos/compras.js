let clientSupabase = null;
if (typeof supabase !== 'undefined' && supabase.createClient) {
    const SUPABASE_URL = "https://tu-proyecto.supabase.co"; 
    const SUPABASE_KEY = "tu-anon-key";
    clientSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

let productosData = [];
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
    const btnToggle = document.getElementById("btnToggleSidebar");
    if (btnToggle) {
        btnToggle.addEventListener("click", () => {
            const sidebar = document.getElementById("sidebar");
            sidebar.classList.toggle("d-none");
            btnToggle.textContent = sidebar.classList.contains("d-none") ? "Mostrar menú" : "Ocultar menú";
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

            headers.forEach(h => {
                const icon = h.querySelector(".sort-icon");
                if (icon) icon.textContent = "↕";
            });

            const currentIcon = header.querySelector(".sort-icon");
            if (currentIcon) {
                currentIcon.textContent = ordenAscendente ? "▲" : "▼";
            }

            // Ordena la BD completa y vuelve a filtrar/renderizar desde la página 1
            ordenarDatosGlobales();
            aplicarFiltros();
        });
    });
}

async function cargarDatosCompras() {
    let datosCargados = false;

    if (clientSupabase) {
        try {
            // Se elimina el límite predeterminado pidiendo hasta 100,000 registros de la BD
            const { data, error } = await clientSupabase
                .from('productos')
                .select('*')
                .range(0, 99999);

            if (!error && data && data.length > 0) {
                productosData = data;
                datosCargados = true;
            }
        } catch (e) {
            console.warn("Fallo al consultar Supabase, utilizando dataset de respaldo", e);
        }
    }

    if (!datosCargados) {
        productosData = obtenerDatosPrueba();
    }

    ordenarDatosGlobales();
    aplicarFiltros();
}

function obtenerValorCampo(obj, col) {
    switch (col) {
        case 'codigo':
            return obj.codigo ?? '';
        case 'naci':
            return obj.naci ?? '';
        case 'marca':
            return obj.marca ?? '';
        case 'descripcion':
            return obj.descripcion ?? obj.nombre ?? '';
        case 'unidad':
            return obj.unidad ?? '';
        case 'precio_compra':
            return obj.precio_compra ?? obj.costo ?? 0;
        case 'precio_venta':
            return obj.precio_venta ?? obj.pvp ?? 0;
        case 'saldo_temp':
            return obj.saldo_temp ?? 0;
        case 'saldo':
            return obj.saldo ?? 0;
        case 'saldobext':
            return obj.saldobext ?? obj.saldo_bext ?? 0;
        case 'peso':
            return obj.peso ?? 0;
        case 'medidas':
            return obj.medidas ?? '0';
        default:
            return obj[col] ?? '';
    }
}

function ordenarDatosGlobales() {
    productosData.sort((a, b) => {
        let valA = obtenerValorCampo(a, ordenColumna);
        let valB = obtenerValorCampo(b, ordenColumna);

        const numA = Number(valA);
        const numB = Number(valB);

        // Si ambos valores son numéricos
        if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '' && typeof valA !== 'boolean' && typeof valB !== 'boolean') {
            return ordenAscendente ? numA - numB : numB - numA;
        }

        // Si son cadenas de texto (Orden Alpha Natural)
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();

        return ordenAscendente 
            ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
            : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
    });
}

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
        
        const cumpleGen = !gen || (
            codigo.includes(gen) ||
            desc.includes(gen) ||
            marca.includes(gen) ||
            naci.includes(gen)
        );

        return cumpleNom && cumpleMar && cumpleCod && cumpleGen;
    });

    paginaActual = 1;
    renderizarTabla();
}

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
        const costoVal = p.precio_compra ?? p.costo ?? 0;
        const costoFormateado = parseFloat(costoVal).toFixed(2);
        const sGye = p.saldobext ?? p.saldo_bext ?? 0;
        
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
            <td>${sGye}</td>
            <td>${p.peso || 0}</td>
            <td>${p.medidas || '0'}</td>
            <td class="text-center">
                <button class="action-btn me-1" onclick="editarProducto('${p.codigo}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn" onclick="eliminarProducto('${p.codigo}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("inputPagina").value = paginaActual;
}

function editarProducto(codigo) {
    console.log("Editar ítem compras:", codigo);
}

function eliminarProducto(codigo) {
    console.log("Eliminar ítem compras:", codigo);
}

function obtenerDatosPrueba() {
    return [
        { codigo: "ABR013", naci: "TWN", marca: "SH.MC", descripcion: "ABRAZADERA CUADRO MTB 34.9 MM C/BLOQ.", unidad: "UNI", precio_compra: 3.00, precio_venta: 5.00, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR015", naci: "TWN", marca: "SHIMANO", descripcion: "ABRAZADERA P/REDUCIR PASACAT.34.9 A 31.8", unidad: "UNI", precio_compra: 1.00, precio_venta: 2.00, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR019", naci: "TWN", marca: "ZOOMN", descripcion: "ABRAZADERA CUADRO BMX ALUMINIO 25.4 MM", unidad: "UNI", precio_compra: 1.00, precio_venta: 2.50, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR022", naci: "TWN", marca: "EPOCH MAK", descripcion: "ABRAZADERA CUADRO MTB 34.9 MM ALUMINIO", unidad: "UNI", precio_compra: 4.00, precio_venta: 7.00, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR024", naci: "TWN", marca: "ZOOM", descripcion: "ABRAZADERA CUADRO MTB 31.8 MM ALUMINIO", unidad: "UNI", precio_compra: 3.00, precio_venta: 6.00, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR029", naci: "TWN", marca: "ZOOM", descripcion: "ABRAZADERA CUADRO MTB 34.9 MM C/BLOQ.", unidad: "UNI", precio_compra: 3.00, precio_venta: 5.50, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR030", naci: "TWN", marca: "SH.MC", descripcion: "ABRAZADERA CABLE UNIV.PLAST.150mm", unidad: "UNI", precio_compra: 0.00, precio_venta: 0.50, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" },
        { codigo: "ABR032", naci: "TWN", marca: "CYCLERS", descripcion: "ABRAZADERA VELCRO MANGUERA CAMELBAG", unidad: "UNI", precio_compra: 1.00, precio_venta: 2.00, saldo_temp: 0, saldo: 0, saldobext: 0, peso: 0, medidas: "0" }
    ];
}