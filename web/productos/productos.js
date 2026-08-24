// build 24-08-2026

// ===============================
// VARIABLES
// ===============================

let productos = [];
let productosFiltrados = [];
let paginaActual = 1;
let itemsPorPagina = 20;
let mostrarTodos = false;
let vista = 2;
let ordenActual = {};
let productoEditando = null;

// ===============================
// REFERENCIAS DOM
// ===============================

const tablaBody       = document.getElementById("tablaBody");
const theadProductos  = document.getElementById("theadProductos");

const buscarNombre    = document.getElementById("buscarNombre");
const buscarMarca     = document.getElementById("buscarMarca");
const buscarCodigo    = document.getElementById("buscarCodigo");
const buscarPro1      = document.getElementById("buscarPro1");

const btnMostrarTodos = document.getElementById("btnMostrarTodos");
const btnNuevoProducto= document.getElementById("btnNuevoProducto");

const vista1          = document.getElementById("vista1");
const vista2          = document.getElementById("vista2");

const btnPrimero      = document.getElementById("btnPrimero");
const btnAnterior     = document.getElementById("btnAnterior");
const btnSiguiente    = document.getElementById("btnSiguiente");
const btnUltimo       = document.getElementById("btnUltimo");
const paginaActualSpan= document.getElementById("paginaActual");
const irPagina        = document.getElementById("irPagina");
const btnIr           = document.getElementById("btnIr");

const modalEditar     = document.getElementById("modalEditar");
const editCodigo      = document.getElementById("editCodigo");
const editDescripcion = document.getElementById("editDescripcion");
const editPrecio      = document.getElementById("editPrecio");
const guardarEdicion  = document.getElementById("guardarEdicion");
const cerrarModal     = document.getElementById("cerrarModal");

const modalCrear      = document.getElementById("modalCrear");
const newCodigo       = document.getElementById("newCodigo");
const newDescripcion  = document.getElementById("newDescripcion");
const newMarca        = document.getElementById("newMarca");
const newUnidad       = document.getElementById("newUnidad");
const newPrecio       = document.getElementById("newPrecio");
const guardarNuevo    = document.getElementById("guardarNuevo");
const cerrarCrear     = document.getElementById("cerrarCrear");

const toggleSidebar   = document.getElementById("toggleSidebar");

// ===============================
// CARGAR PRODUCTOS
// ===============================

async function cargarProductos() {
    try {
        const contacto = buscarPro1.value || 319;
        const respuesta = await fetch(`https://consupabase-api.onrender.com/api/productos?contacto=${contacto}`);
        productos = await respuesta.json();
        productosFiltrados = [...productos];
        mostrarPagina(1);
    } catch (error) {
        tablaBody.innerHTML =
            `<tr><td colspan="12">Error al conectar con el servidor</td></tr>`;
    }
}

// ===============================
// ENCABEZADOS DINÁMICOS
// ===============================

function actualizarEncabezados() {
    theadProductos.innerHTML = `
        <tr>
            <th data-col="pro1">PRO1</th>
            <th data-col="pro2">PRO2</th>
            <th data-col="pro3">PRO3</th>
            <th data-col="codigo_proveedor">PROV</th>
            <th data-col="codigo">CÓDIGO</th>
            <th data-col="marca">MARCA</th>
            <th data-col="descripcion">DESCRIPCIÓN</th>
            <th data-col="saldo_temp">S.TEM</th>
            <th data-col="costo_prom">COSTO</th>
            <th data-col="precio_venta">P.VENTA</th>
            <th>ACCIONES</th>
        </tr>
    `;

    activarOrdenamiento();
}

// ===============================
// ORDENAR COLUMNAS
// ===============================

function activarOrdenamiento() {
    document.querySelectorAll("th[data-col]").forEach(th => {
        th.onclick = () => ordenarPor(th.dataset.col);
    });
}

function ordenarPor(columna) {
    const asc = !ordenActual[columna];
    ordenActual[columna] = asc;

    productosFiltrados.sort((a, b) => {
        const x = (a[columna] ?? "").toString().toLowerCase();
        const y = (b[columna] ?? "").toString().toLowerCase();
        return asc ? x.localeCompare(y) : y.localeCompare(x);
    });

    mostrarPagina(1);
}

// ===============================
// MOSTRAR PAGINA
// ===============================

