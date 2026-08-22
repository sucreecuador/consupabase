const API = "https://consupabase-api.onrender.com/clientes";

const tabla = document.getElementById("tablaContactos");
const buscar = document.getElementById("buscar");

const btnNuevo = document.getElementById("btnNuevo");
const modal = document.getElementById("modal");
const btnCerrar = document.getElementById("btnCerrar");
const btnGuardar = document.getElementById("btnGuardar");

let editId = null;

// ===============================
// ABRIR MODAL
// ===============================
btnNuevo.onclick = () => {
    editId = null;
    document.getElementById("modalTitulo").innerText = "Nuevo Contacto";

    document.getElementById("conNombre").value = "";
    document.getElementById("conEmpresa").value = "";
    document.getElementById("conTelefono").value = "";
    document.getElementById("conEmail").value = "";
    document.getElementById("conTipo").value = "";

    modal.style.display = "flex";
};

// ===============================
// CERRAR MODAL
// ===============================
btnCerrar.onclick = () => modal.style.display = "none";

// ===============================
// GUARDAR CONTACTO
// ===============================
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
    cargarContactos(buscar.value);
};

// ===============================
// CARGAR CONTACTOS
// ===============================
async function cargarContactos(filtro = "") {
    const params = new URLSearchParams({
        nombre: filtro
    });

    const res = await fetch(`${API}?${params.toString()}`);
    const json = await res.json();

    tabla.innerHTML = "";

    json.data.forEach(con => {
        tabla.innerHTML += `
            <tr>
                <td>${con.nombre ?? ""}</td>
                <td>${con.empresa ?? ""}</td>
                <td>${con.telefono ?? ""}</td>
                <td>${con.email ?? ""}</td>
                <td>${con.tipo ?? ""}</td>
                <td>
                    <button class="btn-edit" onclick="editar('${con.id}')">✏️</button>
                    <button class="btn-delete" onclick="eliminar('${con.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// ===============================
// EDITAR CONTACTO
// ===============================
async function editar(id) {
    editId = id;

    const res = await fetch(`${API}/${id}`);
    const con = await res.json();

    document.getElementById("modalTitulo").innerText = "Editar Contacto";

    document.getElementById("conNombre").value = con.nombre ?? "";
    document.getElementById("conEmpresa").value = con.empresa ?? "";
    document.getElementById("conTelefono").value = con.telefono ?? "";
    document.getElementById("conEmail").value = con.email ?? "";
    document.getElementById("conTipo").value = con.tipo ?? "";

    modal.style.display = "flex";
}

// ===============================
// ELIMINAR CONTACTO
// ===============================
async function eliminar(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    cargarContactos(buscar.value);
}

// ===============================
// BUSCAR
// ===============================
buscar.onkeyup = () => {
    cargarContactos(buscar.value);
};

// ===============================
// INICIAL
// ===============================
cargarContactos();
