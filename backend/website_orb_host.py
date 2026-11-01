"""Explicitly development-only website ORB host. No customer database imports."""
import asyncio
from contextlib import asynccontextmanager
import json
import logging
import os
import secrets
import re
from pathlib import Path
from fastapi import FastAPI, Request, Response, HTTPException
from pydantic import BaseModel, Field, ConfigDict
from .orb_harness import WebsiteHarness
from . import main as existing_orb

COOKIE='pops_orb_visitor'
logger=logging.getLogger('pops.website_orb.voice')
ALLOWED_ORIGINS={'http://localhost:5173','http://127.0.0.1:5173','http://localhost:4173','http://127.0.0.1:4173'}
ALLOWED_ORIGINS.update(value.strip() for value in os.getenv('POPS_ORB_ALLOWED_ORIGINS','').split(',') if value.strip())

@asynccontextmanager
async def lifespan(app):
    app.state.harness=WebsiteHarness()
    async def expire():
        while True:
            await asyncio.sleep(30);app.state.harness.expire_sessions()
    cleanup=asyncio.create_task(expire())
    yield
    cleanup.cancel()
    app.state.harness.public.close()

# Extend the existing website backend and preserve its supported read surfaces.
app=existing_orb.app
app.router.routes=[route for route in app.router.routes if getattr(route,'path','') not in {'/api/orb/website-text','/api/orb/website-voice','/api/orb/capabilities','/api/orb/tts/{audio_id}','/docs','/redoc','/docs/oauth2-redirect','/openapi.json'}]
app.router.lifespan_context=lifespan

@app.middleware('http')
async def boundaries(request,call_next):
    if os.getenv('POPS_ORB_DEVELOPMENT')!='1':
        from fastapi.responses import JSONResponse
        return JSONResponse({'detail':'This development-only ORB host is disabled.'},status_code=503)
    if request.url.path.startswith('/api/checkout') or request.url.path in {'/api/orb/tools/run','/api/orb/tts'}:
        from fastapi.responses import JSONResponse
        return JSONResponse({'detail':'Payments, native tools and persistent text-to-speech writes are disabled in this development host.'},status_code=503)
    if request.method=='POST':
        if request.headers.get('origin') not in ALLOWED_ORIGINS:
            from fastapi.responses import JSONResponse
            return JSONResponse({'detail':'Unapproved website origin.'},status_code=403)
        if int(request.headers.get('content-length','0') or 0)>(2097152 if request.url.path=='/api/orb/website-voice' else 65536):
            from fastapi.responses import JSONResponse
            return JSONResponse({'detail':'Request too large.'},status_code=413)
    response=await call_next(request)
    response.headers['Cache-Control']='no-store';response.headers['X-Robots-Tag']='noindex, nofollow';response.headers['Referrer-Policy']='no-referrer'
    return response

def visitor(request:Request,csrf=True):
    cookie=request.cookies.get(COOKIE)
    harness=request.app.state.harness
    if csrf and cookie not in harness.visitors:raise HTTPException(401,'Visitor session expired. Start a new session.')
    key,session,created=harness.visitor(cookie)
    if csrf and not secrets.compare_digest(request.headers.get('x-orb-csrf',''),session.csrf):raise HTTPException(403,'Invalid visitor session token.')
    return key,session,created

class Event(BaseModel):
    model_config=ConfigDict(extra='forbid')
    kind:str
    route:str=Field(max_length=150)
    screen:str|None=Field(default=None,max_length=30)

class Question(BaseModel):
    model_config=ConfigDict(extra='forbid')
    transcript:str=Field(min_length=1,max_length=2000)
    route:str=Field(default='/',max_length=150)
    event:str='question'
    demo_screen:str|None=Field(default=None,max_length=30)
    synthesize_tts:bool=False

class Speech(BaseModel):
    model_config=ConfigDict(extra='forbid')
    response_id:str=Field(min_length=36,max_length=36)
    route:str=Field(max_length=150)

class Intro(BaseModel):
    model_config=ConfigDict(extra='forbid')
    route:str=Field(max_length=150)
    first_visit:bool=True

@app.post('/api/orb/speech/intro')
async def intro(payload:Intro,request:Request):
    _,item,_=visitor(request)
    harness=request.app.state.harness
    if payload.route not in harness.routes:raise HTTPException(400,'Private pages are excluded from ORB speech.')
    if item.route!=payload.route:harness.event(item,'page',payload.route)
    page=next(page for page in harness.catalog['pages'] if page['route']==payload.route)
    page_name='POPS homepage' if payload.route=='/' else page['title'].split('|',1)[0].strip()
    spoken_output=(f"Hi, I'm Pops. Welcome to the {page_name} page; I can help you explore POPS and find answers here.")
    turn=harness.observe(item,{'kind':'conversation','role':'assistant','content':spoken_output,'event':'page_intro'})
    return {'transcript':'','spoken_output':spoken_output,'speech_id':turn.item_id,'cognitive_pulse':{'cognitive_mode':'WEBSITE_INTRO','glow_intensity':.5},'llm_source':'website-intro','tts_provider':os.getenv('ORB_TTS_PROVIDER','kokoro').lower(),'tts_audio_url':None,'tts_error':None,'memory_context':None,'action':{'type':'stay'}}