function mostrarPagina(numPagina) {
    paginaActual = numPagina;

    let lista = [];

    if (mostrarTodos) {
        lista = productosFiltrados;
    } else {
        const inicio = (paginaActual - 1) * itemsPorPagina;
        const fin    = inicio + itemsPorPagina;
        lista = productosFiltrados.slice(inicio, fin);
    }

    tablaBody.innerHTML = "";

    if (lista.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="12">No se encontraron productos</td></tr>`;
        actualizarPaginacion();
        return;
    }

    lista.forEach(prod => {
        tablaBody.innerHTML += `
            <tr>
                <td>${prod.pro1 ?? "—"}</td>
                <td>${prod.pro2 ?? "—"}</td>
                <td>${prod.pro3 ?? "—"}</td>
                <td>${prod.codigo_proveedor ?? ""}</td>
                <td>${prod.codigo}</td>
                <td>${prod.marca}</td>
                <td>${prod.descripcion}</td>
                <td>${prod.saldo_temp}</td>
                <td>${(prod.costo_prom ?? 0).toFixed(2)}</td>
                <td>${(prod.precio_venta ?? 0).toFixed(2)}</td>
                <td>
                    <button onclick='abrirModal(${JSON.stringify(prod)})'>✏️</button>
                    <button onclick='eliminarProducto(${prod.id})'>🗑️</button>
                </td>
            </tr>
        `;
    });

    actualizarPaginacion();
}

// ===============================
// PAGINACIÓN
// ===============================

function actualizarPaginacion() {
    if (mostrarTodos) {
        paginaActualSpan.innerText = `Mostrando ${productosFiltrados.length} productos`;
        return;
    }

    const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina) || 1;
    paginaActualSpan.innerText = `Página ${paginaActual} de ${totalPaginas}`;
}

btnPrimero.onclick = () => {
    if (!mostrarTodos) mostrarPagina(1);
};

btnAnterior.onclick = () => {
    if (!mostrarTodos && paginaActual > 1) mostrarPagina(paginaActual - 1);
};

btnSiguiente.onclick = () => {
    if (!mostrarTodos) {
        const total = Math.ceil(productosFiltrados.length / itemsPorPagina) || 1;
        if (paginaActual < total) mostrarPagina(paginaActual + 1);
    }
};

btnUltimo.onclick = () => {
    if (!mostrarTodos) {
        const total = Math.ceil(productosFiltrados.length / itemsPorPagina) || 1;
        mostrarPagina(total);
    }
};

btnIr.onclick = () => {
    if (!mostrarTodos) {
        const num   = parseInt(irPagina.value);
        const total = Math.ceil(productosFiltrados.length / itemsPorPagina) || 1;
        if (num >= 1 && num <= total) mostrarPagina(num);
    }
};

// ===============================
// FILTROS
// ===============================

function aplicarFiltros() {
    const nombre = buscarNombre.value.toLowerCase();
    const marca  = buscarMarca.value.toLowerCase();
    const codigo = buscarCodigo.value.toLowerCase();
    const pro1   = buscarPro1.value.toLowerCase();

    productosFiltrados = productos.filter(p =>
        (p.descripcion ?? "").toLowerCase().includes(nombre) &&
        (p.marca ?? "").toLowerCase().includes(marca) &&
        (p.codigo ?? "").toLowerCase().includes(codigo) &&
        (
            (p.pro1 ?? "").toString().toLowerCase().includes(pro1) ||
            (p.pro2 ?? "").toString().toLowerCase().includes(pro1) ||
            (p.pro3 ?? "").toString().toLowerCase().includes(pro1)
        )
    );

    mostrarPagina(1);
}

buscarNombre.oninput = aplicarFiltros;
buscarMarca.oninput  = aplicarFiltros;
buscarCodigo.oninput = aplicarFiltros;
buscarPro1.oninput   = aplicarFiltros;

// ===============================
// MOSTRAR TODOS
// ===============================

btnMostrarTodos.onclick = () => {
    mostrarTodos = !mostrarTodos;
    btnMostrarTodos.innerText = mostrarTodos ? "Modo paginado" : "Mostrar todos";
    mostrarPagina(1);
};

// ===============================
// EDITAR PRODUCTO
// ===============================

function abrirModal(prod) {
    productoEditando = prod;

    editCodigo.value      = prod.codigo ?? "";
    editDescripcion.value = prod.descripcion ?? "";
    editPrecio.value      = prod.precio_venta ?? "";

    modalEditar.style.display = "block";
}

cerrarModal.onclick = () => {
    modalEditar.style.display = "none";
};

guardarEdicion.onclick = async () => {
    if (!productoEditando) return;

    const nuevo = {
        codigo:       editCodigo.value,
        descripcion:  editDescripcion.value,
        precio_venta: parseFloat(editPrecio.value || "0")
    };

    await fetch(`/api/productos/${productoEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo)
    });

    modalEditar.style.display = "none";
    cargarProductos();
};

// ===============================
// CREAR PRODUCTO
// ===============================

btnNuevoProducto.onclick = () => {
    modalCrear.style.display = "block";
};

cerrarCrear.onclick = () => {
    modalCrear.style.display = "none";
};

guardarNuevo.onclick = async () => {
    const nuevo = {
        codigo:       newCodigo.value,
        descripcion:  newDescripcion.value,
        marca:        newMarca.value,
        unidad:       newUnidad.value,
        precio_venta: parseFloat(newPrecio.value || "0")
    };

    await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo)
    });

    modalCrear.style.display = "none";
    cargarProductos();
};

// ===============================
// ELIMINAR PRODUCTO
// ===============================

async function eliminarProducto(id) {
    if (!confirm("¿Eliminar producto?")) return;

    await fetch(`/api/productos/${id}`, {
        method: "DELETE"
    });

    cargarProductos();
}

// ===============================
// SIDEBAR
// ===============================

toggleSidebar.onclick = () => {
    const sidebar = document.getElementById("sidebar");
    const main    = document.querySelector(".main-content");

    if (sidebar.style.display === "none") {
        sidebar.style.display = "block";
        main.style.marginLeft = "240px";
        toggleSidebar.innerText = "Ocultar menú";
    } else {
        sidebar.style.display = "none";
        main.style.marginLeft = "20px";
        toggleSidebar.innerText = "Mostrar menú";
    }
};

// ===============================
// INICIO
// ===============================

actualizarEncabezados();
cargarProductos();
