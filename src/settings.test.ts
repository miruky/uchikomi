import { describe, expect, it } from 'vitest';
import { parseHints } from './settings';

describe('parseHints', () => {
  it("'off' のときだけ非表示", () => {
    expect(parseHints('off')).toBe(false);
  });

  it('既定(null・on・不明)は表示', () => {
    expect(parseHints(null)).toBe(true);
    expect(parseHints('on')).toBe(true);
    expect(parseHints('')).toBe(true);
  });
});
