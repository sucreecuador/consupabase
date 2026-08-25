const API_URL = "/api/productos";
let datosProductos = [];
let columnaOrdenActual = '';
let ordenAscendente = true;

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();

    const btnBuscar = document.getElementById("btnBuscar");
    const btnMostrarTodos = document.getElementById("btnMostrarTodos");

    if (btnBuscar) {
        btnBuscar.addEventListener("click", () => {
            const nombre = document.getElementById("buscarNombre")?.value || "";
            const marca = document.getElementById("buscarMarca")?.value || "";
            const codigo = document.getElementById("buscarCodigo")?.value || "";
            const contacto = document.getElementById("buscarContacto")?.value || "";
            cargarProductos({ nombre, marca, codigo, contacto });
        });
    }

    if (btnMostrarTodos) {
        btnMostrarTodos.addEventListener("click", () => {
            document.getElementById("buscarNombre").value = "";
            document.getElementById("buscarMarca").value = "";
            document.getElementById("buscarCodigo").value = "";
            document.getElementById("buscarContacto").value = "";
            cargarProductos();
        });
    }
});

async function cargarProductos(filtros = {}) {
    const tabla = document.getElementById("tablaProductos");
    if (!tabla) return;

    tabla.innerHTML = `<tr><td colspan="11" class="text-center py-4"><i class="fas fa-spinner fa-spin me-2"></i>Cargando productos...</td></tr>`;

    try {
        const query = new URLSearchParams();
        if (filtros.nombre) query.append("nombre", filtros.nombre);
        if (filtros.marca) query.append("marca", filtros.marca);
        if (filtros.codigo) query.append("codigo", filtros.codigo);
        if (filtros.contacto) query.append("contacto", filtros.contacto);

        const url = query.toString() ? `${API_URL}?${query.toString()}` : API_URL;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Error al consultar la API");

        datosProductos = await response.json();
        
        // Resetear indicador de orden al cargar nuevos datos
        columnaOrdenActual = '';
        ordenAscendente = true;
        
        renderizarTabla(datosProductos);

    } catch (error) {
        console.error(error);
        tabla.innerHTML = `<tr><td colspan="11" class="text-center text-danger py-4">Error al cargar datos desde el servidor.</td></tr>`;
    }
}

function renderizarTabla(productos) {
    const tabla = document.getElementById("tablaProductos");
    if (!tabla) return;

    if (!productos || productos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="11" class="text-center py-4 text-muted">No se encontraron productos.</td></tr>`;
        return;
    }

    tabla.innerHTML = productos.map(p => {
        const codProv = p.codigo_proveedor || p.cod_prov || '0';
        return `
            <tr>
                <td class="text-center">${p.pro1 || '—'}</td>
                <td class="text-center">${p.pro2 || '—'}</td>
                <td class="text-center">${p.pro3 || '—'}</td>
                <td>${codProv}</td>
                <td><strong>${p.codigo || '—'}</strong></td>
                <td>${p.marca || '—'}</td>
                <td>${p.descripcion || '—'}</td>
                <td class="text-center">${p.saldo_temp ?? 0}</td>
                <td class="text-end">$${Number(p.costo_prom || 0).toFixed(2)}</td>
                <td class="text-end">$${Number(p.precio_venta || 0).toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary p-1 me-1" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger p-1" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join("");
}

function ordenarPor(columna) {
    if (!datosProductos || datosProductos.length === 0) return;

    if (columnaOrdenActual === columna) {
        ordenAscendente = !ordenAscendente;
    } else {
        columnaOrdenActual = columna;
        ordenAscendente = true;
    }

    // Actualizar iconos visuales en las cabeceras
    document.querySelectorAll('.sort-icon').forEach(span => span.textContent = '↕');
    const spanActual = document.getElementById(`sort-${columna}`);
    if (spanActual) {
        spanActual.textContent = ordenAscendente ? '▲' : '▼';
    }

    datosProductos.sort((a, b) => {
        let valA = a[columna];
        let valB = b[columna];

        // Normalizar valores nulos o indefinidos
        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        // Si son numéricos
        if (typeof valA === 'number' || typeof valB === 'number' || !isNaN(valA) && !isNaN(valB) && valA !== '' && valB !== '') {
            valA = Number(valA);
            valB = Number(valB);
            return ordenAscendente ? valA - valB : valB - valA;
        }

        // Si son cadenas de texto
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();

        if (valA < valB) return ordenAscendente ? -1 : 1;
        if (valA > valB) return ordenAscendente ? 1 : -1;
        return 0;
    });

    renderizarTabla(datosProductos);
}