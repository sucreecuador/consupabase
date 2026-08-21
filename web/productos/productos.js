document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");

    const ruta = window.location.pathname;

    if (ruta.includes("productos")) {
        sidebar.classList.add("sidebar-small");
        content.classList.add("content-small");
    } else {
        sidebar.classList.remove("sidebar-small");
        content.classList.remove("content-small");
    }
});
