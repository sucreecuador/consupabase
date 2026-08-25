let todosLosProductos = [];
let productosFiltrados = [];
let vistaActiva = 'ventas';
let paginaActual = 1;
const REGISTROS_POR_PAGINA = 50;

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});

function getProp(obj, ...keys) {
    if (!obj) return '';
    for (let k of keys) {
        if (obj[k] !== undefined && obj[k] !== null) return obj[k];
        const lowerKey = k.toLowerCase();
        const found = Object.keys(obj).find(key => key.toLowerCase() === lowerKey);
        if (found && obj[found] !== undefined && obj[found] !== null) return obj[found];
    }
    return '';
}

async function cargarProductos() {
    const tbody = document.querySelector("#tablaProductos tbody");
    tbody.innerHTML = `<tr><td colspan="11" class="status-msg" style="color:#64748b;">Cargando productos...</td></tr>`;

    try {
        // Apunta directamente al puerto/host base evitando rutas relativas de /web/
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/productos?tipo=${vistaActiva}`);

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            todosLosProductos = data;
        } else if (data && Array.isArray(data.datos)) {
            todosLosProductos = data.datos;
        } else if (data && Array.isArray(data.data)) {
            todosLosProductos = data.data;
        } else {
            todosLosProductos = [];
        }

        productosFiltrados = [...todosLosProductos];
        paginaActual = 1;
        renderizarTabla();
    } catch (error) {
        console.error("Error al obtener datos:", error);
        tbody.innerHTML = `<tr><td colspan="11" class="status-msg">Error al obtener datos del servidor.</td></tr>`;
        document.getElementById("infoPagina").innerText = "Mostrando 0-0 de 0";
    }
}

function renderizarTabla() {
    const tbody = document.querySelector("#tablaProductos tbody");
    const total = productosFiltrados.length;

    if (total === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="status-msg" style="color:#64748b;">No hay productos registrados.</td></tr>`;
        document.getElementById("infoPagina").innerText = "Mostrando 0-0 de 0";
        document.getElementById("btnPrev").disabled = true;
        document.getElementById("btnNext").disabled = true;
        return;
    }

    const totalPaginas = Math.ceil(total / REGISTROS_POR_PAGINA) || 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    if (paginaActual < 1) paginaActual = 1;

    const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
    const fin = Math.min(inicio + REGISTROS_POR_PAGINA, total);
    const paginados = productosFiltrados.slice(inicio, fin);

    tbody.innerHTML = "";

    paginados.forEach(p => {
        const tr = document.createElement("tr");
        const cod = getProp(p, 'CODIGO', 'codigo', 'cod_producto', 'id');
        const codProv = getProp(p, 'COD_PROV', 'cod_prov') || '-';
        const pro1 = getProp(p, 'PRO1', 'pro1') || '-';
        const pro2 = getProp(p, 'PRO2', 'pro2') || '-';
        const pro3 = getProp(p, 'PRO3', 'pro3') || '-';
        const marca = getProp(p, 'MARCA', 'marca') || '-';
        const descripcion = getProp(p, 'DESCRIPCION', 'descripcion', 'nombre') || '-';
        const stem = getProp(p, 'STEM', 'stem', 'stock') || 0;
        const costo = Number(getProp(p, 'COSTO', 'costo') || 0).toFixed(2);
        const pventa = Number(getProp(p, 'PVENTA', 'pventa', 'precio') || 0).toFixed(2);

        tr.innerHTML = `
            <td>${pro1}</td>
            <td>${pro2}</td>
            <td>${pro3}</td>
            <td>${codProv}</td>
            <td><strong>${cod || '-'}</strong></td>
            <td>${marca}</td>
            <td>${descripcion}</td>
            <td>${stem}</td>
            <td>$${costo}</td>
            <td>$${pventa}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-action btn-edit" title="Editar" onclick="abrirEdicion('${cod}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarProducto('${cod}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("infoPagina").innerText = `Mostrando ${inicio + 1}-${fin} de ${total} (Página ${paginaActual} de ${totalPaginas})`;
    document.getElementById("btnPrev").disabled = paginaActual === 1;
    document.getElementById("btnNext").disabled = paginaActual >= totalPaginas;
}

function ejecutarBusqueda() {
    const texto = document.getElementById("searchInput").value.toLowerCase().trim();
    const campo = document.getElementById("searchField").value;

    if (!texto) {
        productosFiltrados = [...todosLosProductos];
    } else {
        productosFiltrados = todosLosProductos.filter(p => {
            const val = String(getProp(p, campo, campo.toUpperCase()) || getProp(p, 'DESCRIPCION', 'CODIGO')).toLowerCase();
            return val.includes(texto);
        });
    }
    paginaActual = 1;
    renderizarTabla();
}

function mostrarTodos() {
    document.getElementById("searchInput").value = "";
    productosFiltrados = [...todosLosProductos];
    paginaActual = 1;
    renderizarTabla();
}

function cambiarVista(vista) {
    if (vistaActiva === vista) return;
    vistaActiva = vista;
    document.getElementById("tabVentas").classList.toggle("active", vista === 'ventas');
    document.getElementById("tabCompras").classList.toggle("active", vista === 'compras');
    cargarProductos();
}

function cambiarPagina(delta) {
    paginaActual += delta;
    renderizarTabla();
}

function irAPaginaEspecifica() {
    const input = document.getElementById("gotoPageInput");
    const num = parseInt(input.value, 10);
    const totalPaginas = Math.ceil(productosFiltrados.length / REGISTROS_POR_PAGINA) || 1;
    if (isNaN(num) || num < 1 || num > totalPaginas) return alert("Número de página inválido.");
    paginaActual = num;
    renderizarTabla();
}