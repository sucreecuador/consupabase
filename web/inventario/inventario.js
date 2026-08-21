const API = "https://consupabase-api.onrender.com/inventario";

const tabla = document.getElementById("tablaInventario");

const fechaInicio = document.getElementById("fechaInicio");
const fechaFin = document.getElementById("fechaFin");
const tipoMovimiento = document.getElementById("tipoMovimiento");

const btnFiltrar = document.getElementById("btnFiltrar");
const btnNuevo = document.getElementById("btnNuevo");

const modal = document.getElementById("modal");
const btnCerrar = document.getElementById("btnCerrar");
const btnGuardar = document.getElementById("btnGuardar");

let editId = null;

// Abrir modal
btnNuevo.onclick = () => {
    editId = null;
    document.getElementById("modalTitulo").innerText = "Nuevo Movimiento";
    modal.style.display = "flex";
};

// Cerrar modal
btnCerrar.onclick = () => modal.style.display = "none";

// Guardar movimiento
btnGuardar.onclick = async () => {
    const data = {
        producto: document.getElementById("invProducto").value,
        tipo: document.getElementById("invTipo").value,
        cantidad: Number(document.getElementById("invCantidad").value),
        usuario: document.getElementById("invUsuario").value
    };

    if (editId) {
        await fetch(`${API}/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    } else {
        await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    }

    modal.style.display = "none";
    cargarInventario();
};

// Cargar inventario
async function cargarInventario() {
    const params = new URLSearchParams({
        inicio: fechaInicio.value,
        fin: fechaFin.value,
        tipo: tipoMovimiento.value
    });

    const res = await fetch(`${API}?${params.toString()}`);
    const json = await res.json();

    tabla.innerHTML = "";

    json.data.forEach(item => {
        tabla.innerHTML += `
            <tr>
                <td>${item.fecha}</td>
                <td>${item.producto}</td>
                <td>${item.tipo}</td>
                <td>${item.cantidad}</td>
                <td>${item.usuario}</td>
                <td>
                    <button onclick="editar('${item.id}')">✏️</button>
                    <button onclick="eliminar('${item.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// Editar movimiento
async function editar(id) {
    editId = id;

    const res = await fetch(`${API}/${id}`);
    const item = await res.json();

    document.getElementById("modalTitulo").innerText = "Editar Movimiento";

    document.getElementById("invProducto").value = item.producto;
    document.getElementById("invTipo").value = item.tipo;
    document.getElementById("invCantidad").value = item.cantidad;
    document.getElementById("invUsuario").value = item.usuario;

    modal.style.display = "flex";
}

// Eliminar movimiento
async function eliminar(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    cargarInventario();
}

// Filtrar
btnFiltrar.onclick = () => cargarInventario();

// Inicial
cargarInventario();
