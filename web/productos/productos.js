let productos = [];
let productosFiltrados = [];
let paginaActual = 1;
let itemsPorPagina = 20;
let mostrarTodos = true;
let ordenActual = {};
let productoEditando = null;
let vistaActual = 2;

const tablaBody       = document.getElementById("tablaBody");
const theadProductos  = document.getElementById("theadProductos");

const buscarNombre    = document.getElementById("buscarNombre");
const buscarMarca     = document.getElementById("buscarMarca");
const buscarCodigo    = document.getElementById("buscarCodigo");
const buscarPro1      = document.getElementById("buscarPro1");

const btnMostrarTodos = document.getElementById("btnMostrarTodos");
const btnNuevoProducto= document.getElementById("btnNuevoProducto");

const btnVista1       = document.getElementById("vista1");
const btnVista2       = document.getElementById("vista2");

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

if (btnVista1) {
    btnVista1.onclick = () => {
        vistaActual = 1;
        btnVista1.classList.add("activa");
        if (btnVista2) btnVista2.classList.remove("activa");
        actualizarEncabezados();
        mostrarPagina(1);
    };
}

if (btnVista2) {
    btnVista2.onclick = () => {
        vistaActual = 2;
        btnVista2.classList.add("activa");
        if (btnVista1) btnVista1.classList.remove("activa");
        actualizarEncabezados();
        mostrarPagina(1);
    };
}

async function cargarProductos() {
    try {
        // Intenta obtener los datos filtrados directamente o la lista completa
        const respuesta = await fetch('/api/productos?contacto=319');
        let data = await respuesta.json();
        
        // Si el endpoint no filtró automáticamente, forzamos el filtro local por 319
        productos = data.filter(p => 
            String(p.pro1) === "319" || 
            String(p.pro2) === "319" || 
            String(p.pro3) === "319" ||
            String(p.contacto) === "319"
        );

        // Si la respuesta venía filtrada de origen pero el array quedó vacío con el filtro extra, usamos la data limpia
        if (productos.length === 0 && data.length > 0) {
            productos = data;
        }

        productosFiltrados = [...productos];
        actualizarEncabezados();
        mostrarPagina(1);
    } catch (error) {
        if (tablaBody) {
            tablaBody.innerHTML =
                `<tr><td colspan="11" style="text-align:center; color:red;">Error al cargar datos del proveedor 319</td></tr>`;
        }
    }
}

function actualizarEncabezados() {
    if (!theadProductos) return;

    if (vistaActual === 1) {
        theadProductos.innerHTML = `
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
        theadProductos.innerHTML = `
            <tr>
                <th data-col="pro1">PRO1</th>
                <th data-col="pro2">PRO2</th>
                <th data-col="pro3">PRO3</th>
                <th data-col="codigo_proveedor">CÓD. PROV.</th>
                <th data-col="codigo">CÓDIGO</th>
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

    if (!tablaBody) return;
    tablaBody.innerHTML = "";

    const totalCols = vistaActual === 1 ? 8 : 11;

    if (lista.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="${totalCols}" style="text-align:center;">No hay registros asociados al proveedor 319</td></tr>`;
        actualizarPaginacion();
        return;
    }

    lista.forEach(prod => {
        if (vistaActual === 1) {
            tablaBody.innerHTML += `
                <tr>
                    <td>${prod.codigo ?? ""}</td>
                    <td>${prod.naci ?? ""}</td>
                    <td>${prod.marca ?? ""}</td>
                    <td>${prod.descripcion ?? ""}</td>
                    <td>${prod.unidad ?? ""}</td>
                    <td>${(prod.precio_venta ?? 0).toFixed(2)}</td>
                    <td>${prod.saldo_temp ?? 0}</td>
                    <td style="text-align:center;">
                        <button onclick='abrirModal(${JSON.stringify(prod)})' title="Editar">✏️</button>
                        <button onclick='eliminarProducto(${prod.id})' title="Eliminar">🗑️</button>
                    </td>
                </tr>
            `;
        } else {
            const codProv = prod.codigo_proveedor ?? prod.cod_proveedor ?? "—";
            
            tablaBody.innerHTML += `
                <tr>
                    <td>${prod.pro1 ?? "—"}</td>
                    <td>${prod.pro2 ?? "—"}</td>
                    <td>${prod.pro3 ?? "—"}</td>
                    <td>${codProv}</td>
                    <td>${prod.codigo ?? ""}</td>
                    <td>${prod.marca ?? ""}</td>
                    <td>${prod.descripcion ?? ""}</td>
                    <td>${prod.saldo_temp ?? 0}</td>
                    <td>${(prod.costo_prom ?? 0).toFixed(2)}</td>
                    <td>${(prod.precio_venta ?? 0).toFixed(2)}</td>
                    <td style="text-align:center;">
                        <button onclick='abrirModal(${JSON.stringify(prod)})' title="Editar">✏️</button>
                        <button onclick='eliminarProducto(${prod.id})' title="Eliminar">🗑️</button>
                    </td>
                </tr>
            `;
        }
    });

    actualizarPaginacion();
}

function actualizarPaginacion() {
    if (!paginaActualSpan) return;

    if (mostrarTodos) {
        paginaActualSpan.innerText = `Mostrando ${productosFiltrados.length} productos (Proveedor 319)`;
        return;
    }

    const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina) || 1;
    paginaActualSpan.innerText = `Página ${paginaActual} de ${totalPaginas}`;
}

function aplicarFiltros() {
    const nombre = buscarNombre ? buscarNombre.value.toLowerCase() : "";
    const marca  = buscarMarca ? buscarMarca.value.toLowerCase() : "";
    const codigo = buscarCodigo ? buscarCodigo.value.toLowerCase() : "";

    productosFiltrados = productos.filter(p =>
        (p.descripcion ?? "").toLowerCase().includes(nombre) &&
        (p.marca ?? "").toLowerCase().includes(marca) &&
        (p.codigo ?? "").toLowerCase().includes(codigo)
    );

    mostrarPagina(1);
}

if (buscarNombre) buscarNombre.oninput = aplicarFiltros;
if (buscarMarca) buscarMarca.oninput  = aplicarFiltros;
if (buscarCodigo) buscarCodigo.oninput = aplicarFiltros;

if (btnMostrarTodos) {
    btnMostrarTodos.onclick = () => {
        mostrarTodos = !mostrarTodos;
        btnMostrarTodos.innerText = mostrarTodos ? "Modo paginado" : "Mostrar todos";
        mostrarPagina(1);
    };
}

document.addEventListener("DOMContentLoaded", () => {
    vistaActual = 2;
    if (btnVista2) btnVista2.classList.add("activa");
    if (btnVista1) btnVista1.classList.remove("activa");
    cargarProductos();
});