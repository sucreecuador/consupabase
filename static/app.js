function renderTableData(data) {
    tableBody.innerHTML = "";

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No se encontraron registros.</td></tr>`;
        return;
    }

    data.forEach(item => {
        const tr = document.createElement("tr");

        if (currentModule === "productos") {
            if (currentVista === 1) {
                tr.innerHTML = `
                    <td><strong>${item.codigo || ''}</strong></td>
                    <td>${item.codigo_proveedor || item.cod_prov || ''}</td>
                    <td>${item.marca || ''}</td>
                    <td>${item.descripcion || ''}</td>
                    <td>$${Number(item.precio_venta || 0).toFixed(2)}</td>
                    <td>$${Number(item.costo_prom || 0).toFixed(2)}</td>
                    <td>${item.saldo || 0}</td>
                    <td>${item.saldo_bext || 0}</td>
                    <td>${item.saldo_temp || 0}</td>
                `;
            } else {
                tr.innerHTML = `
                    <td><strong>${item.codigo || ''}</strong></td>
                    <td>${item.codigo_proveedor || item.cod_prov || ''}</td>
                    <td>${item.marca || ''}</td>
                    <td>${item.descripcion || ''}</td>
                    <td>$${Number(item.precio_venta || 0).toFixed(2)}</td>
                    <td>$${Number(item.costo_prom || 0).toFixed(2)}</td>
                    <td>${item.saldo || 0}</td>
                    <td>${item.peso || ''}</td>
                    <td>${item.medidas || item.medida || ''}</td>
                `;
            }
        } else {
            // Lectura de los campos exactos mapeados desde la imagen de Supabase
            const cod = item.codigo_cliente || item.id || '';
            const ruc = item.ruc || item.cedula || item.identificacion || '';
            const nom = item.nombre || item.razon_social || '';
            const dir = item.direccion || item.calle || '';
            const tel = item.telefono || item.celular || '';
            const email = item.email || item.correo || '';
            const ciudad = item.ciudad || '';
            const tipo = item.categoria || item.tipo_contacto || '';

            tr.innerHTML = `
                <td><strong>${cod}</strong></td>
                <td>${ruc}</td>
                <td>${nom}</td>
                <td>${dir}</td>
                <td>${tel}</td>
                <td>${email}</td>
                <td>${ciudad}</td>
                <td>${tipo}</td>
            `;
        }

        tableBody.appendChild(tr);
    });
}