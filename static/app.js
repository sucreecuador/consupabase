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
        
        // Cambiamos el texto del título en la cabecera si es telefono1
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

    const totalPages = result.total_pages || 1;
    document.getElementById('infoPaginacionContacto').innerText = `Página ${paginaActualContacto + 1} de ${totalPages}`;
    document.getElementById('btnAnteriorContacto').disabled = paginaActualContacto === 0;
    document.getElementById('btnSiguienteContacto').disabled = (paginaActualContacto + 1) >= totalPages;
}