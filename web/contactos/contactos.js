let todosLosContactos = [];
let contactosFiltrados = [];
let vistaActual = "clientes";

let paginaClientes = 1;
let paginaProveedores = 1;
const POR_PAGINA = 50;

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
    const dataset = contactosFiltrados; // Muestra todos los datos sin importar la categoría
    const total = dataset.length;

    const totalPaginas = Math.ceil(total / POR_PAGINA) || 1;
    if (paginaClientes > totalPaginas) paginaClientes = totalPaginas;

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
                        <button class="btn-action btn-edit" title="Editar" onclick="editarContacto('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarContacto('${c.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("infoClientes").innerText = `Mostrando ${total === 0 ? 0 : inicio + 1}-${fin} de ${total}`;
    document.getElementById("pageClientes").innerText = `Página ${paginaClientes} de ${totalPaginas}`;
    document.getElementById("btnPrevClientes").disabled = paginaClientes === 1;
    document.getElementById("btnNextClientes").disabled = paginaClientes >= totalPaginas;
}

function renderizarProveedores() {
    const tbody = document.querySelector("#tablaProveedores tbody");
    const dataset = contactosFiltrados; // Muestra todos los datos sin importar la categoría
    const total = dataset.length;

    const totalPaginas = Math.ceil(total / POR_PAGINA) || 1;
    if (paginaProveedores > totalPaginas) paginaProveedores = totalPaginas;

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
                        <button class="btn-action btn-edit" title="Editar" onclick="editarContacto('${p.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarContacto('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("infoProveedores").innerText = `Mostrando ${total === 0 ? 0 : inicio + 1}-${fin} de ${total}`;
    document.getElementById("pageProveedores").innerText = `Página ${paginaProveedores} de ${totalPaginas}`;
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

function filtrarContactos() {
    const text = document.getElementById("searchInput").value.toLowerCase();
    contactosFiltrados = todosLosContactos.filter(c => {
        const nombre = (c.nombre || "").toLowerCase();
        const ruc = (c.ruc || "").toLowerCase();
        const codigo = (c.codigo_cliente || "").toLowerCase();
        const direccion = (c.direccion || "").toLowerCase();
        return nombre.includes(text) || ruc.includes(text) || codigo.includes(text) || direccion.includes(text);
    });

    paginaClientes = 1;
    paginaProveedores = 1;
    renderizarVista();
}

function mostrarError(mensaje) {
    document.querySelector("#tablaClientes tbody").innerHTML = `<tr><td colspan="9" class="loading-td" style="color: #ef4444;">${mensaje}</td></tr>`;
    document.querySelector("#tablaProveedores tbody").innerHTML = `<tr><td colspan="8" class="loading-td" style="color: #ef4444;">${mensaje}</td></tr>`;
}

function editarContacto(id) {
    alert("Editar contacto con ID: " + id);
}

function eliminarContacto(id) {
    if (confirm("¿Estás seguro de eliminar este contacto?")) {
        alert("Eliminar contacto con ID: " + id);
    }
}