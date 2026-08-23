// ============================================================
// Sidebar Navegación ERP SUCRE
// ============================================================

function sendNavigate(ruta) {
    window.location.href = ruta;
}

// Resaltar opción activa
document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".sidebar-menu li");
    const current = window.location.pathname;

    items.forEach(li => {
        const ruta = li.getAttribute("onclick");
        if (!ruta) return;

        if (ruta.includes(current)) {
            li.classList.add("active");
        }
    });
});
