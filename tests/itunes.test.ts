import test from 'node:test';
import assert from 'node:assert/strict';
import { pickBestItunesResult } from '../lib/itunes';

const r = (artistName: string, trackName: string, collectionName: string, year: number, extra: object = {}) => ({
  artistName, trackName, collectionName, releaseDate: `${year}-06-01T07:00:00Z`, ...extra,
});

test('rejects tribute acts that merely contain the artist name', () => {
  const results = [
    r('Garth Brooks Tribute', 'Standing Outside the Fire', 'Garth Brooks Hits 2 - A Tribute Album', 2023),
    r('John Sawyer', 'Standing Outside the Fire', 'A Tribute to Garth Brooks', 1998),
    r('Trevor Loughrey', 'Standing Outside the Fire', 'The Collection', 2019),
  ];
  assert.equal(pickBestItunesResult(results, 'Garth Brooks', 'Standing Outside the Fire'), null);
});

test('prefers the original over live and re-recorded versions', () => {
  const results = [
    r('Journey', 'Lights (Live In Houston, 1981)', 'Live In Houston 1981', 2005),
    r('Journey', 'Lights (Re-Recorded)', 'Revelation', 2008),
    r('Journey', 'Lights', 'Time3', 1992),
    r('Journey', 'Lights', 'Infinity', 1978),
  ];
  const best = pickBestItunesResult(results, 'Journey', 'Lights');
  assert.equal(best.collectionName, 'Infinity');
});

test('exact artist beats a partial artist match', () => {
  const results = [
    r('Tom Petty and the Heartbreakers', 'Breakdown', 'Tom Petty & The Heartbreakers', 1976),
    r('Tom Petty', 'Breakdown', 'Greatest Hits', 1993),
  ];
  assert.equal(pickBestItunesResult(results, 'Tom Petty', 'Breakdown').collectionName, 'Greatest Hits');
});

test('a legitimate song title containing "cover" or "sing" is not rejected', () => {
  const results = [r('The Carpenters', 'Sing', 'Now & Then', 1973), r('Rod Stewart', 'Cover Me', 'Rod', 1980)];
  assert.ok(pickBestItunesResult(results, 'The Carpenters', 'Sing'));
});

test('keeps a tribute match when the user searched for a tribute act', () => {
  const results = [r('Garth Brooks Tribute', 'Friends in Low Places', 'A Tribute Album', 2020)];
  assert.ok(pickBestItunesResult(results, 'Garth Brooks Tribute', 'Friends in Low Places'));
});

test('returns null when nothing matches', () => {
  assert.equal(pickBestItunesResult([r('BTS', 'Lights', 'MAP OF THE SOUL', 2019)], 'Journey', 'Lights'), null);
  assert.equal(pickBestItunesResult([], 'Journey', 'Lights'), null);
});
