import { beforeEach, describe, expect, it } from 'vitest';
import { isThemeMode, loadTheme, nextTheme } from './theme';

class MemStorage {
  private m = new Map<string, string>();
  get length(): number {
    return this.m.size;
  }
  getItem(k: string): string | null {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  setItem(k: string, v: string): void {
    this.m.set(k, String(v));
  }
  removeItem(k: string): void {
    this.m.delete(k);
  }
  clear(): void {
    this.m.clear();
  }
  key(i: number): string | null {
    return [...this.m.keys()][i] ?? null;
  }
}

beforeEach(() => {
  globalThis.localStorage = new MemStorage() as unknown as Storage;
});

describe('isThemeMode', () => {
  it('3つの値だけを受け入れる', () => {
    expect(isThemeMode('auto')).toBe(true);
    expect(isThemeMode('light')).toBe(true);
    expect(isThemeMode('dark')).toBe(true);
    expect(isThemeMode('sepia')).toBe(false);
    expect(isThemeMode(null)).toBe(false);
  });
});

describe('nextTheme', () => {
  it('自動→ライト→ダーク→自動 と巡回する', () => {
    expect(nextTheme('auto')).toBe('light');
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('auto');
  });
});

describe('loadTheme', () => {
  it('保存が無ければ自動', () => {
    expect(loadTheme()).toBe('auto');
  });

  it('保存された妥当な値を読む', () => {
    localStorage.setItem('uchikomi.theme', 'dark');
    expect(loadTheme()).toBe('dark');
  });

  it('不正な保存値は自動に倒す', () => {
    localStorage.setItem('uchikomi.theme', 'neon');
    expect(loadTheme()).toBe('auto');
  });
});
