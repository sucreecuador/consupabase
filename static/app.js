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

// Cambiar de pestaña
function switchTab(tab) {
    const secProductos = document.getElementById('seccionProductos');
    const secContactos = document.getElementById('seccionContactos');
    const btnProd = document.getElementById('btnTabProductos');
    const btnCont = document.getElementById('btnTabContactos');

    if (tab === 'productos') {
        secProductos.style.display = 'block';
        secContactos.style.display = 'none';
        btnProd.style.backgroundColor = "#0056b3";
        btnCont.style.backgroundColor = "#6c757d";
        cargarDatos('productos');
    } else {
        secProductos.style.display = 'none';
        secContactos.style.display = 'block';
        btnProd.style.backgroundColor = "#6c757d";
        btnCont.style.backgroundColor = "#0056b3";
        cargarDatos('contactos');
    }
}

// Cambiar vista productos
function cambiarVistaProductos(vista) {
    prodVistaActual = vista;

    document.getElementById('btnProdVista1').style.backgroundColor =
        vista === 1 ? '#333' : '#777';

    document.getElementById('btnProdVista2').style.backgroundColor =
        vista === 2 ? '#333' : '#777';

    cargarDatos('productos');
}

// Mostrar todos
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

// Buscar
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

// Cargar datos
function cargarDatos(tipo) {
    if (tipo === 'productos') {
        let url = `/productos?page=${paginaActualProducto}&page_size=${pageSize}`;

        if (modoBusquedaActual.campo) {
            let val = '';
            if (modoBusquedaActual.campo === 'descripcion')
                val = document.getElementById('filtroDesc').value;
            if (modoBusquedaActual.campo === 'codigo')
                val = document.getElementById('filtroCodigo').value;
            if (modoBusquedaActual.campo === 'marca')
                val = document.getElementById('filtroMarca').value;
            if (modoBusquedaActual.campo === 'proveedor')
                val = document.getElementById('filtroProveedor').value;

            if (val) url += `&${modoBusquedaActual.campo}=${encodeURIComponent(val)}`;
        }

        if (ordenProdCol)
            url += `&order_by=${ordenProdCol}&order_dir=${ordenProdDir}`;

        fetch(url)
            .then(res => res.json())
            .then(data => renderizarProductos(data))
            .catch(err => console.error("Error cargando productos:", err));

    } else {
        let url = `/contactos?page=${paginaActualContacto}&page_size=${pageSize}`;

        if (modoBusquedaActual.campo) {
            let val = '';
            if (modoBusquedaActual.campo === 'nombre')
                val = document.getElementById('filtroNombreContacto').value;
            if (modoBusquedaActual.campo === 'ruc')
                val = document.getElementById('filtroRucContacto').value;

            if (val) url += `&${modoBusquedaActual.campo}=${encodeURIComponent(val)}`;
        }

        if (ordenContCol)
            url += `&order_by=${ordenContCol}&order_dir=${ordenContDir}`;

        fetch(url)
            .then(res => res.json())
            .then(data => renderizarContactos(data))
            .catch(err => console.error("Error cargando contactos:", err));
    }
}

// Renderizar productos
function renderizarProductos(result) {
    const thead = document.querySelector('#tablaProductos thead');
    const tbody = document.querySelector('#tablaProductos tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    // Columnas por vista (9 columnas cada una)
    let columnas = prodVistaActual === 1
        ? [
            'codigo',
            'codigo_proveedor',
            'marca',
            'descripcion',
            'precio_venta',
            'costo_prom',
            'saldo',
            'saldo_bext',
            'saldo_temp'
        ]
        : [
            'codigo',
            'codigo_proveedor',
            'marca',
            'descripcion',
            'precio_venta',
            'costo_prom',
            'saldo',
            'peso',
            'medidas'
        ];

    // Nombres bonitos
    const nombresCabecera = {
        codigo: "CÓDIGO",
        codigo_proveedor: "CÓDIGO PROVEEDOR",
        marca: "MARCA",
        descripcion: "DESCRIPCIÓN",
        precio_venta: "PRECIO VENTA",
        costo_prom: "COSTO PROM",
        saldo: "SALDO",
        saldo_bext: "SALDO BEXT",
        saldo_temp: "SALDO TEMP",
        peso: "PESO",
        medidas: "MEDIDAS"
    };

    // Cabecera
    let headerRow = document.createElement('tr');
    columnas.forEach(col => {
        let th = document.createElement('th');
        let texto = nombresCabecera[col] || col.toUpperCase();

        if (ordenProdCol === col)
            texto += ordenProdDir === 'asc' ? ' ▲' : ' ▼';

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

    // Filas
    if (result.data && Array.isArray(result.data)) {
        result.data.forEach(item => {
            let tr = document.createElement('tr');

            tr.onclick = () => {
                document.querySelectorAll("tr").forEach(r => r.classList.remove("selected-row"));
                tr.classList.add("selected-row");
            };

            columnas.forEach(col => {
                let td = document.createElement('td');
                let valor = item[col] ?? "";

                // Formato numérico
                const columnasNumericas = [
                    'precio_venta',
                    'costo_prom',
                    'saldo',
                    'saldo_bext',
                    'saldo_temp',
                    'peso'
                ];

                if (columnasNumericas.includes(col)) {
                    td.classList.add("num");
                    valor = Number(valor).toLocaleString("es-EC", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }

                // Tooltip descripción
                if (col === 'descripcion') {
                    td.classList.add("desc");
                    td.setAttribute("data-full", item[col]);
                }

                // Tooltip medidas
                if (col === 'medidas') {
                    td.classList.add("medidas");
                    td.setAttribute("data-full", item[col]);
                }

                // Tooltip peso
                if (col === 'peso') {
                    td.classList.add("peso");
                    td.setAttribute("data-full", item[col]);
                }

                // Colores por stock
                if (col === 'saldo') {
                    let s = Number(item[col]);
                    if (s > 20) td.classList.add("stock-verde");
                    else if (s > 5) td.classList.add("stock-amarillo");
                    else td.classList.add("stock-rojo");
                }

                td.innerText = valor;
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    }

    const count = result.count || 0;
    const totalPages = Math.ceil(count / pageSize) || 1;

    document.getElementById('infoPaginacion').innerText =
        `Página ${paginaActualProducto + 1} de ${totalPages}`;

    document.getElementById('btnAnterior').disabled = paginaActualProducto === 0;
    document.getElementById('btnSiguiente').disabled =
        (paginaActualProducto + 1) >= totalPages;
}

// Renderizar contactos (sin tocar)
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
        th.innerText = texto;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    if (result.data && Array.isArray(result.data)) {
        result.data.forEach(item => {
            let tr = document.createElement('tr');
            columnas.forEach(col => {
                let td = document.createElement('td');
                td.innerText = item[col] ?? "";
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    const count = result.count || 0;
    const totalPages = Math.ceil(count / pageSize) || 1;

    document.getElementById('infoPaginacionContacto').innerText =
        `Página ${paginaActualContacto + 1} de ${totalPages}`;

    document.getElementById('btnAnteriorContacto').disabled =
        paginaActualContacto === 0;

    document.getElementById('btnSiguienteContacto').disabled =
        (paginaActualContacto + 1) >= totalPages;
}

// Paginación productos
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

// Paginación contactos
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

// Carga inicial
window.onload = () => {
    cargarDatos('productos');
};
