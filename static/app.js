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