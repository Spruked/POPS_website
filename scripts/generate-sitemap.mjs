import { readFileSync, writeFileSync } from 'node:fs';
const pages=JSON.parse(readFileSync('src/data/sitePages.json','utf8'));
const lexicon=JSON.parse(readFileSync('src/data/popslexicon.json','utf8'));
const slugs=lexicon.terms.map(term=>term.term.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
// Keep the same slug rule as the existing validated Lexicon source.
const paths=[...pages.filter(page=>page.indexable).map(page=>page.path),...slugs.map(slug=>`/lexicon/${slug}`)];
const urls=[...new Set(paths)];
writeFileSync('public/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(path=>`  <url><loc>https://pops.spruked.com${path}</loc></url>`).join('\n')+'\n</urlset>\n');
writeFileSync('public/robots.txt','User-agent: *\nAllow: /\nDisallow: /api/\n\n# Private pages use noindex metadata and are excluded from the sitemap.\n# They remain crawlable so crawlers can see noindex; robots.txt is not access control.\nSitemap: https://pops.spruked.com/sitemap.xml\n');
console.log(`Sitemap generated: ${urls.length} public URLs; customer and transactional pages excluded.`);
