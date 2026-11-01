import json
from pathlib import Path
import tempfile
import unittest

import httpx

from backend.orb_harness import WebsiteHarness


class Crawl30IntegrationTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.harness = WebsiteHarness(Path(self.tmp.name))

    def tearDown(self):
        self.harness.public.close()
        self.tmp.cleanup()

    def test_source_inventory_and_pointer_gate_are_exact(self):
        scan = self.harness.crawl30
        self.assertIsNotNone(scan)
        self.assertEqual(scan['pointer_map']['record_count'], 2291)
        self.assertEqual(scan['outcome']['published_count'], 63)
        self.assertEqual(scan['outcome']['withheld_count'], 1547)
        self.assertEqual(len(scan['candidate_ids']), 63)
        self.assertEqual(len([item for item in scan['outcome']['withheld']]), 1547)
        self.assertFalse(scan['candidate_ids'] & set(item['target_id'] for item in scan['outcome']['withheld']))

    def test_semantic_retrieval_keeps_current_facts_authoritative(self):
        results = self.harness._crawl_retrieval('Android Google Play testing', limit=3)
        self.assertTrue(results)
        self.assertTrue(all('Historical Crawl #30, supplemental' in result for result in results[:3]))
        self.assertTrue(any('android' in result.lower() for result in results))
        self.assertTrue(any(fact.startswith('Android is progressing through Google Play testing.')
                            for fact in self.harness.catalog['product_facts']['facts']))

    def test_only_same_route_registered_candidates_can_be_suggested(self):
        _, visitor, _ = self.harness.visitor(None)
        target = next(item for item in self.harness.targets.values() if item['id'] in self.harness.crawl30['candidate_ids'])
        visitor.route = target['route']
        self.assertEqual(self.harness.validate_action(visitor, {'type': 'point', 'target_id': target['id']}),
                         {'type': 'point', 'target_id': target['id']})
        visitor.route = '/'
        self.assertEqual(self.harness.validate_action(visitor, {'type': 'point', 'target_id': target['id']}),
                         {'type': 'stay'})
        withheld = self.harness.crawl30['outcome']['withheld'][0]['target_id']
        visitor.route = target['route']
        self.assertEqual(self.harness.validate_action(visitor, {'type': 'point', 'target_id': withheld}),
                         {'type': 'stay'})

    def test_runtime_context_status_exposes_loaded_crawl_identity(self):
        from backend.website_orb_host import requested_crawl_metadata
        status=requested_crawl_metadata(self.harness)
        self.assertTrue(status['loaded'])
        self.assertEqual(status['crawl_id'],'30')
        self.assertEqual(status['pointer_identity_count'],2291)
        self.assertEqual(status['verified_candidate_count'],63)
        self.assertEqual(status['withheld_count'],1547)

    async def test_model_receives_product_facts_and_retrieved_context(self):
        captured = []

        async def response(request):
            if request.url.path.endswith('/models'):
                return httpx.Response(200, json={'data': [{'id': 'fixture'}]})
            captured.append(json.loads(request.content))
            return httpx.Response(200, json={'choices': [{'message': {'content': json.dumps({
                'spoken_output': 'Android is still progressing through Google Play testing.',
                'action': {'type': 'stay'},
            })}}]})

        _, visitor, _ = self.harness.visitor(None)
        visitor.route = '/access'
        async with httpx.AsyncClient(transport=httpx.MockTransport(response)) as client:
            await self.harness.answer(visitor, 'Is Android released and can I buy it?', client=client)
        system = json.loads(captured[0]['messages'][0]['content'])
        facts=system['product_facts']['facts']
        self.assertTrue(any(fact.startswith('Android is progressing through Google Play testing.') for fact in facts))
        self.assertTrue(any('$99.00 one-time' in fact and 'Windows Guardian' in fact for fact in facts))
        self.assertTrue(any('Open Door is personally reviewed financial assistance' in fact for fact in facts))
        self.assertTrue(any('$12.99 one-time lifetime membership' in fact for fact in facts))
        self.assertTrue(any(fact.startswith('Checkout is disabled.') for fact in facts))
        self.assertEqual(len(system['current_access_routes']),3)
        self.assertIn('Membership',system['membership_fact'])
        self.assertEqual(system['crawl_provenance']['crawlId'], '30')
        self.assertTrue(system['retrieved_public_context'])
        self.assertIn('Is Android released', captured[0]['messages'][-1]['content'])
        self.assertEqual(captured[0]['response_format']['json_schema']['schema']['properties']['spoken_output']['maxLength'],800)
        self.assertEqual(captured[0]['max_tokens'],180)


if __name__ == '__main__':
    unittest.main()
