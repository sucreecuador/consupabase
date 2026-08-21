# ============================================================
#  DEPLOY AUTOMÁTICO DEL FRONTEND ERP-WEB A RENDER
# ============================================================

Write-Host "============================================================"
Write-Host "   🚀 INICIANDO DEPLOY DEL FRONTEND ERP-WEB"
Write-Host "============================================================"

# Ruta del proyecto
$projectPath = "C:\Users\Supervisor\consupabase"
Set-Location $projectPath

Write-Host "`n🔍 Verificando carpeta web..."

if (Test-Path "$projectPath\web") {
    Write-Host "✔ OK: carpeta web encontrada"
} else {
    Write-Host "❌ ERROR: No existe la carpeta web/"
    exit
}

# ============================================================
#  GIT: AGREGAR CAMBIOS Y CREAR COMMIT
# ============================================================

Write-Host "`n📦 Agregando archivos al commit..."
git add .

Write-Host "📝 Creando commit..."
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Frontend ERP-WEB Deploy - $timestamp"

Write-Host "`n⬆ Subiendo cambios a GitHub..."
git push

# ============================================================
#  RENDER: ENVIAR DEPLOY DEL FRONTEND
# ============================================================

Write-Host "`n🚀 Enviando deploy del frontend a Render..."

# Render API Key desde variable de entorno
$apiKey = $env:RENDER_API_KEY

if (-not $apiKey) {
    Write-Host "❌ ERROR: No existe RENDER_API_KEY en variables de entorno."
    exit
}

# ID del servicio frontend en Render (TU ID REAL)
$serviceId = "srv-abc123def456ghi789"

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
    Write-Host "   ✔ Render aceptó el deploy del frontend"
    Write-Host "============================================================"
    Write-Host "🆔 ID del deploy: $($deploy.id)"
    Write-Host "📌 Estado inicial: $($deploy.status)"
}
catch {
    Write-Host "❌ ERROR al enviar el deploy del frontend a Render."
    Write-Host $_
}

Write-Host "`n============================================================"
Write-Host "   🎉 DEPLOY DEL FRONTEND COMPLETO"
Write-Host "============================================================"
