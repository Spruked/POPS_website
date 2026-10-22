$ErrorActionPreference='Stop'
if (Get-NetTCPConnection -LocalPort 8001 -State Listen -ErrorAction SilentlyContinue) {
    Write-Host 'Port 8001 already has a listener. Reusing the existing ORB backend.'
    return
}
$orbPython=Join-Path $PSScriptRoot '.venv-orb/Scripts/python.exe'
if (-not (Test-Path -LiteralPath $orbPython)) { throw 'Create .venv-orb and install backend/orb-requirements.txt first.' }
$orbLogs=Join-Path $PSScriptRoot '.local/orb'
New-Item -ItemType Directory -Path $orbLogs -Force | Out-Null
$env:POPS_ORB_DEVELOPMENT='1'
$env:POPS_LLAMA_BASE_URL='http://127.0.0.1:16520'
$env:ORB_TTS_CACHE_DIR=Join-Path $orbLogs 'tts-cache'
$env:ORB_TTS_PROVIDER='qwen'
if(-not $env:ORB_TTS_QWEN_URL){$env:ORB_TTS_QWEN_URL='http://127.0.0.1:8020'}
if(-not $env:ORB_TTS_QWEN_PAYLOAD_MODE){$env:ORB_TTS_QWEN_PAYLOAD_MODE='gradio-custom-voice'}
if(-not $env:ORB_TTS_QWEN_VOICE){$env:ORB_TTS_QWEN_VOICE='Vivian'}
$env:ORB_TTS_QWEN_LANGUAGE='English'
$env:ORB_TTS_QWEN_INSTRUCT=''
$env:ORB_TTS_QWEN_TEMP_DIR=Join-Path $PSScriptRoot '.local/qwen-tts/audio-temp'
$orbHost=Start-Process -FilePath $orbPython -ArgumentList @('-m','uvicorn','backend.website_orb_host:app','--host','127.0.0.1','--port','8001','--workers','1') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $orbLogs 'host.stdout.log') -RedirectStandardError (Join-Path $orbLogs 'host.stderr.log')
Write-Host "Local ORB host started (PID $($orbHost.Id)); production mode remains disabled."
for ($attempt=0;$attempt -lt 30;$attempt++) {
    Start-Sleep -Milliseconds 500
    try { $health=Invoke-WebRequest 'http://127.0.0.1:8001/api/orb/capabilities' -UseBasicParsing -TimeoutSec 2; if($health.StatusCode -eq 200){return} } catch {}
    $orbHost.Refresh();if($orbHost.HasExited){throw 'ORB host exited. Check .local/orb/host.stderr.log.'}
}
throw 'ORB host did not become ready. Check .local/orb logs.'
