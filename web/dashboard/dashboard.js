document.addEventListener("DOMContentLoaded", () => {
    loadModule("dashboard-module.html");
});

function loadModule(file) {
    fetch(file)
        .then(r => r.text())
        .then(html => {
            document.getElementById("dashboard-module").innerHTML = html;
        });
}

function sendNavigate(ruta) {
    window.location.href = ruta;
}
