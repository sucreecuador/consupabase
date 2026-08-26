// web/productos/compras.js
const ejemploProductosCompras = ejemploProductos.map(p => ({
    ...p,
    ultima_venta: null // placeholder
}));

function calcularStockTotalCompras(p) {
    return (p.stock_tem || 0) + (p.stock_uio || 0) + (p.stock_gye || 0);
}

function renderTablaCompras(data) {
    const tbody = document.getElementById("tbodyCompras");
    tbody.innerHTML = "";

    data.forEach(p => {
        const stockTotal = calcularStockTotalCompras(p);
        const rowClass = stockTotal === 0 ? "stock-critical-row" : "";
        const ultimaVentaClass =
            p.ultima_venta ? "ultima-venta-recent" : "ultima-venta-none";
        const ultimaVentaText =
            p.ultima_venta ? "Reciente" : "Sin movimiento";

        tbody.innerHTML += `
            <tr class="${rowClass}">
                <td>${p.codigo}</td>
                <td>${p.marca}</td>
                <td>${p.nombre}</td>
                <td>
                    <span class="stock-total-badge ${stockTotal === 0 ? "stock-total-zero" : "stock-total-ok"}">
                        ${stockTotal}
                    </span>
                </td>
                <td>
                    <span class="stock-location-badge">UIO: ${p.stock_uio}</span>
                </td>
                <td>
                    <span class="stock-location-badge">GYE: ${p.stock_gye}</span>
                </td>
                <td>
                    <span class="ultima-venta-badge ${ultimaVentaClass}">
                        ${ultimaVentaText}
                    </span>
                </td>
                <td class="erp-actions">
                    <button class="btn btn-sm btn-outline-primary">📦</button>
                    <button class="btn btn-sm btn-outline-warning">✏️</button>
                </td>
            </tr>
        `;
    });
}

function filtrarCompras(texto) {
    texto = (texto || "").toLowerCase();

    const filtrados = ejemploProductosCompras.filter(p =>
        p.codigo.toLowerCase().includes(texto) ||
        p.marca.toLowerCase().includes(texto) ||
        p.nombre.toLowerCase().includes(texto)
    );

    renderTablaCompras(filtrados);
}

document.addEventListener("DOMContentLoaded", () => {
    renderTablaCompras(ejemploProductosCompras);

    const buscarCompras = document.getElementById("buscarCompras");
    const btnToggleMenu = document.getElementById("btnToggleMenu");

    buscarCompras.addEventListener("input", e => {
        filtrarCompras(e.target.value);
    });

    btnToggleMenu.addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("d-none");
    });
});
