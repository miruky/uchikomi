// 1行ぶんの打鍵状態を管理する。入力は正しい文字のみ前進し、誤りは
// ミスとして数える(バックスペースで戻れる)。表示と統計のための状態を持つ。

export interface CharState {
  char: string;
  status: 'done' | 'current' | 'pending' | 'error';
}

export class TypingEngine {
  private cursor = 0;
  private mistakes = 0;
  private typed = 0; // 正しく打った総数(後退しても減らさない)
  private startedAt: number | null = null;
  private finishedAt: number | null = null;
  private errorAt = false; // 現在位置で直近に誤打したか

  constructor(readonly target: string) {}

  get started(): boolean {
    return this.startedAt !== null;
  }

  get finished(): boolean {
    return this.cursor >= this.target.length;
  }

  get position(): number {
    return this.cursor;
  }

  get mistakeCount(): number {
    return this.mistakes;
  }

  // 期待される次の文字。完了後はnull。
  nextChar(): string | null {
    return this.cursor < this.target.length ? (this.target[this.cursor] ?? null) : null;
  }

  // 1文字入力。正しければ前進してtrue、誤りならミスを数えてfalse。
  input(char: string, now: number = Date.now()): boolean {
    if (this.finished) return false;
    if (this.startedAt === null) this.startedAt = now;
    if (char === this.target[this.cursor]) {
      this.cursor += 1;
      this.typed += 1;
      this.errorAt = false;
      if (this.finished) this.finishedAt = now;
      return true;
    }
    this.mistakes += 1;
    this.errorAt = true;
    return false;
  }

  backspace(): void {
    if (this.cursor > 0 && !this.finished) {
      this.cursor -= 1;
      this.errorAt = false;
    }
  }

  states(): CharState[] {
    return [...this.target].map((char, i) => {
      if (i < this.cursor) return { char, status: 'done' };
      if (i === this.cursor) return { char, status: this.errorAt ? 'error' : 'current' };
      return { char, status: 'pending' };
    });
  }

  elapsedMs(now: number = Date.now()): number {
    if (this.startedAt === null) return 0;
    return (this.finishedAt ?? now) - this.startedAt;
  }

  // 1分あたりの語数。英文の慣例に従い5打鍵=1語で換算する。
  wpm(now: number = Date.now()): number {
    const ms = this.elapsedMs(now);
    if (ms <= 0) return 0;
    return Math.round(this.typed / 5 / (ms / 60000));
  }

  // 正確性: 正しい打鍵 / (正しい打鍵 + ミス)。
  accuracy(): number {
    const total = this.typed + this.mistakes;
    return total === 0 ? 1 : this.typed / total;
  }
}
