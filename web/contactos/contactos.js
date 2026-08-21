const API = "https://consupabase-api.onrender.com/contactos";

const tabla = document.getElementById("tablaContactos");
const buscar = document.getElementById("buscar");

const modal = document.getElementById("modal");
const btnNuevo = document.getElementById("btnNuevo");
const btnCerrar = document.getElementById("btnCerrar");
const btnGuardar = document.getElementById("btnGuardar");

let editId = null;

// Abrir modal
btnNuevo.onclick = () => {
    editId = null;
    document.getElementById("modalTitulo").innerText = "Nuevo Contacto";
    modal.style.display = "flex";
};

// Cerrar modal
btnCerrar.onclick = () => modal.style.display = "none";

// Guardar contacto
btnGuardar.onclick = async () => {
    const data = {
        nombre: document.getElementById("conNombre").value,
        empresa: document.getElementById("conEmpresa").value,
        telefono: document.getElementById("conTelefono").value,
        email: document.getElementById("conEmail").value,
        tipo: document.getElementById("conTipo").value
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
    cargarContactos();
};

// Cargar contactos
async function cargarContactos(filtro = "") {
    const res = await fetch(`${API}?nombre=${filtro}`);
    const json = await res.json();

    tabla.innerHTML = "";

    json.data.forEach(con => {
        tabla.innerHTML += `
            <tr>
                <td>${con.nombre}</td>
                <td>${con.empresa}</td>
                <td>${con.telefono}</td>
                <td>${con.email}</td>
                <td>${con.tipo}</td>
                <td>
                    <button onclick="editar('${con.id}')">✏️</button>
                    <button onclick="eliminar('${con.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// Editar contacto
async function editar(id) {
    editId = id;

    const res = await fetch(`${API}/${id}`);
    const con = await res.json();

    document.getElementById("modalTitulo").innerText = "Editar Contacto";

    document.getElementById("conNombre").value = con.nombre;
    document.getElementById("conEmpresa").value = con.empresa;
    document.getElementById("conTelefono").value = con.telefono;
    document.getElementById("conEmail").value = con.email;
    document.getElementById("conTipo").value = con.tipo;

    modal.style.display = "flex";
}

// Eliminar contacto
async function eliminar(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    cargarContactos();
}

// Buscar
buscar.onkeyup = () => cargarContactos(buscar.value);

// Inicial
cargarContactos();
