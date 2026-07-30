document.addEventListener("DOMContentLoaded", () => {
    // Escuchar eventos en los botones
    const btnTodos = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Mostrar todos"));
    if (btnTodos) {
        btnTodos.addEventListener("click", () => {
            paginaActual = 0;
            limpiarInputs();
            cargarProductos();
        });
    }

    const btnDesc = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Buscar por descripción"));
    if (btnDesc) {
        btnDesc.addEventListener("click", () => {
            const val = document.querySelector("input[placeholder*='Buscar']")?.value || "";
            paginaActual = 0;
            cargarProductos(`descripcion=${encodeURIComponent(val)}`);
        });
    }

    // Carga inicial
    cargarProductos();
});

let paginaActual = 0;
const pageSize = 50;

function limpiarInputs() {
    document.querySelectorAll("input[type='text']").forEach(i => i.value = "");
}

async function cargarProductos(queryParams = "") {
    const tbody = document.querySelector("table tbody") || crearTbodySiNoExiste();
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 15px;">Cargando...</td></tr>`;
    }

    try {
        const url = queryParams 
            ? `/productos?page=${paginaActual}&page_size=${pageSize}&${queryParams}`
            : `/productos?page=${paginaActual}&page_size=${pageSize}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.error_detalle || result.error) {
            console.error("Error en respuesta API:", result.error_detalle || result.error);
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red; padding: 15px;">Error: ${result.error_detalle || result.error}</td></tr>`;
            }
            return;
        }

        const datos = result.data || [];
        renderizarTabla(datos);

    } catch (err) {
        console.error("Error al conectar con la API:", err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red; padding: 15px;">Error de conexión con la API</td></tr>`;
        }
    }
}

function renderizarTabla(datos) {
    const tabla = document.querySelector("table");
    if (!tabla) return;

    let tbody = tabla.querySelector("tbody");
    if (!tbody) {
        tbody = document.createElement("tbody");
        tabla.appendChild(tbody);
    }

    tbody.innerHTML = "";

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 15px;">No se encontraron registros</td></tr>`;
        return;
    }

    datos.forEach(item => {
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
