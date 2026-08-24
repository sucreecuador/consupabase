document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sidebar").innerHTML = `
        <div class="sidebar">
            <h2 class="sidebar-title">ERP SUCRE</h2>

            <a href="/" class="sidebar-item">Inicio</a>
            <a href="/web/dashboard/index.html" class="sidebar-item">Indicadores</a>
            <a href="/web/productos/productos.html" class="sidebar-item">Productos</a>
            <a href="/web/inventario/index.html" class="sidebar-item">Inventario</a>
            <a href="/web/contactos/index.html" class="sidebar-item">Contactos</a>
            <a href="/web/reportes/index.html" class="sidebar-item">Reportes</a>
            <a href="/web/configuracion/index.html" class="sidebar-item">Configuración</a>
        </div>
    `;
});
