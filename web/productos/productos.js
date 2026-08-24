document.addEventListener("DOMContentLoaded", async () => {
    const tablaBody = document.getElementById("tablaBody");
    const paginaActualSpan = document.getElementById("paginaActual");

    try {
        const respuesta = await fetch('/api/productos?contacto=319');
        const data = await respuesta.json();

        if (!tablaBody) return;
        tablaBody.innerHTML = "";

        if (!data || data.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="11" style="text-align:center;">No se encontraron registros para el proveedor 319</td></tr>`;
            return;
        }

        data.forEach(prod => {
            const codProv = prod.codigo_proveedor ?? prod.cod_proveedor ?? "—";
            tablaBody.innerHTML += `
                <tr>
                    <td>${prod.pro1 ?? "—"}</td>
                    <td>${prod.pro2 ?? "—"}</td>
                    <td>${prod.pro3 ?? "—"}</td>
                    <td>${codProv}</td>
                    <td>${prod.codigo ?? ""}</td>
                    <td>${prod.marca ?? ""}</td>
                    <td>${prod.descripcion ?? ""}</td>
                    <td>${prod.saldo_temp ?? 0}</td>
                    <td>${Number(prod.costo_prom ?? 0).toFixed(2)}</td>
                    <td>${Number(prod.precio_venta ?? 0).toFixed(2)}</td>
                    <td style="text-align:center;">
                        <button onclick='alert("Editar: " + ${prod.id})'>✏️</button>
                        <button onclick='alert("Eliminar: " + ${prod.id})'>🗑️</button>
                    </td>
                </tr>
            `;
        });

        if (paginaActualSpan) {
            paginaActualSpan.innerText = `Mostrando ${data.length} productos del proveedor 319`;
        }
    } catch (error) {
        if (tablaBody) {
            tablaBody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:red;">Error al cargar datos del proveedor 319</td></tr>`;
        }
    }
});