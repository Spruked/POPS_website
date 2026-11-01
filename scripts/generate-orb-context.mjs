// Publishes current canonical website copy and imports verified public scan
// identities. Never reads customer databases, accounts, cookies, or forms.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import ts from 'typescript';

async function sourceModule(path) {
  const text = readFileSync(path, 'utf8');
  const js = ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}

const fixtures = await sourceModule('src/pops-demo-app/data/demoRecords.ts');
const { tourSteps } = await sourceModule('src/pops-demo-app/tour/tourSteps.ts');
const routes = [...readFileSync('public/sitemap.xml', 'utf8').matchAll(/<loc>https:\/\/pops\.spruked\.com([^<]*)<\/loc>/g)]
  .map((match) => match[1] || '/');
const decode = (value) => value
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'")
  .replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const pages = routes.map((route) => {
  if (/^\/(?:account|cart|checkout|api)(?:\/|$)/.test(route)) {
    throw Error('Private route cannot enter the public ORB catalog');
  }
  const html = readFileSync(resolve('dist', `.${route}`, 'index.html'), 'utf8');
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) throw Error(`Missing public build content ${route}`);
  const text = decode(main.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  return {
    route,
    title: decode(html.match(/<title>(.*?)<\/title>/s)?.[1] || route),
    text,
    sha256: createHash('sha256').update(text).digest('hex'),
  };
});

const registry = ts.createSourceFile(
  'targets.ts', readFileSync('src/orb/pointerTargetRegistry.ts', 'utf8'), ts.ScriptTarget.Latest, true,
);
let targetObject;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(registry) === 'POINTER_TARGETS') {
    targetObject = node.initializer;
  }
  ts.forEachChild(node, visit);
}
visit(registry);
const localTargets = targetObject.properties.map((property) => {
  const fields = {};
  for (const field of property.initializer.properties) {
    if (field.initializer && ts.isStringLiteral(field.initializer)) {
      fields[field.name.getText(registry)] = field.initializer.text;
    }
  }
  return fields;
});

const crawlRoot = 'data/orb-weaver/www.popsproof.com/crawl-30';
const crawlContextPath = `${crawlRoot}/website_orb_context/latest_context.json`;
const crawlMapPath = `${crawlRoot}/verification/run_4/verification/orb/pointer_map.json`;
const crawlOutcomePath = `${crawlRoot}/verification/run_4/verification/orb/pointer_verification_outcome.json`;
let importedTargets = [];
let crawlSource = null;
if (existsSync(crawlContextPath) && existsSync(crawlMapPath) && existsSync(crawlOutcomePath)) {
  const context = JSON.parse(readFileSync(crawlContextPath, 'utf8'));
  const pointerMap = JSON.parse(readFileSync(crawlMapPath, 'utf8'));
  const outcome = JSON.parse(readFileSync(crawlOutcomePath, 'utf8'));
  if (pointerMap.record_count !== 2291 || outcome.published_count !== 63 || outcome.withheld_count !== 1547
    || context.source_validation?.status !== 'COMPLETE' || context.source_validation?.invalid_count !== 0) {
    throw Error('Crawl #30 persisted artifact counts or source validation do not match its manifest.');
  }
  const records = new Map(pointerMap.records.map((record) => [record.target_id, record]));
  importedTargets = outcome.published.flatMap((published) => {
    const record = records.get(published.target_id);
    const label = published.meaning.replace(/^[^:]+:\s*/, '').trim();
    const policy = record?.runtime_policy || {};
    const evidence = record?.confidence_evidence || {};
    const route = record?.page_route?.startsWith('http')
      ? new URL(record.page_route).pathname
      : record?.page_route;
    if (!record || !route || !policy.may_point || record.status !== 'active'
      || record.finding_class !== 'CONFIRMED' || record.confidence_class !== 'STABLE'
      || !Number.isInteger(evidence.render_count)
      || evidence.render_count < 1
      || !Array.isArray(evidence.viewports)
      || evidence.viewports.length === 0) {
      return [];
    }
    return [{
      id: record.target_id,
      route,
      selector: record.semantic_locator,
      label,
      description: `${published.meaning}. Crawl #30 verification is historical evidence; confirm the active DOM before pointing.`,
      actions: ['scroll_to_target', 'ping', 'explain'],
      guideOnly: true,
      runtimeVerification: {
        sourceCrawlId: '30',
        sourceDomain: 'www.popsproof.com',
        sourceTargetId: record.target_id,
        findingClass: record.finding_class,
        confidenceClass: record.confidence_class,
        verifiedAt: evidence.last_verified_time || record.last_verified_at,
        expectedText: label,
        targetType: record.target_type,
        landmark: record.structural_context?.landmark || null,
        ordinalInParent: record.structural_context?.ordinal_in_parent || null,
        parentLocator: record.structural_context?.parent_locator || null,
        sourceRevision: evidence.source_revision || null,
      },
    }];
  });
  if (importedTargets.length !== outcome.published_count) {
    throw Error(`Only ${importedTargets.length} of ${outcome.published_count} published Crawl #30 targets passed recorded verification checks.`);
  }
  crawlSource = {
    source: 'Orb Weaver project 8, Crawl Job 30',
    domain: 'www.popsproof.com',
    projectId: '8',
    crawlId: '30',
    crawlCompletedAt: '2026-10-31T14:40:45.689622',
    verificationRunId: '4',
    verificationCompletedAt: '2026-10-31T14:59:07.046824',
    contextPath: crawlContextPath,
    pointerMapPath: crawlMapPath,
    verificationOutcomePath: crawlOutcomePath,
    pointerIdentityCount: pointerMap.record_count,
    publishedCandidateCount: outcome.published_count,
    withheldCount: outcome.withheld_count,
    contextPath: `${crawlRoot}/website_orb_context/latest_context.json`,
    pageInventoryPath: `${crawlRoot}/crawl.json`,
    lexicalIndexPath: `${crawlRoot}/website_orb_context/lexical_index.json`,
    knowledgeGraphPath: `${crawlRoot}/website_orb_context/latest_context.json#knowledge_graph`,
    knowledgeChunksPath: `${crawlRoot}/website_orb_context/knowledge_chunks.json`,
    retrievalIndexPath: `${crawlRoot}/website_orb_context/retrieval_index.json`,
    routeClassificationPath: `${crawlRoot}/website_orb_context/route_classification.json`,
    sourceValidationPath: `${crawlRoot}/website_orb_context/source_validation.json`,
    runtimeCandidatePath: 'src/orb/crawl30VerifiedTargets.json',
    runtimeCandidatesSelected: importedTargets.length,
    withheldReasonCounts: outcome.withheld_reason_counts,
    sourceValidationStatus: context.source_validation?.status || 'UNKNOWN',
  };
}

