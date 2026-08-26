# deploy.ps1 - Script de despliegue ERP SUCRE
$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   🚀 INICIANDO DEPLOY COMPLETO DEL ERP SUCRE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Verificar presencia de archivos y carpetas base
if (-not (Test-Path "main.py")) {
    Write-Host "❌ ERROR: No se encontró main.py" -ForegroundColor Red
    exit 1
}
Write-Host "✔ OK: main.py encontrado" -ForegroundColor Green

if (-not (Test-Path "web")) {
    Write-Host "❌ ERROR: No se encontró la carpeta web" -ForegroundColor Red
    exit 1
}
Write-Host "✔ OK: carpeta web encontrada" -ForegroundColor Green

# Verificar productos.html (en raíz de web o subcarpetas)
$pathProductos = Get-ChildItem -Path "web" -Filter "productos.html" -Recurse -ErrorAction SilentlyContinue
if ($null -eq $pathProductos) {
    Write-Host "❌ ERROR: No se encontró productos.html dentro de la carpeta web" -ForegroundColor Red
    exit 1
}
Write-Host "✔ OK: productos.html encontrado en ($($pathProductos.FullName))" -ForegroundColor Green

# Verificar compras.html (en raíz de web o subcarpetas)
$pathCompras = Get-ChildItem -Path "web" -Filter "compras.html" -Recurse -ErrorAction SilentlyContinue
if ($null -eq $pathCompras) {
    Write-Host "❌ ERROR: No se encontró compras.html dentro de la carpeta web" -ForegroundColor Red
    exit 1
}
Write-Host "✔ OK: compras.html encontrado en ($($pathCompras.FullName))" -ForegroundColor Green

# 2. Guardar y subir cambios a GitHub
Write-Host "`n📦 Verificando cambios pendientes..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "✔ Cambios detectados, creando commit..." -ForegroundColor Green
    git add .
    $fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Deploy ERP Sucre (Ventas & Compras) - $fecha"
    
    Write-Host "⬆ Subiendo cambios a GitHub..." -ForegroundColor Yellow
    git push origin main
} else {
    Write-Host "ℹ No hay cambios pendientes por commitear." -ForegroundColor Cyan
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "   🎉 DEPLOY FINALIZADO CON ÉXITO" -ForegroundColor Green
Write-Host "   Render compilará y actualizará la app automáticamente." -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Cyan