document.addEventListener("DOMContentLoaded", () => {
    cargarContactos();
});

async function cargarContactos() {
    const tablaBody = document.querySelector("#tabla-contactos tbody") || document.querySelector("table tbody");
    
    try {
        const response = await fetch("/api/contactos");
        if (!response.ok) throw new Error("Error al consultar la API de Supabase");
        
        const contactos = await response.json();
        
        if (!tablaBody) return;
        tablaBody.innerHTML = "";

        if (contactos.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No hay contactos registrados.</td></tr>`;
            return;
        }

        contactos.forEach(c => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${c.nombre || '-'}</td>
                <td>${c.empresa || '-'}</td>
                <td>${c.telefono || '-'}</td>
                <td>${c.email || '-'}</td>
                <td>${c.tipo || '-'}</td>
                <td>
                    <button class="btn-edit" onclick="editarContacto('${c.id}')">Editar</button>
                    <button class="btn-delete" onclick="eliminarContacto('${c.id}')">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error cargando contactos:", error);
        if (tablaBody) {
            tablaBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red; padding: 20px;">Error al cargar datos desde Supabase. Checkea la consola.</td></tr>`;
        }
    }
}