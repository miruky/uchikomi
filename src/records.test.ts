import { beforeEach, describe, expect, it } from 'vitest';
import { bestFor, isBetter, loadRecords, recordScore } from './records';

// node 環境には localStorage が無いので、テスト用に最小実装を差し込む。
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

describe('isBetter', () => {
  it('記録が無ければ常に更新', () => {
    expect(isBetter(undefined, { wpm: 10, accuracy: 90 })).toBe(true);
  });

  it('WPMが速い方を採る', () => {
    expect(isBetter({ wpm: 40, accuracy: 99 }, { wpm: 41, accuracy: 80 })).toBe(true);
    expect(isBetter({ wpm: 40, accuracy: 80 }, { wpm: 39, accuracy: 100 })).toBe(false);
  });

  it('同速なら正確性が高い方', () => {
    expect(isBetter({ wpm: 40, accuracy: 90 }, { wpm: 40, accuracy: 95 })).toBe(true);
    expect(isBetter({ wpm: 40, accuracy: 95 }, { wpm: 40, accuracy: 95 })).toBe(false);
  });
});

describe('recordScore と永続化', () => {
  it('初回は保存され updated=true', () => {
    const r = recordScore('python', { wpm: 30, accuracy: 92 });
    expect(r.updated).toBe(true);
    expect(bestFor('python')).toEqual({ wpm: 30, accuracy: 92 });
  });

  it('更新できないときは前の記録を返す', () => {
    recordScore('go', { wpm: 50, accuracy: 95 });
    const r = recordScore('go', { wpm: 40, accuracy: 99 });
    expect(r.updated).toBe(false);
    expect(r.best).toEqual({ wpm: 50, accuracy: 95 });
  });

  it('言語ごとに別々に持つ', () => {
    recordScore('rust', { wpm: 25, accuracy: 88 });
    recordScore('sql', { wpm: 33, accuracy: 91 });
    expect(Object.keys(loadRecords()).sort()).toEqual(['rust', 'sql']);
  });

  it('壊れた保存値からは空で復帰する', () => {
    localStorage.setItem('uchikomi.records.v1', '{ broken');
    expect(loadRecords()).toEqual({});
  });
});
