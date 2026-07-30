function formatearNombreColumna(nombre) {
    const mapaNombres = {
        "codigo": "COD. CONTACTO",
        "cod_contacto": "COD. CONTACTO",
        "id": "COD. CONTACTO",
        "ruc": "C.C. o R.U.C.",
        "cedula": "C.C. o R.U.C.",
        "nombre": "NOMBRE APELLIDO",
        "direccion": "CALLE Y NUMERO",
        "telefono": "TELEFONO",
        "email": "CORR. ELECTRONICO",
        "ciudad": "CIUDAD",
        "tipo": "CATEGORIA",
        "categoria": "CATEGORIA",
        "contacto": "CONTACTO",
        "vendedor": "VENDEDOR",
        "limite_credito": "LIMITE CREDITO",
        "plazo": "PLAZO",
        "banco": "BANCO",
        "observaciones": "OBSERVACIONES"
    };
    
    if (mapaNombres[nombre.toLowerCase()]) {
        return mapaNombres[nombre.toLowerCase()];
    }
    return nombre.replace(/_/g, " ").toUpperCase();
}

async function cargarContactos() {
    try {
        const nombre = document.getElementById("filtroNombreContacto").value;
        const ruc = document.getElementById("filtroRucContacto").value;

        let url = `/contactos?page=${paginaActualContacto - 1}&page_size=20`;
        if (nombre) url += `&nombre=${encodeURIComponent(nombre)}`;
        if (ruc) url += `&ruc=${encodeURIComponent(ruc)}`;
        if (orderByCont) url += `&order_by=${orderByCont}&order_dir=${orderDirCont}`;

        const resp = await fetch(url);
        const data = await resp.json();

        totalPaginasContacto = data.total_pages || 1;

        const tbody = document.querySelector("#tablaContactos tbody");
        const thead = document.querySelector("#tablaContactos thead");

        tbody.innerHTML = "";
        thead.innerHTML = "";

        if (!data.data || data.data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='10' style='text-align:center;'>No hay datos disponibles</td></tr>";
            renderPaginationContacto();
            return;
        }

        const keysDisponibles = Object.keys(data.data[0]);
        let campoCodigoReal = "codigo";
        if (!keysDisponibles.includes("codigo")) {
            if (keysDisponibles.includes("cod_contacto")) campoCodigoReal = "cod_contacto";
            else if (keysDisponibles.includes("id")) campoCodigoReal = "id";
        }

        // Vista 1: Exactamente las 8 columnas indicadas en tu imagen
        const vista1Cont = [
            campoCodigoReal, 
            "ruc", 
            "nombre", 
            "direccion", 
            "telefono", 
            "email", 
            "ciudad", 
            "tipo"
        ];
        
        // Vista 2: Las mismas columnas de la vista 1 pero sin "direccion" ni "ciudad"
        const vista2Cont = vista1Cont.filter(c => c !== "direccion" && c !== "ciudad");

        const columnas = vistaContactos === 1 ? vista1Cont : vista2Cont;
        const columnasValidas = columnas.filter(c => keysDisponibles.includes(c));
        const finalCols = columnasValidas.length > 0 ? columnasValidas : columnas;

        let headHtml = "<tr>";
        finalCols.forEach(c => {
            let indicador = "";
            if (orderByCont === c) {
                indicador = orderDirCont === "asc" ? " ▲" : " ▼";
            }
            const nombreLimpio = formatearNombreColumna(c);
            headHtml += `<th onclick="ordenarColumnaCont('${c}')" style="cursor: pointer;">${nombreLimpio}${indicador}</th>`;
        });
        headHtml += "</tr>";
        thead.innerHTML = headHtml;

        data.data.forEach(item => {
            let filaHtml = "<tr>";
            finalCols.forEach(c => {
                filaHtml += `<td>${item[c] !== null && item[c] !== undefined ? item[c] : ""}</td>`;
            });
            filaHtml += "</tr>";
            tbody.innerHTML += filaHtml;
        });

        renderPaginationContacto();
    } catch (error) {
        console.error("Error cargando contactos:", error);
    }
}