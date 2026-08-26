let comprasData = [];

async function cargarCompras() {
    const res = await fetch("/api/productos");
    comprasData = await res.json();
    renderCompras(comprasData);
}

function renderCompras(data) {
    const tbody = document.getElementById("tbodyCompras");
    tbody.innerHTML = "";

    data.forEach(prod => {
        tbody.innerHTML += `
            <tr>
                <td>${prod.pro1 ?? "-"}</td>
                <td>${prod.pro2 ?? "-"}</td>
                <td>${prod.pro3 ?? "-"}</td>
                <td>${prod.codigo_proveedor ?? "-"}</td>
                <td>${prod.codigo ?? "-"}</td>
                <td>${prod.marca ?? "-"}</td>
                <td>${prod.descripcion ?? "-"}</td>
                <td>${prod.saldo_temp ?? "-"}</td>
                <td>${prod.costo_prom ?? "-"}</td>
                <td>${prod.precio_venta ?? "-"}</td>
                <td>
                    <button class="btn btn-sm btn-primary">✏️</button>
                    <button class="btn btn-sm btn-danger">🗑️</button>
                </td>
            </tr>
        `;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarCompras();
});
