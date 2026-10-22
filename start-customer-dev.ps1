$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
if (Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue) {
    $health = Invoke-WebRequest 'http://127.0.0.1:8787/api/customer/session' -UseBasicParsing
    if ($health.StatusCode -ne 200) { throw 'Port 8787 is in use by an unexpected service.' }
    Write-Host 'Customer development service already available on port 8787.'
    return
}
$python = Join-Path $projectRoot '.venv-customer/Scripts/python.exe'
$server = Join-Path $projectRoot '.venv-customer/Scripts/waitress-serve.exe'
if (-not (Test-Path -LiteralPath $server)) {
    throw 'Install the isolated customer environment first. See README.md.'
}
& $python (Join-Path $projectRoot 'backend/manage_customers.py') migrate --noinput
if ($LASTEXITCODE -ne 0) { throw 'Customer database migration failed.' }
$logs = Join-Path $projectRoot '.local/customers'
New-Item -ItemType Directory -Path $logs -Force | Out-Null
$customerProcess = Start-Process -FilePath $server -ArgumentList @('--listen=127.0.0.1:8787', '--threads=4', 'customer_site.wsgi:application') `
    -WorkingDirectory (Join-Path $projectRoot 'backend') -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $logs 'server.stdout.log') -RedirectStandardError (Join-Path $logs 'server.stderr.log')
for ($attempt=0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 500
    $customerProcess.Refresh()
    if ($customerProcess.HasExited) { throw "Customer service exited. Check $logs" }
    try {
        $response = Invoke-WebRequest 'http://127.0.0.1:8787/api/customer/session' -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "Isolated customer service running (PID $($customerProcess.Id)). Local email outbox: $logs/mail"
            return
        }
    } catch { }
}
throw 'Customer service did not become ready.'
