let paginaActual = 1;
let totalPaginas = 1;

function renderPagination() {
    document.getElementById("infoPaginacion").innerText =
        `Página ${paginaActual} de ${totalPaginas}`;
}

function cambiarPagina(delta) {
    const nueva = paginaActual + delta;
    if (nueva >= 1 && nueva <= totalPaginas) {
        paginaActual = nueva;
        cargarProductos();
    }
}

function irAPagina() {
    const pagina = parseInt(document.getElementById("inputPagina").value);
    if (pagina >= 1 && pagina <= totalPaginas) {
        paginaActual = pagina;
        cargarProductos();
    }
}

async function cargarProductos() {
    try {
        const resp = await fetch(`/productos?page=${paginaActual - 1}&page_size=50`);
        const data = await resp.json();

        totalPaginas = data.total_pages || 1;

        const tbody = document.querySelector("#tablaProductos tbody");
        const thead = document.querySelector("#tablaProductos thead");

        tbody.innerHTML = "";
        thead.innerHTML = "";

        if (data.data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='9'>No hay datos</td></tr>";
            renderPagination();
            return;
        }

        // SOLO 9 COLUMNAS REALES
        const columnas = [
            "codigo",
            "codigo_proveedor",
            "marca",
            "descripcion",
            "unidad",
            "saldo",
            "saldo_bext",
            "saldo_temp",
            "costo_prom"
        ];

        thead.innerHTML = "<tr>" + columnas.map(c => `<th>${c}</th>`).join("") + "</tr>";

        data.data.forEach(item => {
            const fila = "<tr>" + columnas.map(c => `<td>${item[c]}</td>`).join("") + "</tr>";
            tbody.innerHTML += fila;
        });

        renderPagination();

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

/* CONTACTOS */
let paginaActualContacto = 1;
let totalPaginasContacto = 1;

function renderPaginationContacto() {
    document.getElementById("infoPaginacionContacto").innerText =
        `Página ${paginaActualContacto} de ${totalPaginasContacto}`;
}

function cambiarPaginaContacto(delta) {
    const nueva = paginaActualContacto + delta;
    if (nueva >= 1 && nueva <= totalPaginasContacto) {
        paginaActualContacto = nueva;
        cargarContactos();
    }
}

function irAPaginaContacto() {
    const pagina = parseInt(document.getElementById("inputPaginaContacto").value);
    if (pagina >= 1 && pagina <= totalPaginasContacto) {
        paginaActualContacto = pagina;
        cargarContactos();
    }
}

async function cargarContactos() {
    try {
        const resp = await fetch(`/contactos?page=${paginaActualContacto - 1}&page_size=50`);
        const data = await resp.json();

        totalPaginasContacto = data.total_pages || 1;

        const tbody = document.querySelector("#tablaContactos tbody");
        const thead = document.querySelector("#tablaContactos thead");

        tbody.innerHTML = "";
        thead.innerHTML = "";

        if (data.data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='10'>No hay datos</td></tr>";
            renderPaginationContacto();
            return;
        }

        const columnas = Object.keys(data.data[0]);
        thead.innerHTML = "<tr>" + columnas.map(c => `<th>${c}</th>`).join("") + "</tr>";

        data.data.forEach(item => {
            const fila = "<tr>" + columnas.map(c => `<td>${item[c]}</td>`).join("") + "</tr>";
            tbody.innerHTML += fila;
        });

        renderPaginationContacto();

    } catch (error) {
        console.error("Error cargando contactos:", error);
    }
}

/* Cambiar pestañas */
function switchTab(tab) {
    document.getElementById("seccionProductos").style.display =
        tab === "productos" ? "block" : "none";

    document.getElementById("seccionContactos").style.display =
        tab === "contactos" ? "block" : "none";
}

/* Inicial */
window.onload = () => {
    cargarProductos();
};
