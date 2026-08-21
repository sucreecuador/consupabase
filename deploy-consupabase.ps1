# ============================================================
# CI/CD Automático para CONSUPABASE ERP
# Backend (app/) + Frontend (web/) + Render
# ============================================================

Write-Host "Iniciando CI/CD del Proyecto CONSUPABASE ERP"
Write-Host "============================================================"

$projectPath = "C:\Users\Supervisor\consupabase"
Set-Location $projectPath

$paths = @(
    "$projectPath\app",
    "$projectPath\web",
    "$projectPath\web\components",
    "$projectPath\web\components\sidebar",
    "$projectPath\web\dashboard"
)

foreach ($p in $paths) {
    if (-Not (Test-Path $p)) {
        Write-Host "ADVERTENCIA: No existe $p"
    }
}

git add app/* 2>$null
git add web/*
git add deploy-consupabase.ps1

if (Test-Path "$projectPath\static") {
    git add static/*
}

$gitStatus = git status --porcelain

if ($gitStatus) {
    git commit -am "ERP Deploy - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} else {
    git commit --allow-empty -m "ERP Forzando deploy - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

git push origin main

if (-Not $env:RENDER_API_KEY) {
    Write-Host "ERROR: La variable de entorno RENDER_API_KEY no está definida."
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
        Write-Host "Render aceptó el deploy."
        Write-Host "ID del deploy: $($deploy.id)"
        Write-Host "Estado inicial: $($deploy.status)"
    }
}
catch {
    Write-Host "ERROR al enviar deploy:"
    Write-Host $_.Exception.Message
}

Write-Host "FIN DEL DEPLOY"
