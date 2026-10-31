param(
    [Parameter(Mandatory=$true)][string]$ServerPath,
    [Parameter(Mandatory=$true)][string]$ModelPath,
    [int]$Port = 16520,
    [string]$LogDirectory = 'C:\llama.cpp\logs'
)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Path $LogDirectory -Force | Out-Null
function Write-SupervisorLog([string]$Message) {
    Add-Content -LiteralPath (Join-Path $LogDirectory 'supervisor.log') -Value ((Get-Date -Format o)+' '+$Message) -Encoding UTF8
}
if (-not (Test-Path -LiteralPath $ServerPath -PathType Leaf) -or -not (Test-Path -LiteralPath $ModelPath -PathType Leaf)) {
    Write-SupervisorLog 'Missing configured executable or local model. No download attempted.'
    exit 1
}
$resolvedServer = (Resolve-Path -LiteralPath $ServerPath).Path
Write-SupervisorLog "Supervisor started; loopback port $Port."
while ($true) {
    try {
        $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        $child = $null
        if ($listener) {
            $owner = Get-CimInstance Win32_Process -Filter ("ProcessId="+$listener[0].OwningProcess)
            if (-not $owner -or $owner.ExecutablePath -ne $resolvedServer) {
                Write-SupervisorLog "Port conflict on $Port; preserving the unrelated listener."
                Start-Sleep -Seconds 10
                continue
            }
            $child = Get-Process -Id $owner.ProcessId
            Write-SupervisorLog "Monitoring existing llama-server PID $($child.Id)."
        } else {
            $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
            $child = Start-Process -FilePath $resolvedServer -ArgumentList @('--model',('"{0}"' -f $ModelPath),'--host','127.0.0.1','--port',"$Port",'--ctx-size','4096','--n-gpu-layers','99') -WorkingDirectory (Split-Path $resolvedServer -Parent) -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $LogDirectory "$stamp.stdout.log") -RedirectStandardError (Join-Path $LogDirectory "$stamp.stderr.log")
            Write-SupervisorLog "Started existing llama-server PID $($child.Id)."
        }
        $started = Get-Date
        $failures = 0
        while (-not $child.HasExited) {
            Start-Sleep -Seconds 5
            $child.Refresh()
            if ($child.HasExited) { break }
            try {
                $health = Invoke-RestMethod -Uri ("http://127.0.0.1:$Port/health") -TimeoutSec 4
                if ($health.status -ne 'ok') { throw 'Model is not ready.' }
                $failures = 0
            } catch {
                if (((Get-Date)-$started).TotalSeconds -gt 300) { $failures++ }
            }
            if ($failures -ge 3) {
                # Terminate only the verified model process; never an unrelated port owner.
                $current = Get-CimInstance Win32_Process -Filter ("ProcessId="+$child.Id)
                if ($current.ExecutablePath -eq $resolvedServer) {
                    Write-SupervisorLog "Health checks failed repeatedly; restarting owned PID $($child.Id)."
                    Stop-Process -Id $child.Id -Force
                }
                break
            }
        }
        Write-SupervisorLog "Model process ended; recovery in 5 seconds."
    } catch {
        Write-SupervisorLog ('Supervisor error: '+$_.Exception.GetType().Name+'; recovery in 5 seconds.')
    }
    Start-Sleep -Seconds 5
}
