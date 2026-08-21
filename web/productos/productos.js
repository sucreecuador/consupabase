const API = "https://consupabase-api.onrender.com/productos";

const tabla = document.getElementById("tablaProductos");
const buscar = document.getElementById("buscar");

const btnNuevo = document.getElementById("btnNuevo");
const modal = document.getElementById("modal");
const btnCerrar = document.getElementById("btnCerrar");
const btnGuardar = document.getElementById("btnGuardar");

let editId = null;

// Paginación
let pagina = 1;
let porPagina = 20;
let totalPaginas = 1;

// Ordenamiento
let ordenColumna = "descripcion";
let ordenDireccion = "asc";

// ===============================
// Abrir modal
// ===============================
btnNuevo.onclick = () => {
    editId = null;
    document.getElementById("modalTitulo").innerText = "Nuevo Producto";

    document.getElementById("prodCodigo").value = "";
    document.getElementById("prodDescripcion").value = "";
    document.getElementById("prodMarca").value = "";
    document.getElementById("prodProveedor").value = "";
    document.getElementById("prodStock").value = "";
    document.getElementById("prodPrecio").value = "";

    modal.style.display = "flex";
};

// ===============================
// Cerrar modal
// ===============================
btnCerrar.onclick = () => modal.style.display = "none";

// ===============================
// Guardar producto
// ===============================
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

// ===============================
// Cargar productos con orden y paginación
// ===============================
async function cargarProductos(filtro = "") {
    const params = new URLSearchParams({
        descripcion: filtro,
        pagina,
        porPagina,
        ordenColumna,
        ordenDireccion
    });

    const res = await fetch(`${API}?${params.toString()}`);
    const json = await res.json();

    tabla.innerHTML = "";
    totalPaginas = json.totalPaginas;

    json.data.forEach(prod => {
        const stockColor =
            prod.stock <= 0 ? "badge-red" :
            prod.stock < 10 ? "badge-orange" :
            "badge-green";

        tabla.innerHTML += `
            <tr>
                <td>${prod.codigo ?? ""}</td>
                <td>${prod.descripcion ?? ""}</td>
                <td><span class="badge badge-blue">${prod.marca ?? ""}</span></td>
                <td><span class="badge badge-gray">${prod.proveedor ?? "—"}</span></td>
                <td><span class="badge ${stockColor}">${prod.stock ?? 0}</span></td>
                <td><span class="badge badge-green">$${(prod.precio ?? 0).toFixed(2)}</span></td>
                <td>
                    <button class="btn-edit" onclick="editar('${prod.id}')">✏️</button>
                    <button class="btn-delete" onclick="eliminar('${prod.id}')">🗑️</button>
                </td>
            </tr>
        `;
    });

    renderPaginacion();
}

// ===============================
// Ordenar columnas
// ===============================
function ordenar(columna) {
    if (ordenColumna === columna) {
        ordenDireccion = ordenDireccion === "asc" ? "desc" : "asc";
    } else {
        ordenColumna = columna;
        ordenDireccion = "asc";
    }
    cargarProductos(buscar.value);
}

// ===============================
// Editar producto
// ===============================
async function editar(id) {
    editId = id;

    const res = await fetch(`${API}/${id}`);
    const prod = await res.json();

    document.getElementById("modalTitulo").innerText = "Editar Producto";

    document.getElementById("prodCodigo").value = prod.codigo ?? "";
    document.getElementById("prodDescripcion").value = prod.descripcion ?? "";
    document.getElementById("prodMarca").value = prod.marca ?? "";
    document.getElementById("prodProveedor").value = prod.proveedor ?? "";
    document.getElementById("prodStock").value = prod.stock ?? 0;
    document.getElementById("prodPrecio").value = prod.precio ?? 0;

    modal.style.display = "flex";
}

// ===============================
// Eliminar producto
// ===============================
async function eliminar(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    cargarProductos();
}

// ===============================
// Paginación
// ===============================
function renderPaginacion() {
    const paginacion = document.getElementById("paginacion");

    paginacion.innerHTML = `
        <button onclick="paginaAnterior()" ${pagina === 1 ? "disabled" : ""}>« Anterior</button>
        <span>Página ${pagina} de ${totalPaginas}</span>
        <button onclick="paginaSiguiente()" ${pagina === totalPaginas ? "disabled" : ""}>Siguiente »</button>
    `;
}

function paginaAnterior() {
    if (pagina > 1) {
        pagina--;
        cargarProductos(buscar.value);
    }
}

function paginaSiguiente() {
    if (pagina < totalPaginas) {
        pagina++;
        cargarProductos(buscar.value);
    }
}

// ===============================
// Buscar
// ===============================
buscar.onkeyup = () => {
    pagina = 1;
    cargarProductos(buscar.value);
};

// Inicial
cargarProductos();
