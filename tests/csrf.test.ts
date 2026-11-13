import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { generateCsrfToken, validateCsrfToken } from '../lib/csrf';

// Secret is read lazily by lib/csrf, so setting it after the (hoisted) import is sufficient.
process.env.NEXTAUTH_SECRET = 'unit-test-secret';

function signed(timestamp: number): string {
  const data = `${timestamp}.${'a'.repeat(64)}`;
  const sig = createHmac('sha256', process.env.NEXTAUTH_SECRET as string).update(data).digest('hex');
  return `${data}.${sig}`;
}

test('a freshly generated token validates', () => {
  assert.equal(validateCsrfToken(generateCsrfToken()), true);
});

test('missing, malformed and non-string tokens are rejected', () => {
  assert.equal(validateCsrfToken(null), false);
  assert.equal(validateCsrfToken(undefined), false);
  assert.equal(validateCsrfToken(''), false);
  assert.equal(validateCsrfToken('a.b'), false);
  assert.equal(validateCsrfToken('a.b.c.d'), false);
  assert.equal(validateCsrfToken(123 as unknown as string), false);
});

test('tampering with the payload or signature is rejected', () => {
  const [ts, rnd, sig] = generateCsrfToken().split('.');
  assert.equal(validateCsrfToken(`${ts}.${rnd.replace(/.$/, rnd.endsWith('0') ? '1' : '0')}.${sig}`), false);
  assert.equal(validateCsrfToken(`${ts}.${rnd}.${sig.replace(/.$/, sig.endsWith('0') ? '1' : '0')}`), false);
  assert.equal(validateCsrfToken(`${ts}.${rnd}.${sig.slice(0, -2)}`), false);
});

test('tokens older than one hour are rejected, recent ones accepted', () => {
  assert.equal(validateCsrfToken(signed(Date.now() - 61 * 60 * 1000)), false);
  assert.equal(validateCsrfToken(signed(Date.now() - 30 * 60 * 1000)), true);
});

test('tokens dated in the future are rejected', () => {
  assert.equal(validateCsrfToken(signed(Date.now() + 10 * 60 * 1000)), false);
});

test('a token signed with a different secret is rejected', () => {
  const data = `${Date.now()}.${'b'.repeat(64)}`;
  const sig = createHmac('sha256', 'some-other-secret').update(data).digest('hex');
  assert.equal(validateCsrfToken(`${data}.${sig}`), false);
});

test('in production a missing NEXTAUTH_SECRET fails closed instead of using a default', () => {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = signed(Date.now()); // built while the secret still exists
  const env = process.env as Record<string, string | undefined>;
  const nodeEnv = env.NODE_ENV;
  delete env.NEXTAUTH_SECRET;
  env.NODE_ENV = 'production';
  try {
    assert.throws(() => generateCsrfToken(), /NEXTAUTH_SECRET/);
    assert.throws(() => validateCsrfToken(token), /NEXTAUTH_SECRET/);
  } finally {
    env.NEXTAUTH_SECRET = secret;
    env.NODE_ENV = nodeEnv;
  }
});
