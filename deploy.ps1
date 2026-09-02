Write-Host "============================================================"
Write-Host "   🚀 INICIANDO DEPLOY COMPLETO DEL ERP SUCRE (RAILWAY)"
Write-Host "============================================================"

# Archivos principales del ERP
$archivos = @(
    "main.py",
    "web/login.html",
    "web/index.html",

    # Configuración
    "web/configuracion/index.html",

    # Contactos
    "web/contactos/index.html",
    "web/contactos/contactos.js",
    "web/contactos/contactos.css",

    # Dashboard
    "web/dashboard/index.html",
    "web/dashboard/dashboard.js",
    "web/dashboard/dashboard.css",

    # Facturación
    "web/facturacion/index.html",
    "web/facturacion/facturacion.js",
    "web/facturacion/facturacion.css",

    # Inventario
    "web/inventario/index.html",

    # Productos
    "web/productos/productos.html",
    "web/productos/productos.js",
    "web/productos/productos.css",

    # Reportes
    "web/reportes/index.html",
    "web/reportes/reportes.js",
    "web/reportes/reportes.css"
)

foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Write-Host "✔ OK: $archivo encontrado"
    } else {
        Write-Host "❌ ADVERTENCIA: $archivo NO existe localmente"
    }
}

Write-Host ""
Write-Host "📦 Verificando cambios pendientes..."

git add .
$fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deploy ERP Sucre - Limpieza depuracion deploy - $fecha"
git push origin main

Write-Host ""
Write-Host "============================================================"
Write-Host "   🎉 CAMBIOS ENVIADOS A RAILWAY VIA GIT PUSH"
Write-Host "   Railway detectará el push y desplegará automáticamente."
Write-Host "============================================================"