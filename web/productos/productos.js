async function cargarProductos() {
    const tbody = document.getElementById('tablaCuerpo');
    if (tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">Cargando datos...</td></tr>';

    const inputBuscar = document.getElementById('buscar');
    const valor = inputBuscar ? inputBuscar.value.trim() : '';

    const params = new URLSearchParams({
        pagina: paginaActual,
        porPagina: 20,
        ordenColumna: ordenColumna,
        ordenDireccion: ordenDireccion
    });

    // SOLO enviar columnaFiltro y valorFiltro SI el campo de texto NO está vacío
    if (valor !== '') {
        params.append('columnaFiltro', columnaBusqueda);
        params.append('valorFiltro', valor);
    }

    try {
        const res = await fetch(`/api/productos?${params.toString()}`);
        
        if (!res.ok) {
            const errDetail = await res.json().catch(() => ({}));
            console.error("Detalle del error del backend:", errDetail);
            throw new Error(`HTTP ${res.status}`);
        }
        
        const respuesta = await res.json();
        renderizarTabla(respuesta.data || []);
        renderizarPaginacion(respuesta.totalPaginas || 1);
    } catch (err) {
        console.error("Error al cargar productos:", err);
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:red;">
                Error de conexión con el servidor. Revisa los logs de la consola (F12).
            </td></tr>`;
        }
    }
}