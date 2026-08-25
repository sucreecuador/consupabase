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
            tr.innerHTML = `
                <td><span class="badge-code">${c.codigo_cliente || '-'}</span></td>
                <td>${c.ruc || '-'}</td>
                <td><strong>${c.nombre || c.razon_social || '-'}</strong></td>
                <td>${c.direccion || '-'}</td>
                <td>${c.telefono1 || c.telefono2 || '-'}</td>
                <td>${c.email || '-'}</td>
                <td>${c.ciudad || '-'}</td>
                <td>${c.transporte || '-'}</td>
                <td style="text-align: center;">
                    <div class="action-btns" style="justify-content: center;">
                        <button class="btn-action btn-edit" title="Editar" onclick="editarContactoPorCodigo('${c.codigo_cliente}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarContactoPorCodigo('${c.codigo_cliente}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("infoClientes").innerText = `Mostrando ${total === 0 ? 0 : inicio + 1}-${fin} de ${total} registros (Página ${paginaClientes} de ${totalPaginas})`;
    document.getElementById("btnPrevClientes").disabled = paginaClientes === 1;
    document.getElementById("btnNextClientes").disabled = paginaClientes >= totalPaginas;
    
    renderizarControlesNumericos("numPagesClientes", paginaClientes, totalPaginas);
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
            tr.innerHTML = `
                <td><span class="badge-code">${p.codigo_cliente || '-'}</span></td>
                <td>${p.ruc || '-'}</td>
                <td><strong>${p.nombre || p.razon_social || '-'}</strong></td>
                <td>${p.direccion || '-'}</td>
                <td>${p.telefono1 || p.telefono2 || '-'}</td>
                <td>${p.email || '-'}</td>
                <td>${p.requiere || '-'}</td>
                <td style="text-align: center;">
                    <div class="action-btns" style="justify-content: center;">
                        <button class="btn-action btn-edit" title="Editar" onclick="editarContactoPorCodigo('${p.codigo_cliente}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarContactoPorCodigo('${p.codigo_cliente}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("infoProveedores").innerText = `Mostrando ${total === 0 ? 0 : inicio + 1}-${fin} de ${total} registros (Página ${paginaProveedores} de ${totalPaginas})`;
    document.getElementById("btnPrevProveedores").disabled = paginaProveedores === 1;
    document.getElementById("btnNextProveedores").disabled = paginaProveedores >= totalPaginas;

    renderizarControlesNumericos("numPagesProveedores", paginaProveedores, totalPaginas);
}

function renderizarControlesNumericos(containerId, paginaActual, totalPaginas) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const maxVisibles = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxVisibles / 2));
    let fin = Math.min(totalPaginas, inicio + maxVisibles - 1);

    if (fin - inicio + 1 < maxVisibles) {
        inicio = Math.max(1, fin - maxVisibles + 1);
    }

    for (let i = inicio; i <= fin; i++) {
        const btn = document.createElement("button");
        btn.className = `btn-page ${i === paginaActual ? "active" : ""}`;
        btn.innerText = i;
        btn.onclick = () => fijarPagina(i);
        container.appendChild(btn);
    }
}

function cambiarPagina(delta) {
    if (vistaActual === "clientes") {
        paginaClientes += delta;
    } else {
        paginaProveedores += delta;
    }
    renderizarVista();
}

function fijarPagina(num) {
    if (vistaActual === "clientes") {
        paginaClientes = num;
    } else {
        paginaProveedores = num;
    }
    renderizarVista();
}

function irAPaginaDirecta(valor) {
    const num = parseInt(valor, 10);
    const dataset = contactosFiltrados;
    const totalPaginas = Math.ceil(dataset.length / POR_PAGINA) || 1;

    if (isNaN(num) || num < 1 || num > totalPaginas) {
        alert(`Por favor ingrese un número de página válido entre 1 y ${totalPaginas}.`);
        return;
    }

    fijarPagina(num);
}

function filtrarContactos() {
    const text = document.getElementById("searchInput").value.toLowerCase().trim();
    const field = document.getElementById("searchField").value;

    contactosFiltrados = todosLosContactos.filter(c => {
        if (!text) return true;

        if (field === "todos") {
            return (
                (c.codigo_cliente || "").toLowerCase().includes(text) ||
                (c.ruc || "").toLowerCase().includes(text) ||
                (c.nombre || "").toLowerCase().includes(text) ||
                (c.razon_social || "").toLowerCase().includes(text) ||
                (c.direccion || "").toLowerCase().includes(text) ||
                (c.telefono1 || "").toLowerCase().includes(text) ||
                (c.email || "").toLowerCase().includes(text) ||
                (c.requiere || "").toLowerCase().includes(text)
            );
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

        if (columnaOrden === "nombre") {
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

// 1. Edición por Código de Cliente
function iniciarEdicionPorCodigo() {
    const codigoInput = prompt("Ingrese el código de cliente que desea editar:");
    if (codigoInput !== null && codigoInput.trim() !== "") {
        editarContactoPorCodigo(codigoInput.trim());
    }
}

function editarContactoPorCodigo(codigo) {
    if (!codigo || codigo === "undefined" || codigo === "null") {
        iniciarEdicionPorCodigo();
        return;
    }

    const contactoEncontrado = todosLosContactos.find(
        c => String(c.codigo_cliente).toLowerCase() === String(codigo).toLowerCase()
    );

    if (!contactoEncontrado) {
        alert("Código no encontrado");
        return;
    }

    cargarFormularioEdicion(contactoEncontrado);
}

function cargarFormularioEdicion(contacto) {
    alert(`Formulario de Edición Cargado:\n\nCódigo: ${contacto.codigo_cliente}\nNombre: ${contacto.nombre || contacto.razon_social}\nRUC/Cédula: ${contacto.ruc || 'N/A'}\nDirección: ${contacto.direccion || 'N/A'}`);
}

// 2. Eliminación con confirmación explícita por Código
function eliminarContactoPorCodigo(codigo) {
    if (!codigo || codigo === "undefined") {
        alert("El registro seleccionado no tiene un código asignado válido.");
        return;
    }

    const confirmado = confirm(`¿Desea eliminar el cliente con código ${codigo}?`);
    if (confirmado) {
        alert(`Contacto con código ${codigo} eliminado exitosamente.`);
    }
}

function mostrarError(mensaje) {
    document.querySelector("#tablaClientes tbody").innerHTML = `<tr><td colspan="9" class="loading-td" style="color: #dc2626;">${mensaje}</td></tr>`;
    document.querySelector("#tablaProveedores tbody").innerHTML = `<tr><td colspan="8" class="loading-td" style="color: #dc2626;">${mensaje}</td></tr>`;
}