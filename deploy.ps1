Write-Host "============================================================"
Write-Host "   🚀 INICIANDO DEPLOY COMPLETO DEL ERP SUCRE"
Write-Host "============================================================"

# Archivos principales
$archivos = @(
    "main.py",

    # Productos
    "web/productos/productos.html",
    "web/productos/productos.js",

    # Compras
    "web/compras/compras.html",
    "web/compras/compras.js",

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
    "web/facturacion/facturacion.js"
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
git push

Write-Host ""
Write-Host "============================================================"
Write-Host "   🚀 Enviando deploy a Render..."
Write-Host "============================================================"

# Render deploy trigger
curl -X POST `
  -H "Accept: application/json" `
  -H "Content-Type: application/json" `
  -d '{}' `
  https://api.render.com/deploy/srv-d9l24qdaeets73ad9fvg?key=YOUR_RENDER_KEY

Write-Host ""
Write-Host "============================================================"
Write-Host "   🎉 DEPLOY FINALIZADO CON ÉXITO"
Write-Host "   Render compilará y actualizará la app automáticamente."
Write-Host "============================================================"
