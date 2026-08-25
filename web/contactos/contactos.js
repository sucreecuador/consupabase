let todosLosContactos = [];
let contactosFiltrados = [];
let vistaActual = "clientes";

let paginaClientes = 1;
let paginaProveedores = 1;
const POR_PAGINA = 50;

let columnaOrden = "";
let direccionOrden = "asc";

document.addEventListener("DOMContentLoaded", () => {
    cargarContactos();
});

async function cargarContactos() {
    try {
        const response = await fetch("/api/contactos");
        if (!response.ok) throw new Error("Error al obtener los contactos");

        todosLosContactos = await response.json();

        if (todosLosContactos.error) {
            mostrarError(todosLosContactos.error);
            return;
        }

        contactosFiltrados = [...todosLosContactos];
        renderizarVista();
    } catch (error) {
        console.error("Error al cargar datos:", error);
        mostrarError("Error al conectar con la base de datos de Supabase.");
    }
}

function cambiarVista(vista) {
    vistaActual = vista;
    const btnClientes = document.getElementById("btnTabClientes");
    const btnProveedores = document.getElementById("btnTabProveedores");
    const vistaClientes = document.getElementById("vistaClientes");
    const vistaProveedores = document.getElementById("vistaProveedores");

    if (vista === "clientes") {
        btnClientes.className = "tab-btn active-clientes";
        btnProveedores.className = "tab-btn";
        vistaClientes.classList.add("active");
        vistaProveedores.classList.remove("active");
    } else {
        btnClientes.className = "tab-btn";
        btnProveedores.className = "tab-btn active-proveedores";
        vistaClientes.classList.remove("active");
        vistaProveedores.classList.add("active");
    }

    renderizarVista();
}

function renderizarVista() {
    if (vistaActual === "clientes") {
        renderizarClientes();
    } else {
        renderizarProveedores();
    }
}

function obtenerCodigoContacto(c) {
    if (!c) return "";
    const val = c.codigo !== undefined && c.codigo !== null && c.codigo !== "" ? c.codigo : c.codigo_cliente;
    return val !== undefined && val !== null ? String(val).trim() : "";
}

