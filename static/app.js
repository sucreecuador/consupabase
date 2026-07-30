let paginaActualProducto = 0;
let pageSize = 50;
let ordenProdCol = '';
let ordenProdDir = 'asc';
let prodVistaActual = 1;

let paginaActualContacto = 0;
let ordenContCol = '';
let ordenContDir = 'asc';
let contVistaActual = 1;

let modoBusquedaActual = { tipo: 'productos', campo: null };

// Cambiar de Pestaña Principal
function switchTab(tab) {
    const secProductos = document.getElementById('seccionProductos');
    const secContactos = document.getElementById('seccionContactos');
    const btnProd = document.getElementById('btnTabProductos');
    const btnCont = document.getElementById('btnTabContactos');

    if (tab === 'productos') {
        secProductos.style.display = 'block';
        secContactos.style.display = 'none';
        btnProd.style.backgroundColor = '#0056b3';
        btnCont.style.backgroundColor = '#6c757d';
        cargarDatos('productos');
    } else {
        secProductos.style.display = 'none';
        secContactos.style.display = 'block';
        btnProd.style.backgroundColor = '#6c757d';
        btnCont.style.backgroundColor = '#0056b3';
        cargarDatos('contactos');
    }
}

// Cambiar Vistas de Productos
function cambiarVistaProductos(vista) {
    prodVistaActual = vista;
    document.getElementById('btnProdVista1').style.backgroundColor = vista === 1 ? '#333' : '#777';
    document.getElementById('btnProdVista2').style.backgroundColor = vista === 2 ? '#333' : '#777';
    cargarDatos('productos');
}

// Cambiar Vistas de Contactos
function cambiarVistaContactos(vista) {
    contVistaActual = vista;
    document.getElementById('btnContVista1').style.backgroundColor = vista === 1 ? '#333' : '#777';
    document.getElementById('btnContVista2').style.backgroundColor = vista === 2 ? '#333' : '#777';
    cargarDatos('contactos');
}

// Mostrar Todos
function mostrarTodos(tipo) {
    if (tipo === 'productos') {
        paginaActualProducto = 0;
        ordenProdCol = '';
        ordenProdDir = 'asc';
        modoBusquedaActual = { tipo: 'productos', campo: null };
        document.getElementById('filtroDesc').value = '';
        document.getElementById('filtroCodigo').value = '';
        document.getElementById('filtroMarca').value = '';
        document.getElementById('filtroProveedor').value = '';
        cargarDatos('productos');
    } else {
        paginaActualContacto = 0;
        ordenContCol = '';
        ordenContDir = 'asc';
        modoBusquedaActual = { tipo: 'contactos', campo: null };
        document.getElementById('filtroNombreContacto').value = '';
        document.getElementById('filtroRucContacto').value = '';
        cargarDatos('contactos');
    }
}

// Función general de Búsqueda
function buscar(tipo, campo) {
    modoBusquedaActual = { tipo, campo };
    if (tipo === 'productos') {
        paginaActualProducto = 0;
        cargarDatos('productos');
    } else {
        paginaActualContacto = 0;
        cargarDatos('contactos');
    }
}

// Cargar Datos desde la API
function cargarDatos(tipo) {
    if (tipo === 'productos') {
        let url = `/productos?page=${paginaActualProducto}&page_size=${pageSize}`;
        
        if (modoBusquedaActual.campo) {
            let val = '';
            if (modoBusquedaActual.campo === 'descripcion') val = document.getElementById('filtroDesc').value;
            if (modoBusquedaActual.campo === 'codigo') val = document.getElementById('filtroCodigo').value;
            if (modoBusquedaActual.campo === 'marca') val = document.getElementById('filtroMarca').value;
            if (modoBusquedaActual.campo === 'proveedor') val = document.getElementById('filtroProveedor').value;
            if (val) url += `&${modoBusquedaActual.campo}=${encodeURIComponent(val)}`;
        }

        if (ordenProdCol) url += `&order_by=${ordenProdCol}&order_dir=${ordenProdDir}`;

        fetch(url)
            .then(res => res.json())
            .then(data => renderizarProductos(data))
            .catch(err => console.error("Error cargando productos:", err));

    } else {
        let url = `/contactos?page=${paginaActualContacto}&page_size=${pageSize}`;
        
        if (modoBusquedaActual.campo) {
            let val = '';
            if (modoBusquedaActual.campo === 'nombre') val = document.getElementById('filtroNombreContacto').value;
            if (modoBusquedaActual.campo === 'ruc') val = document.getElementById('filtroRucContacto').value;
            if (val) {
                let param = modoBusquedaActual.campo === 'nombre' ? 'nombre' : 'ruc';
                url += `&${param}=${encodeURIComponent(val)}`;
            }
        }

        if (ordenContCol) url += `&order_by=${ordenContCol}&order_dir=${ordenContDir}`;

        fetch(url)
            .then(res => res.json())
            .then(data => renderizarContactos(data))
            .catch(err => console.error("Error cargando contactos:", err));
    }
}

