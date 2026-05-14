# start-dashboard.ps1
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $projectPath

Set-Location $projectRoot

Write-Host "Iniciando Reporte Dashboard y Proxy CORS..." -ForegroundColor Cyan

# Verificar si node_modules existe, si no, instalar
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..."
    npm install
}

# Iniciar el Proxy en segundo plano
Write-Host "Iniciando Proxy intermedio en puerto 4007..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoProfile -Command node proxy-server.js" -WindowStyle Hidden

# Ejecutar el servidor de Vite en el puerto 4006
npm run dev