speech_lock=asyncio.Lock()

@app.post('/api/orb/speech')
async def speech(payload:Speech,request:Request):
    _,item,_=visitor(request)
    if payload.route not in request.app.state.harness.routes or item.route!=payload.route:
        raise HTTPException(400,'Speech is available only for the active public page.')
    turn=item.memory.get(payload.response_id)
    if not turn or turn.content.get('role')!='assistant':raise HTTPException(404,'Response is not in this visitor session.')
    revision=item.revision
    # Serialize the existing provider/cache contract, then remove transient audio.
    async with speech_lock:
        if revision!=item.revision or await request.is_disconnected():raise HTTPException(409,'Speech request interrupted.')
        provider=os.getenv('ORB_TTS_PROVIDER','kokoro').lower()
        try:
            if provider=='qwen' and os.getenv('ORB_TTS_QWEN_PAYLOAD_MODE') in {'gradio-custom-voice','windows-bridge'}:
                from .orb_qwen_tts import synthesize
                audio=await asyncio.wait_for(
                    synthesize(turn.content['content']),
                    timeout=float(os.getenv('ORB_TTS_QWEN_TOTAL_TIMEOUT_SECONDS','180')),
                )
            else:
                audio_url,provider,error=await existing_orb._synthesize_orb_tts(turn.content['content'],provider=provider)
                if error or not audio_url:raise ValueError('Configured voice provider unavailable.')
                filename=audio_url.rsplit('/',1)[-1]
                if not re.fullmatch(r'[a-f0-9]{32}\.wav',filename):raise ValueError('Invalid provider audio reference.')
                path=existing_orb.TTS_CACHE_DIR/filename
                try:audio=path.read_bytes()
                finally:path.unlink(missing_ok=True)
        except Exception as primary_error:
            fallback=os.getenv('ORB_TTS_FALLBACK_PROVIDER','').lower()
            if provider!='qwen' or fallback!='kokoro':
                raise HTTPException(503,'Configured voice synthesis is unavailable. Captions remain available; retry narration when ready.')
            logger.warning('Qwen TTS unavailable; using configured Kokoro fallback: %s',primary_error)
            try:
                audio_url,fallback_provider,error=await existing_orb._synthesize_orb_tts(turn.content['content'],provider=fallback)
                if error or not audio_url:raise ValueError('Kokoro fallback unavailable.')
                filename=audio_url.rsplit('/',1)[-1]
                if not re.fullmatch(r'[a-f0-9]{32}\.wav',filename):raise ValueError('Invalid fallback audio reference.')
                path=existing_orb.TTS_CACHE_DIR/filename
                try:audio=path.read_bytes()
                finally:path.unlink(missing_ok=True)
                provider=f'{fallback_provider or fallback}-fallback'
            except Exception:raise HTTPException(503,'Qwen TTS and the configured fallback are unavailable. Captions remain available; retry narration when ready.')
        if revision!=item.revision or await request.is_disconnected():raise HTTPException(409,'Speech request interrupted.')
        if len(audio)<=44 or audio[:4]!=b'RIFF' or audio[8:12]!=b'WAVE':raise HTTPException(502,'Voice provider did not return WAV audio.')
        return Response(audio,media_type='audio/wav',headers={'Cache-Control':'no-store','X-Orb-Speech-Provider':provider})

@app.get('/api/orb/session')
async def session(request:Request,response:Response):
    key,item,created=visitor(request,csrf=False)
    if created:response.set_cookie(COOKIE,key,httponly=True,samesite='strict',path='/api/orb')
    return {'csrfToken':item.csrf,'development_only':True,'idle_expiry_seconds':1800,'memory':'supplied A.I.M.S. ShortTermMemory; no durable visitor transcripts'}

@app.post('/api/orb/session/clear')
async def clear(request:Request,response:Response):
    key,_,_=visitor(request);request.app.state.harness.visitors.pop(key,None);response.delete_cookie(COOKIE,path='/api/orb')
    return {'message':'Visitor session cleared. No customer account information was involved.'}

@app.post('/api/orb/session/event')
async def event(payload:Event,request:Request):
    _,item,_=visitor(request)
    try:request.app.state.harness.event(item,payload.kind,payload.route,payload.screen)
    except ValueError as error:raise HTTPException(400,str(error))
    return {'accepted':True}

