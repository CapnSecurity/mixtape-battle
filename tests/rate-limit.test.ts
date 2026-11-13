import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { getClientId, createRateLimit } from '../lib/rate-limit';

const req = (headers: Record<string, string> = {}) =>
  new NextRequest('http://localhost/api/test', { headers });

beforeEach(() => {
  delete process.env.TRUSTED_PROXY_HOPS;
});

test('default (1 hop) keys on the right-most X-Forwarded-For entry', () => {
  assert.equal(getClientId(req({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3' })), '3.3.3.3');
});

test('a forged left-most entry cannot change the key', () => {
  const a = getClientId(req({ 'x-forwarded-for': '6.6.6.6, 9.9.9.9' }));
  const b = getClientId(req({ 'x-forwarded-for': '7.7.7.7, 9.9.9.9' }));
  assert.equal(a, b);
});

test('TRUSTED_PROXY_HOPS=2 keys on the second entry from the right', () => {
  process.env.TRUSTED_PROXY_HOPS = '2';
  assert.equal(getClientId(req({ 'x-forwarded-for': '6.6.6.6, 9.9.9.9, 10.0.0.1' })), '9.9.9.9');
});

test('hop counts larger than the chain fall back to the left-most entry', () => {
  process.env.TRUSTED_PROXY_HOPS = '5';
  assert.equal(getClientId(req({ 'x-forwarded-for': '9.9.9.9, 10.0.0.1' })), '9.9.9.9');
});

test('invalid TRUSTED_PROXY_HOPS values fall back to 1', () => {
  for (const bad of ['0', '-3', 'abc', '']) {
    process.env.TRUSTED_PROXY_HOPS = bad;
    assert.equal(getClientId(req({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' })), '2.2.2.2', `value "${bad}"`);
  }
});

test('x-real-ip is used when there is no X-Forwarded-For, otherwise "unknown"', () => {
  assert.equal(getClientId(req({ 'x-real-ip': '4.4.4.4' })), '4.4.4.4');
  assert.equal(getClientId(req()), 'unknown');
});

test('limiter allows N requests then blocks with 429 and Retry-After, per client', async () => {
  const limit = createRateLimit({ maxRequests: 3, windowMs: 60_000 }, `unit-${Date.now()}`);
  const a = () => limit(req({ 'x-forwarded-for': '8.8.8.8' }));
  assert.equal((await a()).success, true);
  assert.equal((await a()).success, true);
  assert.equal((await a()).success, true);
  const blocked = await a();
  assert.equal(blocked.success, false);
  assert.equal(blocked.response?.status, 429);
  assert.ok(blocked.response?.headers.get('retry-after'));
  // A different client has its own bucket.
  assert.equal((await limit(req({ 'x-forwarded-for': '8.8.4.4' }))).success, true);
});
