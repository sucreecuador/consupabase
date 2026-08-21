const API = "https://consupabase-api.onrender.com/productos";

const tabla = document.getElementById("tablaProductos");
const buscar = document.getElementById("buscar");

const modal = document.getElementById("modal");
const btnNuevo = document.getElementById("btnNuevo");
const btnCerrar = document.getElementById("btnCerrar");
const btnGuardar = document.getElementById("btnGuardar");

let editId = null;

// Abrir modal
btnNuevo.onclick = () => {
    editId = null;
    document.getElementById("modalTitulo").innerText = "Nuevo Producto";
    modal.style.display = "flex";
};

// Cerrar modal
btnCerrar.onclick = () => modal.style.display = "none";

// Guardar producto
btnGuardar.onclick = async () => {
    const data = {
        codigo: document.getElementById("prodCodigo").value,
        descripcion: document.getElementById("prodDescripcion").value,
        marca: document.getElementById("prodMarca").value,
        proveedor: document.getElementById("prodProveedor").value,
        stock: Number(document.getElementById("prodStock").value),
        precio: Number(document.getElementById("prodPrecio").value)
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
    cargarProductos();
};

// Cargar productos
async function cargarProductos(filtro = "") {
    const res = await fetch(`${API}?descripcion=${filtro}`);
    const json = await res.json();

    tabla.innerHTML = "";

    json.data.forEach(prod => {
        tabla.innerHTML += `
            <tr>
                <td>${prod.codigo}</td>
                <td>${prod.descripcion}</td>
                <td>${prod.marca}</td>
                <td>${prod.proveedor}</td>
                <td>${prod.stock}</td>
                <td>$${prod.precio}</td>
                <td>
                    <button onclick="editar('${prod.id}')">✏️</button>
                    <button onclick="eliminar('${prod.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// Editar producto
async function editar(id) {
    editId = id;

    const res = await fetch(`${API}/${id}`);
    const prod = await res.json();

    document.getElementById("modalTitulo").innerText = "Editar Producto";

    document.getElementById("prodCodigo").value = prod.codigo;
    document.getElementById("prodDescripcion").value = prod.descripcion;
    document.getElementById("prodMarca").value = prod.marca;
    document.getElementById("prodProveedor").value = prod.proveedor;
    document.getElementById("prodStock").value = prod.stock;
    document.getElementById("prodPrecio").value = prod.precio;

    modal.style.display = "flex";
}

// Eliminar producto
async function eliminar(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    cargarProductos();
}

// Buscar
buscar.onkeyup = () => cargarProductos(buscar.value);

// Inicial
cargarProductos();
