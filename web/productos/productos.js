// ===============================
//  CARGAR PRODUCTOS DESDE SUPABASE
// ===============================

let productos = [];
let paginaActual = 1;
let itemsPorPagina = 20;

// Llamar API
async function cargarProductos() {
    try {
        const respuesta = await fetch("/api/productos");
        productos = await respuesta.json();

        mostrarPagina(1);

    } catch (error) {
        console.error("Error cargando productos:", error);
        document.getElementById("tablaBody").innerHTML = `
            <tr><td colspan="8" class="sin-productos">Error al conectar con el servidor</td></tr>
        `;
    }
}

// ===============================
//  MOSTRAR PAGINACIÓN
// ===============================

function mostrarPagina(numPagina) {
    paginaActual = numPagina;

    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;

    const pagina = productos.slice(inicio, fin);

    const tbody = document.getElementById("tablaBody");
    tbody.innerHTML = "";

    if (pagina.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="8" class="sin-productos">No se encontraron productos</td></tr>
        `;
        return;
    }

    pagina.forEach(prod => {
        tbody.innerHTML += `
            <tr>
                <td>${prod.codigo || ""}</td>
                <td>${prod.naci || ""}</td>
                <td>${prod.marca || ""}</td>
                <td>${prod.descripcion || ""}</td>
                <td>${prod.unidad || ""}</td>
                <td>${prod.precio_venta || ""}</td>
                <td>${prod.saldo_temp || ""}</td>
                <td>
                    <button class="btn-accion">✏️</button>
                    <button class="btn-accion">🗑️</button>
                </td>
            </tr>
        `;
    });

    actualizarPaginacion();
}

// ===============================
//  ACTUALIZAR PAGINACIÓN
// ===============================

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(productos.length / itemsPorPagina);
    document.getElementById("paginaActual").innerText = `Página ${paginaActual} de ${totalPaginas}`;
}

// ===============================
//  BOTONES DE PAGINACIÓN
// ===============================

document.getElementById("btnPrimero").onclick = () => mostrarPagina(1);
document.getElementById("btnAnterior").onclick = () => {
    if (paginaActual > 1) mostrarPagina(paginaActual - 1);
};
document.getElementById("btnSiguiente").onclick = () => {
    const totalPaginas = Math.ceil(productos.length / itemsPorPagina);
    if (paginaActual < totalPaginas) mostrarPagina(paginaActual + 1);
};
document.getElementById("btnUltimo").onclick = () => {
    const totalPaginas = Math.ceil(productos.length / itemsPorPagina);
    mostrarPagina(totalPaginas);
};

document.getElementById("btnIr").onclick = () => {
    const num = parseInt(document.getElementById("irPagina").value);
    const totalPaginas = Math.ceil(productos.length / itemsPorPagina);
    if (num >= 1 && num <= totalPaginas) mostrarPagina(num);
};

// ===============================
//  BUSCADOR
// ===============================

document.getElementById("buscarNombre").addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase();

    const filtrados = productos.filter(p =>
        (p.descripcion || "").toLowerCase().includes(texto)
    );

    const tbody = document.getElementById("tablaBody");
    tbody.innerHTML = "";

    if (filtrados.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="8" class="sin-productos">No se encontraron productos</td></tr>
        `;
        return;
    }

    filtrados.forEach(prod => {
        tbody.innerHTML += `
            <tr>
                <td>${prod.codigo || ""}</td>
                <td>${prod.naci || ""}</td>
                <td>${prod.marca || ""}</td>
                <td>${prod.descripcion || ""}</td>
                <td>${prod.unidad || ""}</td>
                <td>${prod.precio_venta || ""}</td>
                <td>${prod.saldo_temp || ""}</td>
                <td>
                    <button class="btn-accion">✏️</button>
                    <button class="btn-accion">🗑️</button>
                </td>
            </tr>
        `;
    });
});

// ===============================
//  INICIO
// ===============================

cargarProductos();
