# Script de Despliegue con Sincronización Forzada para Respaldo Consupabase
Param(
    [string]$MensajeCommit = "Respaldo y despliegue completo de consupabase a Render"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  RESPALDO CONSUPABASE - DEPLIEGUE TOTAL  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Agregar todos los archivos del respaldo
Write-Host "[+] Agregando todos los archivos y programas del respaldo..." -ForegroundColor Green
git add -A

# 2. Crear commit si existen cambios locales
$status = git status --porcelain
If ($status) {
    Write-Host "[+] Creando commit local..." -ForegroundColor Green
    git commit -m "$MensajeCommit"
} else {
    Write-Host "[i] No hay cambios locales pendientes de commit." -ForegroundColor Yellow
}

# 3. Intentar integrar cambios remotos o forzar push del respaldo
Write-Host "[+] Sincronizando respaldo local con GitHub (main)..." -ForegroundColor Green

try {
    # Intenta hacer rebase primero
    git pull --rebase origin main 2>$null
    git push origin main
} catch {
    Write-Host "[!] El historial remoto difiere. Forzando actualización con el respaldo local..." -ForegroundColor Yellow
    # Si falla por conflicto de historial, fuerza la subida del respaldo local
    git push --force origin main
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "✔ DESPLIEGUE A GITHUB COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "Render detectará los cambios en main e iniciará el build." -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan