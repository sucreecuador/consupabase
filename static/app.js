let paginaActual = 1;
let totalPaginas = 1;
let vistaProductos = 1; 

let orderByProd = null;
let orderDirProd = "asc";

let paginaActualContacto = 1;
let totalPaginasContacto = 1;
let vistaContactos = 1;

let orderByCont = null;
let orderDirCont = "asc";

function formatearNombreColumna(nombre) {
    const mapaNombres = {
        "codigo": "COD. CONTACTO",
        "cod_contacto": "COD. CONTACTO",
        "id": "COD. CONTACTO",
        "ruc": "C.C. o R.U.C.",
        "cedula": "C.C. o R.U.C.",
        "nombre": "NOMBRE APELLIDO",
        "direccion": "CALLE Y NUMERO",
        "telefono": "TELEFONO",
        "email": "CORR. ELECTRONICO",
        "ciudad": "CIUDAD",
        "tipo": "CATEGORIA",
        "categoria": "CATEGORIA",
        "contacto": "CONTACTO",
        "vendedor": "VENDEDOR",
        "limite_credito": "LIMITE CREDITO",
        "plazo": "PLAZO",
        "banco": "BANCO",
        "observaciones": "OBSERVACIONES"
    };
    
    if (mapaNombres[nombre.toLowerCase()]) {
        return mapaNombres[nombre.toLowerCase()];
    }
    return nombre.replace(/_/g, " ").toUpperCase();
}

function cambiarVistaProductos(vista) {
    vistaProductos = vista;
    paginaActual = 1;
    cargarProductos();
}

function cambiarVistaContactos(vista) {
    vistaContactos = vista;
    paginaActualContacto = 1;
    cargarContactos();
}

function renderPagination() {
    document.getElementById("infoPaginacion").innerText = `Pág. ${paginaActual}/${totalPaginas}`;
    document.getElementById("inputPagina").value = paginaActual;
}

function cambiarPagina(delta) {
    const nueva = paginaActual + delta;
    if (nueva >= 1 && nueva <= totalPaginas) {
        paginaActual = nueva;
        cargarProductos();
    }
}

function irAPagina() {
    const inputVal = parseInt(document.getElementById("inputPagina").value);
    if (!isNaN(inputVal) && inputVal >= 1 && inputVal <= totalPaginas) {
        paginaActual = inputVal;
        cargarProductos();
    } else {
        alert(`Por favor ingrese un número de página válido entre 1 y ${totalPaginas}`);
    }
}

function filtrarDatos() {
    paginaActual = 1;
    cargarProductos();
}

function mostrarTodosProductos() {
    document.getElementById("filtroDesc").value = "";
    document.getElementById("filtroCodigo").value = "";
    document.getElementById("filtroMarca").value = "";
    document.getElementById("filtroProveedor").value = "";
    orderByProd = null;
    orderDirProd = "asc";
    paginaActual = 1;
    cargarProductos();
}

function ordenarColumnaProd(columna) {
    if (orderByProd === columna) {
        orderDirProd = orderDirProd === "asc" ? "desc" : "asc";
    } else {
        orderByProd = columna;
        orderDirProd = "asc";
    }
    cargarProductos();
}

