// web/productos/productos.js
const ejemploProductos = [
  {
    codigo: "BDO001",
    ori: "COL",
    marca: "HABY",
    nombre: "BABY DOLL COPA TRIANGULAR, SIN ARO CARGA",
    uni: "UNI",
    pvp: 26.0,
    stock_tem: 0,
    stock_uio: 0,
    stock_gye: 0,
    peso: 0,
    medidas: "www.haby.com.co",
    creado_en: null
  },
  {
    codigo: "AUD001",
    ori: "CHP",
    marca: "SH.MC",
    nombre: "AUDIFONO GOTA BLUETOOTH",
    uni: "UNI",
    pvp: 6.0,
    stock_tem: 4,
    stock_uio: 2,
    stock_gye: 2,
    peso: 0.01,
    medidas: "importadorasucre",
    creado_en: null
  },
  {
    codigo: "ASC001",
    ori: "CHP",
    marca: "XINDA",
    nombre: "ASCENDEDOR PARA ESCALADA",
    uni: "UNI",
    pvp: 76.0,
    stock_tem: 0,
    stock_uio: 1,
    stock_gye: 0,
    peso: 0.19,
    medidas: "20 X 9 X 2 cm",
    creado_en: null
  },
  {
    codigo: "ARO149",
    ori: "CHP",
    marca: "ALEX RIM",
    nombre: "ARO SOLO 26 X 1.75 ALUM 36H.D/C NEGRO",
    uni: "UNI",
    pvp: 20.0,
    stock_tem: 0,
    stock_uio: 0,
    stock_gye: 0,
    peso: 0,
    medidas: "0",
    creado_en: null
  }
];

let productosVentas = [];

function calcularStockTotal(p) {
    return (p.stock_tem || 0) + (p.stock_uio || 0) + (p.stock_gye || 0);
}

function renderTablaVentas(data) {
    const tbody = document.getElementById("tbodyVentas");
    tbody.innerHTML = "";

    data.forEach(p => {
        const stockTotal = calcularStockTotal(p);
        const stockClass = stockTotal > 0 ? "stock-total-ok" : "stock-total-zero";

        tbody.innerHTML += `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.marca}</td>
                <td>${p.nombre}</td>
                <td><span class="text-success fw-semibold">$${p.pvp.toFixed(2)}</span></td>
                <td>
                    <span class="stock-total-badge ${stockClass}">
                        ${stockTotal}
                    </span>
                </td>
                <td>
                    <span class="stock-location-badge">UIO: ${p.stock_uio}</span>
                </td>
                <td>
                    <span class="stock-location-badge">GYE: ${p.stock_gye}</span>
                </td>
                <td>${p.peso}</td>
                <td>${p.medidas}</td>
                <td class="erp-actions">
                    <button class="btn btn-sm btn-outline-info">👁️</button>
                    <button class="btn btn-sm btn-outline-warning">✏️</button>
                    <button class="btn btn-sm btn-outline-danger">🗑️</button>
                </td>
            </tr>
        `;
    });
}

function filtrarVentas(texto, filtroStock) {
    texto = (texto || "").toLowerCase();

    let filtrados = productosVentas.filter(p => {
        const matchTexto =
            p.codigo.toLowerCase().includes(texto) ||
            p.marca.toLowerCase().includes(texto) ||
            p.nombre.toLowerCase().includes(texto);

        const stockTotal = calcularStockTotal(p);

        if (filtroStock === "con-stock") {
            return matchTexto && stockTotal > 0;
        }
        if (filtroStock === "sin-stock") {
            return matchTexto && stockTotal === 0;
        }
        return matchTexto;
    });

    renderTablaVentas(filtrados);
}

document.addEventListener("DOMContentLoaded", () => {
    productosVentas = [...ejemploProductos];
    renderTablaVentas(productosVentas);

    const buscarGlobal = document.getElementById("buscarGlobal");
    const filtroButtons = document.querySelectorAll(".erp-search-filters button");
    const btnToggleMenu = document.getElementById("btnToggleMenu");

    let filtroStockActual = "todos";

    buscarGlobal.addEventListener("input", e => {
        filtrarVentas(e.target.value, filtroStockActual);
    });

    filtroButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filtroButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filtroStockActual = btn.getAttribute("data-filter");
            filtrarVentas(buscarGlobal.value, filtroStockActual);
        });
    });

    btnToggleMenu.addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("d-none");
    });
});
