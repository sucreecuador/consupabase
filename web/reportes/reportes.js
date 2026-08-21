const API = "https://consupabase-api.onrender.com/reportes";

const fechaInicio = document.getElementById("fechaInicio");
const fechaFin = document.getElementById("fechaFin");
const tipoReporte = document.getElementById("tipoReporte");

const btnGenerar = document.getElementById("btnGenerar");
const btnExcel = document.getElementById("btnExcel");
const btnPDF = document.getElementById("btnPDF");

const thead = document.getElementById("theadReportes");
const tbody = document.getElementById("tbodyReportes");

// Generar reporte
btnGenerar.onclick = async () => {
    const params = new URLSearchParams({
        inicio: fechaInicio.value,
        fin: fechaFin.value,
        tipo: tipoReporte.value
    });

    const res = await fetch(`${API}?${params.toString()}`);
    const json = await res.json();

    renderTabla(json.columns, json.data);
};

// Renderizar tabla
function renderTabla(columns, data) {
    thead.innerHTML = "<tr>" + columns.map(c => `<th>${c}</th>`).join("") + "</tr>";

    tbody.innerHTML = data.map(row => {
        return "<tr>" + columns.map(c => `<td>${row[c]}</td>`).join("") + "</tr>";
    }).join("");
}

// Exportar Excel
btnExcel.onclick = () => {
    const params = new URLSearchParams({
        inicio: fechaInicio.value,
        fin: fechaFin.value,
        tipo: tipoReporte.value,
        formato: "excel"
    });

    window.open(`${API}/export?${params.toString()}`);
};

// Exportar PDF
btnPDF.onclick = () => {
    const params = new URLSearchParams({
        inicio: fechaInicio.value,
        fin: fechaFin.value,
        tipo: tipoReporte.value,
        formato: "pdf"
    });

    window.open(`${API}/export?${params.toString()}`);
};
