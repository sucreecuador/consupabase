# Script de Despliegue Completo para Respaldo Consupabase (Render / GitHub)
Param(
    [string]$MensajeCommit = "Respaldo y despliegue completo de consupabase a Render"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  RESPALDO CONSUPABASE - DEPLIEGUE TOTAL  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Verificar o Inicializar Repositorio Git
If (-not (Test-Path ".git")) {
    Write-Host "[-] Inicializando repositorio Git local..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# 2. Verificar que exista un remote configurado (si no existe, avisa)
$remoteUrl = git remote get-url origin 2>$null
If (-not $remoteUrl) {
    Write-Host "[!] ADVERTENCIA: No hay un repositorio remoto 'origin' configurado." -ForegroundColor Yellow
    Write-Host "Ejecuta: git remote add origin <url-de-tu-repo-en-github>" -ForegroundColor Yellow
    Exit
}

# 3. Agregar ABSOLUTAMENTE TODOS los archivos del respaldo actual
Write-Host "[+] Agregando todos los archivos y programas del respaldo..." -ForegroundColor Green
git add -A

# 4. Comprobar si hay cambios pendientes para el commit
$status = git status --porcelain
If ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "[i] No hay modificaciones nuevas. Todo el respaldo ya está sincronizado." -ForegroundColor Cyan
} else {
    # 5. Crear Commit con los cambios masivos
    Write-Host "[+] Creando commit con el mensaje: '$MensajeCommit'..." -ForegroundColor Green
    git commit -m "$MensajeCommit"
}

# 6. Forzar subida de todo el respaldo al repositorio en GitHub
Write-Host "[+] Subiendo la totalidad de programas a GitHub (rama main)..." -ForegroundColor Green
git push -u origin main

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "✔ RESPALDO Y PUSH COMPLETADOS EXITOSAMENTE" -ForegroundColor Green
Write-Host "Render actualizará automáticamente tu aplicación web." -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan