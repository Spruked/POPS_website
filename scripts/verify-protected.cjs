const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

function verifyProtected() {
  const originals = JSON.parse(fs.readFileSync('docs/launch/protected-baseline.json', 'utf8'));
  const portable = JSON.parse(fs.readFileSync('docs/launch/protected-portable-baseline.json', 'utf8'));
  const approval = JSON.parse(fs.readFileSync('src/pops-demo-app/validation/authorized-orb-changes.json', 'utf8'));
  const allowed = ['WebsiteFloatingOrb.tsx', 'WebsiteOrbPointerOverlay.tsx', 'pointerGuideController.ts', 'pointerTargetRegistry.ts', 'websiteOrbTargetTypes.ts'].map(name => 'src/orb/' + name);
  assert.deepEqual(approval.files.map(item => item.path).sort(), allowed.sort());
  assert.equal(portable.length, originals.length);
  for (const entry of portable) {
    const original = originals.find(item => item.path.replaceAll('\\', '/') === entry.path);
    assert.equal(entry.originalRawSHA256, original?.sha256, entry.path + ' baseline identity');
    const accepted = approval.files.find(item => item.path === entry.path);
    const actual = crypto.createHash('sha256').update(fs.readFileSync(entry.path, 'utf8').replaceAll('\r\n', '\n')).digest('hex');
    assert.equal(actual, accepted?.sha256LF || entry.originalLFSHA256, entry.path + ' unexpected protected change');
  }
  return `${portable.length - allowed.length} original protected files preserved; ${allowed.length} explicitly authorized website ORB integrations verified (LF-normalized for Windows/WSL).`;
}
module.exports = { verifyProtected };
if (require.main === module) console.log(verifyProtected());
