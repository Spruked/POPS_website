// Publishes only public build copy, registered targets, and immutable fictional fixtures.
// Never reads the customer database, account pages, cookies, or form submissions.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import ts from 'typescript';
async function sourceModule(path){const text=readFileSync(path,'utf8');const js=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));}
const fixtures=await sourceModule('src/pops-demo-app/data/demoRecords.ts');
const {tourSteps}=await sourceModule('src/pops-demo-app/tour/tourSteps.ts');
const routes=[...readFileSync('public/sitemap.xml','utf8').matchAll(/<loc>https:\/\/pops\.spruked\.com([^<]*)<\/loc>/g)].map(match=>match[1]||'/');
const decode=value=>value.replace(/&#(\d+);/g,(_,code)=>String.fromCodePoint(Number(code))).replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#x27;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const pages=routes.map(route=>{
 if(/^\/(?:account|cart|checkout|api)(?:\/|$)/.test(route))throw Error('Private route cannot enter the public ORB catalog');
 const html=readFileSync(resolve('dist','.'+route,'index.html'),'utf8');
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];if(!main)throw Error('Missing public build content '+route);
 const text=decode(main.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
 return{route,title:decode(html.match(/<title>(.*?)<\/title>/s)?.[1]||route),text,sha256:createHash('sha256').update(text).digest('hex')};
});
const registry=ts.createSourceFile('targets.ts',readFileSync('src/orb/pointerTargetRegistry.ts','utf8'),ts.ScriptTarget.Latest,true);
let targetObject;function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(registry)==='POINTER_TARGETS')targetObject=node.initializer;ts.forEachChild(node,visit);}visit(registry);
const targets=targetObject.properties.map(property=>{
 const fields={};for(const field of property.initializer.properties){if(field.initializer&&ts.isStringLiteral(field.initializer))fields[field.name.getText(registry)]=field.initializer.text;}return fields;
});
const demo={
 people:fixtures.demoContacts.map(person=>({id:person.id,name:person.name,role:person.role})),relationships:fixtures.demoRelationships,
 incident:fixtures.demoIncidents[0],evidence:fixtures.DEMO_TEXT,timeline:fixtures.demoEvents,
 report:fixtures.demoReports[0],steps:tourSteps,
};
mkdirSync('data/orb-context',{recursive:true});
writeFileSync('data/orb-context/website.json',JSON.stringify({version:1,source:'Local public crawl build; no customer or visitor data',pages,targets,demo},null,2)+'\n');
writeFileSync('src/orb/registeredDestinations.json',JSON.stringify({routes,targets:targets.map(({id,route})=>({id,route}))},null,2)+'\n');
console.log(`Generated canonical ORB context: ${pages.length} public pages, ${targets.length} website targets and ${tourSteps.length} fictional demo stops.`);
