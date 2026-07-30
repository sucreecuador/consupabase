let paginaActual = 0;
let paginaActualContacto = 0;
const pageSize = 50;

let prodVistaActual = 1;
let contVistaActual = 1;

let busquedaProdCriterio = '';
let busquedaContCriterio = '';

document.addEventListener("DOMContentLoaded", () => {
    cargarDatos('productos');
});

function switchTab(tab) {
    if (tab === 'productos') {
        document.getElementById('seccionProductos').style.display = 'block';
        document.getElementById('seccionContactos').style.display = 'none';
        document.getElementById('btnTabProductos').style.backgroundColor = '#0056b3';
        document.getElementById('btnTabContactos').style.backgroundColor = '#6c757d';
        cargarDatos('productos');
    } else {
        document.getElementById('seccionProductos').style.display = 'none';
        document.getElementById('seccionContactos').style.display = 'block';
        document.getElementById('btnTabProductos').style.backgroundColor = '#6c757d';
        document.getElementById('btnTabContactos').style.backgroundColor = '#0056b3';
        cargarDatos('contactos');
    }
}

function cambiarVistaProductos(vista) {
    prodVistaActual = vista;
    document.getElementById('btnProdVista1').style.backgroundColor = vista === 1 ? '#333' : '#777';
    document.getElementById('btnProdVista2').style.backgroundColor = vista === 2 ? '#333' : '#777';
    cargarDatos('productos');
}

function cambiarVistaContactos(vista) {
    contVistaActual = vista;
    document.getElementById('btnContVista1').style.backgroundColor = vista === 1 ? '#333' : '#777';
    document.getElementById('btnContVista2').style.backgroundColor = vista === 2 ? '#333' : '#777';
    cargarDatos('contactos');
}

function buscar(tipo, criterio) {
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
    if (tipo === 'productos') {
        paginaActual = 0;
        busquedaProdCriterio = '';
        document.getElementById('filtroDesc').value = '';
        document.getElementById('filtroCodigo').value = '';
        document.getElementById('filtroMarca').value = '';
        document.getElementById('filtroProveedor').value = '';
    } else {
        paginaActualContacto = 0;
        busquedaContCriterio = '';
        document.getElementById('filtroNombreContacto').value = '';
        document.getElementById('filtroRucContacto').value = '';
    }
    cargarDatos(tipo);
}

function cambiarPagina(direccion) {
    paginaActual += direccion;
    cargarDatos('productos');
}

function irAPagina() {
    const input = document.getElementById('inputPagina').value;
    const pag = parseInt(input) - 1;
    if (!isNaN(pag) && pag >= 0) {
        paginaActual = pag;
        cargarDatos('productos');
    }
}

function cambiarPaginaContacto(direccion) {
    paginaActualContacto += direccion;
    cargarDatos('contactos');
}

function irAPaginaContacto() {
    const input = document.getElementById('inputPaginaContacto').value;
    const pag = parseInt(input) - 1;
    if (!isNaN(pag) && pag >= 0) {
        paginaActualContacto = pag;
        cargarDatos('contactos');
    }
}

