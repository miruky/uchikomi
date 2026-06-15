import { describe, expect, it } from 'vitest';
import { displayKey, topMissedKeys } from './stats';

describe('topMissedKeys', () => {
  it('回数の多い順に返す', () => {
    const misses = new Map([
      ['(', 3],
      ['_', 5],
      [';', 1],
    ]);
    expect(topMissedKeys(misses)).toEqual([
      { key: '_', count: 5 },
      { key: '(', count: 3 },
      { key: ';', count: 1 },
    ]);
  });

  it('0回は除き、上位n件に絞る', () => {
    const misses = new Map([
      ['a', 0],
      ['b', 2],
      ['c', 4],
      ['d', 1],
    ]);
    expect(topMissedKeys(misses, 2)).toEqual([
      { key: 'c', count: 4 },
      { key: 'b', count: 2 },
    ]);
  });

  it('同数は文字順で安定させる', () => {
    const misses = new Map([
      ['z', 2],
      ['a', 2],
    ]);
    expect(topMissedKeys(misses).map((m) => m.key)).toEqual(['a', 'z']);
  });

  it('誤打がなければ空', () => {
    expect(topMissedKeys(new Map())).toEqual([]);
  });
});

describe('displayKey', () => {
  it('空白は記号に置き換える', () => {
    expect(displayKey(' ')).toBe('␣');
    expect(displayKey('(')).toBe('(');
  });
});
