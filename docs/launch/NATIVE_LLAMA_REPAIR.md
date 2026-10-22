# Native Windows llama.cpp repair — October 22, 2026

The existing **ORB Qwen 7B Server** scheduled task was repaired in place. No new service, installation, model download, WSL operation or production change was made.

## Evidence and cause

The executable and both model splits exist and load successfully. The original task had only a user-logon trigger, `InteractiveToken`, battery start/stop restrictions, three one-minute recovery attempts, and no StartWhenAvailable setting. Consequently it did not provide the requested unattended startup before login, could stop on battery, and had limited task-level recovery. The old launcher treated any port listener as sufficient without verifying inference health or its owner.

The previously recorded task result was **3221225786 / 0xC000013A**, a control-exit cancellation. Task Scheduler operational history was disabled. There is insufficient retained evidence to identify the actor or condition that canceled that run; battery restrictions are a configuration defect, not a proven explanation for that particular cancellation. The original log also mixed PowerShell UTF-8 metadata and native UTF-16 redirection, making diagnosis difficult. No broken binary/model path or conflicting listener was found when restarting the model.

Microsoft references: [task logon types](https://learn.microsoft.com/en-us/windows/win32/taskschd/taskschedulerschema-logontype-principaltype-element), [Windows error status reference](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-erref/596a1078-e883-4972-9bbc-49e60bebca55).

## Installed configuration

- Executable: `C:\llama.cpp\llama-server.exe`
- Launcher: `C:\llama.cpp\Start-ORB-LLM.ps1`
- Model: `C:\Users\bryan\.cache\huggingface\hub\models--Qwen--Qwen2.5-7B-Instruct-GGUF\snapshots\bb5d59e06d9551d752d08b292a50eb208b07ab1f\qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf`
- The first split is a valid local cache link; llama.cpp loads the second split automatically. Its zero-byte link metadata does not mean the model is empty.
- Model arguments: `--model "<above model path>" --host 127.0.0.1 --port 16520 --ctx-size 4096 --n-gpu-layers 99`
- Task action: absolute Windows PowerShell path, `-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "C:\llama.cpp\Start-ORB-LLM.ps1"`, followed by explicit `-ServerPath`, `-ModelPath`, `-Port 16520`, and `-LogDirectory "C:\llama.cpp\logs"`.
- Same Windows user, S4U noninteractive logon; boot and user-logon triggers, plus a five-minute retry trigger. No stored account password was introduced.
- Battery operation allowed; StartWhenAvailable; no execution time limit; IgnoreNew prevents concurrent task instances; 999 one-minute task recovery attempts.
- Supervisor monitors the verified model process and inference health, retries after five seconds, and preserves unrelated port owners. Startup grace is five minutes; three failed health checks after that grace trigger recovery.
- Logs: `C:\llama.cpp\logs\supervisor.log` and timestamped separate `*.stdout.log` / `*.stderr.log`. Original task XML and launcher backups are retained in `C:\llama.cpp`; additional private diagnostic snapshots are under `.local/`.

Repository source: `scripts/windows/Start-ORB-LLM.ps1`, `Repair-WindowsLlama.ps1`, `Test-WindowsLlamaRecovery.ps1`. The repair script requires Administrator PowerShell and updates only the named existing task. It is not run by npm or a website build.

## Verified and pending checks

Verified: the repaired noninteractive task is running; the listener is loopback-only; `/health` reports `ok`; `/v1/models` identifies Qwen 2.5 7B Q4_K_M; `/v1/chat/completions` generates actual replies. Live-model browser tests passed in development and the production bundle, including conversation context and all eight demo stops at desktop/tablet/mobile sizes.

**Not yet verified: forced model-process recovery, forced supervisor-process recovery, or an actual Windows reboot.** The ordinary shell cannot terminate the task's noninteractive processes. The Windows administrator prompt for the prepared recovery test was canceled, so no forced-crash test was performed and elevation was not retried. A boot trigger is configured; this is not proof of a completed reboot test. Do not restart the user's PC without coordinating ongoing work.

When the owner is ready, run the following from this repository in **Administrator PowerShell**. It deliberately terminates only the verified installed model and supervisor, requires replacement PIDs, checks readiness and inference after both recoveries, and saves evidence:

```powershell
.\scripts\windows\Test-WindowsLlamaRecovery.ps1 -ResultPath "$PWD\.local\llama-recovery-results.json"
```

After a separately coordinated Windows restart, verify the task and `/health` before starting a manual launcher. S4U has no network/encrypted-file access; the discovered model is local and successfully read under the repaired task, but future relocation must preserve those constraints.

## Website connection

`start-orb-dev.ps1` sets `POPS_LLAMA_BASE_URL=http://127.0.0.1:16520` and starts the existing website host extension on `127.0.0.1:8001`, one worker. Vite proxies `/api/orb` there. The adapter discovers the actual model ID from `/v1/models`, rather than guessing it. Port 40343 is historical and is not used. The website does not start a competing inference service.

Typed ORB conversation and generated tour narration use the model. Dynamic speech uses the browser's speech service; the bundled authored WAVs are an offline fallback. Recorded-audio STT is not configured locally. Production governance and hosting remain deferred.
