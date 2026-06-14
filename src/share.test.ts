import { describe, expect, it } from 'vitest';
import { langIdFromSearch, searchForLang } from './share';

const known = new Set(['python', 'go', 'rust']);
const isValid = (id: string): boolean => known.has(id);

describe('langIdFromSearch', () => {
  it('妥当な言語idを取り出す', () => {
    expect(langIdFromSearch('?lang=go', isValid)).toBe('go');
  });

  it('未知の言語は null', () => {
    expect(langIdFromSearch('?lang=cobol', isValid)).toBeNull();
  });

  it('クエリが無ければ null', () => {
    expect(langIdFromSearch('', isValid)).toBeNull();
    expect(langIdFromSearch('?theme=dark', isValid)).toBeNull();
  });
});

describe('searchForLang', () => {
  it('言語idを載せたクエリを作る', () => {
    expect(searchForLang('rust')).toBe('?lang=rust');
  });

  it('作ったクエリは読み戻せる', () => {
    expect(langIdFromSearch(searchForLang('python'), isValid)).toBe('python');
  });
});
