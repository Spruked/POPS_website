$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$demoRoot = Split-Path $PSScriptRoot -Parent
$stepsSource = Get-Content -LiteralPath (Join-Path $demoRoot 'tour/tourSteps.ts') -Raw -Encoding utf8
$matches = [regex]::Matches($stepsSource, "\{screen:'([^']+)'.*?narration:'((?:\\.|[^'])*)'", [System.Text.RegularExpressions.RegexOptions]::Singleline)
if ($matches.Count -ne 8) { throw 'Expected eight scripted narration stops.' }
$outputRoot = Join-Path $demoRoot 'assets/narration'
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('Microsoft David Desktop')
$synth.Rate = -1
try {
    $manifest = foreach ($step in $matches) {
        $name = $step.Groups[1].Value
        $text = $step.Groups[2].Value
        $destination = Join-Path $outputRoot "$name.wav"
        $synth.SetOutputToWaveFile($destination)
        $synth.Speak($text)
        $synth.SetOutputToNull()
        [PSCustomObject]@{ step=$name; voice='Microsoft David Desktop'; text=$text; sha256=(Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash }
    }
    $manifestJson = $manifest | ConvertTo-Json -Depth 4
    [System.IO.File]::WriteAllText((Join-Path $outputRoot 'manifest.json'), $manifestJson, (New-Object System.Text.UTF8Encoding($false)))
} finally { $synth.Dispose() }
Write-Host 'Generated eight offline narration assets. No voice service runs in the website.'
