const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { BrenderClient } = require('../dist/index.js');
test('compiled CLI launches with help and refuses missing credentials', () => {
  const env = {...process.env, CF_ACCOUNT_ID:'',CF_API_TOKEN:''};
  const help = spawnSync(process.execPath,['dist/cli.js','--help'],{env,encoding:'utf8'});
  assert.equal(help.status,0); assert.match(help.stdout,/Cloudflare Browser Rendering/);
  const missing = spawnSync(process.execPath,['dist/cli.js','https://example.invalid'],{env,encoding:'utf8'});
  assert.equal(missing.status,1); assert.match(missing.stderr,/environment variables are required/);
});
test('compiler migration preserves HTTP and API failure propagation', async () => {
  const original = global.fetch;
  const client = new BrenderClient({accountId:'synthetic',apiToken:'synthetic'});
  try {
    global.fetch = async () => ({ok:false,status:429,statusText:'Too Many Requests',text:async()=>'test limit'});
    await assert.rejects(client.crawl({url:'https://example.invalid'}),/429.*test limit/);
    await assert.rejects(client.getJob('synthetic'),/429.*test limit/);
    global.fetch = async () => ({ok:true,json:async()=>({success:false,errors:[{message:'test denied'}]})});
    await assert.rejects(client.crawl({url:'https://example.invalid'}),/test denied/);
    await assert.rejects(client.getJob('synthetic'),/test denied/);
  } finally {global.fetch=original;}
});
test('compiled polling handles terminal failures and timeout',async()=>{
 const client=new BrenderClient({accountId:'synthetic',apiToken:'synthetic'});
 client.getJob=async()=>({id:'test',status:'failed'});
 assert.equal((await client.waitForCompletion('test',1,100)).status,'failed');
 await assert.rejects(client.waitForCompletion('test',1,0),/Timeout/);
});
