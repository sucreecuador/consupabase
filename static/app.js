function buscar(tipo, criterio) {
    tipoActual = tipo;
    criterioBusqueda = criterio;
    
    if (tipo === 'productos') {
        paginaActual = 0;
        if (criterio === 'descripcion') valorBusqueda = document.getElementById('filtroDesc').value;
        if (criterio === 'codigo') valorBusqueda = document.getElementById('filtroCodigo').value;
        if (criterio === 'marca') valorBusqueda = document.getElementById('filtroMarca').value;
        if (criterio === 'proveedor') valorBusqueda = document.getElementById('filtroProveedor').value;
    } else {
        paginaActualContacto = 0;
        if (criterio === 'nombre') {
            valorBusqueda = document.getElementById('filtroNombreContacto').value;
        } else if (criterio === 'ruc') {
            valorBusqueda = document.getElementById('filtroRucContacto').value;
        }
    }
    cargarDatos(tipo);
}

async function cargarDatos(tipo) {
    let url = '';
    let page = (tipo === 'productos') ? paginaActual : paginaActualContacto;
    
    if (tipo === 'productos') {
        url = `/productos?page=${page}&page_size=${pageSize}`;
        if (criterioBusqueda && valorBusqueda) {
            url += `&${criterioBusqueda}=${encodeURIComponent(valorBusqueda)}`;
        }
    } else {
        url = `/contactos?page=${page}&page_size=${pageSize}`;
        if (criterioBusqueda === 'nombre' && valorBusqueda) {
            url += `&nombre=${encodeURIComponent(valorBusqueda)}`;
        } else if (criterioBusqueda === 'ruc' && valorBusqueda) {
            url += `&ruc=${encodeURIComponent(valorBusqueda)}`;
        }
    }

    try {
        const response = await fetch(url);
        const result = await response.json();

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