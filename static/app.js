let paginaActual = 0;
let paginaActualContacto = 0;
const pageSize = 50;

let prodVistaActual = 1;
let contVistaActual = 1;
let busquedaProdCriterio = "";
let busquedaContCriterio = "";

// 🔥 VARIABLES DE ORDENAMIENTO
let ordenColumna = "";
let ordenDireccion = "asc";
let tipoActual = "productos";

document.addEventListener("DOMContentLoaded", () => {
    cargarDatos('productos');
});

function switchTab(tab) {
    tipoActual = tab;

    if (tab === 'productos') {
        document.getElementById('seccionProductos').style.display = 'block';
        document.getElementById('seccionContactos').style.display = 'none';
        cargarDatos('productos');
    } else {
        document.getElementById('seccionProductos').style.display = 'none';
        document.getElementById('seccionContactos').style.display = 'block';
        cargarDatos('contactos');
    }
}

function buscar(tipo, criterio) {
    tipoActual = tipo;

    if (tipo === 'productos') {
        paginaActual = 0;
        busquedaProdCriterio = criterio;
    } else {
        paginaActualContacto = 0;
        busquedaContCriterio = criterio;
    }
    cargarDatos(tipo);
}

function mostrarTodos(tipo) {
    tipoActual = tipo;

    if (tipo === 'productos') {
        paginaActual = 0;
        busquedaProdCriterio = "";
        document.getElementById('filtroDesc').value = "";
        document.getElementById('filtroCodigo').value = "";
        document.getElementById('filtroMarca').value = "";
        document.getElementById('filtroProveedor').value = "";
    } else {
        paginaActualContacto = 0;
        busquedaContCriterio = "";
        document.getElementById('filtroNombreContacto').value = "";
        document.getElementById('filtroRucContacto').value = "";
    }
    cargarDatos(tipo);
}

async function cargarDatos(tipo) {
    let url = "";

    if (tipo === 'productos') {
        url = `/productos?page=${paginaActual}&page_size=${pageSize}`;
        let val = "";

        if (busquedaProdCriterio === 'descripcion') val = document.getElementById('filtroDesc').value;
        if (busquedaProdCriterio === 'codigo') val = document.getElementById('filtroCodigo').value;
        if (busquedaProdCriterio === 'marca') val = document.getElementById('filtroMarca').value;
        if (busquedaProdCriterio === 'proveedor') val = document.getElementById('filtroProveedor').value;

        if (busquedaProdCriterio && val) {
            url += `&${busquedaProdCriterio}=${encodeURIComponent(val)}`;
        }

        if (ordenColumna) {
            url += `&order_by=${ordenColumna}&order_dir=${ordenDireccion}`;
        }

    } else {
        url = `/contactos?page=${paginaActualContacto}&page_size=${pageSize}`;
        let val = "";

        if (busquedaContCriterio === 'nombre') val = document.getElementById('filtroNombreContacto').value;
        if (busquedaContCriterio === 'ruc') val = document.getElementById('filtroRucContacto').value;

        if (busquedaContCriterio && val) {
            url += `&${busquedaContCriterio}=${encodeURIComponent(val)}`;
        }

        if (ordenColumna) {
            url += `&order_by=${ordenColumna}&order_dir=${ordenDireccion}`;
        }
    }

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) throw new Error(result.detail || "Error al cargar datos");

        if (tipo === 'productos') {
            renderizarProductos(result);
        } else {
            renderizarContactos(result);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

function renderizarProductos(result) {
    const thead = document.querySelector('#tablaProductos thead');
    const tbody = document.querySelector('#tablaProductos tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    let columnas = [];

    if (prodVistaActual === 1) {
        columnas = [
            'codigo', 'codigo_proveedor', 'marca', 'descripcion',
            'precio_venta', 'costo_prom', 'saldo', 'saldo_bext', 'saldo_temp'
        ];
    } else {
        columnas = [
            'codigo', 'codigo_proveedor', 'marca', 'descripcion',
            'precio_venta', 'costo_prom', 'saldo', 'peso', 'medidas'
        ];
    }

    let headerRow = document.createElement('tr');

    columnas.forEach(col => {
        let th = document.createElement('th');

        let flecha = "";
        if (ordenColumna === col) {
            flecha = ordenDireccion === "asc" ? " ↑" : " ↓";
        }

        th.innerText = col.toUpperCase() + flecha;
        th.style.cursor = "pointer";

        th.onclick = () => {
            if (ordenColumna === col) {
                ordenDireccion = ordenDireccion === "asc" ? "desc" : "asc";
            } else {
                ordenColumna = col;
                ordenDireccion = "asc";
            }
            cargarDatos("productos");
        };

        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    result.data.forEach(item => {
        let tr = document.createElement('tr');
        columnas.forEach(col => {
            let td = document.createElement('td');
            let val = item[col];
            if (val === null || val === undefined) val = "";
            td.innerText = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    const totalPages = result.total_pages || 1;
    document.getElementById('infoPaginacion').innerText =
        `Página ${paginaActual + 1} de ${totalPages}`;
}

function renderizarContactos(result) {
    const thead = document.querySelector('#tablaContactos thead');
    const tbody = document.querySelector('#tablaContactos tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    let columnas = [];

    if (contVistaActual === 1) {
        columnas = ['codigo_cliente', 'ruc', 'nombre', 'email', 'ciudad'];
    } else {
        columnas = ['codigo_cliente', 'ruc', 'nombre', 'direccion', 'telefono1'];
    }

    let headerRow = document.createElement('tr');

    columnas.forEach(col => {
        let th = document.createElement('th');

        let flecha = "";
        if (ordenColumna === col) {
            flecha = ordenDireccion === "asc" ? " ↑" : " ↓";
        }

        th.innerText = col.toUpperCase() + flecha;
        th.style.cursor = "pointer";

        th.onclick = () => {
            if (ordenColumna === col) {
                ordenDireccion = ordenDireccion === "asc" ? "desc" : "asc";
            } else {
                ordenColumna = col;
                ordenDireccion = "asc";
            }
            cargarDatos("contactos");
        };

        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    result.data.forEach(item => {
        let tr = document.createElement('tr');
        columnas.forEach(col => {
            let td = document.createElement('td');
            let val = item[col];
            if (val === null || val === undefined) val = "";
            td.innerText = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    const totalPages = result.total_pages || 1;
    document.getElementById('infoPaginacionContacto').innerText =
        `Página ${paginaActualContacto + 1} de ${totalPages}`;
}
