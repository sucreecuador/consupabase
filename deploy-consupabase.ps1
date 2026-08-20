Write-Host ""
Write-Host "Iniciando CI/CD del Proyecto CONSUPABASE" -ForegroundColor Cyan
Write-Host "============================================================"

# Ruta del proyecto
$projectPath = "C:\Users\Supervisor\consupabase"
Set-Location $projectPath
Write-Host "Ruta establecida: $projectPath"

# Asegurar que static/ está dentro del repo
Write-Host "Verificando carpeta static..." -ForegroundColor Yellow
if (!(Test-Path "$projectPath\static")) {
    Write-Host "ERROR: La carpeta static NO existe en el proyecto." -ForegroundColor Red
    exit
}

# Forzar a Git a incluir archivos estáticos
Write-Host "Forzando inclusión de archivos estáticos..." -ForegroundColor Yellow
git add static/index.html --force
git add static/script.js --force
git add static/styles.css --force

# Agregar todo lo demás
git add .

# Verificar cambios
$status = git status
Write-Host $status

if ($status -match "nothing to commit") {
    Write-Host "ADVERTENCIA: Git no detecta cambios. Forzando commit..." -ForegroundColor Yellow

    # Forzar commit vacío para obligar a Render a reconstruir
    git commit --allow-empty -m "Forzando deploy - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} else {
    Write-Host "Creando commit con cambios detectados..." -ForegroundColor Green
    git commit -m "Deploy automático - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# Subir a GitHub
Write-Host "Subiendo a GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host "Push completado." -ForegroundColor Green

# Render Deploy
Write-Host ""
Write-Host "Recuperando Render API Key..." -ForegroundColor Cyan
$renderKey = $env:RENDER_API_KEY

if (!$renderKey) {
    Write-Host "ERROR: No existe RENDER_API_KEY en variables de entorno." -ForegroundColor Red
    exit
}

Write-Host "API Key cargada." -ForegroundColor Green

Write-Host "Enviando Deploy a Render..." -ForegroundColor Cyan

$serviceId = "srv-xxxxxxxxxxxxxxxxxxxx"   # ← reemplaza con tu Service ID real

$deploy = Invoke-RestMethod `
    -Method POST `
    -Uri "https://api.render.com/v1/services/$serviceId/deploys" `
    -Headers @{ "Authorization" = "Bearer $renderKey" }

Write-Host "Render aceptó el deploy." -ForegroundColor Green
Write-Host "ID del deploy: $($deploy.id)"
Write-Host "Estado inicial: $($deploy.status)"

Write-Host ""
Write-Host "CI/CD COMPLETO: GitHub + Render" -ForegroundColor Cyan
Write-Host "============================================================"
Write-Host "FIN DEL DEPLOY"
