// Serves only dist and runs the complete tour against the real production bundle.
// Local ORB proxy only; customer, checkout and native-tool APIs remain unavailable.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

const root = path.resolve('dist');
const assets = path.join(root, 'assets');
const demo = 'src/pops-demo-app';
const narration = JSON.parse(fs.readFileSync(path.join(demo, 'assets/narration/manifest.json'), 'utf8'));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const inventory = [];
for (const item of [...narration.map(n => ({ name: n.step, extension: '.wav', source: `assets/narration/${n.step}.wav` })), { name: 'popsbadge', extension: '.png', source: 'assets/popsbadge.png' }]) {
  const file = fs.readdirSync(assets).find(name => name.startsWith(item.name + '-') && name.endsWith(item.extension));
  assert.ok(file, `Missing production asset: ${item.source}`);
  const bytes = fs.readFileSync(path.join(assets, file));
  assert.equal(sha(bytes), sha(fs.readFileSync(path.join(demo, item.source))), `Production asset bytes differ: ${file}`);
  inventory.push({ source: item.source, url: '/assets/' + file, bytes: bytes.length, sha256: sha(bytes) });
}
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.wav': 'audio/wav', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain' };
const requested = new Set();
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); } catch { response.writeHead(400).end(); return; }
  requested.add(pathname);
  if (pathname.startsWith('/api/orb/') && !pathname.includes('/tools/') && !pathname.includes('/tts')) {
    // This private test origin forwards to the already-running local development host.
    const upstream = http.request({hostname:'127.0.0.1',port:8001,path:request.url,method:request.method,headers:{...request.headers,host:'127.0.0.1:8001',origin:'http://localhost:5173'}}, result=>{response.writeHead(result.statusCode,result.headers);result.pipe(response);});
    upstream.on('error',()=>response.writeHead(503).end());request.pipe(upstream);return;
  }
  if (pathname.startsWith('/api/')) { response.writeHead(503, { 'Content-Type': 'application/json' }).end('{"error":"Unavailable in isolated production test"}'); return; }
  let file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    if (path.extname(file)) { response.writeHead(404).end(); return; }
    file = path.join(root, 'index.html');
  }
  const bytes = fs.readFileSync(file);
  const headers = { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
  const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range || '');
  if (range) {
    const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
    if (start > end || start >= bytes.length) { response.writeHead(416, { 'Content-Range': `bytes */${bytes.length}` }).end(); return; }
    response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${bytes.length}`, 'Content-Length': end - start + 1 }).end(bytes.subarray(start, end + 1));
  } else response.writeHead(200, { ...headers, 'Content-Length': bytes.length }).end(bytes);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const child = spawn(process.execPath, [path.join(demo, 'scripts/test-demo.cjs')], { env: { ...process.env, DEMO_BASE_URL: origin, DEMO_ASSET_URLS: JSON.stringify(inventory) }, stdio: 'inherit' });
    const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve); });
    assert.equal(code, 0, 'Production tour regression failed');
    for (const item of inventory) assert.ok(requested.has(item.url), `Browser never requested production asset: ${item.url}`);
    fs.writeFileSync(path.join(demo, 'validation/production-assets.json'), JSON.stringify({ status: 'passed', serving: 'dist; loopback ORB host only; other APIs unavailable', assets: inventory, allRequestedByBrowser: true, audioDecodedByBrowser:true, liveNarration:'real local llama.cpp responses; browser speech lifecycle instrumented' }, null, 2) + '\n');
    console.log(`Verified all ${inventory.length} demo assets byte-for-byte in dist and requested by the production browser.`);
  } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
