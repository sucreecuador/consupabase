# ============================================================
#  DEPLOY AUTOMÁTICO A RENDER DESDE WINDOWS POWERSHELL
#  Proyecto: CONSUPABASE ERP
# ============================================================

Write-Host "============================================================"
Write-Host "   🚀 INICIANDO DEPLOY DEL ERP CONSUPABASE"
Write-Host "============================================================"

# Ruta del proyecto
$projectPath = "C:\Users\Supervisor\consupabase"
Set-Location $projectPath

Write-Host "`n🔍 Verificando estructura del proyecto..."

# Carpetas requeridas
$requiredFolders = @("static", "web")
foreach ($folder in $requiredFolders) {
    if (Test-Path "$projectPath\$folder") {
        Write-Host "✔ OK: $projectPath\$folder"
    } else {
        Write-Host "⚠ ADVERTENCIA: Falta $projectPath\$folder"
    }
}

# ============================================================
#  GIT: AGREGAR CAMBIOS Y CREAR COMMIT
# ============================================================

Write-Host "`n📦 Agregando archivos al commit..."
git add .

Write-Host "📝 Creando commit..."
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "ERP Deploy - $timestamp"

Write-Host "`n⬆ Subiendo cambios a GitHub..."
git push

# ============================================================
#  RENDER: ENVIAR DEPLOY
# ============================================================

Write-Host "`n🚀 Enviando deploy a Render..."

# Render API Key desde variable de entorno
$apiKey = $env:RENDER_API_KEY

if (-not $apiKey) {
    Write-Host "❌ ERROR: No existe RENDER_API_KEY en variables de entorno."
    exit
}

# ID del servicio en Render (debes poner el tuyo)
$serviceId = "srv-xxxxxxxxxxxxxxxxxxxx"

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
}
catch {
    Write-Host "❌ ERROR al enviar el deploy a Render."
    Write-Host $_
}

Write-Host "`n============================================================"
Write-Host "   🎉 DEPLOY COMPLETO"
Write-Host "============================================================"
