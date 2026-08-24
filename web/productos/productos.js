let productos = [];
let paginaActual = 1;
let itemsPorPagina = 20;
let ordenActual = {};
let vista = 1;
let productoEditando = null;

// ===============================
//  CARGAR PRODUCTOS
// ===============================

async function cargarProductos() {
    try {
        const respuesta = await fetch("/api/productos");
        productos = await respuesta.json();
        mostrarPagina(1);
    } catch (error) {
        document.getElementById("tablaBody").innerHTML =
            `<tr><td colspan="8">Error al conectar con el servidor</td></tr>`;
    }
}

// ===============================
//  MOSTRAR PAGINA
// ===============================

function mostrarPagina(numPagina) {
    paginaActual = numPagina;

    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;

    const pagina = productos.slice(inicio, fin);

    const tbody = document.getElementById("tablaBody");
    tbody.innerHTML = "";

    if (pagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">No se encontraron productos</td></tr>`;
        return;
    }

    pagina.forEach(prod => {
        if (vista === 1) {
            tbody.innerHTML += `
                <tr>
                    <td>${prod.codigo}</td>
                    <td>${prod.naci}</td>
                    <td>${prod.marca}</td>
                    <td>${prod.descripcion}</td>
                    <td>${prod.unidad}</td>
                    <td>${prod.precio_venta}</td>
                    <td>${prod.saldo_temp}</td>
                    <td>
                        <button onclick='abrirModal(${JSON.stringify(prod)})'>✏️</button>
                        <button onclick='eliminarProducto(${prod.id})'>🗑️</button>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML += `
                <tr>
                    <td>${prod.codigo}</td>
                    <td>${prod.codigo_proveedor}</td>
                    <td>${prod.costo_prom}</td>
                    <td>${prod.precio_fob}</td>
                    <td>${prod.precio_anterior}</td>
                    <td>${prod.viene}</td>
                    <td>${prod.fecha_ultima_ingreso}</td>
                    <td>${prod.fecha_ultima_egreso}</td>
                </tr>
            `;
        }
    });

    actualizarPaginacion();
}

// ===============================
//  PAGINACIÓN
// ===============================

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(productos.length / itemsPorPagina);
    document.getElementById("paginaActual").innerText =
        `Página ${paginaActual} de ${totalPaginas}`;
}

btnPrimero.onclick = () => mostrarPagina(1);
btnAnterior.onclick = () => paginaActual > 1 && mostrarPagina(paginaActual - 1);
btnSiguiente.onclick = () => {
    const total = Math.ceil(productos.length / itemsPorPagina);
    paginaActual < total && mostrarPagina(paginaActual + 1);
};
btnUltimo.onclick = () => {
    const total = Math.ceil(productos.length / itemsPorPagina);
    mostrarPagina(total);
};
btnIr.onclick = () => {
    const num = parseInt(irPagina.value);
    const total = Math.ceil(productos.length / itemsPorPagina);
    if (num >= 1 && num <= total) mostrarPagina(num);
};

// ===============================
//  ORDENAR COLUMNAS
// ===============================

document.querySelectorAll("th[data-col]").forEach(th => {
    th.onclick = () => ordenarPor(th.dataset.col);
});

function ordenarPor(columna) {
    const asc = !ordenActual[columna];
    ordenActual[columna] = asc;

    productos.sort((a, b) => {
        const x = (a[columna] || "").toString().toLowerCase();
        const y = (b[columna] || "").toString().toLowerCase();
        return asc ? x.localeCompare(y) : y.localeCompare(x);
    });

    mostrarPagina(1);
}

// ===============================
//  BUSCADOR AVANZADO
// ===============================

function aplicarFiltros() {
    const nombre = buscarNombre.value.toLowerCase();
    const marca = buscarMarca.value.toLowerCase();
    const codigo = buscarCodigo.value.toLowerCase();

    const filtrados = productos.filter(p =>
        (p.descripcion || "").toLowerCase().includes(nombre) &&
        (p.marca || "").toLowerCase().includes(marca) &&
        (p.codigo || "").toLowerCase().includes(codigo)
    );

    const tbody = document.getElementById("tablaBody");
    tbody.innerHTML = "";

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">No se encontraron productos</td></tr>`;
        return;
    }

    filtrados.forEach(prod => {
        tbody.innerHTML += `
            <tr>
                <td>${prod.codigo}</td>
                <td>${prod.naci}</td>
                <td>${prod.marca}</td>
                <td>${prod.descripcion}</td>
                <td>${prod.unidad}</td>
                <td>${prod.precio_venta}</td>
                <td>${prod.saldo_temp}</td>
                <td>
                    <button onclick='abrirModal(${JSON.stringify(prod)})'>✏️</button>
                    <button onclick='eliminarProducto(${prod.id})'>🗑️</button>
                </td>
            </tr>
        `;
    });
}

buscarNombre.oninput = aplicarFiltros;
buscarMarca.oninput = aplicarFiltros;
buscarCodigo.oninput = aplicarFiltros;

// ===============================
//  VISTAS
// ===============================

vista1.onclick = () => {
    vista = 1;
    vista1.classList.add("activa");
    vista2.classList.remove("activa");
    mostrarPagina(1);
};

vista2.onclick = () => {
    vista = 2;
    vista2.classList.add("activa");
    vista1.classList.remove("activa");
    mostrarPagina(1);
};

// ===============================
//  EDITAR PRODUCTO
// ===============================

function abrirModal(prod) {
    productoEditando = prod;

    editCodigo.value = prod.codigo;
    editDescripcion.value = prod.descripcion;
    editPrecio.value = prod.precio_venta;

    modalEditar.style.display = "block";
}

cerrarModal.onclick = () => modalEditar.style.display = "none";

guardarEdicion.onclick = async () => {
    const nuevo = {
        codigo: editCodigo.value,
        descripcion: editDescripcion.value,
        precio_venta: editPrecio.value
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
//  CREAR PRODUCTO
// ===============================

btnNuevoProducto.onclick = () => {
    modalCrear.style.display = "block";
};

cerrarCrear.onclick = () => {
    modalCrear.style.display = "none";
};

guardarNuevo.onclick = async () => {
    const nuevo = {
        codigo: newCodigo.value,
        descripcion: newDescripcion.value,
        marca: newMarca.value,
        unidad: newUnidad.value,
        precio_venta: newPrecio.value
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
//  ELIMINAR PRODUCTO
// ===============================

async function eliminarProducto(id) {
    if (!confirm("¿Eliminar producto?")) return;

    await fetch(`/api/productos/${id}`, {
        method: "DELETE"
    });

    cargarProductos();
}

// ===============================
//  OCULTAR SIDEBAR
// ===============================

toggleSidebar.onclick = () => {
    const sidebar = document.getElementById("sidebar");
    const main = document.querySelector(".main-content");

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
//  INICIO
// ===============================

cargarProductos();