@app.post('/api/orb/website-text')
async def text(payload:Question,request:Request):
    _,item,_=visitor(request)
    harness=request.app.state.harness
    if payload.route not in harness.routes:raise HTTPException(400,'Private and unregistered pages are excluded from ORB conversation.')
    if payload.event not in {'question','tour_stop','resume'}:raise HTTPException(400,'Unsupported conversation event.')
    if payload.demo_screen is not None:
        if payload.route!='/product-demo' or payload.demo_screen not in harness.steps:raise HTTPException(400,'Unknown demo screen.')
        if payload.event=='tour_stop' and not item.demo_active:harness.event(item,'start_demo',payload.route,payload.demo_screen)
        else:harness.event(item,'screen',payload.route,payload.demo_screen)
    elif item.route!=payload.route:harness.event(item,'page',payload.route)
    try:result=await harness.answer(item,payload.transcript,payload.event)
    except ValueError as error:raise HTTPException(400,str(error))
    except Exception:raise HTTPException(503,'The local model is unavailable or returned an invalid response. No model action was executed.')
    action=result['action']
    pulse={'cognitive_mode':'DEVELOPMENT_CONVERSATION','glow_intensity':.72}
    if action['type']=='point':pulse['semantic_target_id']=action['target_id']
    return {'transcript':payload.transcript,'spoken_output':result['spoken_output'],'speech_id':result.get('speech_id'),'cognitive_pulse':pulse,'llm_source':result['llm_source'],'memory_context':'Relevant public copy and temporary visitor context from supplied A.I.M.S.','tts_audio_url':None,'tts_provider':os.getenv('ORB_TTS_PROVIDER','kokoro').lower(),'tts_error':None,'action':action,'development_only':True}

@app.get('/api/orb/capabilities')
async def capabilities():
    original=await existing_orb.capabilities()
    crawl=requested_crawl_metadata(app.state.harness)
    # The legacy host reports its historical default URL as "configured" even
    # when no STT provider was supplied. This development route requires an
    # explicit provider and must advertise the same condition to the browser.
    original['stt']={'configured':bool(os.getenv('FASTER_WHISPER_STT_URL')),'url':os.getenv('FASTER_WHISPER_STT_URL','')}
    tts_provider=os.getenv('ORB_TTS_PROVIDER','kokoro').lower()
    tts_url=os.getenv('ORB_TTS_QWEN_URL','') if tts_provider=='qwen' else os.getenv('ORB_TTS_KOKORO_URL','http://127.0.0.1:8880/speak')
    tts_voice=os.getenv('ORB_TTS_QWEN_VOICE','Vivian') if tts_provider=='qwen' else os.getenv('ORB_TTS_KOKORO_VOICE','am_echo')
    return {**original,'status':'development-only','website_context':crawl,'tts':{**original.get('tts',{}),'provider':tts_provider,'configured':bool(tts_url),'voice':tts_voice,'fallback_provider':os.getenv('ORB_TTS_FALLBACK_PROVIDER') or None,'transport':'session-authorized transient WAV; browser speech emergency fallback'},'local_llm':{'configured':True,'url':os.getenv('POPS_LLAMA_BASE_URL','http://127.0.0.1:16520'),'model':os.getenv('POPS_LLAMA_MODEL') or 'discovered from /v1/models'},'memory':{'canonical':'Vault-Logic-System-Template/AIMS/memory_core','visitor_storage':'volatile short-term memory','durable_storage':'public published website copy only'},'governance':'Production TPC/Correspondence/Doctrine integration deferred by owner; local action validation only.'}

def requested_crawl_metadata(harness):
    scan=getattr(harness,'crawl30',None)
    if not scan:return {'loaded':False}
    descriptor=scan['descriptor']
    return {
        'loaded':True,
        'source':descriptor['source'],
        'project_id':descriptor['projectId'],
        'crawl_id':descriptor['crawlId'],
        'verification_run_id':descriptor['verificationRunId'],
        'pointer_identity_count':scan['pointer_map']['record_count'],
        'verified_candidate_count':len(scan['candidate_ids']),
        'withheld_count':scan['outcome']['withheld_count'],
    }

@app.post('/api/orb/website-voice')
async def voice(request:Request):
    visitor(request)
    if not os.getenv('FASTER_WHISPER_STT_URL'):raise HTTPException(503,'Recorded-audio transcription is not configured. Use Ask Pops or browser voice recognition; no audio was sent to an unconfigured service.')
    form=await request.form()
    audio=form.get('audio')
    if not audio or not hasattr(audio,'read'):raise HTTPException(400,'No audio supplied.')
    audio_bytes=await audio.read()
    if len(audio_bytes)>2097152:raise HTTPException(413,'Audio too large.')
    transcript=await existing_orb._transcribe_with_faster_whisper(audio_bytes,audio.filename or 'orb.webm')
    payload=Question(transcript=transcript,route=str(form.get('route','/')),demo_screen=form.get('demo_screen') or None)
    return await text(payload,request)
