let todosLosProductos = [];
let productosFiltrados = [];
let vistaActual = "ventas";

let paginaVentas = 1;
let paginaCompras = 1;
const POR_PAGINA = 50;

let columnaOrden = "";
let direccionOrden = "asc";

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});

function obtenerProp(obj, ...keys) {
    if (!obj) return "";
    for (let k of keys) {
        if (obj[k] !== undefined && obj[k] !== null) return obj[k];
        const lowerKey = k.toLowerCase();
        const found = Object.keys(obj).find(key => key.toLowerCase() === lowerKey);
        if (found && obj[found] !== undefined && obj[found] !== null) return obj[found];
    }
    return "";
}

async function cargarProductos() {
    try {
        const response = await fetch(`${window.location.origin}/api/productos`);
        if (!response.ok) throw new Error("Error al obtener productos");

        const data = await response.json();
        console.log("Respuesta backend:", data);
        
        if (Array.isArray(data)) {
            todosLosProductos = data;
        } else if (data && Array.isArray(data.productos)) {
            todosLosProductos = data.productos;
        } else if (data && Array.isArray(data.datos)) {
            todosLosProductos = data.datos;
        } else if (data && Array.isArray(data.data)) {
            todosLosProductos = data.data;
        } else if (data && typeof data === 'object') {
            const posibleArray = Object.values(data).find(val => Array.isArray(val));
            todosLosProductos = posibleArray || [];
        } else {
            todosLosProductos = [];
        }

        productosFiltrados = [...todosLosProductos];
        renderizarVista();
    } catch (error) {
        console.error("Error al cargar datos:", error);
        mostrarError("Error al conectar con la base de datos de Supabase.");
    }
}

function cambiarVista(vista) {
    vistaActual = vista;
    const btnVentas = document.getElementById("btnTabVentas");
    const btnCompras = document.getElementById("btnTabCompras");
    const vistaVentas = document.getElementById("vistaVentas");
    const vistaCompras = document.getElementById("vistaCompras");

    if (vista === "ventas") {
        btnVentas.className = "tab-btn active-ventas";
        btnCompras.className = "tab-btn";
        vistaVentas.classList.add("active");
        vistaCompras.classList.remove("active");
    } else {
        btnVentas.className = "tab-btn";
        btnCompras.className = "tab-btn active-compras";
        vistaVentas.classList.remove("active");
        vistaCompras.classList.add("active");
    }

    renderizarVista();
}

function renderizarVista() {
    if (vistaActual === "ventas") {
        renderizarTablaGenerica("#tablaVentas tbody", "infoVentas", "btnPrevVentas", "btnNextVentas", paginaVentas);
    } else {
        renderizarTablaGenerica("#tablaCompras tbody", "infoCompras", "btnPrevCompras", "btnNextCompras", paginaCompras);
    }
}

