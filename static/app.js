let paginaActualProducto = 0;
let ordenProdCol = '';
let ordenProdDir = 'asc';

let paginaActualContacto = 0;
let ordenContCol = '';
let ordenContDir = 'asc';
let contVistaActual = 1;

// Función para alternar entre pestañas (Productos y Contactos)
function switchTab(tab) {
    const secProductos = document.getElementById('seccionProductos');
    const secContactos = document.getElementById('seccionContactos');

    if (tab === 'productos') {
        if (secProductos) secProductos.style.display = 'block';
        if (secContactos) secContactos.style.display = 'none';
        cargarDatos('productos');
    } else if (tab === 'contactos') {
        if (secProductos) secProductos.style.display = 'none';
        if (secContactos) secContactos.style.display = 'block';
        cargarDatos('contactos');
    }
}

// Función central para cargar datos desde la API
function cargarDatos(tipo) {
    if (tipo === 'productos') {
        let descripcion = document.getElementById('inputDescProducto')?.value || '';
        let codigo = document.getElementById('inputCodProducto')?.value || '';
        let marca = document.getElementById('inputMarcaProducto')?.value || '';
        let proveedor = document.getElementById('inputProvProducto')?.value || '';

        let url = `/productos?page=${paginaActualProducto}&page_size=50`;
        if (descripcion) url += `&descripcion=${encodeURIComponent(descripcion)}`;
        if (codigo) url += `&codigo=${encodeURIComponent(codigo)}`;
        if (marca) url += `&marca=${encodeURIComponent(marca)}`;
        if (proveedor) url += `&proveedor=${encodeURIComponent(proveedor)}`;
        if (ordenProdCol) url += `&order_by=${ordenProdCol}&order_dir=${ordenProdDir}`;

        fetch(url)
            .then(res => res.json())
            .then(data => renderizarProductos(data))
            .catch(err => console.error("Error al cargar productos:", err));

    } else if (tipo === 'contactos') {
        let url = `/contactos?page=${paginaActualContacto}&page_size=50`;
        if (ordenContCol) url += `&order_by=${ordenContCol}&order_dir=${ordenContDir}`;

        fetch(url)
            .then(res => res.json())
            .then(data => renderizarContactos(data))
            .catch(err => console.error("Error al cargar contactos:", err));
    }
}

// Botón Mostrar Todos (Productos)
function mostrarTodos() {
    paginaActualProducto = 0;
    ordenProdCol = '';
    ordenProdDir = 'asc';
    
    if(document.getElementById('inputDescProducto')) document.getElementById('inputDescProducto').value = '';
    if(document.getElementById('inputCodProducto')) document.getElementById('inputCodProducto').value = '';
    if(document.getElementById('inputMarcaProducto')) document.getElementById('inputMarcaProducto').value = '';
    if(document.getElementById('inputProvProducto')) document.getElementById('inputProvProducto').value = '';

    cargarDatos('productos');
}

// Renderizado de la tabla de Productos
function renderizarProductos(result) {
    const thead = document.querySelector('#tablaProductos thead');
    const tbody = document.querySelector('#tablaProductos tbody');
    if (!thead || !tbody) return;
    
    thead.innerHTML = '';
    tbody.innerHTML = '';

    let columnas = ['codigo', 'descripcion', 'marca', 'proveedor'];

    let headerRow = document.createElement('tr');
    columnas.forEach(col => {
        let th = document.createElement('th');
        let texto = col.toUpperCase();

        if (ordenProdCol === col) {
            texto += (ordenProdDir === 'asc' ? ' ▲' : ' ▼');
        }
        th.innerText = texto;
        th.style.cursor = 'pointer';
        th.title = `Ordenar por ${texto}`;
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
                let val = item[col];
                if (val === null || val === undefined) val = '';
                td.innerText = val;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    const count = result.count || 0;
    const totalPages = Math.ceil(count / 50) || 1;
    
    const infoPag = document.getElementById('infoPaginacionProducto');
    if (infoPag) infoPag.innerText = `Página ${paginaActualProducto + 1} de ${totalPages}`;
    
    const btnAnt = document.getElementById('btnAnteriorProducto');
    if (btnAnt) btnAnt.disabled = paginaActualProducto === 0;
    
    const btnSig = document.getElementById('btnSiguienteProducto');
    if (btnSig) btnSig.disabled = (paginaActualProducto + 1) >= totalPages;
}

// Renderizado de la tabla de Contactos
function renderizarContactos(result) {
    const thead = document.querySelector('#tablaContactos thead');
    const tbody = document.querySelector('#tablaContactos tbody');
    if (!thead || !tbody) return;
    
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
        let texto = col.toUpperCase();
        if (col === 'telefono1') {
            texto = 'TELEFONO';
        }

        if (ordenContCol === col) {
            texto += (ordenContDir === 'asc' ? ' ▲' : ' ▼');
        }
        th.innerText = texto;
        th.style.cursor = 'pointer';
        th.title = `Ordenar por ${texto}`;
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
                    val = item['email'] || item['correo'] || item['correo_electronico'] || '';
                } else if (col === 'telefono1') {
                    val = item['telefono1'] || item['telefono'] || item['celular'] || '';
                } else {
                    val = item[col];
                }

                if (val === null || val === undefined) val = '';
                td.innerText = val;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    const count = result.count || 0;
    const totalPages = Math.ceil(count / 50) || 1;
    
    const infoPag = document.getElementById('infoPaginacionContacto');
    if (infoPag) infoPag.innerText = `Página ${paginaActualContacto + 1} de ${totalPages}`;
    
    const btnAnt = document.getElementById('btnAnteriorContacto');
    if (btnAnt) btnAnt.disabled = paginaActualContacto === 0;
    
    const btnSig = document.getElementById('btnSiguienteContacto');
    if (btnSig) btnSig.disabled = (paginaActualContacto + 1) >= totalPages;
}

// Carga inicial al abrir la página web
window.onload = () => {
    cargarDatos('productos');
};