const API = "https://consupabase-api.onrender.com/dashboard";

const kpiVentasDia = document.getElementById("kpiVentasDia");
const kpiFacturasDia = document.getElementById("kpiFacturasDia");
const kpiStockCritico = document.getElementById("kpiStockCritico");
const kpiClientesActivos = document.getElementById("kpiClientesActivos");

const tablaUltimasFacturas = document.getElementById("tablaUltimasFacturas");
const tablaStockBajo = document.getElementById("tablaStockBajo");

// Cargar tablero
async function cargarDashboard() {
    const res = await fetch(API);
    const json = await res.json();

    // KPIs
    kpiVentasDia.innerText = `$${json.kpis.ventas_dia.toFixed(2)}`;
    kpiFacturasDia.innerText = json.kpis.facturas_dia;
    kpiStockCritico.innerText = json.kpis.stock_critico;
    kpiClientesActivos.innerText = json.kpis.clientes_activos;

    // Últimas facturas
    tablaUltimasFacturas.innerHTML = "";
    json.ultimas_facturas.forEach(f => {
        tablaUltimasFacturas.innerHTML += `
            <tr>
                <td>${f.numero}</td>
                <td>${f.cliente}</td>
                <td>${f.fecha}</td>
                <td>$${f.total.toFixed(2)}</td>
            </tr>
        `;
    });

    // Stock bajo
    tablaStockBajo.innerHTML = "";
    json.stock_bajo.forEach(p => {
        tablaStockBajo.innerHTML += `
            <tr>
                <td>${p.descripcion}</td>
                <td>${p.stock}</td>
            </tr>
        `;
    });
}

// Inicial
cargarDashboard();
