// ============================================================
//  CONSUPABASE ERP - Dashboard JS
//  Integración dinámica con el menú lateral (sidebar)
// ============================================================

// Escuchar mensajes enviados desde el sidebar (iframe)
window.addEventListener("message", (event) => {
    if (!event.data || !event.data.action) return;

    if (event.data.action === "navigate") {
        loadModule(event.data.url);
    }
});

// ============================================================
//  Cargar módulo dentro del dashboard
// ============================================================

function loadModule(url) {
    const content = document.getElementById("erp-content");

    // Mostrar estado de carga
    content.innerHTML = `
        <div style="padding:20px;font-size:18px;">
            ⏳ Cargando módulo...
        </div>
    `;

    // Petición del módulo
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo cargar el módulo: " + url);
            }
            return response.text();
        })
        .then(html => {
            content.innerHTML = html;
        })
        .catch(error => {
            content.innerHTML = `
                <div style="padding:20px;color:red;">
                    <h2>Error cargando módulo</h2>
                    <p>${error}</p>
                </div>
            `;
        });
}

// ============================================================
//  Cargar módulo inicial (Dashboard)
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    loadModule("/web/dashboard/dashboard-module.html");
});
