# ============================================================
# CI/CD Automático para CONSUPABASE ERP
# Backend (app/) + Frontend (web/) + Render
# ============================================================

Write-Host "Iniciando CI/CD del Proyecto CONSUPABASE ERP"
Write-Host "============================================================"

# Ruta del proyecto
$projectPath = "C:\Users\Supervisor\consupabase"
Set-Location $projectPath
Write-Host "Ruta establecida: $projectPath"

# ============================================================
# 1. Verificar estructura del ERP
# ============================================================

Write-Host "Verificando estructura de ERP..."

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

# ============================================================
# 2. Incluir archivos en Git
# ============================================================

Write-Host "Incluyendo backend (app/)..."
git add app/* 2>$null

Write-Host "Incluyendo frontend (web/)..."
git add web/*

Write-Host "Incluyendo script de deploy..."
git add deploy-consupabase.ps1

if (Test-Path "$projectPath\static") {
    Write-Host "Incluyendo carpeta static (compatibilidad)..."
    git add static/*
}

# ============================================================
# 3. Commit automático
# ============================================================

$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "Cambios detectados. Realizando commit..."
    git commit -am "ERP Deploy - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} else {
    Write-Host "Sin cambios detectados. Forzando commit..."
    git commit --allow-empty -m "ERP Forzando deploy - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# ============================================================
# 4. Push a GitHub
# ============================================================

Write-Host "Subiendo a GitHub..."
git push origin main
Write-Host "Push completado.`n"

# ============================================================
# 5. Render API Deploy
# ============================================================

Write-Host "Recuperando Render API Key..."

if (-Not $env:RENDER_API_KEY) {
    Write-Host "ERROR: La variable de entorno RENDER_API_KEY no está definida."
    exit
}

Write-Host "API Key cargada."

# *** SERVICE ID CORRECTO ***
$serviceId = "srv-d9l24qdaeets73ad9fvg"

$renderApiUrl = "https://api.render.com/v1/services/$serviceId/deploys"

Write-Host "Enviando Deploy a Render..."

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
    } else {
        Write-Host "Render aceptó el deploy, pero no devolvió ID (respuesta vacía)."
    }
}
catch {
    Write-Host "ERROR al enviar deploy:"
    Write-Host $_.Exception.Message
}

Write-Host "`nCI/CD COMPLETO: Backend + Frontend + Render"
Write-Host "============================================================"
Write-Host "FIN DEL DEPLOY"