async function cargarProductos() {
    try {
        const desc = document.getElementById("filtroDesc").value;
        const codigo = document.getElementById("filtroCodigo").value;
        const marca = document.getElementById("filtroMarca").value;
        const proveedor = document.getElementById("filtroProveedor").value;

        let url = `/productos?page=${paginaActual - 1}&page_size=20`;
        if (desc) url += `&descripcion=${encodeURIComponent(desc)}`;
        if (codigo) url += `&codigo=${encodeURIComponent(codigo)}`;
        if (marca) url += `&marca=${encodeURIComponent(marca)}`;
        if (proveedor) url += `&proveedor=${encodeURIComponent(proveedor)}`;
        if (orderByProd) url += `&order_by=${orderByProd}&order_dir=${orderDirProd}`;

        const resp = await fetch(url);
        const data = await resp.json();

        totalPaginas = data.total_pages || 1;

        const tbody = document.querySelector("#tablaProductos tbody");
        const thead = document.querySelector("#tablaProductos thead");

        tbody.innerHTML = "";
        thead.innerHTML = "";

        if (!data.data || data.data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='9' style='text-align:center;'>No hay datos disponibles</td></tr>";
            renderPagination();
            return;
        }

        const vista1 = ["codigo", "codigo_proveedor", "marca", "descripcion", "costo_prom", "precio_venta", "saldo", "saldo_bext", "saldo_temp"];
        const vista2 = ["codigo", "codigo_proveedor", "marca", "descripcion", "costo_prom", "precio_venta", "saldo", "peso", "medidas"];

        const columnas = vistaProductos === 1 ? vista1 : vista2;

        let headHtml = "<tr>";
        columnas.forEach(c => {
            let indicador = "";
            if (orderByProd === c) {
                indicador = orderDirProd === "asc" ? " ▲" : " ▼";
            }
            const nombreLimpio = formatearNombreColumna(c);
            headHtml += `<th onclick="ordenarColumnaProd('${c}')" style="cursor: pointer;">${nombreLimpio}${indicador}</th>`;
        });
        headHtml += "</tr>";
        thead.innerHTML = headHtml;

        data.data.forEach(item => {
            let filaHtml = "<tr>";
            columnas.forEach(c => {
                filaHtml += `<td>${item[c] !== null && item[c] !== undefined ? item[c] : ""}</td>`;
            });
            filaHtml += "</tr>";
            tbody.innerHTML += filaHtml;
        });

        renderPagination();
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

/* CONTACTOS */
function renderPaginationContacto() {
    document.getElementById("infoPaginacionContacto").innerText = `Pág. ${paginaActualContacto}/${totalPaginasContacto}`;
    document.getElementById("inputPaginaContacto").value = paginaActualContacto;
}

function cambiarPaginaContacto(delta) {
    const nueva = paginaActualContacto + delta;
    if (nueva >= 1 && nueva <= totalPaginasContacto) {
        paginaActualContacto = nueva;
        cargarContactos();
    }
}

function irAPaginaContacto() {
    const inputVal = parseInt(document.getElementById("inputPaginaContacto").value);
    if (!isNaN(inputVal) && inputVal >= 1 && inputVal <= totalPaginasContacto) {
        paginaActualContacto = inputVal;
        cargarContactos();
    } else {
        alert(`Por favor ingrese un número de página válido entre 1 y ${totalPaginasContacto}`);
    }
}

function filtrarDatosContactos() {
    paginaActualContacto = 1;
    cargarContactos();
}

function mostrarTodosContactos() {
    document.getElementById("filtroNombreContacto").value = "";
    document.getElementById("filtroRucContacto").value = "";
    orderByCont = null;
    orderDirCont = "asc";
    paginaActualContacto = 1;
    cargarContactos();
}

function ordenarColumnaCont(columna) {
    if (orderByCont === columna) {
        orderDirCont = orderDirCont === "asc" ? "desc" : "asc";
    } else {
        orderByCont = columna;
        orderDirCont = "asc";
    }
    cargarContactos();
}

async function cargarContactos() {
    try {
        const nombre = document.getElementById("filtroNombreContacto").value;
        const ruc = document.getElementById("filtroRucContacto").value;

        let url = `/contactos?page=${paginaActualContacto - 1}&page_size=20`;
        if (nombre) url += `&nombre=${encodeURIComponent(nombre)}`;
        if (ruc) url += `&ruc=${encodeURIComponent(ruc)}`;
        if (orderByCont) url += `&order_by=${orderByCont}&order_dir=${orderDirCont}`;

        const resp = await fetch(url);
        const data = await resp.json();

        totalPaginasContacto = data.total_pages || 1;

        const tbody = document.querySelector("#tablaContactos tbody");
        const thead = document.querySelector("#tablaContactos thead");

        tbody.innerHTML = "";
        thead.innerHTML = "";

        if (!data.data || data.data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='10' style='text-align:center;'>No hay datos disponibles</td></tr>";
            renderPaginationContacto();
            return;
        }

        const keysDisponibles = Object.keys(data.data[0]);
        let campoCodigoReal = "codigo";
        if (!keysDisponibles.includes("codigo")) {
            if (keysDisponibles.includes("cod_contacto")) campoCodigoReal = "cod_contacto";
            else if (keysDisponibles.includes("id")) campoCodigoReal = "id";
        }

        const vista1Cont = [campoCodigoReal, "ruc", "nombre", "direccion", "telefono", "email", "ciudad", "tipo"];
        const vista2Cont = vista1Cont.filter(c => c !== "direccion" && c !== "ciudad");

        const columnas = vistaContactos === 1 ? vista1Cont : vista2Cont;
        const columnasValidas = columnas.filter(c => keysDisponibles.includes(c));
        const finalCols = columnasValidas.length > 0 ? columnasValidas : columnas;

        let headHtml = "<tr>";
        finalCols.forEach(c => {
            let indicador = "";
            if (orderByCont === c) {
                indicador = orderDirCont === "asc" ? " ▲" : " ▼";
            }
            const nombreLimpio = formatearNombreColumna(c);
            headHtml += `<th onclick="ordenarColumnaCont('${c}')" style="cursor: pointer;">${nombreLimpio}${indicador}</th>`;
        });
        headHtml += "</tr>";
        thead.innerHTML = headHtml;

        data.data.forEach(item => {
            let filaHtml = "<tr>";
            finalCols.forEach(c => {
                filaHtml += `<td>${item[c] !== null && item[c] !== undefined ? item[c] : ""}</td>`;
            });
            filaHtml += "</tr>";
            tbody.innerHTML += filaHtml;
        });

        renderPaginationContacto();
    } catch (error) {
        console.error("Error cargando contactos:", error);
    }
}

function switchTab(tab) {
    document.getElementById("seccionProductos").style.display = tab === "productos" ? "block" : "none";
    document.getElementById("seccionContactos").style.display = tab === "contactos" ? "block" : "none";

    const btnProd = document.getElementById("btnTabProductos");
    const btnCont = document.getElementById("btnTabContactos");

    if (tab === "productos") {
        btnProd.classList.add("active-tab");
        btnCont.classList.remove("active-tab");
        cargarProductos();
    } else {
        btnCont.classList.add("active-tab");
        btnProd.classList.remove("active-tab");
        cargarContactos();
    }
}

window.onload = () => {
    cargarProductos();
};