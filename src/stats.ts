// 1回のプレイで「どの文字で打ち間違えたか」を集計する。練習で詰める対象を
// 示すため、誤打の多い文字を上位から返す。

export interface MissCount {
  key: string;
  count: number;
}

// 文字ごとの誤打回数を多い順に。同数は文字順で安定させ、上位n件を返す。
export function topMissedKeys(misses: Map<string, number>, n = 3): MissCount[] {
  return [...misses.entries()]
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : 1))
    .slice(0, n);
}

// 表示用に文字を読みやすくする。空白は視認できないため記号に置き換える。
export function displayKey(key: string): string {
  if (key === ' ') return '␣';
  return key;
}
