console.log("REPORTES JS CARGADO ✔");

const SUPABASE_URL = "https://utcqgkeiyqvfxfhjupfc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0Y3Fna2VpeXF2ZnhmaGp1cGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU3MTAsImV4cCI6MjA5ODI1MTcxMH0.99DA5vNg4rUClLekWOyLjfe3QWEKX0vior4CZxxT9ts";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnGenerar").addEventListener("click", generarReporte);
    document.getElementById("btnExcel").addEventListener("click", exportarExcel);
    document.getElementById("btnPDF").addEventListener("click", exportarPDF);
});

async function generarReporte() {

    const tipo = document.getElementById("tipoReporte").value;

    let tabla = "";
    let columnas = [];

    if (tipo === "productos") {
        tabla = "productos";
        columnas = ["codigo", "marca", "descripcion", "pventa", "stem"];
    }

    if (tipo === "inventario") {
        tabla = "inventario";
        columnas = ["codigo", "descripcion", "stock"];
    }

    if (tipo === "contactos") {
        tabla = "clientes";
        columnas = ["codigo_cliente", "razon_social", "ruc", "telefono1", "ciudad"];
    }

    if (tipo === "ventas") {
        tabla = "ventas";
        columnas = ["fecha", "cliente", "total"];
    }

    if (tipo === "compras") {
        tabla = "compras";
        columnas = ["fecha", "proveedor", "total"];
    }

    const { data, error } = await client.from(tabla).select("*");

    if (error) {
        alert("Error al generar reporte: " + error.message);
        return;
    }

    renderizarTabla(columnas, data);
}

function renderizarTabla(columnas, data) {

    const thead = document.getElementById("theadReportes");
    const tbody = document.getElementById("tbodyReportes");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    let th = "<tr>";
    columnas.forEach(c => th += `<th>${c.toUpperCase()}</th>`);
    th += "</tr>";

    thead.innerHTML = th;

    data.forEach(row => {
        let tr = "<tr>";
        columnas.forEach(c => tr += `<td>${row[c] || "-"}</td>`);
        tr += "</tr>";
        tbody.innerHTML += tr;
    });
}

function exportarExcel() {
    alert("Exportar Excel aún no implementado.");
}

function exportarPDF() {
    alert("Exportar PDF aún no implementado.");
}
