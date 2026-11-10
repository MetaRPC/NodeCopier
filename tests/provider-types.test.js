const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

test('published TypeScript declarations accept every supported account route', () => {
  const result = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '--noEmit', '--strict', '--skipLibCheck', '--target', 'ES2020', '--moduleResolution', 'node', 'tests/provider-types.ts'], { encoding:'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
