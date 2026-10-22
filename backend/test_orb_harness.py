import asyncio
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch, AsyncMock
import io
import wave
import httpx
from fastapi.testclient import TestClient
from backend.orb_harness import WebsiteHarness, ShortTermMemory

class HarnessTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.temporary=tempfile.TemporaryDirectory();self.root=Path(self.temporary.name);self.harness=WebsiteHarness(self.root)
        self.requests=[]
    def tearDown(self):self.harness.public.close();self.temporary.cleanup()
    def client(self,action=None):
        def respond(request):
            if request.url.path=='/v1/models':return httpx.Response(200,json={'data':[{'id':'fixture-model'}]})
            self.requests.append(json.loads(request.content))
            return httpx.Response(200,json={'choices':[{'message':{'content':json.dumps({'spoken_output':'Fictional response for a test.','action':action or {'type':'stay'}})}}]})
        return httpx.AsyncClient(transport=httpx.MockTransport(respond))

    async def test_canonical_memory_session_isolation_and_clear_lifecycle(self):
        first,visitor,_=self.harness.visitor(None);second,other,_=self.harness.visitor(None)
        self.assertIsInstance(visitor.memory,ShortTermMemory)
        async with self.client() as client:await self.harness.answer(visitor,'Explain Android for my blue-heron-project.',client=client)
        self.assertTrue(any('blue-heron-project' in str(item.content) for item in visitor.memory.all_items()))
        self.assertFalse(other.memory.all_items())
        visitor.touched-=1801;self.harness.expire_sessions();self.assertNotIn(first,self.harness.visitors);self.assertIn(second,self.harness.visitors)

    async def test_private_transcript_not_written_to_durable_ledgers(self):
        _,visitor,_=self.harness.visitor(None);question='Explain the evidence view for my unique-ephemeral-marker.'
        async with self.client() as client:await self.harness.answer(visitor,question,client=client)
        for file in self.root.rglob('*'):
            if file.is_file():self.assertNotIn(b'unique-ephemeral-marker',file.read_bytes(),str(file))
        receipt=self.harness.public.retrieval_ledger.recent(1)[0]
        self.assertIn(receipt['query'],self.harness.public_terms)

    async def test_private_contact_details_not_sent_to_model(self):
        _,visitor,_=self.harness.visitor(None)
        async with self.client() as client:result=await self.harness.answer(visitor,'My email is private-customer@example.com',client=client)
        self.assertEqual(result['llm_source'],'privacy-boundary');self.assertFalse(self.requests);self.assertFalse(visitor.memory.all_items())

    async def test_relevant_previous_context_reaches_same_session_only(self):
        _,visitor,_=self.harness.visitor(None)
        async with self.client() as client:
            await self.harness.answer(visitor,'I am exploring the Android companion.',client=client)
            await self.harness.answer(visitor,'Can it synchronize with Windows?',client=client)
        self.assertIn('Android companion',str(self.requests[-1]['messages']))
        self.assertNotIn('street_address',str(self.requests[-1]['messages']))

    async def test_actions_reject_private_routes_commands_and_unknown_targets(self):
        _,visitor,_=self.harness.visitor(None)
        for action in [{'type':'navigate','route':'/account/profile'},{'type':'execute','command':'powershell'},{'type':'point','target_id':'unregistered'},{'type':'show_screen','screen':'evidence'}]:
            self.assertEqual(self.harness.validate_action(visitor,action),{'type':'stay'})
        self.harness.event(visitor,'start_demo','/product-demo','dashboard')
        async with self.client({'type':'show_screen','screen':'dossier'}) as client:
            result=await self.harness.answer(visitor,'Guide this screen.','tour_stop',client)
        self.assertEqual(result['action']['screen'],'dossier');self.assertEqual(result['action']['target_id'],'pops.demo.dossier')
        self.assertIn('Alex Morgan',str(self.requests[-1]['messages']))

    async def test_automatic_tour_cannot_skip_stops(self):
        _,visitor,_=self.harness.visitor(None);self.harness.event(visitor,'start_demo','/product-demo','dashboard')
        async with self.client({'type':'show_screen','screen':'review'}) as client:result=await self.harness.answer(visitor,'Guide this stop.','tour_stop',client)
        self.assertEqual(result['action'],{'type':'stay'})

