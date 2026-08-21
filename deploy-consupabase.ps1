# ============================================================
# CI/CD Automático para CONSUPABASE ERP
# Backend (main.py) + Frontend (web/) + Render Deploy Trigger
# ============================================================

Write-Host ""
Write-Host "============================================================"
Write-Host "   🚀 INICIANDO DEPLOY DEL ERP CONSUPABASE"
Write-Host "============================================================"
Write-Host ""

# Ruta del proyecto
$projectPath = "C:\Users\Supervisor\consupabase"
Set-Location $projectPath

# Carpetas que deben existir
$paths = @(
    "$projectPath\web",
    "$projectPath\web\dashboard",
    "$projectPath\web\components",
    "$projectPath\web\components\sidebar",
    "$projectPath\web\productos",
    "$projectPath\static"
)

Write-Host "🔍 Verificando estructura del proyecto..."
foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Host "✔ OK: $p"
    } else {
        Write-Host "⚠ ADVERTENCIA: Falta $p"
    }
}

Write-Host ""
Write-Host "📦 Agregando archivos al commit..."

git add main.py
git add web/*
git add static/*
git add Procfile
git add requirements.txt
git add deploy-consupabase.ps1

# Verificar si hay cambios
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "📝 Commit con cambios detectados..."
    git commit -am "ERP Deploy - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} else {
    Write-Host "📝 Commit vacío (forzando deploy)..."
    git commit --allow-empty -m "ERP Deploy (forced) - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

Write-Host ""
Write-Host "⬆ Subiendo cambios a GitHub..."
git push origin main

Write-Host ""
Write-Host "🚀 Enviando deploy a Render..."

if (-Not $env:RENDER_API_KEY) {
    Write-Host "❌ ERROR: La variable de entorno RENDER_API_KEY no está definida."
    Write-Host "Define la variable así:"
    Write-Host '$env:RENDER_API_KEY = "tu_api_key_de_render"'
    exit
}

$serviceId = "srv-d9l24qdaeets73ad9fvg"
$renderApiUrl = "https://api.render.com/v1/services/$serviceId/deploys"

try {
    $deploy = Invoke-RestMethod `
        -Method Post `
        -Uri $renderApiUrl `
        -Headers @{ "Authorization" = "Bearer $env:RENDER_API_KEY" } `
        -ContentType "application/json" `
        -Body "{}"

    if ($deploy -and $deploy.id) {
        Write-Host ""
        Write-Host "============================================================"
        Write-Host "   ✔ Render aceptó el deploy"
        Write-Host "============================================================"
        Write-Host "🆔 ID del deploy: $($deploy.id)"
        Write-Host "📌 Estado inicial: $($deploy.status)"
        Write-Host ""
    }
}
catch {
    Write-Host "❌ ERROR al enviar deploy a Render:"
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "============================================================"
Write-Host "   🎉 DEPLOY COMPLETO"
Write-Host "============================================================"
Write-Host ""
