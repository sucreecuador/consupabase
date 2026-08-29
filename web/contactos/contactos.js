// CONFIGURACIÓN DE LA API Y ESTADO DE LA APLICACIÓN
const API_URL = "https://consupabase-apiv2.onrender.com";

let contactos = [];
let contactosFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 10;
let modalContactoInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    modalContactoInstance = new bootstrap.Modal(document.getElementById('modalContacto'));
    cargarContactos();
});

// CARGAR TODOS LOS CONTACTOS DESDE LA API
async function cargarContactos() {
    try {
        const res = await fetch(`${API_URL}/clientes`);
        if (!res.ok) throw new Error("Error al obtener la lista de clientes");
        
        contactos = await res.json();
        contactosFiltrados = [...contactos];
        renderizarTabla();
    } catch (err) {
        console.error(err);
        alert("Error de conexión con la API: " + err.message);
    }
}

// RENDERIZAR LA TABLA CON PAGINACIÓN
function renderizarTabla() {
    const tbody = document.getElementById("cuerpoTabla");
    tbody.innerHTML = "";

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const listaPagina = contactosFiltrados.slice(inicio, fin);

    if (listaPagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">No se encontraron registros</td></tr>`;
    } else {
        listaPagina.forEach(c => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${c.codigo_cliente || '-'}</td>
                <td><strong>${c.nombre || c.razon_social || '-'}</strong></td>
                <td>${c.ruc || '-'}</td>
                <td>${c.ciudad || '-'}</td>
                <td>${c.direccion || '-'}</td>
                <td>${c.telefono1 || '-'}</td>
                <td>${c.email || '-'}</td>
                <td>${c.fecnac_c || c.fecha_nacimiento || '-'}</td>
                <td>${c.necesi_c || '-'}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalEditar('${c.codigo_cliente}')">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarContacto('${c.codigo_cliente}')">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Actualizar texto de paginación
    const total = contactosFiltrados.length;
    const totalPaginas = Math.ceil(total / registrosPorPagina) || 1;
    document.getElementById("infoPaginacion").innerText = `Mostrando ${listaPagina.length > 0 ? inicio + 1 : 0}-${Math.min(fin, total)} de ${total} registros (Página ${paginaActual} de ${totalPaginas})`;
}

// FILTRAR EN TIEMPO REAL
function filtrarTabla() {
    const texto = document.getElementById("inputBuscar").value.toLowerCase().strip();
    contactosFiltrados = contactos.filter(c => {
        const cod = (c.codigo_cliente || "").toLowerCase();
        const nom = (c.nombre || "").toLowerCase();
        const raz = (c.razon_social || "").toLowerCase();
        const ruc = (c.ruc || "").toLowerCase();
        const ciu = (c.ciudad || "").toLowerCase();

        return cod.includes(texto) || nom.includes(texto) || raz.includes(texto) || ruc.includes(texto) || ciu.includes(texto);
    });

    paginaActual = 1;
    renderizarTabla();
}

// ABRIR MODAL EN MODO EDICIÓN
function abrirModalEditar(codigo) {
    const cliente = contactos.find(c => String(c.codigo_cliente) === String(codigo));
    if (!cliente) {
        alert("Cliente no encontrado en memoria");
        return;
    }

    document.getElementById("codigo_cliente").value = cliente.codigo_cliente || "";
    document.getElementById("categoria").value = cliente.categoria || "";
    document.getElementById("ruc").value = cliente.ruc || "";
    document.getElementById("nombre").value = cliente.nombre || cliente.razon_social || "";
    document.getElementById("direccion").value = cliente.direccion || "";
    document.getElementById("ciudad").value = cliente.ciudad || "";
    document.getElementById("telefono1").value = cliente.telefono1 || "";
    document.getElementById("email").value = cliente.email || "";
    document.getElementById("transporte").value = cliente.transporte || "";
    document.getElementById("banco_datos_pago").value = cliente.banco_datos_pago || "";
    document.getElementById("fecnac_c").value = cliente.fecnac_c || cliente.fecha_nacimiento || "";
    document.getElementById("coment_c").value = cliente.coment_c || "";
    document.getElementById("necesi_c").value = cliente.necesi_c || "";

    document.getElementById("modalContactoLabel").innerText = "Editar Contacto";
    modalContactoInstance.show();
}

// ABRIR MODAL PARA NUEVO / EDICIÓN POR CÓDIGO
function abrirModalNuevo() {
    document.getElementById("formContacto").reset();
    document.getElementById("codigo_cliente").removeAttribute("readonly");
    document.getElementById("modalContactoLabel").innerText = "Editar/Nuevo Contacto";
    modalContactoInstance.show();
}

// GUARDAR O ACTUALIZAR CONTACTO (CORRIGE Y FILTRA EL PAYLOAD EXACTO)
async function guardarContacto(e) {
    e.preventDefault();

    const form = document.getElementById("formContacto");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    // 1. LIMPIAR PROPIEDADES NO DESEADAS QUE PROVOCAN EL ERROR DE ESQUEMA EN SUPABASE
    delete payload.requiere;
    delete payload.necesidad;
    delete payload.comentario;

    // 2. ASEGURAR NOMBRES DE COLUMNAS EXACTOS
    payload.razon_social = payload.nombre;
    if (payload.fecnac_c) {
        payload.fecha_nacimiento = payload.fecnac_c;
    }

    const codigo = payload.codigo_cliente;
    if (!codigo) {
        alert("El código del cliente es obligatorio");
        return;
    }

    // Mostrar spinner
    document.getElementById("txtGuardar").innerText = "Guardando...";
    document.getElementById("spinnerGuardar").classList.remove("d-none");
    document.getElementById("btnGuardar").disabled = true;

    try {
        const response = await fetch(`${API_URL}/clientes/${codigo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || errData.message || "Could not find the column in the schema cache");
        }

        alert("¡Contacto guardado correctamente!");
        modalContactoInstance.hide();
        await cargarContactos();

    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error al guardar los cambios: " + error.message);
    } finally {
        document.getElementById("txtGuardar").innerText = "Guardar Cambios";
        document.getElementById("spinnerGuardar").classList.add("d-none");
        document.getElementById("btnGuardar").disabled = false;
    }
}

// ELIMINAR REGISTRO
async function eliminarContacto(codigo) {
    if (!confirm(`¿Está seguro de que desea eliminar al cliente con código ${codigo}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/clientes/${codigo}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error("No se pudo eliminar el registro");

        alert("Contacto eliminado con éxito");
        await cargarContactos();
    } catch (err) {
        alert("Error al eliminar: " + err.message);
    }
}

// LOGICA DE PAGINACION
function paginaAnterior() {
    if (paginaActual > 1) {
        paginaActual--;
        renderizarTabla();
    }
}

function paginaSiguiente() {
    const totalPaginas = Math.ceil(contactosFiltrados.length / registrosPorPagina);
    if (paginaActual < totalPaginas) {
        paginaActual++;
        renderizarTabla();
    }
}

function irAPagina() {
    const input = document.getElementById("inputPagina");
    const num = parseInt(input.value);
    const totalPaginas = Math.ceil(contactosFiltrados.length / registrosPorPagina);

    if (num >= 1 && num <= totalPaginas) {
        paginaActual = num;
        renderizarTabla();
    } else {
        alert(`Ingrese una página válida entre 1 y ${totalPaginas}`);
    }
}

function mostrarTodos() {
    document.getElementById("inputBuscar").value = "";
    contactosFiltrados = [...contactos];
    paginaActual = 1;
    renderizarTabla();
}

function cambiarVista(vista) {
    if (vista === 'ventas') {
        document.getElementById("btnVistaVentas").classList.add("active", "btn-dark");
        document.getElementById("btnVistaVentas").classList.remove("btn-outline-dark");
        document.getElementById("btnVistaCompras").classList.remove("active", "btn-dark");
        document.getElementById("btnVistaCompras").classList.add("btn-outline-dark");
    } else {
        document.getElementById("btnVistaCompras").classList.add("active", "btn-dark");
        document.getElementById("btnVistaCompras").classList.remove("btn-outline-dark");
        document.getElementById("btnVistaVentas").classList.remove("active", "btn-dark");
        document.getElementById("btnVistaVentas").classList.add("btn-outline-dark");
    }
}

function toggleMenu() {
    alert("Menú de navegación");
}