class HostBoundaryTests(unittest.TestCase):
    def setUp(self):
        from backend import website_orb_host
        self.module=website_orb_host;self.tmp=tempfile.TemporaryDirectory()
        self.env=patch.dict(os.environ,{'POPS_ORB_DEVELOPMENT':'1'});self.env.start()
        self.host_patch=patch.object(website_orb_host,'WebsiteHarness',lambda:WebsiteHarness(Path(self.tmp.name)));self.host_patch.start()
        self.client=TestClient(website_orb_host.app);self.client.__enter__()
        self.token=self.client.get('/api/orb/session').json()['csrfToken']
        self.headers={'origin':'http://localhost:5173','x-orb-csrf':self.token}
    def tearDown(self):self.client.__exit__(None,None,None);self.host_patch.stop();self.env.stop();self.tmp.cleanup()
    def test_origin_and_csrf_required(self):
        self.assertEqual(self.client.post('/api/orb/session/event',json={'kind':'page','route':'/'}).status_code,403)
        self.assertEqual(self.client.post('/api/orb/session/event',headers={'origin':'https://foreign.example','x-orb-csrf':self.token},json={'kind':'page','route':'/'}).status_code,403)
        self.assertEqual(self.client.post('/api/orb/session/event',headers={'origin':'http://localhost:5173'},json={'kind':'page','route':'/'}).status_code,403)
    def test_customer_payload_and_pages_rejected(self):
        self.assertEqual(self.client.post('/api/orb/website-text',headers=self.headers,json={'transcript':'Hello','route':'/account'}).status_code,400)
        self.assertEqual(self.client.post('/api/orb/website-text',headers=self.headers,json={'transcript':'Hello','route':'/','street_address':'Not allowed'}).status_code,422)
    def test_no_payment_native_tool_or_persistent_speech_writes(self):
        for path in ['/api/checkout/square','/api/orb/tools/run','/api/orb/tts']:
            self.assertEqual(self.client.post(path,headers=self.headers,json={}).status_code,503)
    def test_clear_forgets_session_and_invalidates_token(self):
        self.assertEqual(self.client.post('/api/orb/session/clear',headers=self.headers,json={}).status_code,200)
        self.assertEqual(self.client.post('/api/orb/session/event',headers=self.headers,json={'kind':'page','route':'/'}).status_code,401)
    def test_qwen_speech_uses_only_session_assistant_turn_and_removes_audio(self):
        harness=self.module.app.state.harness
        visitor=harness.visitors[self.client.cookies.get(self.module.COOKIE)]
        turn=harness.observe(visitor,{'kind':'conversation','role':'assistant','content':'Windows is the confirmed desktop platform.'})
        buffer=io.BytesIO()
        with wave.open(buffer,'wb') as wav:
            wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(24000);wav.writeframes(b'\x00\x00'*1200)
        filename='a'*32+'.wav';audio_path=Path(self.tmp.name)/filename;audio_path.write_bytes(buffer.getvalue())
        synth=AsyncMock(return_value=('/api/orb/tts/'+filename,'qwen',None))
        with patch.object(self.module.existing_orb,'TTS_CACHE_DIR',Path(self.tmp.name)),patch.object(self.module.existing_orb,'_synthesize_orb_tts',synth):
            response=self.client.post('/api/orb/speech',headers=self.headers,json={'response_id':turn.item_id,'route':'/'})
        self.assertEqual(response.status_code,200,response.text);self.assertEqual(response.content,buffer.getvalue())
        self.assertEqual(response.headers['x-orb-speech-provider'],'qwen');self.assertFalse(audio_path.exists())
        synth.assert_awaited_once_with(turn.content['content'],provider='qwen')
        self.assertEqual(self.client.post('/api/orb/speech',headers=self.headers,json={'response_id':turn.item_id,'route':'/','text':'Arbitrary text'}).status_code,422)
        _,other,_=harness.visitor(None)
        alien=harness.observe(other,{'kind':'conversation','role':'assistant','content':'Other visitor response.'})
        self.assertEqual(self.client.post('/api/orb/speech',headers=self.headers,json={'response_id':alien.item_id,'route':'/'}).status_code,404)
        self.assertEqual(self.client.get('/api/orb/tts/'+filename).status_code,404)
    def test_qwen_failure_preserves_text_and_reports_unavailable(self):
        harness=self.module.app.state.harness;visitor=harness.visitors[self.client.cookies.get(self.module.COOKIE)]
        turn=harness.observe(visitor,{'kind':'conversation','role':'assistant','content':'A caption remains available.'})
        with patch.object(self.module.existing_orb,'_synthesize_orb_tts',AsyncMock(return_value=(None,'qwen','Unavailable'))):
            response=self.client.post('/api/orb/speech',headers=self.headers,json={'response_id':turn.item_id,'route':'/'})
        self.assertEqual(response.status_code,503);self.assertEqual(visitor.memory.get(turn.item_id).content['content'],'A caption remains available.')
    def test_intro_uses_canonical_session_and_excludes_private_pages(self):
        self.assertEqual(self.client.post('/api/orb/speech/intro',headers=self.headers,json={'route':'/account/profile'}).status_code,400)
        response=self.client.post('/api/orb/speech/intro',headers=self.headers,json={'route':'/desktop-app'})
        self.assertEqual(response.status_code,200)
        item=self.module.app.state.harness.visitors[self.client.cookies.get(self.module.COOKIE)]
        self.assertEqual(item.memory.get(response.json()['speech_id']).content['role'],'assistant')
    def test_production_environment_disabled(self):
        with patch.dict(os.environ,{'POPS_ORB_DEVELOPMENT':'0'}):self.assertEqual(self.client.get('/api/orb/session').status_code,503)

if __name__=='__main__':unittest.main()
