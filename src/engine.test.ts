import { describe, expect, it } from 'vitest';
import { TypingEngine } from './engine';

describe('TypingEngine 進行', () => {
  it('正しい入力で前進する', () => {
    const e = new TypingEngine('ab');
    expect(e.input('a')).toBe(true);
    expect(e.position).toBe(1);
    expect(e.input('b')).toBe(true);
    expect(e.finished).toBe(true);
  });

  it('誤入力は前進せずミスを数える', () => {
    const e = new TypingEngine('ab');
    expect(e.input('x')).toBe(false);
    expect(e.position).toBe(0);
    expect(e.mistakeCount).toBe(1);
  });

  it('バックスペースで戻る', () => {
    const e = new TypingEngine('ab');
    e.input('a');
    e.backspace();
    expect(e.position).toBe(0);
  });

  it('完了後は入力を受けない', () => {
    const e = new TypingEngine('a');
    e.input('a');
    expect(e.input('a')).toBe(false);
  });

  it('nextCharは期待文字、完了後はnull', () => {
    const e = new TypingEngine('ab');
    expect(e.nextChar()).toBe('a');
    e.input('a');
    expect(e.nextChar()).toBe('b');
    e.input('b');
    expect(e.nextChar()).toBeNull();
  });
});

describe('TypingEngine 表示状態', () => {
  it('done / current / pending を返す', () => {
    const e = new TypingEngine('abc');
    e.input('a');
    const states = e.states();
    expect(states.map((s) => s.status)).toEqual(['done', 'current', 'pending']);
  });

  it('誤打中の現在位置はerror', () => {
    const e = new TypingEngine('abc');
    e.input('x');
    expect(e.states()[0]!.status).toBe('error');
  });
});

describe('TypingEngine 統計', () => {
  it('正確性はミスを反映する', () => {
    const e = new TypingEngine('ab');
    e.input('x'); // miss
    e.input('a');
    e.input('b');
    // 正打2 / (正打2 + ミス1)
    expect(e.accuracy()).toBeCloseTo(2 / 3);
  });

  it('未入力の正確性は1', () => {
    expect(new TypingEngine('ab').accuracy()).toBe(1);
  });

  it('WPMは経過時間から算出する', () => {
    const e = new TypingEngine('abcde');
    e.input('a', 0);
    e.input('b', 0);
    e.input('c', 0);
    e.input('d', 0);
    e.input('e', 60000); // 5打鍵=1語を1分で
    expect(e.wpm()).toBe(1);
  });
});
