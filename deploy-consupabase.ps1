# ============================================================
#  CI/CD Profesional: GitHub + Render
#  Proyecto: consupabase
#  Autor: Ricardo Almeida
# ============================================================

$projectPath = "C:\Users\Supervisor\consupabase"
$repoUrl = "https://github.com/sucreecuador/consupabase.git"
$renderServiceId = "srv-d9l24qdaeets73ad9fvg"
$keyPath = "$env:USERPROFILE\.render_api_key.secure"

Write-Host ""
Write-Host "Iniciando CI/CD del Proyecto CONSUPABASE"
Write-Host "============================================================"
Write-Host ""

Write-Host "Verificando ruta del proyecto..."
if (-Not (Test-Path $projectPath)) {
    Write-Host "ERROR: La ruta $projectPath no existe."
    exit
}
Set-Location $projectPath
Write-Host "Ruta establecida: $projectPath"
Write-Host ""

if (-Not (Test-Path ".git")) {
    Write-Host "Inicializando repositorio Git..."
    git init
} else {
    Write-Host "Git ya está inicializado."
}
Write-Host ""

Write-Host "Configurando rama main..."
git branch -M main
Write-Host ""

Write-Host "Verificando remote origin..."
$remoteExists = git remote | Select-String "origin"

if ($remoteExists) {
    Write-Host "Remote 'origin' ya existe."
} else {
    Write-Host "Agregando remote origin..."
    git remote add origin $repoUrl
}
Write-Host ""

Write-Host "Agregando archivos..."
git add .
Write-Host ""

$fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "Creando commit..."
git commit -m "Adaptacion responsive para celulares vertical y horizontal - $fecha"
Write-Host ""

Write-Host "Subiendo a GitHub..."
git push -u origin main
Write-Host "Push completado."
Write-Host ""

Write-Host "Recuperando Render API Key..."
if (-Not (Test-Path $keyPath)) {
    Write-Host "ERROR: No se encontró la API Key encriptada."
    exit
}

$secureKey = Get-Content $keyPath | ConvertTo-SecureString
$renderKey = [System.Net.NetworkCredential]::new("", $secureKey).Password
Write-Host "API Key cargada."
Write-Host ""

Write-Host "Enviando Deploy a Render..."

$deployUrl = "https://api.render.com/v1/services/$renderServiceId/deploys"

$headers = @{
    "Authorization" = "Bearer $renderKey"
    "Accept"        = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri $deployUrl -Method Post -Headers $headers
    Write-Host "Render aceptó el deploy."
    Write-Host "ID del deploy: $($response.id)"
    Write-Host "Estado inicial: $($response.status)"
} catch {
    Write-Host "ERROR al desplegar en Render."
    Write-Host $_
    exit
}

Write-Host ""
Write-Host "CI/CD COMPLETO: GitHub + Render"
Write-Host "============================================================"
Write-Host "FIN DEL DEPLOY"
Write-Host ""