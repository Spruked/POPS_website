param([string]$TaskName='ORB Qwen 7B Server',[int]$Port=16520,[Parameter(Mandatory=$true)][string]$ResultPath)
$ErrorActionPreference='Stop'
$identity=[Security.Principal.WindowsIdentity]::GetCurrent()
if (-not (New-Object Security.Principal.WindowsPrincipal($identity)).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Run the controlled recovery test from Administrator PowerShell.' }
$result=@{status='running';checkedAtUtc=[DateTime]::UtcNow.ToString('o');actualRebootTested=$false;endpoint="http://127.0.0.1:$Port"}
function Save-Result { [IO.File]::WriteAllText($ResultPath,($result | ConvertTo-Json -Depth 5)) }
function Ready { try { return (Invoke-RestMethod "http://127.0.0.1:$Port/health" -TimeoutSec 3).status -eq 'ok' } catch { return $false } }
function Infer {
    $models=Invoke-RestMethod "http://127.0.0.1:$Port/v1/models" -TimeoutSec 5
    $body=@{model=$models.data[0].id;messages=@(@{role='user';content='Reply with exactly: Pops recovery works'});max_tokens=24;temperature=0} | ConvertTo-Json -Depth 5
    $answer=(Invoke-RestMethod "http://127.0.0.1:$Port/v1/chat/completions" -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 30).choices[0].message.content
    if ($answer -notmatch 'Pops recovery works') { throw 'Inference did not return the requested recovery phrase.' }
    return $answer
}
try {
    $listener=Get-NetTCPConnection -LocalPort $Port -State Listen
    $oldModel=Get-CimInstance Win32_Process -Filter ("ProcessId="+$listener[0].OwningProcess)
    if ($oldModel.ExecutablePath -ne 'C:\llama.cpp\llama-server.exe' -or $oldModel.CommandLine -notmatch ('--port\s+'+$Port+'(?:\s|$)')) { throw 'Unexpected port owner; no process terminated.' }
    $before=Infer
    $modelFailureAt=Get-Date
    Stop-Process -Id $oldModel.ProcessId -Force
    $deadline=(Get-Date).AddSeconds(100)
    do { Start-Sleep -Seconds 2; $listeners=Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue; $newPid=if($listeners){$listeners[0].OwningProcess}else{0} } while ((-not $newPid -or $newPid -eq $oldModel.ProcessId -or -not (Ready)) -and (Get-Date) -lt $deadline)
    if (-not $newPid -or $newPid -eq $oldModel.ProcessId -or -not (Ready)) { throw 'Model did not automatically recover.' }
    $afterModel=Infer
    $result.oldModelPid=$oldModel.ProcessId;$result.recoveredModelPid=$newPid
    $result.modelRecoverySeconds=[Math]::Round(((Get-Date)-$modelFailureAt).TotalSeconds,1)
    $result.inferenceBefore=$before;$result.inferenceAfterModel=$afterModel;$result.modelRecoveryPassed=$true
    Save-Result
    $model=Get-CimInstance Win32_Process -Filter ("ProcessId="+$newPid)
    $supervisor=Get-CimInstance Win32_Process -Filter ("ProcessId="+$model.ParentProcessId)
    if ($supervisor.CommandLine -notmatch 'C:\\llama.cpp\\Start-ORB-LLM.ps1') { throw 'Unexpected supervisor; no supervisor terminated.' }
    $supervisorFailureAt=Get-Date
    Stop-Process -Id $supervisor.ProcessId -Force
    $deadline=(Get-Date).AddSeconds(160)
    do {
        Start-Sleep -Seconds 3
        $newSupervisor=Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | Where-Object { $_.ProcessId -ne $supervisor.ProcessId -and $_.CommandLine -match 'C:\\llama.cpp\\Start-ORB-LLM.ps1' } | Select-Object -First 1
    } while ((-not $newSupervisor -or -not (Ready)) -and (Get-Date) -lt $deadline)
    if (-not $newSupervisor -or -not (Ready)) { throw 'Scheduled task did not recover its supervisor.' }
    $afterSupervisor=Infer
    [xml]$definition=Export-ScheduledTask -TaskName $TaskName
    $result.status='passed';$result.oldSupervisorPid=$supervisor.ProcessId;$result.recoveredSupervisorPid=$newSupervisor.ProcessId
    $result.supervisorRecoverySeconds=[Math]::Round(((Get-Date)-$supervisorFailureAt).TotalSeconds,1)
    $result.supervisorRecoveryPassed=$true;$result.inferenceAfterSupervisor=$afterSupervisor
    $result.bootTriggerConfigured=($null -ne $definition.Task.Triggers.BootTrigger)
    $result.logonType=[string]$definition.Task.Principals.Principal.LogonType
    $result.retryTriggerInterval=[string]$definition.Task.Triggers.TimeTrigger.Repetition.Interval
    Save-Result
} catch {
    $result.status='failed';$result.error=$_.Exception.Message;Save-Result
    Start-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    throw
}
