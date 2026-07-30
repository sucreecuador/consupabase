document.addEventListener("DOMContentLoaded", () => {
    // Si existen botones o elementos de navegación
    const btnMostrarTodos = document.querySelector("button:contains('Mostrar todos')") || document.querySelectorAll("button")[4];
    
    // Carga inicial de productos
    cargarProductos();
});

let paginaActual = 0;
const pageSize = 50;

async function cargarProductos(queryParams = "") {
    const tbody = document.querySelector("table tbody") || crearTbodySiNoExiste();
    
    try {
        const response = await fetch(`/productos?page=${paginaActual}&page_size=${pageSize}&${queryParams}`);
        const result = await response.json();

        if (result.error) {
            console.error("Error en respuesta API:", result.error);
            return;
        }

        const datos = result.data || [];
        renderizarTabla(datos);

    } catch (err) {
        console.error("Error al conectar con la API:", err);
    }
}

function renderizarTabla(datos) {
    // Buscar la tabla en la página
    const tabla = document.querySelector("table");
    if (!tabla) return;

    // Asegurar que exista un tbody
    let tbody = tabla.querySelector("tbody");
    if (!tbody) {
        tbody = document.createElement("tbody");
        tabla.appendChild(tbody);
    }

    tbody.innerHTML = "";

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">No se encontraron registros</td></tr>`;
        return;
    }

    datos.forEach(item => {
        // Normalizar claves para soportar minúsculas y mayúsculas
        const codigo = item.codigo || item.CODIGO || item.cod || "";
        const descripcion = item.descripcion || item.DESCRIPCION || item.desc || "";
        const marca = item.marca || item.MARCA || "";
        const proveedor = item.proveedor || item.PROVEEDOR || item.prov || "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 8px;">${codigo}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${descripcion}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${marca}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${proveedor}</td>
        `;
        tbody.appendChild(tr);
    });
}

function crearTbodySiNoExiste() {
    const tabla = document.querySelector("table");
    if (tabla) {
        let tbody = tabla.querySelector("tbody");
        if (!tbody) {
            tbody = document.createElement("tbody");
            tabla.appendChild(tbody);
        }
        return tbody;
    }
    return null;
}
