param(
    [Parameter(Mandatory=$true)][string]$ModelPath,
    [string]$ServerPath='C:\llama.cpp\llama-server.exe',
    [string]$TaskName='ORB Qwen 7B Server',
    [int]$Port=16520,
    [string]$ResultPath
)
$ErrorActionPreference='Stop'
$identity=[Security.Principal.WindowsIdentity]::GetCurrent()
$principal=New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Run this existing-task repair from an Administrator PowerShell.' }
$existing=Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
if (-not (Test-Path -LiteralPath $ServerPath -PathType Leaf) -or -not (Test-Path -LiteralPath $ModelPath -PathType Leaf)) { throw 'Existing executable/model unavailable. Nothing installed or downloaded.' }
$installedRoot=Split-Path $ServerPath -Parent
$launcher=Join-Path $installedRoot 'Start-ORB-LLM.ps1'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
Export-ScheduledTask -TaskName $TaskName | Set-Content -LiteralPath (Join-Path $installedRoot "task-before-$stamp.xml") -Encoding UTF8
Copy-Item -LiteralPath $launcher -Destination (Join-Path $installedRoot "Start-ORB-LLM.before-$stamp.ps1")
$settings=New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -DontStopOnIdleEnd -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew
$triggers=@((New-ScheduledTaskTrigger -AtStartup),(New-ScheduledTaskTrigger -AtLogOn -User $existing.Principal.UserId),(New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5)))
$taskPrincipal=New-ScheduledTaskPrincipal -UserId $existing.Principal.UserId -LogonType S4U -RunLevel Limited
$action=New-ScheduledTaskAction -Execute "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -Argument ('-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+$launcher+'" -ServerPath "'+$ServerPath+'" -ModelPath "'+$ModelPath+'" -Port '+$Port+' -LogDirectory "'+(Join-Path $installedRoot 'logs')+'"') -WorkingDirectory $installedRoot
Stop-ScheduledTask -TaskName $TaskName
$owned=Get-CimInstance Win32_Process -Filter "Name='llama-server.exe'" | Where-Object { $_.ExecutablePath -eq $ServerPath -and $_.CommandLine -match ('--port\s+'+$Port+'(?:\s|$)') }
foreach ($modelProcess in $owned) { Stop-Process -Id $modelProcess.ProcessId -Force -ErrorAction SilentlyContinue }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Start-ORB-LLM.ps1') -Destination $launcher -Force
Set-ScheduledTask -TaskName $TaskName -Settings $settings -Trigger $triggers -Principal $taskPrincipal -Action $action | Out-Null
Start-ScheduledTask -TaskName $TaskName
if ($ResultPath) { [IO.File]::WriteAllText($ResultPath,'Existing scheduled task repaired and started.') }
Write-Host 'Existing task repaired: noninteractive startup, startup/logon/5-minute recovery triggers, continuous supervisor, loopback-only inference.'