function renderizarClientes() {
    const tbody = document.querySelector("#tablaClientes tbody");
    const dataset = contactosFiltrados;
    const total = dataset.length;

    const totalPaginas = Math.ceil(total / POR_PAGINA) || 1;
    if (paginaClientes > totalPaginas) paginaClientes = totalPaginas;
    if (paginaClientes < 1) paginaClientes = 1;

    const inicio = (paginaClientes - 1) * POR_PAGINA;
    const fin = Math.min(inicio + POR_PAGINA, total);
    const paginados = dataset.slice(inicio, fin);

    tbody.innerHTML = "";
    if (paginados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="loading-td">No hay contactos registrados.</td></tr>`;
    } else {
        paginados.forEach(c => {
            const tr = document.createElement("tr");
            const codigoValor = obtenerCodigoContacto(c) || '-';
            tr.innerHTML = `
                <td><span class="badge-code">${codigoValor}</span></td>
                <td>${c.ruc || '-'}</td>
                <td><strong>${c.nombre || c.razon_social || '-'}</strong></td>
                <td>${c.direccion || '-'}</td>
                <td>${c.telefono1 || c.telefono2 || '-'}</td>
                <td>${c.email || '-'}</td>
                <td>${c.ciudad || '-'}</td>
                <td>${c.transporte || '-'}</td>
                <td style="text-align: center;">
                    <div class="action-btns">
                        <button class="btn-action btn-edit" title="Editar" onclick="abrirFormularioEdicionPorObjeto('${codigoValor}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarContactoPorCodigo('${codigoValor}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("infoClientes").innerText = `Mostrando ${total === 0 ? 0 : inicio + 1}-${fin} de ${total} registros (Página ${paginaClientes} de ${totalPaginas})`;
    document.getElementById("btnPrevClientes").disabled = paginaClientes === 1;
    document.getElementById("btnNextClientes").disabled = paginaClientes >= totalPaginas;
}

function renderizarProveedores() {
    const tbody = document.querySelector("#tablaProveedores tbody");
    const dataset = contactosFiltrados;
    const total = dataset.length;

    const totalPaginas = Math.ceil(total / POR_PAGINA) || 1;
    if (paginaProveedores > totalPaginas) paginaProveedores = totalPaginas;
    if (paginaProveedores < 1) paginaProveedores = 1;

    const inicio = (paginaProveedores - 1) * POR_PAGINA;
    const fin = Math.min(inicio + POR_PAGINA, total);
    const paginados = dataset.slice(inicio, fin);

    tbody.innerHTML = "";
    if (paginados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="loading-td">No hay proveedores registrados.</td></tr>`;
    } else {
        paginados.forEach(p => {
            const tr = document.createElement("tr");
            const codigoValor = obtenerCodigoContacto(p) || '-';
            tr.innerHTML = `
                <td><span class="badge-code">${codigoValor}</span></td>
                <td>${p.ruc || '-'}</td>
                <td><strong>${p.nombre || p.razon_social || '-'}</strong></td>
                <td>${p.direccion || '-'}</td>
                <td>${p.telefono1 || p.telefono2 || '-'}</td>
                <td>${p.email || '-'}</td>
                <td>${p.requiere || '-'}</td>
                <td style="text-align: center;">
                    <div class="action-btns">
                        <button class="btn-action btn-edit" title="Editar" onclick="abrirFormularioEdicionPorObjeto('${codigoValor}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarContactoPorCodigo('${codigoValor}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("infoProveedores").innerText = `Mostrando ${total === 0 ? 0 : inicio + 1}-${fin} de ${total} registros (Página ${paginaProveedores} de ${totalPaginas})`;
    document.getElementById("btnPrevProveedores").disabled = paginaProveedores === 1;
    document.getElementById("btnNextProveedores").disabled = paginaProveedores >= totalPaginas;
}

function cambiarPagina(delta) {
    if (vistaActual === "clientes") {
        paginaClientes += delta;
    } else {
        paginaProveedores += delta;
    }
    renderizarVista();
}

function irAPaginaEspecifica() {
    const inputId = vistaActual === "clientes" ? "gotoPageClientesInput" : "gotoPageProveedoresInput";
    const input = document.getElementById(inputId);
    const numeroPagina = parseInt(input.value, 10);
    const totalRegistros = contactosFiltrados.length;
    const totalPaginas = Math.ceil(totalRegistros / POR_PAGINA) || 1;

    if (isNaN(numeroPagina) || numeroPagina < 1 || numeroPagina > totalPaginas) {
        alert("Número de página inválido");
        return;
    }

    if (vistaActual === "clientes") {
        paginaClientes = numeroPagina;
    } else {
        paginaProveedores = numeroPagina;
    }

    renderizarVista();
}

function filtrarContactos() {
    const text = document.getElementById("searchInput").value.toLowerCase().trim();
    const field = document.getElementById("searchField").value;

    contactosFiltrados = todosLosContactos.filter(c => {
        if (!text) return true;
        const cod = obtenerCodigoContacto(c).toLowerCase();

        if (field === "todos") {
            return (
                cod.includes(text) ||
                (c.ruc || "").toLowerCase().includes(text) ||
                (c.nombre || "").toLowerCase().includes(text) ||
                (c.razon_social || "").toLowerCase().includes(text) ||
                (c.direccion || "").toLowerCase().includes(text) ||
                (c.telefono1 || "").toLowerCase().includes(text) ||
                (c.email || "").toLowerCase().includes(text) ||
                (c.requiere || "").toLowerCase().includes(text)
            );
        } else if (field === "codigo") {
            return cod.includes(text);
        } else if (field === "nombre") {
            return (c.nombre || "").toLowerCase().includes(text) || (c.razon_social || "").toLowerCase().includes(text);
        } else {
            return (c[field] || "").toString().toLowerCase().includes(text);
        }
    });

    if (columnaOrden) {
        aplicarOrdenamiento();
    }

    paginaClientes = 1;
    paginaProveedores = 1;
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
    contactosFiltrados.sort((a, b) => {
        let valA = a[columnaOrden] || "";
        let valB = b[columnaOrden] || "";

        if (columnaOrden === "codigo") {
            valA = obtenerCodigoContacto(a);
            valB = obtenerCodigoContacto(b);
        } else if (columnaOrden === "nombre") {
            valA = a.nombre || a.razon_social || "";
            valB = b.nombre || b.razon_social || "";
        }

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

    const activeTableId = vistaActual === "clientes" ? "#tablaClientes" : "#tablaProveedores";
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

function iniciarEdicionPorCodigo() {
    const codigoInput = prompt("Ingrese el código del cliente a editar:");
    if (codigoInput === null) return;

    const codigoLimpio = codigoInput.trim().toLowerCase();
    if (!codigoLimpio) {
        alert("Código inválido o no encontrado.");
        return;
    }

    const contactoEncontrado = todosLosContactos.find(
        c => obtenerCodigoContacto(c).toLowerCase() === codigoLimpio
    );

    if (!contactoEncontrado) {
        alert("Código inválido o no encontrado.");
        return;
    }

    cargarFormularioModal(contactoEncontrado);
}

function abrirFormularioEdicionPorObjeto(codigo) {
    const codigoBuscado = String(codigo).trim().toLowerCase();
    const contacto = todosLosContactos.find(
        c => obtenerCodigoContacto(c).toLowerCase() === codigoBuscado
    );
    if (contacto) {
        cargarFormularioModal(contacto);
    }
}

function cargarFormularioModal(contacto) {
    document.getElementById("edit_codigo").value = obtenerCodigoContacto(contacto);
    document.getElementById("edit_ruc").value = contacto.ruc || "";
    document.getElementById("edit_nombre").value = contacto.nombre || contacto.razon_social || "";
    document.getElementById("edit_direccion").value = contacto.direccion || "";
    document.getElementById("edit_telefono1").value = contacto.telefono1 || "";
    document.getElementById("edit_email").value = contacto.email || "";
    document.getElementById("edit_ciudad").value = contacto.ciudad || "";
    document.getElementById("edit_transporte").value = contacto.transporte || contacto.requiere || "";

    document.getElementById("modalEdicion").classList.add("active");
}

function cerrarModal() {
    document.getElementById("modalEdicion").classList.remove("active");
}

async function guardarEdicion(event) {
    event.preventDefault();

    const codigo = document.getElementById("edit_codigo").value;
    
    const payload = {
        ruc: document.getElementById("edit_ruc").value,
        nombre: document.getElementById("edit_nombre").value,
        direccion: document.getElementById("edit_direccion").value,
        telefono1: document.getElementById("edit_telefono1").value,
        email: document.getElementById("edit_email").value,
        ciudad: document.getElementById("edit_ciudad").value,
        transporte: document.getElementById("edit_transporte").value
    };

    try {
        const response = await fetch(`/api/contactos/${encodeURIComponent(codigo)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.status === 404) {
            alert("Código inválido o no encontrado.");
            return;
        }

        if (!response.ok) {
            throw new Error("Error al actualizar la información.");
        }

        alert("Contacto actualizado exitosamente.");
        cerrarModal();
        await cargarContactos();
    } catch (error) {
        console.error(error);
        alert("Error al intentar guardar los cambios.");
    }
}

async function eliminarContactoPorCodigo(codigo) {
    if (codigo === undefined || codigo === null || String(codigo).trim() === "" || String(codigo) === "undefined" || String(codigo) === "null" || String(codigo) === "-") {
        alert("Código inválido o no encontrado.");
        return;
    }

    const codigoBuscado = String(codigo).trim().toLowerCase();

    const contactoEncontrado = todosLosContactos.find(c => {
        return obtenerCodigoContacto(c).toLowerCase() === codigoBuscado;
    });

    if (!contactoEncontrado) {
        alert("Código no encontrado. No se puede eliminar.");
        return;
    }

    const codigoReal = obtenerCodigoContacto(contactoEncontrado);

    const confirmado = confirm(`¿Desea eliminar el contacto con código ${codigoReal}?`);
    if (!confirmado) return;

    try {
        const response = await fetch(`/api/contactos/${encodeURIComponent(codigoReal)}`, {
            method: "DELETE"
        });

        if (response.status === 404) {
            alert("Código no encontrado. No se puede eliminar.");
            return;
        }

        if (!response.ok) {
            throw new Error("Error al eliminar el registro.");
        }

        alert("Registro eliminado exitosamente.");
        await cargarContactos();
    } catch (error) {
        console.error(error);
        alert("Ocurrió un error al intentar eliminar el registro.");
    }
}

function mostrarError(mensaje) {
    document.querySelector("#tablaClientes tbody").innerHTML = `<tr><td colspan="9" class="loading-td" style="color: #dc2626;">${mensaje}</td></tr>`;
    document.querySelector("#tablaProveedores tbody").innerHTML = `<tr><td colspan="8" class="loading-td" style="color: #dc2626;">${mensaje}</td></tr>`;
}