const targets = [...localTargets, ...importedTargets];
const demo = {
  people: fixtures.demoContacts.map((person) => ({ id: person.id, name: person.name, role: person.role })),
  relationships: fixtures.demoRelationships,
  incident: fixtures.demoIncidents[0],
  evidence: fixtures.DEMO_TEXT,
  timeline: fixtures.demoEvents,
  report: fixtures.demoReports[0],
  steps: tourSteps,
};

// These facts are release-critical and come from the current canonical POPS
// purchase/product pages. Crawl text supplements retrieval but cannot override.
const productFacts = {
  source: 'current canonical POPS repository pages',
  precedence: 'These current repository facts override older crawl text and model assumptions.',
  facts: [
    'Windows POPS Desktop Access is the published $99.00 one-time Windows desktop application license; it includes lifetime POPS Membership.',
    'The public website and fictional browser demonstration are separate from the downloadable Windows application. No verified installer is currently linked or delivered.',
    'Checkout is disabled. A saved cart selection is not an order; no payment session, payment, license, or activation is created.',
    'Android is progressing through Google Play testing. It is not publicly available, production approved, or ready to purchase. No public Play Store listing or Android price is published.',
    'A separate iOS application is planned; no release date, price, or cross-platform entitlement is announced.',
    'Open Door is personally reviewed financial assistance for the POPS Desktop for Windows offer. Its review and fulfillment workflow is not currently active, and it is not offered for Android or iOS.',
    'Sponsor contributions can support approved Windows Open Door access; a contribution is not an application license. Sponsorship fulfillment is currently unavailable.',
    'POPS Membership is a separate $12.99 one-time lifetime membership. Membership alone is not an application license; POPS Desktop includes lifetime Membership.',
    'POPS organizes a parent’s record of involvement, chronological history, and supporting material for personal review and appropriate professional discussion. It does not prove disputed events or guarantee a custody outcome.',
    'POPS does not track users’ private documentation entries. Do not assume encryption, cloud synchronization, automatic backup, or other unverified capabilities.',
  ],
};

mkdirSync('data/orb-context', { recursive: true });
writeFileSync('data/orb-context/website.json', JSON.stringify({
  version: 1,
  source: 'Current canonical POPS repository public build; no customer or visitor data',
  pages,
  targets,
  demo,
  product_facts: productFacts,
  orb_weaver_crawl: crawlSource,
}, null, 2) + '\n');
writeFileSync('src/orb/crawl30VerifiedTargets.json', JSON.stringify(importedTargets, null, 2) + '\n');
writeFileSync('src/orb/registeredDestinations.json', JSON.stringify({
  routes,
  targets: targets.map(({ id, route }) => ({ id, route })),
}, null, 2) + '\n');
console.log(`Generated canonical ORB context: ${pages.length} current public pages, ${localTargets.length} local targets, ${importedTargets.length} Crawl #30 verified candidates, and ${tourSteps.length} fictional demo stops.`);
