param(
    [Parameter(Mandatory=$true)][string]$PythonPath,
    [Parameter(Mandatory=$true)][string]$ModelPath,
    [int]$Port=8020
)
$ErrorActionPreference='Stop'
if(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue){throw "Port $Port already has a listener. Preserving it; inspect before starting Qwen."}
foreach($required in @($PythonPath,(Join-Path $ModelPath 'config.json'),(Join-Path $ModelPath 'vocab.json'),(Join-Path $ModelPath 'model.safetensors'),(Join-Path $ModelPath 'speech_tokenizer/config.json'),(Join-Path $ModelPath 'speech_tokenizer/model.safetensors'))){if(-not(Test-Path -LiteralPath $required -PathType Leaf)){throw 'Existing interpreter or cached model file missing. No installation/download attempted.'}}
$websiteRoot=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$logs=Join-Path $websiteRoot '.local/qwen-tts'
New-Item -ItemType Directory -Path $logs -Force | Out-Null
$env:HF_HUB_OFFLINE='1';$env:TRANSFORMERS_OFFLINE='1';$env:HF_HUB_DISABLE_TELEMETRY='1'
$env:GRADIO_ANALYTICS_ENABLED='False';$env:PYTHONIOENCODING='utf-8'
$env:GRADIO_TEMP_DIR=Join-Path $logs 'audio-temp'
$env:NO_PROXY='localhost,127.0.0.1,::1'
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$qwen=Start-Process -FilePath $PythonPath -ArgumentList @('-m','qwen_tts.cli.demo',('"'+$ModelPath+'"'),'--ip','127.0.0.1','--port',"$Port",'--device','cuda:0','--dtype','bfloat16','--no-flash-attn','--no-share','--concurrency','1') -WorkingDirectory $websiteRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logs "$stamp.stdout.log") -RedirectStandardError (Join-Path $logs "$stamp.stderr.log")
Write-Host "Existing Qwen CLI launched as PID $($qwen.Id), loopback port $Port. Logs: $logs. No service/task or model installation was created."
