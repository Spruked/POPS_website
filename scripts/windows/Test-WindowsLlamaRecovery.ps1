param([string]$TaskName='ORB Qwen 7B Server',[int]$Port=16520,[Parameter(Mandatory=$true)][string]$ResultPath)
$ErrorActionPreference='Stop'
function Ready { try { return (Invoke-RestMethod "http://127.0.0.1:$Port/health" -TimeoutSec 3).status -eq 'ok' } catch { return $false } }
function Infer {
    $models=Invoke-RestMethod "http://127.0.0.1:$Port/v1/models" -TimeoutSec 5
    $body=@{model=$models.data[0].id;messages=@(@{role='user';content='Reply with exactly: Pops recovery works'});max_tokens=24;temperature=0} | ConvertTo-Json -Depth 5
    return (Invoke-RestMethod "http://127.0.0.1:$Port/v1/chat/completions" -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 30).choices[0].message.content
}
try {
    $listener=Get-NetTCPConnection -LocalPort $Port -State Listen
    $oldModel=Get-CimInstance Win32_Process -Filter ("ProcessId="+$listener[0].OwningProcess)
    if ($oldModel.ExecutablePath -ne 'C:\llama.cpp\llama-server.exe' -or $oldModel.CommandLine -notmatch ('--port\s+'+$Port+'(?:\s|$)')) { throw 'Unexpected port owner; no process terminated.' }
    $before=Infer
    Stop-Process -Id $oldModel.ProcessId -Force
    $deadline=(Get-Date).AddSeconds(100)
    do { Start-Sleep -Seconds 2; $listeners=Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue; $newPid=if($listeners){$listeners[0].OwningProcess}else{0} } while ((-not $newPid -or $newPid -eq $oldModel.ProcessId -or -not (Ready)) -and (Get-Date) -lt $deadline)
    if (-not $newPid -or $newPid -eq $oldModel.ProcessId -or -not (Ready)) { throw 'Model did not automatically recover.' }
    $afterModel=Infer
    $model=Get-CimInstance Win32_Process -Filter ("ProcessId="+$newPid)
    $supervisor=Get-CimInstance Win32_Process -Filter ("ProcessId="+$model.ParentProcessId)
    if ($supervisor.CommandLine -notmatch 'C:\\llama.cpp\\Start-ORB-LLM.ps1') { throw 'Unexpected supervisor; no supervisor terminated.' }
    Stop-Process -Id $supervisor.ProcessId -Force
    $deadline=(Get-Date).AddSeconds(110)
    do {
        Start-Sleep -Seconds 3
        $newSupervisor=Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" | Where-Object { $_.ProcessId -ne $supervisor.ProcessId -and $_.CommandLine -match 'C:\\llama.cpp\\Start-ORB-LLM.ps1' } | Select-Object -First 1
    } while ((-not $newSupervisor -or -not (Ready)) -and (Get-Date) -lt $deadline)
    if (-not $newSupervisor -or -not (Ready)) { throw 'Scheduled task did not recover its supervisor.' }
    $afterSupervisor=Infer
    [xml]$definition=Export-ScheduledTask -TaskName $TaskName
    $result=@{status='passed';oldModelPid=$oldModel.ProcessId;recoveredModelPid=$newPid;oldSupervisorPid=$supervisor.ProcessId;recoveredSupervisorPid=$newSupervisor.ProcessId;inferenceBefore=$before;inferenceAfterModel=$afterModel;inferenceAfterSupervisor=$afterSupervisor;bootTriggerConfigured=($null -ne $definition.Task.Triggers.BootTrigger);logonType=$definition.Task.Principals.Principal.LogonType;actualRebootTested=$false;endpoint="http://127.0.0.1:$Port"}
    [IO.File]::WriteAllText($ResultPath,($result | ConvertTo-Json -Depth 5))
} catch {
    [IO.File]::WriteAllText($ResultPath,(@{status='failed';error=$_.Exception.Message} | ConvertTo-Json))
    Start-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    throw
}
