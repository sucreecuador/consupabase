document.addEventListener("DOMContentLoaded", () => {
    cargarContactos();
});

async function cargarContactos() {
    const tablaBody = document.querySelector("#tabla-contactos tbody");
    if (!tablaBody) return;

    try {
        const response = await fetch("/api/contactos");
        if (!response.ok) throw new Error("Error en la petición a la API");

        const data = await response.json();

        if (data.error) {
            tablaBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red; padding: 20px;">Error Supabase: ${data.error}</td></tr>`;
            return;
        }

        tablaBody.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No hay clientes registrados.</td></tr>`;
            return;
        }

        data.forEach(c => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${c.nombre || '-'}</td>
                <td>${c.razon_social || c.empresa || '-'}</td>
                <td>${c.telefono1 || c.telefono || '-'}</td>
                <td>${c.email || '-'}</td>
                <td>${c.categoria || c.tipo || '-'}</td>
                <td>
                    <button class="btn-edit" onclick="editarContacto('${c.id}')">Editar</button>
                    <button class="btn-delete" onclick="eliminarContacto('${c.id}')">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error al cargar contactos:", error);
        tablaBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red; padding: 20px;">Error al conectar con la API backend.</td></tr>`;
    }
}