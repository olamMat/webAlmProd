# install-task.ps1
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$scriptPath = Join-Path $projectPath "start-dashboard.ps1"
$taskName = "ReporteDashboardAutoStart"

Write-Host "Configurando tarea programada para el Dashboard..." -ForegroundColor Cyan

# Eliminar tarea si ya existe
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Tarea anterior eliminada."
}

# Crear la acción: Ejecutar PowerShell con el script en segundo plano
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""

# Crear el disparador: Al iniciar sesión del usuario actual
$trigger = New-ScheduledTaskTrigger -AtLogOn

# Configuraciones adicionales
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Registrar la tarea
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Inicia el Reporte Dashboard al arrancar el sistema."

Write-Host "¡Tarea registrada con éxito! El dashboard iniciará automáticamente en tu próxima sesión." -ForegroundColor Green
Write-Host "Puedes ver la tarea en el 'Programador de tareas' de Windows con el nombre: $taskName"
