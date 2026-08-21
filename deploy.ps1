# ============================================================
#  DEPLOY AUTOMÁTICO DEL BACKEND CONSUPABASE-API A RENDER
# ============================================================

Write-Host "============================================================"
Write-Host "   🚀 INICIANDO DEPLOY DEL BACKEND CONSUPABASE-API"
Write-Host "============================================================"

# Ruta del proyecto
$projectPath = "C:\Users\Supervisor\consupabase"
Set-Location $projectPath

Write-Host "`n🔍 Verificando main.py..."

if (Test-Path "$projectPath\main.py") {
    Write-Host "✔ OK: main.py encontrado"
} else {
    Write-Host "❌ ERROR: No existe main.py en el proyecto"
    exit
}

# ============================================================
#  GIT: AGREGAR CAMBIOS Y CREAR COMMIT
# ============================================================

Write-Host "`n📦 Agregando archivos al commit..."
git add .

Write-Host "📝 Creando commit..."
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Backend Deploy - $timestamp"

Write-Host "`n⬆ Subiendo cambios a GitHub..."
git push

# ============================================================
#  RENDER: ENVIAR DEPLOY DEL BACKEND
# ============================================================

Write-Host "`n🚀 Enviando deploy del backend a Render..."

# Render API Key desde variable de entorno
$apiKey = $env:RENDER_API_KEY

if (-not $apiKey) {
    Write-Host "❌ ERROR: No existe RENDER_API_KEY en variables de entorno."
    exit
}

# ID del servicio backend en Render (TU ID REAL)
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
    Write-Host "   ✔ Render aceptó el deploy del backend"
    Write-Host "============================================================"
    Write-Host "🆔 ID del deploy: $($deploy.id)"
    Write-Host "📌 Estado inicial: $($deploy.status)"
}
catch {
    Write-Host "❌ ERROR al enviar el deploy del backend a Render."
    Write-Host $_
}

Write-Host "`n============================================================"
Write-Host "   🎉 DEPLOY DEL BACKEND COMPLETO"
Write-Host "============================================================"