// Renderizar Productos
function renderizarProductos(result) {
    const thead = document.querySelector('#tablaProductos thead');
    const tbody = document.querySelector('#tablaProductos tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    let columnas = prodVistaActual === 1 
        ? ['codigo', 'descripcion', 'marca', 'proveedor'] 
        : ['codigo', 'descripcion', 'stock', 'precio']; // Ajusta según tus columnas reales de la vista 2

    let headerRow = document.createElement('tr');
    columnas.forEach(col => {
        let th = document.createElement('th');
        let texto = col.toUpperCase();
        if (ordenProdCol === col) texto += (ordenProdDir === 'asc' ? ' ▲' : ' ▼');
        th.innerText = texto;
        th.style.cursor = 'pointer';
        th.onclick = () => {
            if (ordenProdCol === col) {
                ordenProdDir = ordenProdDir === 'asc' ? 'desc' : 'asc';
            } else {
                ordenProdCol = col;
                ordenProdDir = 'asc';
            }
            paginaActualProducto = 0;
            cargarDatos('productos');
        };
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    if (result.data && Array.isArray(result.data)) {
        result.data.forEach(item => {
            let tr = document.createElement('tr');
            columnas.forEach(col => {
                let td = document.createElement('td');
                td.innerText = item[col] ?? '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    const count = result.count || 0;
    const totalPages = Math.ceil(count / pageSize) || 1;
    document.getElementById('infoPaginacion').innerText = `Página ${paginaActualProducto + 1} de ${totalPages}`;
    document.getElementById('btnAnterior').disabled = paginaActualProducto === 0;
    document.getElementById('btnSiguiente').disabled = (paginaActualProducto + 1) >= totalPages;
}

// Renderizar Contactos
function renderizarContactos(result) {
    const thead = document.querySelector('#tablaContactos thead');
    const tbody = document.querySelector('#tablaContactos tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    let columnas = contVistaActual === 1 
        ? ['codigo_cliente', 'ruc', 'nombre', 'email', 'ciudad'] 
        : ['codigo_cliente', 'ruc', 'nombre', 'direccion', 'telefono1'];

    let headerRow = document.createElement('tr');
    columnas.forEach(col => {
        let th = document.createElement('th');
        let texto = col.toUpperCase();
        if (col === 'telefono1') texto = 'TELEFONO';

        if (ordenContCol === col) texto += (ordenContDir === 'asc' ? ' ▲' : ' ▼');
        th.innerText = texto;
        th.style.cursor = 'pointer';
        th.onclick = () => {
            if (ordenContCol === col) {
                ordenContDir = ordenContDir === 'asc' ? 'desc' : 'asc';
            } else {
                ordenContCol = col;
                ordenContDir = 'asc';
            }
            paginaActualContacto = 0;
            cargarDatos('contactos');
        };
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    if (result.data && Array.isArray(result.data)) {
        result.data.forEach(item => {
            let tr = document.createElement('tr');
            columnas.forEach(col => {
                let td = document.createElement('td');
                let val = '';
                if (col === 'email') {
                    val = item['email'] || item['correo'] || '';
                } else if (col === 'telefono1') {
                    val = item['telefono1'] || item['telefono'] || item['celular'] || '';
                } else {
                    val = item[col];
                }
                td.innerText = val ?? '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    const count = result.count || 0;
    const totalPages = Math.ceil(count / pageSize) || 1;
    document.getElementById('infoPaginacionContacto').innerText = `Página ${paginaActualContacto + 1} de ${totalPages}`;
    document.getElementById('btnAnteriorContacto').disabled = paginaActualContacto === 0;
    document.getElementById('btnSiguienteContacto').disabled = (paginaActualContacto + 1) >= totalPages;
}

// Paginación Productos
function cambiarPagina(dir) {
    paginaActualProducto += dir;
    cargarDatos('productos');
}

function irAPagina() {
    let pag = parseInt(document.getElementById('inputPagina').value);
    if (pag > 0) {
        paginaActualProducto = pag - 1;
        cargarDatos('productos');
    }
}

// Paginación Contactos
function cambiarPaginaContacto(dir) {
    paginaActualContacto += dir;
    cargarDatos('contactos');
}

function irAPaginaContacto() {
    let pag = parseInt(document.getElementById('inputPaginaContacto').value);
    if (pag > 0) {
        paginaActualContacto = pag - 1;
        cargarDatos('contactos');
    }
}

// Carga Inicial
window.onload = () => {
    cargarDatos('productos');
};