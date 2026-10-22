"""HTTP adapter to the installed Qwen CLI's verified Gradio API. No TTS engine."""
import json
import os
from pathlib import Path
import re
from urllib.parse import quote, urlparse
import httpx

async def synthesize(text:str)->bytes:
    base=os.environ.get('ORB_TTS_QWEN_URL','').rstrip('/')
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
