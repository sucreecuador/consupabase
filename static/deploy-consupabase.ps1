# ============================================================
#  CI/CD Profesional: GitHub + Render
#  Proyecto: consupabase
#  Autor: Ricardo Almeida
# ============================================================

$projectPath = "C:\Users\Supervisor\consupabase"
$repoUrl = "https://github.com/sucreecuador/consupabase.git"
$renderServiceId = "srv-d9l24qdaeets73ad9fvg"   # ID de tu servicio en Render
$keyPath = "$env:USERPROFILE\.render_api_key.secure"

Write-Host ""
Write-Host "🚀 Iniciando CI/CD del Proyecto CONSUPABASE"
Write-Host "============================================================"
Write-Host ""

# ============================
# 1. Verificar ruta del proyecto
# ============================
Write-Host "📁 Verificando ruta del proyecto..."
if (-Not (Test-Path $projectPath)) {
    Write-Host "❌ ERROR: La ruta $projectPath no existe."
    exit
}
Set-Location $projectPath
Write-Host "✔ Ruta establecida: $projectPath"
Write-Host ""

# ============================
# 2. Inicializar Git si no existe
# ============================
if (-Not (Test-Path ".git")) {
    Write-Host "🔧 Inicializando repositorio Git..."
    git init
} else {
    Write-Host "✔ Git ya está inicializado."
}
Write-Host ""

# ============================
# 3. Configurar rama main
# ============================
Write-Host "🔧 Configurando rama main..."
git branch -M main
Write-Host ""

# ============================
# 4. Verificar remote origin
# ============================
Write-Host "🔧 Verificando remote origin..."
$remoteExists = git remote | Select-String "origin"

if ($remoteExists) {
    Write-Host "✔ Remote 'origin' ya existe."
} else {
    Write-Host "🔧 Agregando remote origin..."
    git remote add origin $repoUrl
}
Write-Host ""

# ============================
# 5. Agregar archivos
# ============================
Write-Host "📦 Agregando archivos..."
git add .
Write-Host ""

# ============================
# 6. Commit automático
# ============================
$fecha = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "📝 Creando commit..."
git commit -m "Auto-deploy $fecha"
Write-Host ""

# ============================
# 7. Push a GitHub
# ============================
Write-Host "⬆ Subiendo a GitHub..."
git push -u origin main
Write-Host "✔ Push completado."
Write-Host ""

# ============================
# 8. Leer Render API Key segura
# ============================
Write-Host "🔐 Recuperando Render API Key..."
if (-Not (Test-Path $keyPath)) {
    Write-Host "❌ ERROR: No se encontró la API Key encriptada."
    Write-Host "Ejecuta primero: save-render-key.ps1"
    exit
}

$secureKey = Get-Content $keyPath | ConvertTo-SecureString
$renderKey = [System.Net.NetworkCredential]::new("", $secureKey).Password
Write-Host "✔ API Key cargada."
Write-Host ""

# ============================
# 9. Desplegar en Render
# ============================
Write-Host "🚀 Enviando Clear Cache & Deploy a Render..."

$deployUrl = "https://api.render.com/v1/services/$renderServiceId/deploys"

$headers = @{
    "Authorization" = "Bearer $renderKey"
    "Content-Type"  = "application/json"
}

$body = @{
    "clearCache" = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $deployUrl -Method Post -Headers $headers -Body $body
    Write-Host "✔ Render aceptó el deploy."
    Write-Host "🆔 ID del deploy: $($response.id)"
    Write-Host "⏳ Estado inicial: $($response.status)"
} catch {
    Write-Host "❌ ERROR al desplegar en Render."
    Write-Host $_
    exit
}

Write-Host ""
Write-Host "🎉 CI/CD COMPLETO: GitHub + Render"
Write-Host "============================================================"
Write-Host "✔ FIN DEL DEPLOY"
Write-Host ""
