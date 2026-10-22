const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const manifest=JSON.parse(fs.readFileSync('docs/launch/IMPORTED_COMPONENTS.json','utf8'));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(manifest.files.length,84);
for(const item of manifest.files){const bytes=fs.readFileSync(item.path);assert.equal(sha(Buffer.from(bytes.toString('utf8').replaceAll('\r\n','\n'))),item.sha256LF,item.path+' original source mismatch');}
function scan(directory){for(const item of fs.readdirSync(directory,{withFileTypes:true})){assert.notEqual(item.name.toLowerCase(),'.git','Nested Git metadata: '+directory);if(item.isDirectory())scan(path.join(directory,item.name));}}
scan('Vault-Logic-System-Template');
const staged=execFileSync('git',['ls-files','--stage','--','Vault-Logic-System-Template'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const row of staged)assert.ok(/^100644 /.test(row),'Not an ordinary tracked file: '+row);
if(process.argv.includes('--tracked'))for(const item of manifest.files)assert.ok(staged.some(row=>row.endsWith('\t'+item.path)),'Not tracked: '+item.path);
assert.equal(execFileSync('git',['ls-files','--stage'],{encoding:'utf8'}).split('\n').filter(row=>row.startsWith('160000 ')).length,0,'Unexpected gitlink');
console.log(`Verified ${manifest.files.length} original supplied files, no nested .git or gitlinks; ${staged.length} ordinary tracked import files.`);
