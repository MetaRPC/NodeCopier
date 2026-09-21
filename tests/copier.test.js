const test = require('node:test');
const assert = require('node:assert');
const { CopierService, CopierAccount, CopierSugar, DemoAccountClient } = require('../dist/index.js');

test('CopierAccount holds credentials and generates auth headers', () => {
  const account = new CopierAccount('copy.mrpc.pro:443', 'usr_test_123');
  assert.strictEqual(account.endpoint, 'copy.mrpc.pro:443');
  assert.strictEqual(account.userKey, 'usr_test_123');

  const meta = account.getAuthMetadata();
  assert.strictEqual(meta.authorization, 'Bearer usr_test_123');
  assert.strictEqual(meta['x-metarpc-manager'], undefined);
});

test('CopierService instantiates and builds gRPC client', () => {
  const copier = new CopierService('copy.mrpc.pro:443', { userKey: 'usr_test_123' });
  assert.ok(copier);
  assert.strictEqual(copier.endpoint, 'copy.mrpc.pro:443');
  assert.strictEqual(copier.account.userKey, 'usr_test_123');
  copier.close();
});

test('CopierSugar fluent builder constructs correct payload', async () => {
  const sugar = CopierSugar.create()
    .withEndpoint('copy.mrpc.pro:443')
    .withCredentials('usr_test_123')
    .fromMaster({ type: 'MT5', user: 10001, password: 'pwd', server: 'Broker-Server' })
    .toSlave({ type: 'MT5', user: 20002, password: 'pwd', server: 'Broker-Server' })
    .withLotMultiplier(1.5)
    .withCopySl(true)
    .withCopyTp(true);

  assert.ok(sugar);
});

test('DemoAccountClient provision works against live service', async () => {
  const demo = new DemoAccountClient();
  const res = await demo.openDemoAccount({ server: 'MetaQuotes-Demo' });
  assert.strictEqual(res.resultCode, 0);
  assert.ok(res.login > 0);
  assert.ok(typeof res.password === 'string' && res.password.length > 0);
  assert.strictEqual(res.server, 'MetaQuotes-Demo');
});
