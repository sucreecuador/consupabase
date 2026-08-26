let productosData = [];
let paginaActual = 1;
let itemsPorPagina = 20;
let currentSort = { column: null, direction: 'asc' };

const columnMap = {
    codigo: "CÓDIGO",
    naci: "ORI",
    marca: "MARCA",
    descripcion: "NOMBRE",
    unidad: "UNI",
    precio_venta: "PVP",
    saldo_temp: "S.TEM",
    saldo: "S UIO",
    saldobext: "S GYE",
    peso: "PESO",
    medidas: "MEDIDAS"
};

async function cargarProductosVentas() {
    const res = await fetch("/api/productos");
    productosData = await res.json();
    renderVentas(productosData);
}

function obtenerPagina(data) {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return data.slice(inicio, inicio + itemsPorPagina);
}

function renderVentas(data) {
    const tbody = document.getElementById("tbodyVentas");
    tbody.innerHTML = "";

    const pagina = obtenerPagina(data);

    pagina.forEach(prod => {
        tbody.innerHTML += `
            <tr>
                <td>${prod.codigo ?? "-"}</td>
                <td>${prod.naci ?? "-"}</td>
                <td>${prod.marca ?? "-"}</td>
                <td>${prod.descripcion ?? "-"}</td>
                <td>${prod.unidad ?? "-"}</td>
                <td>${prod.precio_venta ?? "-"}</td>
                <td>${prod.saldo_temp ?? "-"}</td>
                <td>${prod.saldo ?? "-"}</td>
                <td>${prod.saldobext ?? "-"}</td>
                <td>${prod.peso ?? "-"}</td>
                <td>${prod.medidas ?? "-"}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editarProducto('${prod.codigo}')">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${prod.codigo}')">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function sortData(columnKey) {
    if (currentSort.column === columnKey) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = columnKey;
        currentSort.direction = 'asc';
    }

    productosData.sort((a, b) => {
        let valA = a[columnKey] ?? "";
        let valB = b[columnKey] ?? "";

        if (typeof valA === "string") valA = valA.toUpperCase();
        if (typeof valB === "string") valB = valB.toUpperCase();

        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    actualizarIconos(columnKey);
    renderVentas(productosData);
}

function actualizarIconos(columnKey) {
    document.querySelectorAll("#tablaProductosVentas th").forEach(th => {
        const key = th.dataset.column;
        if (key) th.innerHTML = columnMap[key];
    });

    const th = document.querySelector(`#tablaProductosVentas th[data-column="${columnKey}"]`);
    if (!th) return;

    const icon = currentSort.direction === 'asc' ? " ▲" : " ▼";
    th.innerHTML = columnMap[columnKey] + icon;
}

function attachSortEvents() {
    document.querySelectorAll("#tablaProductosVentas th[data-column]").forEach(th => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            sortData(th.dataset.column);
        });
    });
}

async function buscarSupabase(campo, valor) {
    const res = await fetch(`/api/productos?campo=${campo}&valor=${valor}`);
    const data = await res.json();
    renderVentas(data);
}

document.addEventListener("DOMContentLoaded", () => {
    cargarProductosVentas();
    attachSortEvents();

    document.getElementById("buscarNombre").addEventListener("keyup", e => {
        buscarSupabase("descripcion", e.target.value);
    });

    document.getElementById("buscarMarca").addEventListener("keyup", e => {
        buscarSupabase("marca", e.target.value);
    });

    document.getElementById("buscarCodigo").addEventListener("keyup", e => {
        buscarSupabase("codigo", e.target.value);
    });

    document.getElementById("btnBuscarTodos").addEventListener("click", () => {
        buscarSupabase("todos", document.getElementById("buscarTodos").value);
    });

    document.getElementById("btnMostrarTodos").addEventListener("click", () => {
        cargarProductosVentas();
    });

    document.getElementById("btnAnterior").addEventListener("click", () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderVentas(productosData);
        }
    });

    document.getElementById("btnSiguiente").addEventListener("click", () => {
        paginaActual++;
        renderVentas(productosData);
    });

    document.getElementById("btnIrPagina").addEventListener("click", () => {
        const p = parseInt(document.getElementById("inputPagina").value);
        if (p > 0) {
            paginaActual = p;
            renderVentas(productosData);
        }
    });

    document.getElementById("btnToggleMenu").addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("d-none");
    });
});
