import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, extname, dirname, sep } from 'node:path';
const root=resolve('dist'), template=readFileSync(resolve(root,'index.html'),'utf8');
const pages=JSON.parse(readFileSync('src/data/sitePages.json','utf8')).filter(p=>p.indexable);
const xml=readFileSync('public/sitemap.xml','utf8');
const publicRoutes=[...xml.matchAll(/<loc>https:\/\/pops\.spruked\.com([^<]*)<\/loc>/g)].map(match=>match[1]||'/');
const privateRoutes=JSON.parse(readFileSync('src/data/sitePages.json','utf8')).filter(page=>!page.indexable).map(page=>page.path);
const routes=[...publicRoutes,...privateRoutes];
const types={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json','.xml':'application/xml','.txt':'text/plain'};
const server=createServer((request,response)=>{
 const path=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
 const file=resolve(root,'.'+path);
 if(file!==root&&!file.startsWith(root+sep)){response.writeHead(403).end();return;}
 if(path.startsWith('/api/')){response.writeHead(503,{'Content-Type':'application/json'}).end('{"error":"Not available in static preview"}');return;}
 if(existsSync(file)&&extname(file)){response.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(readFileSync(file));return;}
 response.writeHead(200,{'Content-Type':'text/html'}).end(template);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome'});
 const page=await browser.newPage();
 await page.addInitScript(()=>sessionStorage.setItem('pops:startup-splash-seen','1'));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const output=[];
 for(const route of routes){
  await page.goto(origin+route);await page.locator('main h1').waitFor();await page.waitForFunction(()=>Boolean(document.querySelector('meta[name=description]')?.content));
  const snapshot=await page.evaluate(()=>({title:document.title,head:[...document.head.querySelectorAll('[data-rh]')].filter(el=>el.tagName!=='TITLE').map(el=>el.outerHTML).join('\n'),body:document.querySelector('.page').outerHTML}));
  const html=template.replace(/<title>.*?<\/title>/s,`<title>${snapshot.title.replaceAll('&','&amp;').replaceAll('<','&lt;')}</title>`).replace('</head>',`${snapshot.head}\n</head>`).replace('<div id="root"></div>',`<div id="root">${snapshot.body}</div>`);
  const destination=resolve(root,'.'+route,'index.html');mkdirSync(dirname(destination),{recursive:true});writeFileSync(destination,html);
  output.push({path:route,kind:privateRoutes.includes(route)?'signed-out-noindex-shell':'public',bytes:Buffer.byteLength(html)});
 }
 mkdirSync('docs/launch',{recursive:true});writeFileSync('docs/launch/prerender-report.json',JSON.stringify({pages:output,publicPageDefinitions:pages.length},null,2));
 console.log(`Prerendered ${publicRoutes.length} public pages and ${privateRoutes.length} clean signed-out noindex shells. No customer records or API responses captured.`);
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
