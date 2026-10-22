$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
& (Join-Path $projectRoot 'start-customer-dev.ps1')
$listener = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    Write-Host 'Port 5173 already has a server. Reusing http://localhost:5173'
    return
}

$node = (Get-Command node.exe -ErrorAction Stop).Source
$vite = Join-Path $projectRoot 'node_modules/vite/bin/vite.js'
if (-not (Test-Path -LiteralPath $vite)) {
    throw 'Vite is missing. Run npm install in this folder first.'
}
$logRoot = Join-Path $env:LOCALAPPDATA 'POPS/local-dev'
New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
$serverProcess = Start-Process -FilePath $node -ArgumentList @(
    ('"{0}"' -f $vite), '--host', '127.0.0.1', '--port', '5173', '--strictPort'
) -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $logRoot 'vite.stdout.log') `
    -RedirectStandardError (Join-Path $logRoot 'vite.stderr.log')

for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 500
    $serverProcess.Refresh()
    if ($serverProcess.HasExited) { throw "Vite exited. Check logs in $logRoot" }
    try {
        $response = Invoke-WebRequest 'http://127.0.0.1:5173' -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "Live development: http://localhost:5173 (PID $($serverProcess.Id))"
            Write-Host "Runs independently of this terminal. Logs: $logRoot"
            return
        }
    } catch { }
}
throw "Vite did not become ready. Check logs in $logRoot"
