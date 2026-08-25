let todosLosProductos = [];
let productosFiltrados = [];
let vistaActiva = 'ventas';

let paginaActual = 1;
const REGISTROS_POR_PAGINA = 50;

let columnaOrden = '';
let ordenAscendente = true;

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});

// Función auxiliar para leer llaves insensibles a mayúsculas/minúsculas o nombres alternativos
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
        // Se usa la ruta absoluta desde la raíz para evitar el error de subcarpeta /web/productos/
        const endpoint = `${window.location.origin}/api/productos?tipo=${vistaActiva}`;
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error("Error en la respuesta del servidor (Status " + response.status + ")");
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
        console.error("Error al cargar productos:", error);
        tbody.innerHTML = `<tr><td colspan="11" class="status-msg">Error al obtener datos del servidor.</td></tr>`;
        document.getElementById("infoPagina").innerText = "Mostrando 0-0 de 0";
    }
}

function cambiarVista(vista) {
    if (vistaActiva === vista) return;
    vistaActiva = vista;

    document.getElementById("tabVentas").classList.toggle("active", vista === 'ventas');
    document.getElementById("tabCompras").classList.toggle("active", vista === 'compras');

    cargarProductos();
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
        const codProv = getProp(p, 'COD_PROV', 'cod_prov', 'codigo_proveedor') || '-';
        const pro1 = getProp(p, 'PRO1', 'pro1') || '-';
        const pro2 = getProp(p, 'PRO2', 'pro2') || '-';
        const pro3 = getProp(p, 'PRO3', 'pro3') || '-';
        const marca = getProp(p, 'MARCA', 'marca') || '-';
        const descripcion = getProp(p, 'DESCRIPCION', 'descripcion', 'nombre') || '-';
        
        const rawStem = getProp(p, 'STEM', 'stem', 's.tem', 'stock');
        const stem = rawStem !== '' ? rawStem : 0;
        
        const rawCosto = getProp(p, 'COSTO', 'costo');
        const costo = rawCosto !== '' ? Number(rawCosto).toFixed(2) : "0.00";

        const rawPventa = getProp(p, 'PVENTA', 'pventa', 'p.venta', 'precio', 'precio_venta');
        const pventa = rawPventa !== '' ? Number(rawPventa).toFixed(2) : "0.00";

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

function cambiarPagina(delta) {
    paginaActual += delta;
    renderizarTabla();
}

function irAPaginaEspecifica() {
    const input = document.getElementById("gotoPageInput");
    const num = parseInt(input.value, 10);
    const totalPaginas = Math.ceil(productosFiltrados.length / REGISTROS_POR_PAGINA) || 1;

    if (isNaN(num) || num < 1 || num > totalPaginas) {
        alert("Número de página inválido.");
        return;
    }

    paginaActual = num;
    renderizarTabla();
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

function ordenar(columna) {
    if (columnaOrden === columna) {
        ordenAscendente = !ordenAscendente;
    } else {
        columnaOrden = columna;
        ordenAscendente = true;
    }

    productosFiltrados.sort((a, b) => {
        let valA = getProp(a, columna, columna.toUpperCase());
        let valB = getProp(b, columna, columna.toUpperCase());

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return ordenAscendente ? -1 : 1;
        if (valA > valB) return ordenAscendente ? 1 : -1;
        return 0;
    });

    renderizarTabla();
}

function abrirEdicion(codigo) {
    const prod = todosLosProductos.find(p => String(getProp(p, 'CODIGO', 'codigo', 'id')).toLowerCase() === String(codigo).toLowerCase());

    if (!prod) {
        alert("Código inválido o no encontrado.");
        return;
    }

    document.getElementById("modalTitulo").innerText = "Editar Producto";
    document.getElementById("form_codigo").value = getProp(prod, 'CODIGO', 'codigo');
    document.getElementById("form_codigo").readOnly = true;
    document.getElementById("form_cod_prov").value = getProp(prod, 'COD_PROV', 'cod_prov');
    document.getElementById("form_marca").value = getProp(prod, 'MARCA', 'marca');
    document.getElementById("form_descripcion").value = getProp(prod, 'DESCRIPCION', 'descripcion', 'nombre');
    document.getElementById("form_stem").value = getProp(prod, 'STEM', 'stem', 'stock') || 0;
    document.getElementById("form_costo").value = getProp(prod, 'COSTO', 'costo') || 0;
    document.getElementById("form_pventa").value = getProp(prod, 'PVENTA', 'pventa', 'precio') || 0;

    document.getElementById("modalEdicion").classList.add("active");
}

function abrirModalCrear() {
    document.getElementById("modalTitulo").innerText = "Nuevo Producto";
    document.getElementById("formProducto").reset();
    document.getElementById("form_codigo").readOnly = false;
    document.getElementById("modalEdicion").classList.add("active");
}

function cerrarModal() {
    document.getElementById("modalEdicion").classList.remove("active");
}

async function guardarProducto(event) {
    event.preventDefault();

    const codigo = document.getElementById("form_codigo").value.trim();
    const esEdicion = document.getElementById("form_codigo").readOnly;

    const payload = {
        codigo: codigo,
        cod_prov: document.getElementById("form_cod_prov").value.trim(),
        marca: document.getElementById("form_marca").value.trim(),
        descripcion: document.getElementById("form_descripcion").value.trim(),
        stem: parseInt(document.getElementById("form_stem").value, 10) || 0,
        costo: parseFloat(document.getElementById("form_costo").value) || 0,
        pventa: parseFloat(document.getElementById("form_pventa").value) || 0
    };

    try {
        const url = esEdicion ? `${window.location.origin}/api/productos/${encodeURIComponent(codigo)}` : `${window.location.origin}/api/productos`;
        const method = esEdicion ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.status === 404) {
            alert("Código inválido o no encontrado.");
            return;
        }

        if (!response.ok) {
            throw new Error("Error en la solicitud");
        }

        alert(esEdicion ? "Producto actualizado correctamente." : "Producto registrado correctamente.");
        cerrarModal();
        cargarProductos();
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Ocurrió un error al procesar los cambios.");
    }
}

async function eliminarProducto(codigo) {
    if (!codigo || codigo === "-") {
        alert("Código no encontrado. No se puede eliminar.");
        return;
    }

    const prod = todosLosProductos.find(p => String(getProp(p, 'CODIGO', 'codigo', 'id')).toLowerCase() === String(codigo).toLowerCase());

    if (!prod) {
        alert("Código no encontrado. No se puede eliminar.");
        return;
    }

    const confirmado = confirm(`¿Desea eliminar el producto con código ${codigo}?`);
    if (!confirmado) return;

    try {
        const response = await fetch(`${window.location.origin}/api/productos/${encodeURIComponent(codigo)}`, {
            method: "DELETE"
        });

        if (response.status === 404) {
            alert("Código no encontrado. No se puede eliminar.");
            return;
        }

        if (!response.ok) {
            throw new Error("Error en eliminación");
        }

        alert("Registro eliminado exitosamente.");
        cargarProductos();
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Ocurrió un error al intentar eliminar el registro.");
    }
}

function exportarExcel() {
    if (productosFiltrados.length === 0) {
        alert("No hay registros para exportar.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,PRO1,PRO2,PRO3,COD_PROV,CODIGO,MARCA,DESCRIPCION,STEM,COSTO,PVENTA\n";

    productosFiltrados.forEach(p => {
        const row = [
            getProp(p, 'PRO1', 'pro1'),
            getProp(p, 'PRO2', 'pro2'),
            getProp(p, 'PRO3', 'pro3'),
            getProp(p, 'COD_PROV', 'cod_prov'),
            getProp(p, 'CODIGO', 'codigo'),
            getProp(p, 'MARCA', 'marca'),
            `"${(getProp(p, 'DESCRIPCION', 'descripcion') || "").replace(/"/g, '""')}"`,
            getProp(p, 'STEM', 'stem', 'stock') || 0,
            getProp(p, 'COSTO', 'costo') || 0,
            getProp(p, 'PVENTA', 'pventa', 'precio') || 0
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Productos_${vistaActiva}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}