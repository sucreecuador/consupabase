Write-Host "============================================================"
Write-Host "   🚀 INICIANDO DEPLOY COMPLETO DEL ERP SUCRE (RAILWAY)"
Write-Host "============================================================"

# Archivos principales del ERP
$archivos = @(
    "main.py",

    # Productos
    "web/productos/productos.html",
    "web/productos/productos.js",
    "web/productos/productos.css",

    # Compras (Estructura corregida)
    "web/compras/index.html",
    "web/compras/compras.js",
    "web/compras/compras.css",

    # Contactos
    "web/contactos/index.html",
    "web/contactos/contactos.js",
    "web/contactos/contactos.css",

    # Reportes
    "web/reportes/index.html",
    "web/reportes/reportes.js",
    "web/reportes/reportes.css",

    # Dashboard / Indicadores
    "web/dashboard/index.html",
    "web/dashboard/dashboard.js",
    "web/dashboard/dashboard.css",

    # Facturación
    "web/facturacion/index.html",
    "web/facturacion/facturacion.js",
    "web/facturacion/facturacion.css"
)

foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Write-Host "✔ OK: $archivo encontrado"
    } else {
        Write-Host "❌ ERROR: $archivo NO existe"
    }
}

Write-Host ""
Write-Host "📦 Verificando cambios pendientes..."

git add .
$fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deploy ERP Sucre - $fecha"
git push origin main

Write-Host ""
Write-Host "============================================================"
Write-Host "   🎉 CAMBIOS ENVIADOS A RAILWAY VIA GIT PUSH"
Write-Host "   Railway detectará el push y desplegará automáticamente."
Write-Host "============================================================"