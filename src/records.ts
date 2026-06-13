// 言語ごとの自己ベスト(WPMと正確性)をlocalStorageに保存する。

export interface ScoreRecord {
  wpm: number;
  accuracy: number; // 0〜100
}

const KEY = 'uchikomi.records.v1';

// 速いほど良い。同速なら正確性が高い方を採る。純粋関数なのでテストしやすい。
export function isBetter(prev: ScoreRecord | undefined, next: ScoreRecord): boolean {
  if (!prev) return true;
  if (next.wpm !== prev.wpm) return next.wpm > prev.wpm;
  return next.accuracy > prev.accuracy;
}

export function loadRecords(): Record<string, ScoreRecord> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed as Record<string, ScoreRecord>;
    }
  } catch {
    // 壊れていれば空から始める
  }
  return {};
}

// 自己ベストを更新できたら保存する。更新後(または既存)の記録と、更新有無を返す。
export function recordScore(
  langId: string,
  score: ScoreRecord,
): { best: ScoreRecord; updated: boolean } {
  const all = loadRecords();
  const prev = all[langId];
  const updated = isBetter(prev, score);
  if (updated) {
    all[langId] = score;
    try {
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch {
      // 保存に失敗しても結果表示は続ける
    }
  }
  return { best: updated ? score : prev!, updated };
}

export function bestFor(langId: string): ScoreRecord | undefined {
  return loadRecords()[langId];
}
