// ============================================================
// Dashboard ERP SUCRE
// ============================================================

// Cargar módulo dentro del contenedor principal
document.addEventListener("DOMContentLoaded", () => {
    loadModule("dashboard-module.html");
});

// Función para cargar módulos HTML
function loadModule(file) {
    fetch(file)
        .then(response => response.text())
        .then(html => {
            document.getElementById("dashboard-module").innerHTML = html;
        })
        .catch(err => {
            console.error("Error cargando módulo:", err);
        });
}

// Navegación global del ERP
function sendNavigate(ruta) {
    window.location.href = ruta;
}
