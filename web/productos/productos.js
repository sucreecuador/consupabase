let productos = [];
let productosOriginal = [];
let paginaActual = 1;
let itemsPorPagina = 20;
let ordenActual = {};
let vista = 1;
let productoEditando = null;
let mostrarTodos = false;

// ===============================
//  CARGAR PRODUCTOS
// ===============================

async function cargarProductos() {
    try {
        const respuesta = await fetch("/api/productos");
        productos = await respuesta.json();
        productosOriginal = [...productos];
        mostrarPagina(1);
    } catch (error) {
        document.getElementById("tablaBody").innerHTML =
            `<tr><td colspan="9">Error al conectar con el servidor</td></tr>`;
    }
}

// ===============================
//  ENCABEZADOS DINÁMICOS
// ===============================

function actualizarEncabezados() {
    const thead = document.getElementById("theadProductos");

    if (vista === 1) {
        thead.innerHTML = `
            <tr>
                <th data-col="codigo">CÓDIGO</th>
                <th data-col="naci">NAC</th>
                <th data-col="marca">MARCA</th>
                <th data-col="descripcion">NOMBRE</th>
                <th data-col="unidad">UNI</th>
                <th data-col="precio_venta">PVP</th>
                <th data-col="saldo_temp">S.TEM</th>
                <th>ACCIONES</th>
            </tr>
        `;
    } else {
        thead.innerHTML = `
            <tr>
                <th data-col="pro1">PRO1</th>
                <th data-col="codigo">CÓDIGO</th>
                <th data-col="codigo_proveedor">COD.PROV</th>
                <th data-col="marca">MARCA</th>
                <th data-col="descripcion">DESCRIPCIÓN</th>
                <th data-col="saldo_temp">S.TEM</th>
                <th data-col="costo_prom">COSTO</th>
                <th data-col="precio_venta">P.VENTA</th>
                <th>ACCIONES</th>
            </tr>
        `;
    }

    activarOrdenamiento();
}

// ===============================
//  ORDENAR COLUMNAS
// ===============================

function activarOrdenamiento() {
    document.querySelectorAll("th[data-col]").forEach(th => {
        th.onclick = () => ordenarPor(th.dataset.col);
    });
}

function ordenarPor(columna) {
    const asc = !ordenActual[columna];
    ordenActual[columna] = asc;

    productos.sort((a, b) => {
        const x = (a[columna] ?? "").toString().toLowerCase();
        const y = (b[columna] ?? "").toString().toLowerCase();
        return asc ? x.localeCompare(y) : y.localeCompare(x);
    });

    mostrarPagina(1);
}

// ===============================
//  MOSTRAR PAGINA
// ===============================

function mostrarPagina(numPagina) {
    paginaActual = numPagina;

    let lista = productos;

    if (!mostrarTodos) {
        const inicio = (paginaActual - 1) * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        lista = productos.slice(inicio, fin);
    }

    const tbody = document.getElementById("tablaBody");
    tbody.innerHTML = "";

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9">No se encontraron productos</td></tr>`;
        return;
    }

    lista.forEach(prod => {
        if (vista === 1) {
            tbody.innerHTML += `
                <tr>
                    <td>${prod.codigo}</td>
                    <td>${prod.naci}</td>
                    <td>${prod.marca}</td>
                    <td>${prod.descripcion}</td>
                    <td>${prod.unidad}</td>
                    <td>${(prod.precio_venta ?? 0).toFixed(2)}</td>
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
                    <td>${prod.pro1}</td>
                    <td>${prod.codigo}</td>
                    <td>${prod.codigo_proveedor}</td>
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
        }
    });

    actualizarPaginacion();
}

// ===============================
//  PAGINACIÓN
// ===============================

function actualizarPaginacion() {
    if (mostrarTodos) {
        document.getElementById("paginaActual").innerText = `Mostrando todo`;
        return;
    }

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
//  FILTROS AVANZADOS
// ===============================

function aplicarFiltros() {
    const nombre = buscarNombre.value.toLowerCase();
    const marca = buscarMarca.value.toLowerCase();
    const codigo = buscarCodigo.value.toLowerCase();
    const pro1 = buscarPro1.value.toLowerCase();

    productos = productosOriginal.filter(p =>
        (p.descripcion ?? "").toLowerCase().includes(nombre) &&
        (p.marca ?? "").toLowerCase().includes(marca) &&
        (p.codigo ?? "").toLowerCase().includes(codigo) &&
        (p.pro1 ?? "").toString().toLowerCase().includes(pro1)
    );

    mostrarPagina(1);
}

buscarNombre.oninput = aplicarFiltros;
buscarMarca.oninput = aplicarFiltros;
buscarCodigo.oninput = aplicarFiltros;
buscarPro1.oninput = aplicarFiltros;

// ===============================
//  MOSTRAR TODOS
// ===============================

btnMostrarTodos.onclick = () => {
    mostrarTodos = !mostrarTodos;
    btnMostrarTodos.innerText = mostrarTodos ? "Modo paginado" : "Mostrar todos";
    mostrarPagina(1);
};

// ===============================
//  VISTAS
// ===============================

vista1.onclick = () => {
    vista = 1;
    vista1.classList.add("activa");
    vista2.classList.remove("activa");
    actualizarEncabezados();
    mostrarPagina(1);
};

vista2.onclick = () => {
    vista = 2;
    vista2.classList.add("activa");
    vista1.classList.remove("activa");
    actualizarEncabezados();
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

actualizarEncabezados();
cargarProductos();
