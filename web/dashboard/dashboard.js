document.addEventListener("DOMContentLoaded", () => {
    loadModule("dashboard-module.html");
});

function loadModule(file) {
    fetch(file)
        .then(r => r.text())
        .then(html => {
            document.getElementById("dashboard-module").innerHTML = html;
        })
        .catch(err => console.error("Error cargando módulo:", err));
}

function sendNavigate(ruta) {
    window.location.href = ruta;
}
