# ============================================================
# 🚀 DEPLOY COMPLETO DEL ERP SUCRE (BACKEND + FRONTEND)
# ============================================================

Write-Host "============================================================"
Write-Host "   🚀 INICIANDO DEPLOY COMPLETO DEL ERP SUCRE"
Write-Host "============================================================"

# Ruta del proyecto
$projectPath = "C:\Users\Supervisor\consupabase"
Set-Location $projectPath

# ============================================================
# VERIFICACIONES
# ============================================================

Write-Host "`n🔍 Verificando main.py..."
if (!(Test-Path "$projectPath\main.py")) {
    Write-Host "❌ ERROR: No existe main.py"
    exit
}
Write-Host "✔ OK: main.py encontrado"

Write-Host "`n🔍 Verificando carpeta web..."
if (!(Test-Path "$projectPath\web")) {
    Write-Host "❌ ERROR: No existe carpeta web/"
    exit
}
Write-Host "✔ OK: carpeta web encontrada"

# ============================================================
# GIT: AGREGAR CAMBIOS
# ============================================================

Write-Host "`n📦 Verificando cambios pendientes..."

$changes = git status --porcelain

if ($changes) {
    Write-Host "✔ Cambios detectados, creando commit..."

    git add .

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Deploy ERP Sucre - $timestamp"

    Write-Host "⬆ Subiendo cambios a GitHub..."
    git push
} else {
    Write-Host "⚠ No hay cambios en Git."
    Write-Host "   → Se enviará deploy manual igualmente."
}

# ============================================================
# DEPLOY BACKEND (Render)
# ============================================================

Write-Host "`n🚀 Enviando deploy del BACKEND a Render..."

$apiKey = $env:RENDER_API_KEY

if (-not $apiKey) {
    Write-Host "❌ ERROR: No existe RENDER_API_KEY en variables de entorno."
    exit
}

# ID del servicio backend en Render
$backendId = "srv-d9l24qdaeets73ad9fvg"
$backendUrl = "https://api.render.com/v1/services/$backendId/deploys"

try {
    $deployBackend = Invoke-RestMethod `
        -Method POST `
        -Uri $backendUrl `
        -Headers @{ "Authorization" = "Bearer $apiKey" } `
        -ContentType "application/json" `
        -Body "{}"

    Write-Host "`n✔ Backend desplegado correctamente"
}
catch {
    Write-Host "❌ ERROR al desplegar backend."
    Write-Host $_
}

# ============================================================
# DEPLOY FRONTEND (Render STATIC)
# ============================================================

Write-Host "`n🚀 Enviando deploy del FRONTEND (carpeta /web)..."

# ID del servicio STATIC en Render (CREARLO UNA VEZ EN RENDER)
$frontendId = "srv-frontend-sucre-123456"   # ← CAMBIA ESTE ID

$frontendUrl = "https://api.render.com/v1/services/$frontendId/deploys"

try {
    $deployFrontend = Invoke-RestMethod `
        -Method POST `
        -Uri $frontendUrl `
        -Headers @{ "Authorization" = "Bearer $apiKey" } `
        -ContentType "application/json" `
        -Body "{}"

    Write-Host "`n✔ Frontend desplegado correctamente"
}
catch {
    Write-Host "❌ ERROR al desplegar frontend."
    Write-Host $_
}

Write-Host "`n============================================================"
Write-Host "   🎉 DEPLOY COMPLETO FINALIZADO"
Write-Host "============================================================"
