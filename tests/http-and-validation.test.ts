import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextResponse } from 'next/server';
import { readJsonObject, isDbInt, parseIdParam, isSafeId, cleanText, isCleanString, MAX_DB_INT } from '../lib/http';
import { isValidEmail, normalizeHttpUrl, validateSongInput } from '../lib/input-sanitization';

const jsonReq = (raw: string) => new Request('http://localhost/api/x', { method: 'POST', body: raw, headers: { 'content-type': 'application/json' } });

test('readJsonObject returns plain objects and 400s everything else', async () => {
  assert.deepEqual(await readJsonObject(jsonReq('{"a":1}')), { a: 1 });
  for (const bad of ['{"a":', '', 'null', '[]', '"x"', '1', 'true']) {
    const r = await readJsonObject(jsonReq(bad));
    assert.ok(r instanceof NextResponse, `body ${JSON.stringify(bad)} should be rejected`);
    assert.equal((r as NextResponse).status, 400);
  }
});

test('isDbInt accepts only positive integers that fit a Postgres integer', () => {
  assert.equal(isDbInt(1), true);
  assert.equal(isDbInt(MAX_DB_INT), true);
  for (const bad of [0, -1, 1.5, MAX_DB_INT + 1, 9007199254740993, NaN, Infinity, '1', null, undefined, {}, []]) {
    assert.equal(isDbInt(bad), false, String(bad));
  }
});

test('parseIdParam is strict about URL segments', () => {
  assert.equal(parseIdParam('42'), 42);
  for (const bad of ['NaN', '1e3', '-1', '0x10', ' 1', '1 ', "' OR 1=1", '99999999999999999999', '2147483648', '', '%00', '1.5', undefined, null]) {
    assert.equal(parseIdParam(bad as string), null, String(bad));
  }
});

test('isSafeId allows cuid-like ids only', () => {
  assert.equal(isSafeId('cmwf9lusc002dqnadqkuj10l8'), true);
  for (const bad of ['', 'a'.repeat(65), 'a b', 'a\u0000b', "x' OR 1=1", '../x', 42, null]) assert.equal(isSafeId(bad), false, String(bad));
});

test('cleanText / isCleanString reject non-strings, long values and NUL bytes', () => {
  assert.deepEqual(cleanText(undefined, 5), { ok: true, value: null });
  assert.deepEqual(cleanText(null, 5), { ok: true, value: null });
  assert.deepEqual(cleanText('abc', 5), { ok: true, value: 'abc' });
  for (const bad of ['abcdef', 'a\u0000', 5, {}, []]) assert.equal(cleanText(bad, 5).ok, false, String(bad));
  assert.equal(isCleanString('ok', 5), true);
  assert.equal(isCleanString('a\u0000', 5), false);
});

test('isValidEmail rejects header-injection and malformed addresses', () => {
  for (const ok of ['a@example.com', 'first.last+tag@sub.example.co.uk', "o'brien@example.com"]) assert.equal(isValidEmail(ok), true, ok);
  for (const bad of ['a@example.com\r\nBcc: x@example.com', 'a@example.com\nx', 'a b@example.com', 'a@b', '@example.com', 'a@@example.com', 'Name <a@example.com>', 'a@example.com,b@example.com', `${'a'.repeat(250)}@example.com`, 42, null, undefined]) {
    assert.equal(isValidEmail(bad), false, JSON.stringify(bad));
  }
});

test('normalizeHttpUrl allows only absolute http(s) URLs', () => {
  assert.deepEqual(normalizeHttpUrl('https://genius.com/x?y=1'), { ok: true, url: 'https://genius.com/x?y=1' });
  assert.deepEqual(normalizeHttpUrl('  http://a.example/b  '), { ok: true, url: 'http://a.example/b' });
  for (const empty of ['', '   ', null, undefined]) assert.deepEqual(normalizeHttpUrl(empty), { ok: true, url: null });
  for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>', 'vbscript:x', 'file:///etc/passwd', '//evil.example', '/relative', 'not a url', 'https://' + 'a'.repeat(2100), 42, {}, []]) {
    assert.equal(normalizeHttpUrl(bad).ok, false, String(bad).slice(0, 40));
  }
});

test('validateSongInput rejects non-string fields instead of throwing', () => {
  for (const input of [{ title: 123, artist: 'A' }, { title: 'T', artist: { x: 1 } }, { title: 'T', artist: 'A', album: [] }, { title: ['T'], artist: 'A' }]) {
    const r = validateSongInput(input as never);
    assert.equal(r.isValid, false, JSON.stringify(input));
  }
  assert.equal(validateSongInput({ title: 'Yellow', artist: 'Coldplay', releaseDate: 2000 }).isValid, true);
});
