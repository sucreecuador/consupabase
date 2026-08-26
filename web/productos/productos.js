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
    try {
        const res = await fetch("/api/productos");
        productosData = await res.json();
        renderVentas(productosData);
    } catch (e) {
        document.getElementById("tbodyVentas").innerHTML =
            `<tr><td colspan="12" class="text-danger">Error al cargar datos: ${e}</td></tr>`;
    }
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

function editarProducto(codigo) {
    alert("Editar producto: " + codigo);
}

function eliminarProducto(codigo) {
    if (!confirm("¿Eliminar producto con código " + codigo + "?")) return;

    fetch(`/api/productos/${codigo}`, { method: "DELETE" })
        .then(r => r.json())
        .then(() => cargarProductosVentas());
}

function buscarNombre() {
    const texto = document.getElementById("buscarNombre").value.toLowerCase();
    const filtrados = productosData.filter(p =>
        (p.descripcion ?? "").toLowerCase().includes(texto)
    );
    renderVentas(filtrados);
}

function buscarMarca() {
    const texto = document.getElementById("buscarMarca").value.toLowerCase();
    const filtrados = productosData.filter(p =>
        (p.marca ?? "").toLowerCase().includes(texto)
    );
    renderVentas(filtrados);
}

function buscarCodigo() {
    const texto = document.getElementById("buscarCodigo").value.toLowerCase();
    const filtrados = productosData.filter(p =>
        (p.codigo ?? "").toLowerCase().includes(texto)
    );
    renderVentas(filtrados);
}

function buscarTodos() {
    const texto = document.getElementById("buscarTodos").value.toLowerCase();
    const filtrados = productosData.filter(p =>
        (p.codigo ?? "").toLowerCase().includes(texto) ||
        (p.descripcion ?? "").toLowerCase().includes(texto) ||
        (p.marca ?? "").toLowerCase().includes(texto) ||
        (p.unidad ?? "").toLowerCase().includes(texto)
    );
    renderVentas(filtrados);
}

document.addEventListener("DOMContentLoaded", () => {
    cargarProductosVentas();
    attachSortEvents();

    document.getElementById("buscarNombre").addEventListener("keyup", buscarNombre);
    document.getElementById("buscarMarca").addEventListener("keyup", buscarMarca);
    document.getElementById("buscarCodigo").addEventListener("keyup", buscarCodigo);
    document.getElementById("btnBuscarTodos").addEventListener("click", buscarTodos);

    document.getElementById("btnMostrarTodos").addEventListener("click", () => {
        renderVentas(productosData);
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
});
