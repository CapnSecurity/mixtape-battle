import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { userRef } from '../lib/log';
import { validatePassword } from '../lib/password-validation';

test('userRef is stable, case-insensitive and does not contain the address', () => {
  const a = userRef('Person@Example.com');
  assert.equal(a, userRef('person@example.com '));
  assert.match(a, /^u_[0-9a-f]{8}$/);
  assert.ok(!a.includes('person') && !a.includes('example'));
  assert.notEqual(a, userRef('other@example.com'));
  assert.equal(userRef(null), 'u_unknown');
  assert.equal(userRef(undefined), 'u_unknown');
});

function runDebug(env: Record<string, string>): string {
  return execFileSync(
    process.execPath,
    ['--import', 'tsx', '-e', "import('./lib/log.ts').then((m) => (m.debug ?? m.default.debug)('DEBUG-LINE'))"],
    { env: { ...process.env, ...env }, encoding: 'utf8' }
  );
}

test('debug() is silent in production and enabled in development', () => {
  assert.equal(runDebug({ NODE_ENV: 'production', LOG_LEVEL: '' }).includes('DEBUG-LINE'), false);
  assert.equal(runDebug({ NODE_ENV: 'development', LOG_LEVEL: '' }).includes('DEBUG-LINE'), true);
});

test('debug() can be enabled in production only deliberately via LOG_LEVEL=debug', () => {
  assert.equal(runDebug({ NODE_ENV: 'production', LOG_LEVEL: 'debug' }).includes('DEBUG-LINE'), true);
});

test('password policy accepts a strong password and rejects weak ones', () => {
  assert.equal(validatePassword('Str0ng!Passw0rd').isValid, true);
  for (const weak of ['Sh0rt!A', 'alllowercase1!', 'ALLUPPERCASE1!', 'NoNumbers!!', 'NoSpecial123A', '']) {
    assert.equal(validatePassword(weak).isValid, false, `"${weak}" should be rejected`);
  }
});
