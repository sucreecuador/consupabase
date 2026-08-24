<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Productos - ERP Sucre</title>
    <link rel="stylesheet" href="/web/components/layout.css">
    <link rel="stylesheet" href="/web/productos/productos.css">
</head>
<body>
    <div class="app-container">
        <aside id="sidebar" class="sidebar">
            <h2 class="brand">ERP SUCRE</h2>
            <nav class="menu">
                <a href="/web/index.html">Inicio</a>
                <a href="/web/dashboard/index.html">Indicadores</a>
                <a href="/web/productos/productos.html" class="active">Productos</a>
                <a href="/web/inventario/index.html">Inventario</a>
                <a href="/web/contactos/index.html">Contactos</a>
                <a href="/web/reportes/index.html">Reportes</a>
                <a href="/web/facturacion/index.html">Facturación</a>
                <a href="/web/configuracion/index.html">Configuración</a>
            </nav>
        </aside>

        <main class="main-content">
            <header class="top-bar">
                <h1>Productos</h1>
                <p>Gestión de catálogo, precios y stock</p>
                <button id="toggleSidebar" class="btn-secondary">Ocultar menú</button>
            </header>

            <section class="filters-section">
                <input type="text" id="buscarNombre" placeholder="Buscar por NOMBRE...">
                <input type="text" id="buscarMarca" placeholder="Buscar por MARCA...">
                <input type="text" id="buscarCodigo" placeholder="Buscar por CÓDIGO...">
                <input type="text" id="buscarPro1" placeholder="Buscar por PRO1 (Ej. 319)...">
                <button id="btnMostrarTodos" class="btn-primary">Mostrar todos</button>
                <button id="btnNuevoProducto" class="btn-success">+ Nuevo Producto</button>
            </section>

            <section class="table-container">
                <table>
                    <thead id="theadProductos">
                        <!-- Generado por JS -->
                    </thead>
                    <tbody id="tablaBody">
                        <!-- Generado por JS -->
                    </tbody>
                </table>
            </section>

            <footer class="pagination-container">
                <button id="btnPrimero">« Primero</button>
                <button id="btnAnterior">‹ Anterior</button>
                <span id="paginaActual">Página 1</span>
                <button id="btnSiguiente">Siguiente ›</button>
                <button id="btnUltimo">Último »</button>
                <input type="number" id="irPagina" min="1" placeholder="Pág.">
                <button id="btnIr">Ir</button>
            </footer>
        </main>
    </div>

    <script src="/web/productos/productos.js"></script>
</body>
</html>