function renderizarTablaGenerica(tbodySelector, infoId, btnPrevId, btnNextId, paginaActual) {
    const tbody = document.querySelector(tbodySelector);
    const dataset = productosFiltrados;
    const total = dataset.length;

    const totalPaginas = Math.ceil(total / POR_PAGINA) || 1;
    let pag = paginaActual;
    if (pag > totalPaginas) pag = totalPaginas;
    if (pag < 1) pag = 1;

    if (vistaActual === "ventas") paginaVentas = pag;
    else paginaCompras = pag;

    const inicio = (pag - 1) * POR_PAGINA;
    const fin = Math.min(inicio + POR_PAGINA, total);
    const paginados = dataset.slice(inicio, fin);

    tbody.innerHTML = "";
    if (paginados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="loading-td">No hay productos registrados.</td></tr>`;
    } else {
        paginados.forEach(p => {
            const tr = document.createElement("tr");
            const cod = obtenerProp(p, 'CODIGO', 'codigo', 'cod_producto', 'id');
            const codProv = obtenerProp(p, 'COD_PROV', 'cod_prov') || '-';
            const pro1 = obtenerProp(p, 'PRO1', 'pro1') || '-';
            const pro2 = obtenerProp(p, 'PRO2', 'pro2') || '-';
            const pro3 = obtenerProp(p, 'PRO3', 'pro3') || '-';
            const marca = obtenerProp(p, 'MARCA', 'marca') || '-';
            const descripcion = obtenerProp(p, 'DESCRIPCION', 'descripcion', 'nombre') || '-';
            const stem = obtenerProp(p, 'STEM', 'stem', 'stock') || 0;
            const costo = Number(obtenerProp(p, 'COSTO', 'costo') || 0).toFixed(2);
            const pventa = Number(obtenerProp(p, 'PVENTA', 'pventa', 'precio') || 0).toFixed(2);

            tr.innerHTML = `
                <td>${pro1}</td>
                <td>${pro2}</td>
                <td>${pro3}</td>
                <td>${codProv}</td>
                <td><span class="badge-code">${cod || '-'}</span></td>
                <td>${marca}</td>
                <td><strong>${descripcion}</strong></td>
                <td>${stem}</td>
                <td>$${costo}</td>
                <td>$${pventa}</td>
                <td style="text-align: center;">
                    <div class="action-btns">
                        <button class="btn-action btn-edit" title="Editar" onclick="abrirModalEdicion('${cod}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarProducto('${cod}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById(infoId).innerText = `Mostrando ${total === 0 ? 0 : inicio + 1}-${fin} de ${total} registros (Página ${pag} de ${totalPaginas})`;
    document.getElementById(btnPrevId).disabled = pag === 1;
    document.getElementById(btnNextId).disabled = pag >= totalPaginas;
}

function cambiarPagina(delta) {
    if (vistaActual === "ventas") {
        paginaVentas += delta;
    } else {
        paginaCompras += delta;
    }
    renderizarVista();
}

function irAPaginaEspecifica() {
    const inputId = vistaActual === "ventas" ? "gotoPageVentasInput" : "gotoPageComprasInput";
    const input = document.getElementById(inputId);
    const numeroPagina = parseInt(input.value, 10);
    const totalRegistros = productosFiltrados.length;
    const totalPaginas = Math.ceil(totalRegistros / POR_PAGINA) || 1;

    if (isNaN(numeroPagina) || numeroPagina < 1 || numeroPagina > totalPaginas) {
        alert("Número de página inválido");
        return;
    }

    if (vistaActual === "ventas") {
        paginaVentas = numeroPagina;
    } else {
        paginaCompras = numeroPagina;
    }

    renderizarVista();
}

function filtrarProductos() {
    const text = document.getElementById("searchInput").value.toLowerCase().trim();
    const field = document.getElementById("searchField").value;

    productosFiltrados = todosLosProductos.filter(p => {
        if (!text) return true;
        
        const cod = String(obtenerProp(p, 'CODIGO', 'codigo')).toLowerCase();
        const codProv = String(obtenerProp(p, 'COD_PROV', 'cod_prov')).toLowerCase();
        const desc = String(obtenerProp(p, 'DESCRIPCION', 'descripcion', 'nombre')).toLowerCase();
        const marca = String(obtenerProp(p, 'MARCA', 'marca')).toLowerCase();

        if (field === "todos") {
            return cod.includes(text) || codProv.includes(text) || desc.includes(text) || marca.includes(text);
        } else if (field === "codigo") {
            return cod.includes(text);
        } else if (field === "cod_prov") {
            return codProv.includes(text);
        } else if (field === "descripcion") {
            return desc.includes(text);
        } else if (field === "marca") {
            return marca.includes(text);
        }
        return false;
    });

    if (columnaOrden) {
        aplicarOrdenamiento();
    }

    paginaVentas = 1;
    paginaCompras = 1;
    renderizarVista();
}

function ordenar(columna) {
    if (columnaOrden === columna) {
        direccionOrden = direccionOrden === "asc" ? "desc" : "asc";
    } else {
        columnaOrden = columna;
        direccionOrden = "asc";
    }

    aplicarOrdenamiento();
    actualizarIconosOrden();
    renderizarVista();
}

function aplicarOrdenamiento() {
    productosFiltrados.sort((a, b) => {
        let valA = obtenerProp(a, columna, columna.toUpperCase());
        let valB = obtenerProp(b, columna, columna.toUpperCase());

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return direccionOrden === "asc" ? -1 : 1;
        if (valA > valB) return direccionOrden === "asc" ? 1 : -1;
        return 0;
    });
}

function actualizarIconosOrden() {
    const ths = document.querySelectorAll("th");
    ths.forEach(th => {
        th.classList.remove("sorted");
        const icon = th.querySelector(".sort-icon");
        if (icon) {
            icon.className = "fa-solid fa-sort sort-icon";
        }
    });

    const activeTableId = vistaActual === "ventas" ? "#tablaVentas" : "#tablaCompras";
    const currentTh = Array.from(document.querySelectorAll(`${activeTableId} th`)).find(th => 
        th.getAttribute("onclick") && th.getAttribute("onclick").includes(`'${columnaOrden}'`)
    );

    if (currentTh) {
        currentTh.classList.add("sorted");
        const icon = currentTh.querySelector(".sort-icon");
        if (icon) {
            icon.className = direccionOrden === "asc" ? "fa-solid fa-sort-up sort-icon" : "fa-solid fa-sort-down sort-icon";
        }
    }
}

function abrirModalCrear() {
    document.getElementById("modalTitulo").innerText = "Nuevo Producto";
    document.getElementById("formProducto").reset();
    document.getElementById("edit_codigo").readOnly = false;
    document.getElementById("modalEdicion").classList.add("active");
}

function abrirModalEdicion(codigo) {
    const prod = todosLosProductos.find(p => String(obtenerProp(p, 'CODIGO', 'codigo')).toLowerCase() === String(codigo).toLowerCase());
    if (!prod) return alert("Producto no encontrado.");

    document.getElementById("modalTitulo").innerText = "Editar Producto";
    document.getElementById("edit_codigo").value = obtenerProp(prod, 'CODIGO', 'codigo');
    document.getElementById("edit_codigo").readOnly = true;
    document.getElementById("edit_cod_prov").value = obtenerProp(prod, 'COD_PROV', 'cod_prov');
    document.getElementById("edit_marca").value = obtenerProp(prod, 'MARCA', 'marca');
    document.getElementById("edit_descripcion").value = obtenerProp(prod, 'DESCRIPCION', 'descripcion', 'nombre');
    document.getElementById("edit_stem").value = obtenerProp(prod, 'STEM', 'stem', 'stock') || 0;
    document.getElementById("edit_costo").value = obtenerProp(prod, 'COSTO', 'costo') || 0;
    document.getElementById("edit_pventa").value = obtenerProp(prod, 'PVENTA', 'pventa', 'precio') || 0;

    document.getElementById("modalEdicion").classList.add("active");
}

function cerrarModal() {
    document.getElementById("modalEdicion").classList.remove("active");
}

async function guardarProducto(event) {
    event.preventDefault();

    const codigo = document.getElementById("edit_codigo").value.trim();
    const esEdicion = document.getElementById("edit_codigo").readOnly;

    const payload = {
        codigo: codigo,
        cod_prov: document.getElementById("edit_cod_prov").value.trim(),
        marca: document.getElementById("edit_marca").value.trim(),
        descripcion: document.getElementById("edit_descripcion").value.trim(),
        stem: parseInt(document.getElementById("edit_stem").value, 10) || 0,
        costo: parseFloat(document.getElementById("edit_costo").value) || 0,
        pventa: parseFloat(document.getElementById("edit_pventa").value) || 0
    };

    try {
        const baseUrl = `${window.location.origin}/api/productos`;
        const url = esEdicion ? `${baseUrl}/${encodeURIComponent(codigo)}` : baseUrl;
        const method = esEdicion ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Error en la solicitud");

        alert(esEdicion ? "Producto actualizado correctamente." : "Producto registrado correctamente.");
        cerrarModal();
        await cargarProductos();
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Ocurrió un error al procesar los cambios.");
    }
}

async function eliminarProducto(codigo) {
    if (!codigo || codigo === "-") return alert("Código no encontrado.");

    const confirmado = confirm(`¿Desea eliminar el producto con código ${codigo}?`);
    if (!confirmado) return;

    try {
        const response = await fetch(`${window.location.origin}/api/productos/${encodeURIComponent(codigo)}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Error al eliminar");

        alert("Registro eliminado exitosamente.");
        await cargarProductos();
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Ocurrió un error al intentar eliminar el registro.");
    }
}

function exportarExcel() {
    if (productosFiltrados.length === 0) return alert("No hay registros para exportar.");

    let csvContent = "data:text/csv;charset=utf-8,PRO1,PRO2,PRO3,COD_PROV,CODIGO,MARCA,DESCRIPCION,STEM,COSTO,PVENTA\n";

    productosFiltrados.forEach(p => {
        const row = [
            obtenerProp(p, 'PRO1', 'pro1'),
            obtenerProp(p, 'PRO2', 'pro2'),
            obtenerProp(p, 'PRO3', 'pro3'),
            obtenerProp(p, 'COD_PROV', 'cod_prov'),
            obtenerProp(p, 'CODIGO', 'codigo'),
            obtenerProp(p, 'MARCA', 'marca'),
            `"${(obtenerProp(p, 'DESCRIPCION', 'descripcion') || "").replace(/"/g, '""')}"`,
            obtenerProp(p, 'STEM', 'stem', 'stock') || 0,
            obtenerProp(p, 'COSTO', 'costo') || 0,
            obtenerProp(p, 'PVENTA', 'pventa', 'precio') || 0
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Productos_${vistaActual}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function mostrarError(mensaje) {
    document.querySelector("#tablaVentas tbody").innerHTML = `<tr><td colspan="11" class="loading-td" style="color: #dc2626;">${mensaje}</td></tr>`;
    document.querySelector("#tablaCompras tbody").innerHTML = `<tr><td colspan="11" class="loading-td" style="color: #dc2626;">${mensaje}</td></tr>`;
}