async function cargarDatos(tipo) {
    let url = '';
    
    if (tipo === 'productos') {
        url = `/productos?page=${paginaActual}&page_size=${pageSize}`;
        let val = '';
        if (busquedaProdCriterio === 'descripcion') val = document.getElementById('filtroDesc').value;
        if (busquedaProdCriterio === 'codigo') val = document.getElementById('filtroCodigo').value;
        if (busquedaProdCriterio === 'marca') val = document.getElementById('filtroMarca').value;
        if (busquedaProdCriterio === 'proveedor') val = document.getElementById('filtroProveedor').value;

        if (busquedaProdCriterio && val) {
            url += `&${busquedaProdCriterio}=${encodeURIComponent(val)}`;
        }
    } else {
        url = `/contactos?page=${paginaActualContacto}&page_size=${pageSize}`;
        let val = '';
        if (busquedaContCriterio === 'nombre') val = document.getElementById('filtroNombreContacto').value;
        if (busquedaContCriterio === 'ruc') val = document.getElementById('filtroRucContacto').value;

        if (busquedaContCriterio && val) {
            url += `&ruc=${encodeURIComponent(val)}`;
        }
    }

    try {
        const response = await fetch(url);
        const textResponse = await response.text();
        
        let result;
        try {
            result = JSON.parse(textResponse);
        } catch (e) {
            throw new Error(`Respuesta no válida del servidor: ${textResponse}`);
        }

        if (!response.ok) throw new Error(result.detail || "Error al cargar datos");

        if (tipo === 'productos') {
            document.getElementById('errorProductos').style.display = 'none';
            renderizarProductos(result);
        } else {
            document.getElementById('errorContactos').style.display = 'none';
            renderizarContactos(result);
        }
    } catch (error) {
        if (tipo === 'productos') {
            const errDiv = document.getElementById('errorProductos');
            errDiv.style.display = 'block';
            errDiv.innerText = `Error: ${error.message}`;
        } else {
            const errDiv = document.getElementById('errorContactos');
            errDiv.style.display = 'block';
            errDiv.innerText = `Error: ${error.message}`;
        }
    }
}

function renderizarProductos(result) {
    const thead = document.querySelector('#tablaProductos thead');
    const tbody = document.querySelector('#tablaProductos tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    let columnas = [];
    if (prodVistaActual === 1) {
        columnas = ['codigo', 'codigo_proveedor', 'marca', 'descripcion', 'precio_venta', 'costo_prom', 'saldo', 'saldo_bext', 'saldo_temp'];
    } else {
        columnas = ['codigo', 'codigo_proveedor', 'marca', 'descripcion', 'precio_venta', 'costo_prom', 'saldo', 'peso', 'medidas'];
    }

    let headerRow = document.createElement('tr');
    columnas.forEach(col => {
        let th = document.createElement('th');
        th.innerText = col.toUpperCase();
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    result.data.forEach(item => {
        let tr = document.createElement('tr');
        columnas.forEach(col => {
            let td = document.createElement('td');
            let val = item[col];
            if (val === null || val === undefined) val = '';
            
            if (col === 'precio_venta' || col === 'costo_prom') {
                val = `$${Number(val).toFixed(2)}`;
                td.style.textAlign = 'right';
            }
            td.innerText = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    const totalPages = result.total_pages || 1;
    document.getElementById('infoPaginacion').innerText = `Página ${paginaActual + 1} de ${totalPages}`;
    document.getElementById('btnAnterior').disabled = paginaActual === 0;
    document.getElementById('btnSiguiente').disabled = (paginaActual + 1) >= totalPages;
}

function renderizarContactos(result) {
    const thead = document.querySelector('#tablaContactos thead');
    const tbody = document.querySelector('#tablaContactos tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    let columnas = [];
    if (contVistaActual === 1) {
        columnas = ['codigo_cliente', 'ruc', 'nombre', 'correo', 'ciudad'];
    } else {
        columnas = ['codigo_cliente', 'ruc', 'nombre', 'direccion', 'telefono'];
    }

    let headerRow = document.createElement('tr');
    columnas.forEach(col => {
        let th = document.createElement('th');
        th.innerText = col.toUpperCase();
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    result.data.forEach(item => {
        let tr = document.createElement('tr');
        columnas.forEach(col => {
            let td = document.createElement('td');
            let val = item[col];
            if (val === null || val === undefined) val = '';
            td.innerText = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    const totalPages = result.total_pages || 1;
    document.getElementById('infoPaginacionContacto').innerText = `Página ${paginaActualContacto + 1} de ${totalPages}`;
    document.getElementById('btnAnteriorContacto').disabled = paginaActualContacto === 0;
    document.getElementById('btnSiguienteContacto').disabled = (paginaActualContacto + 1) >= totalPages;
}