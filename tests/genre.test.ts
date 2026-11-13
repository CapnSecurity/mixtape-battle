import test from 'node:test';
import assert from 'node:assert/strict';
import { pickGenre } from '../lib/musicbrainz';

test('pickGenre uses tags from any matching recording, not just the first', () => {
  const recordings = [
    { tags: undefined },
    { tags: [] },
    { tags: [{ name: 'country', count: 2 }, { name: 'classic country', count: 1 }] },
  ];
  assert.equal(pickGenre(recordings), 'country');
});

test('pickGenre sums counts across recordings', () => {
  const recordings = [
    { tags: [{ name: 'rock', count: 1 }, { name: 'pop', count: 2 }] },
    { tags: [{ name: 'rock', count: 2 }] },
  ];
  assert.equal(pickGenre(recordings), 'rock');
});

test('pickGenre returns null without usable tags', () => {
  assert.equal(pickGenre([]), null);
  assert.equal(pickGenre([null, undefined, { tags: [] }, { tags: [{ count: 3 }] }]), null);
});
