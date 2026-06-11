import { describe, expect, it } from 'vitest';
import { hintFor } from './keyboard';
import { LANGUAGES } from './snippets';

describe('hintFor', () => {
  it('小文字はそのまま、shift不要', () => {
    expect(hintFor('a')).toEqual({ base: 'a', shift: false });
  });

  it('大文字は同じ基底キー+shift', () => {
    expect(hintFor('A')).toEqual({ base: 'a', shift: true });
  });

  it('shift記号は基底キーに対応する', () => {
    expect(hintFor('(')).toEqual({ base: '9', shift: true });
    expect(hintFor('"')).toEqual({ base: "'", shift: true });
    expect(hintFor('_')).toEqual({ base: '-', shift: true });
  });

  it('空白はSpace', () => {
    expect(hintFor(' ')).toEqual({ base: 'Space', shift: false });
  });

  it('shift不要の記号', () => {
    expect(hintFor('-')).toEqual({ base: '-', shift: false });
    expect(hintFor(';')).toEqual({ base: ';', shift: false });
  });
});

describe('スニペットはすべて案内可能な文字でできている', () => {
  it('全言語・全スニペットの各文字にhintがある', () => {
    for (const lang of LANGUAGES) {
      for (const snippet of lang.snippets) {
        for (const ch of snippet.text) {
          expect(hintFor(ch), `${lang.id}: ${JSON.stringify(ch)}`).not.toBeNull();
        }
      }
    }
  });

  it('言語idは重複しない', () => {
    const ids = LANGUAGES.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
