import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedArtUrl, parseArtUpdate } from '../lib/art-url';

test('accepts the hosts the metadata lookups use', () => {
  for (const u of [
    'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/71/fc/a.jpg/600x600bb.jpg',
    'https://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd/front-500',
    'https://dn711103.ca.archive.org/0/items/x/y_thumb500.jpg',
    'https://archive.org/download/x/y.jpg',
    'https://lastfm.freetls.fastly.net/i/u/300x300/abc.png',
  ]) assert.equal(isAllowedArtUrl(u), true, u);
});

test('rejects other schemes, hosts, look-alike domains, credentials and ports', () => {
  for (const u of [
    'http://is1-ssl.mzstatic.com/a.jpg',
    'javascript:alert(1)',
    'data:image/png;base64,AAAA',
    'https://evil.example/a.jpg',
    'https://mzstatic.com.evil.example/a.jpg',
    'https://notmzstatic.com/a.jpg',
    'https://evilarchive.org/a.jpg',
    'https://user:pw@coverartarchive.org/a.jpg',
    'https://coverartarchive.org:8443/a.jpg',
    '//coverartarchive.org/a.jpg',
    'not a url',
    'https://coverartarchive.org/' + 'a'.repeat(700),
  ]) assert.equal(isAllowedArtUrl(u), false, u);
});

test('parseArtUpdate: undefined keeps, empty or null clears, bad values are refused', () => {
  assert.deepEqual(parseArtUpdate(undefined), { ok: true, change: false });
  assert.deepEqual(parseArtUpdate(null), { ok: true, change: true, value: null });
  assert.deepEqual(parseArtUpdate('  '), { ok: true, change: true, value: null });
  assert.deepEqual(parseArtUpdate(' https://coverartarchive.org/a '), { ok: true, change: true, value: 'https://coverartarchive.org/a' });
  assert.deepEqual(parseArtUpdate(42), { ok: false });
  assert.deepEqual(parseArtUpdate({}), { ok: false });
  assert.deepEqual(parseArtUpdate('https://evil.example/a.jpg'), { ok: false });
});
