Write-Host "============================================================"
Write-Host "   🚀 INICIANDO DEPLOY COMPLETO DEL ERP SUCRE"
Write-Host "============================================================"

# Ruta base del proyecto
$basePath = "C:\Users\Supervisor\consupabase"

# Archivos obligatorios
$mainPy = Join-Path $basePath "main.py"

# Módulo Productos
$productosHtml = Join-Path $basePath "web\productos\productos.html"
$comprasHtml = Join-Path $basePath "web\productos\compras.html"
$productosJs = Join-Path $basePath "web\productos\productos.js"
$comprasJs = Join-Path $basePath "web\productos\compras.js"

# Módulo Facturación
$facturacionHtml = Join-Path $basePath "web\facturacion\index.html"
$facturacionJs = Join-Path $basePath "web\facturacion\facturacion.js"

# Verificaciones
if (Test-Path $mainPy) {
    Write-Host "✔ OK: main.py encontrado"
} else {
    Write-Host "❌ ERROR: main.py no encontrado"
    exit
}

if (Test-Path $productosHtml) {
    Write-Host "✔ OK: productos.html encontrado"
} else {
    Write-Host "❌ ERROR: productos.html no encontrado"
    exit
}

if (Test-Path $comprasHtml) {
    Write-Host "✔ OK: compras.html encontrado"
} else {
    Write-Host "❌ ERROR: compras.html no encontrado"
    exit
}

if (Test-Path $productosJs) {
    Write-Host "✔ OK: productos.js encontrado"
} else {
    Write-Host "❌ ERROR: productos.js no encontrado"
    exit
}

if (Test-Path $comprasJs) {
    Write-Host "✔ OK: compras.js encontrado"
} else {
    Write-Host "❌ ERROR: compras.js no encontrado"
    exit
}

if (Test-Path $facturacionHtml) {
    Write-Host "✔ OK: index.html encontrado (Facturación)"
} else {
    Write-Host "❌ ERROR: index.html no encontrado"
    exit
}

if (Test-Path $facturacionJs) {
    Write-Host "✔ OK: facturacion.js encontrado"
} else {
    Write-Host "❌ ERROR: facturacion.js no encontrado"
    exit
}

Write-Host ""
Write-Host "📦 Verificando cambios pendientes..."

# Inicializar git si no existe
if (!(Test-Path (Join-Path $basePath ".git"))) {
    git init $basePath
}

Set-Location $basePath

# Agregar cambios
git add .

# Crear commit
$fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deploy ERP Sucre (Consolidación index.html y facturacion.js) - $fecha"

Write-Host "⬆ Subiendo cambios a GitHub..."
git push origin main

Write-Host ""
Write-Host "============================================================"
Write-Host "   🎉 DEPLOY FINALIZADO CON ÉXITO"
Write-Host "   Render compilará y actualizará la app automáticamente."
Write-Host "============================================================"