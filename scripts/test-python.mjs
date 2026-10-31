import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
const name=process.argv[2];
if(!['customer','orb'].includes(name))throw new Error('Choose customer or orb.');
const python=join(process.cwd(),`.venv-${name}`,process.platform==='win32'?'Scripts':'bin',process.platform==='win32'?'python.exe':'python');
const args=name==='customer'?['backend/manage_customers.py','test','customer_site']:['-m','unittest','backend.test_orb_harness','-v'];
const result=spawnSync(python,args,{stdio:'inherit'});
if(result.error)throw result.error;
process.exit(result.status??1);
