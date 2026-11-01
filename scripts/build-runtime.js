// Joins the files listed in modules/manifest.json (in order) into public/ceph-crm.js.
// Order matters: later files wrap or override functions defined by earlier ones.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'modules', 'manifest.json'), 'utf8'));

const output = manifest.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');

fs.writeFileSync(path.join(root, 'public', 'ceph-crm.js'), output);
console.log(`Built public/ceph-crm.js from ${manifest.length} module files`);
