let todosLosContactos = [];
let contactosFiltrados = [];
let vistaActual = "clientes";

let paginaClientes = 1;
let paginaProveedores = 1;
const POR_PAGINA = 50;

document.addEventListener("DOMContentLoaded", () => {
    cargarContactos();
});

// Cargar lista actualizada
async function cargarContactos() {
    try {
        const response = await fetch("/api/contactos");
        if (!response.ok) throw new Error("Error al obtener los contactos");

        todosLosContactos = await response.json();
        contactosFiltrados = [...todosLosContactos];
        renderizarVista();
    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
}

function cambiarVista(vista) {
    vistaActual = vista;
    document.getElementById("btnTabClientes").className = vista === "clientes" ? "tab-btn active-clientes" : "tab-btn";
    document.getElementById("btnTabProveedores").className = vista === "proveedores" ? "tab-btn active-proveedores" : "tab-btn";
    document.getElementById("vistaClientes").className = vista === "clientes" ? "tab-content active" : "tab-content";
    document.getElementById("vistaProveedores").className = vista === "proveedores" ? "tab-content active" : "tab-content";
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

    const inicio = (paginaClientes - 1) * POR_PAGINA;
    const paginados = dataset.slice(inicio, inicio + POR_PAGINA);

    tbody.innerHTML = "";
    if (paginados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="loading-td">No hay datos registrados.</td></tr>`;
    } else {
        paginados.forEach(c => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span class="badge-code">${c.codigo_cliente || '-'}</span></td>
                <td>${c.ruc || '-'}</td>
                <td><strong>${c.nombre || c.razon_social || '-'}</strong></td>
                <td>${c.direccion || '-'}</td>
                <td>${c.telefono1 || '-'}</td>
                <td>${c.email || '-'}</td>
                <td>${c.ciudad || '-'}</td>
                <td>${c.transporte || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-action btn-edit" onclick="editarContactoPorCodigo('${c.codigo_cliente}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" onclick="eliminarContactoPorCodigo('${c.codigo_cliente}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("infoClientes").innerText = `Mostrando ${total === 0 ? 0 : inicio + 1}-${Math.min(inicio + POR_PAGINA, total)} de ${total}`;
}

function renderizarProveedores() {
    const tbody = document.querySelector("#tablaProveedores tbody");
    const dataset = contactosFiltrados;
    const total = dataset.length;
    const inicio = (paginaProveedores - 1) * POR_PAGINA;
    const paginados = dataset.slice(inicio, inicio + POR_PAGINA);

    tbody.innerHTML = "";
    if (paginados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="loading-td">No hay datos registrados.</td></tr>`;
    } else {
        paginados.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span class="badge-code">${p.codigo_cliente || '-'}</span></td>
                <td>${p.ruc || '-'}</td>
                <td><strong>${p.nombre || p.razon_social || '-'}</strong></td>
                <td>${p.direccion || '-'}</td>
                <td>${p.telefono1 || '-'}</td>
                <td>${p.email || '-'}</td>
                <td>${p.requiere || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-action btn-edit" onclick="editarContactoPorCodigo('${p.codigo_cliente}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" onclick="eliminarContactoPorCodigo('${p.codigo_cliente}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("infoProveedores").innerText = `Mostrando ${total === 0 ? 0 : inicio + 1}-${Math.min(inicio + POR_PAGINA, total)} de ${total}`;
}

// 1. ELIMINACIÓN REAL EN BASE DE DATOS POR CÓDIGO
async function eliminarContactoPorCodigo(codigo) {
    if (!codigo || codigo === "undefined" || codigo === "null") {
        const input = prompt("Ingrese el código del cliente que desea eliminar:");
        if (!input) return;
        codigo = input.trim();
    }

    // Validar existencia localmente antes de ejecutar petición
    const existe = todosLosContactos.some(c => String(c.codigo_cliente).toLowerCase() === String(codigo).toLowerCase());
    if (!existe) {
        alert("Código no encontrado. No se puede eliminar.");
        return;
    }

    const confirmado = confirm(`¿Desea eliminar el cliente con código ${codigo}?`);
    if (!confirmado) return;

    try {
        const response = await fetch(`/api/contactos/${encodeURIComponent(codigo)}`, {
            method: "DELETE"
        });

        if (response.status === 404) {
            alert("Código no encontrado. No se puede eliminar.");
            return;
        }

        if (!response.ok) {
            throw new Error("Error al eliminar el registro.");
        }

        alert("Registro eliminado exitosamente de la base de datos.");
        await cargarContactos(); // Refrescar la tabla para que el registro desaparezca
    } catch (error) {
        console.error(error);
        alert("Ocurrió un error al intentar eliminar el registro.");
    }
}

// 2. EDICIÓN CON FORMULARIO REAL Y UPDATE EN LA BASE
function iniciarEdicionPorCodigo() {
    const codigoInput = prompt("Ingrese el código de cliente a editar:");
    if (codigoInput !== null && codigoInput.trim() !== "") {
        editarContactoPorCodigo(codigoInput.trim());
    }
}

function editarContactoPorCodigo(codigo) {
    const contacto = todosLosContactos.find(
        c => String(c.codigo_cliente).toLowerCase() === String(codigo).toLowerCase()
    );

    if (!contacto) {
        alert("Código no encontrado. No se puede editar.");
        return;
    }

    // Cargar datos reales en el formulario modal
    document.getElementById("edit_codigo_cliente").value = contacto.codigo_cliente || "";
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

    const codigo = document.getElementById("edit_codigo_cliente").value;
    
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
            alert("Código no encontrado. No se puede editar.");
            return;
        }

        if (!response.ok) {
            throw new Error("Error al actualizar la información.");
        }

        alert("Contacto actualizado exitosamente.");
        cerrarModal();
        await cargarContactos(); // Refrescar cambios de inmediato
    } catch (error) {
        console.error(error);
        alert("Error al intentar guardar los cambios.");
    }
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
                (c.direccion || "").toLowerCase().includes(text)
            );
        }
        return (c[field] || "").toString().toLowerCase().includes(text);
    });

    paginaClientes = 1;
    paginaProveedores = 1;
    renderizarVista();
}