// ============================================================
//  CONSUPABASE ERP - Módulo Productos con Supabase (CRUD)
// ============================================================

// 1) CONFIGURAR SUPABASE CON TUS KEYS REALES
const SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co";
const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2) REFERENCIAS DOM
const tabla = document.getElementById("tablaProductos");
const modal = document.getElementById("modalProducto");

const prodId = document.getElementById("prodId");
const prodCodigo = document.getElementById("prodCodigo");
const prodNombre = document.getElementById("prodNombre");
const prodMarca = document.getElementById("prodMarca");
const prodStock = document.getElementById("prodStock");
const prodPrecio = document.getElementById("prodPrecio");
const modalTitulo = document.getElementById("modalTitulo");

// 3) ABRIR/CERRAR MODAL
document.getElementById("btnNuevoProducto").onclick = () => {
    limpiarFormulario();
    modalTitulo.textContent = "Nuevo Producto";
    modal.style.display = "flex";
};

document.getElementById("btnCerrarModal").onclick = () => {
    modal.style.display = "none";
};

// 4) LIMPIAR FORMULARIO
function limpiarFormulario() {
    prodId.value = "";
    prodCodigo.value = "";
    prodNombre.value = "";
    prodMarca.value = "";
    prodStock.value = "";
    prodPrecio.value = "";
}

// 5) LISTAR PRODUCTOS (READ)
async function cargarProductos() {
    tabla.innerHTML = `
        <tr>
            <td colspan="6">Cargando productos...</td>
        </tr>
    `;

    const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" style="color:red;">
                    Error cargando productos: ${error.message}
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = "";

    data.forEach(prod => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${prod.codigo}</td>
            <td>${prod.nombre}</td>
            <td>${prod.marca}</td>
            <td>${prod.stock}</td>
            <td>$${prod.precio}</td>
            <td>
                <button class="btnEditar" data-id="${prod.id}">✏️</button>
                <button class="btnEliminar" data-id="${prod.id}">🗑️</button>
            </td>
        `;
        tabla.appendChild(fila);
    });

    document.querySelectorAll(".btnEditar").forEach(btn => {
        btn.onclick = () => editarProducto(btn.dataset.id);
    });

    document.querySelectorAll(".btnEliminar").forEach(btn => {
        btn.onclick = () => eliminarProducto(btn.dataset.id);
    });
}

// 6) GUARDAR PRODUCTO (CREATE/UPDATE)
document.getElementById("btnGuardarProducto").onclick = async () => {
    const id = prodId.value;
    const payload = {
        codigo: prodCodigo.value,
        nombre: prodNombre.value,
        marca: prodMarca.value,
        stock: Number(prodStock.value),
        precio: Number(prodPrecio.value)
    };

    let result;

    if (id) {
        result = await supabase
            .from("productos")
            .update(payload)
            .eq("id", id);
    } else {
        result = await supabase
            .from("productos")
            .insert(payload);
    }

    const { error } = result;

    if (error) {
        alert("Error guardando producto: " + error.message);
        return;
    }

    modal.style.display = "none";
    await cargarProductos();
};

// 7) EDITAR PRODUCTO
async function editarProducto(id) {
    const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        alert("Error cargando producto: " + error.message);
        return;
    }

    prodId.value = data.id;
    prodCodigo.value = data.codigo;
    prodNombre.value = data.nombre;
    prodMarca.value = data.marca;
    prodStock.value = data.stock;
    prodPrecio.value = data.precio;

    modalTitulo.textContent = "Editar Producto";
    modal.style.display = "flex";
}

// 8) ELIMINAR PRODUCTO
async function eliminarProducto(id) {
    if (!confirm("¿Eliminar este producto?")) return;

    const { error } = await supabase
        .from("productos")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Error eliminando producto: " + error.message);
        return;
    }

    await cargarProductos();
}

// 9) INICIALIZAR
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});
