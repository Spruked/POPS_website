"""HTTP adapter to the installed Qwen CLI's verified Gradio API. No TTS engine."""
import asyncio
import json
import os
from pathlib import Path
import re
from urllib.parse import quote, urlparse
import httpx

_WINDOWS_BRIDGE_CODE = r'''
import json
import sys
import urllib.request

url = sys.argv[1]
text = sys.stdin.buffer.read(8192).decode('utf-8')
request = urllib.request.Request(
    url + '/synthesize',
    data=json.dumps({'text': text, 'format': 'wav'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
)
with urllib.request.urlopen(request, timeout=110) as response:
    if response.headers.get_content_type() != 'audio/wav':
        raise ValueError('Qwen bridge did not return WAV audio')
    audio = response.read(16_777_217)
if len(audio) > 16_777_216:
    raise ValueError('Qwen bridge audio exceeds the limit')
sys.stdout.buffer.write(audio)
'''


async def _synthesize_windows_bridge(text: str, base: str) -> bytes:
    origin = urlparse(base)
    if (origin.scheme, origin.hostname, origin.port, origin.path) != ('http', '127.0.0.1', 8020, ''):
        raise ValueError('The existing Windows Qwen bridge must remain on 127.0.0.1:8020.')
    python = os.environ.get('ORB_TTS_WINDOWS_PYTHON', '/mnt/c/Users/bryan/AppData/Local/Programs/Python/Python312/python.exe')
    if not Path(python).is_file():
        raise ValueError('The configured Windows Python interpreter is unavailable.')
    process = await asyncio.create_subprocess_exec(
        python, '-c', _WINDOWS_BRIDGE_CODE, base,
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        audio, error = await asyncio.wait_for(process.communicate(text.encode('utf-8')), timeout=120)
    except TimeoutError:
        process.kill()
        await process.wait()
        raise ValueError('The existing Qwen bridge timed out.') from None
    if process.returncode != 0:
        raise ValueError('The existing Qwen bridge could not synthesize audio.')
    if len(audio) <= 44 or audio[:4] != b'RIFF' or audio[8:12] != b'WAVE':
        raise ValueError('The existing Qwen bridge returned invalid WAV audio.')
    return audio

async def synthesize(text:str)->bytes:
    base=os.environ.get('ORB_TTS_QWEN_URL','').rstrip('/')
    if os.environ.get('ORB_TTS_QWEN_PAYLOAD_MODE') == 'windows-bridge':
        return await _synthesize_windows_bridge(text, base)
    origin=urlparse(base)
    if origin.scheme!='http' or origin.hostname not in {'localhost','127.0.0.1','::1'} or origin.path:
        raise ValueError('Qwen CLI must use a configured loopback origin.')
    voice=os.environ.get('ORB_TTS_QWEN_VOICE','Vivian')
    language=os.environ.get('ORB_TTS_QWEN_LANGUAGE','English')
    instruct=os.environ.get('ORB_TTS_QWEN_INSTRUCT','')
    output=None
    async with httpx.AsyncClient(timeout=120,trust_env=False) as client:
        response=await client.post(base+'/gradio_api/call/v2/run_instruct',json={'text':text,'lang_disp':language,'spk_disp':voice,'instruct':instruct})
        response.raise_for_status();event=response.json()['event_id']
        if not re.fullmatch(r'[a-f0-9]{32}',event):raise ValueError('Invalid Qwen event reference.')
        async with client.stream('GET',base+'/gradio_api/call/run_instruct/'+event) as stream:
            stream.raise_for_status();kind=''
            async for line in stream.aiter_lines():
                if line.startswith('event:'):kind=line[6:].strip()
                elif line.startswith('data:') and kind=='error':raise ValueError('Qwen synthesis failed.')
                elif line.startswith('data:') and kind=='complete':
                    data=json.loads(line[5:]);output=data[0];break
        if not isinstance(output,dict) or not output.get('path'):raise ValueError('Qwen returned no audio.')
        url=output.get('url') or base+'/gradio_api/file='+quote(output['path'],safe='/')
        if url.startswith('/'):url=base+url
        parsed=urlparse(url)
        if (parsed.scheme,parsed.hostname,parsed.port)!=(origin.scheme,origin.hostname,origin.port):raise ValueError('Qwen audio must remain on the verified provider origin.')
        try:
            audio=await client.get(url);audio.raise_for_status()
            if len(audio.content)>16_777_216:raise ValueError('Qwen audio exceeds the development limit.')
            return audio.content
        finally:
            # Only the exact generated WAV within this launcher's owned temp root.
            cache=os.environ.get('ORB_TTS_QWEN_TEMP_DIR')
            if cache:
                path=Path(output['path']).resolve();root=Path(cache).resolve()
                if path.is_relative_to(root) and path.suffix.lower()=='.wav':path.unlink(missing_ok=True)
