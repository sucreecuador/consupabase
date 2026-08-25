let todosLosContactos = [];
let vistaActual = "clientes";

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

        renderizarTablas();
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
}

function renderizarTablas() {
    const tbodyClientes = document.querySelector("#tablaClientes tbody");
    const tbodyProveedores = document.querySelector("#tablaProveedores tbody");

    const clientes = todosLosContactos.filter(c => c.categoria === "C" || !c.categoria);
    const proveedores = todosLosContactos.filter(c => c.categoria === "P");

    // Llenar Clientes
    tbodyClientes.innerHTML = "";
    if (clientes.length === 0) {
        tbodyClientes.innerHTML = `<tr><td colspan="9" class="loading-td">No hay clientes registrados.</td></tr>`;
    } else {
        clientes.forEach(c => {
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
                <td>
                    <div class="action-btns">
                        <button class="btn-action btn-edit" title="Editar" onclick="editarContacto('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarContacto('${c.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbodyClientes.appendChild(tr);
        });
    }

    // Llenar Proveedores
    tbodyProveedores.innerHTML = "";
    if (proveedores.length === 0) {
        tbodyProveedores.innerHTML = `<tr><td colspan="8" class="loading-td">No hay proveedores registrados.</td></tr>`;
    } else {
        proveedores.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span class="badge-code">${p.codigo_cliente || '-'}</span></td>
                <td>${p.ruc || '-'}</td>
                <td><strong>${p.nombre || p.razon_social || '-'}</strong></td>
                <td>${p.direccion || '-'}</td>
                <td>${p.telefono1 || p.telefono2 || '-'}</td>
                <td>${p.email || '-'}</td>
                <td>${p.requiere || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-action btn-edit" title="Editar" onclick="editarContacto('${p.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action btn-delete" title="Eliminar" onclick="eliminarContacto('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbodyProveedores.appendChild(tr);
        });
    }
}

function filtrarContactos() {
    const text = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll(".tab-content.active tbody tr");

    rows.forEach(row => {
        const rowText = row.innerText.toLowerCase();
        row.style.display = rowText.includes(text) ? "" : "none";
    });
}

function mostrarError(mensaje) {
    document.querySelector("#tablaClientes tbody").innerHTML = `<tr><td colspan="9" class="loading-td" style="color: #ef4444;">${mensaje}</td></tr>`;
    document.querySelector("#tablaProveedores tbody").innerHTML = `<tr><td colspan="8" class="loading-td" style="color: #ef4444;">${mensaje}</td></tr>`;
}

function editarContacto(id) {
    console.log("Editar:", id);
}

function eliminarContacto(id) {
    console.log("Eliminar:", id);
}