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

async function cargarProductos() {
    const tbody = document.querySelector("#tablaProductos tbody");
    tbody.innerHTML = `<tr><td colspan="11" class="status-msg" style="color:#64748b;">Cargando productos...</td></tr>`;

    try {
        const endpoint = `/api/productos?tipo=${vistaActiva}`;
        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error("HTTP Status " + response.status);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            todosLosProductos = data;
        } else if (data && Array.isArray(data.datos)) {
            todosLosProductos = data.datos;
        } else {
            todosLosProductos = [];
        }

        productosFiltrados = [...todosLosProductos];
        paginaActual = 1;
        renderizarTabla();
    } catch (error) {
        console.error("Error en fetch de productos:", error);
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

        const cod = p.codigo || p.cod_producto || p.id || "";
        const codProv = p.cod_prov || p.codigo_proveedor || "-";
        const pro1 = p.pro1 || "-";
        const pro2 = p.pro2 || "-";
        const pro3 = p.pro3 || "-";
        const marca = p.marca || "-";
        const descripcion = p.descripcion || p.nombre || "-";
        const stem = p.stem !== undefined && p.stem !== null ? p.stem : (p.stock || 0);
        const costo = p.costo !== undefined && p.costo !== null ? Number(p.costo).toFixed(2) : "0.00";
        const pventa = p.pventa !== undefined && p.pventa !== null ? Number(p.pventa).toFixed(2) : (p.precio ? Number(p.precio).toFixed(2) : "0.00");

        tr.innerHTML = `
            <td>${pro1}</td>
            <td>${pro2}</td>
            <td>${pro3}</td>
            <td>${codProv}</td>
            <td><strong>${cod}</strong></td>
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
            const val = (p[campo] || p.descripcion || p.codigo || "").toString().toLowerCase();
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
        let valA = a[columna] || "";
        let valB = b[columna] || "";

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return ordenAscendente ? -1 : 1;
        if (valA > valB) return ordenAscendente ? 1 : -1;
        return 0;
    });

    renderizarTabla();
}

function abrirEdicion(codigo) {
    const prod = todosLosProductos.find(p => (p.codigo || p.cod_producto || p.id || "").toString().toLowerCase() === codigo.toString().toLowerCase());

    if (!prod) {
        alert("Código inválido o no encontrado.");
        return;
    }

    document.getElementById("modalTitulo").innerText = "Editar Producto";
    document.getElementById("form_codigo").value = prod.codigo || prod.cod_producto || "";
    document.getElementById("form_codigo").readOnly = true;
    document.getElementById("form_cod_prov").value = prod.cod_prov || "";
    document.getElementById("form_marca").value = prod.marca || "";
    document.getElementById("form_descripcion").value = prod.descripcion || prod.nombre || "";
    document.getElementById("form_stem").value = prod.stem || prod.stock || 0;
    document.getElementById("form_costo").value = prod.costo || 0;
    document.getElementById("form_pventa").value = prod.pventa || prod.precio || 0;

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
        const url = esEdicion ? `/api/productos/${encodeURIComponent(codigo)}` : `/api/productos`;
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

    const prod = todosLosProductos.find(p => (p.codigo || p.cod_producto || p.id || "").toString().toLowerCase() === codigo.toString().toLowerCase());

    if (!prod) {
        alert("Código no encontrado. No se puede eliminar.");
        return;
    }

    const confirmado = confirm(`¿Desea eliminar el producto con código ${codigo}?`);
    if (!confirmado) return;

    try {
        const response = await fetch(`/api/productos/${encodeURIComponent(codigo)}`, {
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
            p.pro1 || "",
            p.pro2 || "",
            p.pro3 || "",
            p.cod_prov || "",
            p.codigo || "",
            p.marca || "",
            `"${(p.descripcion || "").replace(/"/g, '""')}"`,
            p.stem || 0,
            p.costo || 0,
            p.pventa || 0
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