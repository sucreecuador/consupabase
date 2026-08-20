# ============================================================
# CI/CD Automático para CONSUPABASE
# GitHub + Render API Deploy
# ============================================================

Write-Host "Iniciando CI/CD del Proyecto CONSUPABASE"
Write-Host "============================================================"

# Ruta del proyecto
$projectPath = "C:\Users\Supervisor\consupabase"
Set-Location $projectPath
Write-Host "Ruta establecida: $projectPath"

# ============================================================
# 1. Verificar carpeta static
# ============================================================

Write-Host "Verificando carpeta static..."

if (-Not (Test-Path "$projectPath\static")) {
    Write-Host "ERROR: La carpeta static no existe. Creándola..."
    New-Item -ItemType Directory -Path "$projectPath\static" | Out-Null
}

Write-Host "Forzando inclusión de archivos estáticos..."
git add static/*

# ============================================================
# 2. Commit forzado
# ============================================================

$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "Cambios detectados. Realizando commit..."
    git commit -am "Deploy automático - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} else {
    Write-Host "ADVERTENCIA: Git no detecta cambios. Forzando commit..."
    git commit --allow-empty -m "Forzando deploy - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# ============================================================
# 3. Push a GitHub
# ============================================================

Write-Host "Subiendo a GitHub..."
git push origin main
Write-Host "Push completado.`n"

# ============================================================
# 4. Render API Deploy
# ============================================================

Write-Host "Recuperando Render API Key..."

if (-Not $env:RENDER_API_KEY) {
    Write-Host "ERROR: La variable de entorno RENDER_API_KEY no está definida."
    exit
}

Write-Host "API Key cargada."

# Service ID REAL del Web Service en Render
$serviceId = "srv-d9l24qdaeets73ad9fvg"

# Endpoint de Render
$renderApiUrl = "https://api.render.com/v1/services/$serviceId/deploys"

Write-Host "Enviando Deploy a Render..."

try {
    $deploy = Invoke-RestMethod `
        -Method Post `
        -Uri $renderApiUrl `
        -Headers @{ "Authorization" = "Bearer $env:RENDER_API_KEY" } `
        -ContentType "application/json" `
        -Body "{}"

    Write-Host "Render aceptó el deploy."
    Write-Host "ID del deploy: $($deploy.id)"
    Write-Host "Estado inicial: $($deploy.status)"
}
catch {
    Write-Host "ERROR al enviar deploy:"
    Write-Host $_.Exception.Message
}

Write-Host "`nCI/CD COMPLETO: GitHub + Render"
Write-Host "============================================================"
Write-Host "FIN DEL DEPLOY"
