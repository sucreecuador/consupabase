# ============================================================
#  🚀 DEPLOY COMPLETO DEL ERP SUCRE (BACKEND)
# ============================================================

Write-Host "============================================================"
Write-Host "   🚀 INICIANDO DEPLOY DEL ERP SUCRE"
Write-Host "============================================================"

# Ruta del proyecto
$projectPath = "C:\Users\Supervisor\consupabase"
Set-Location $projectPath

# ============================================================
#  VERIFICACIONES
# ============================================================

Write-Host "`n🔍 Verificando main.py..."
if (!(Test-Path "$projectPath\main.py")) {
    Write-Host "❌ ERROR: No existe main.py"
    exit
}
Write-Host "✔ OK: main.py encontrado"

Write-Host "`n🔍 Verificando carpeta web..."
if (!(Test-Path "$projectPath\web")) {
    Write-Host "⚠ ADVERTENCIA: No existe carpeta web/"
} else {
    Write-Host "✔ OK: carpeta web encontrada"
}

# ============================================================
#  GIT: AGREGAR CAMBIOS SOLO SI EXISTEN
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
    Write-Host "   → Render NO reconstruirá automáticamente."
    Write-Host "   → Se enviará un deploy manual igualmente."
}

# ============================================================
#  RENDER: ENVIAR DEPLOY
# ============================================================

Write-Host "`n🚀 Enviando deploy a Render..."

$apiKey = $env:RENDER_API_KEY

if (-not $apiKey) {
    Write-Host "❌ ERROR: No existe RENDER_API_KEY en variables de entorno."
    exit
}

# ID del servicio backend en Render
$serviceId = "srv-d9l24qdaeets73ad9fvg"

# Endpoint de Render
$renderUrl = "https://api.render.com/v1/services/$serviceId/deploys"

try {
    $deploy = Invoke-RestMethod `
        -Method POST `
        -Uri $renderUrl `
        -Headers @{ "Authorization" = "Bearer $apiKey" } `
        -ContentType "application/json" `
        -Body "{}"

    Write-Host "`n============================================================"
    Write-Host "   ✔ Render aceptó el deploy"
    Write-Host "============================================================"
    Write-Host "🆔 ID del deploy: $($deploy.id)"
    Write-Host "📌 Estado inicial: $($deploy.status)"
    Write-Host "🔗 Logs: https://dashboard.render.com/services/$serviceId/deploys/$($deploy.id)"
}
catch {
    Write-Host "❌ ERROR al enviar el deploy a Render."
    Write-Host $_
}

Write-Host "`n============================================================"
Write-Host "   🎉 DEPLOY COMPLETO FINALIZADO"
Write-Host "============================================================"
