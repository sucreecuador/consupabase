# Script de Despliegue para Render (ERP Sucre)
Param(
    [string]$MensajeCommit = "Actualizacion y despliegue continuo a Render"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "     INICIANDO DESPLIEGUE A RENDER        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Verificar estado del repositorio Git
If (-not (Test-Path ".git")) {
    Write-Host "[-] Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# 2. Agregar cambios
Write-Host "[+] Agregando archivos al control de versiones..." -ForegroundColor Green
git add .

# 3. Crear Commit
Write-Host "[+] Creando commit: '$MensajeCommit'..." -ForegroundColor Green
try {
    git commit -m "$MensajeCommit"
} catch {
    Write-Host "[!] No hay cambios nuevos para confirmar." -ForegroundColor Yellow
}

# 4. Enviar a GitHub
Write-Host "[+] Subiendo cambios a GitHub (main)..." -ForegroundColor Green
git push origin main

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "✔ PUSH COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "Render detectará los cambios en main e iniciará el Build automáticamente." -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan