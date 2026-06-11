// 打鍵対象のデータ。言語ごとに、その言語の代表的な関数・構文の1行を集める。
// 言語や項目はこの配列に足すだけで増やせる(網羅範囲を広げるための拡張点)。

export interface Snippet {
  text: string;
  note: string; // その行が何か(表示用)
}

export interface Language {
  id: string;
  name: string;
  snippets: Snippet[];
}

export const LANGUAGES: Language[] = [
  {
    id: 'python',
    name: 'Python',
    snippets: [
      { text: 'print("hello")', note: '標準出力' },
      { text: 'len(items)', note: '長さを得る' },
      { text: 'sorted(nums, reverse=True)', note: '降順ソート' },
      { text: 'enumerate(items, start=1)', note: '添字つき反復' },
      { text: 'sum(x for x in nums if x > 0)', note: '条件付き合計' },
      { text: 'dict(zip(keys, values))', note: '辞書を組む' },
      { text: 'open(path, encoding="utf-8")', note: 'ファイルを開く' },
    ],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    snippets: [
      { text: 'const x: number = 42;', note: '型注釈つき宣言' },
      { text: 'items.map((x) => x * 2)', note: '写像' },
      { text: 'arr.filter((x) => x > 0)', note: '抽出' },
      { text: 'Object.entries(obj)', note: 'キーと値の組' },
      { text: 'Promise.all(tasks)', note: '並行待ち合わせ' },
      { text: 'JSON.stringify(value, null, 2)', note: '整形して文字列化' },
      { text: 'arr.reduce((a, b) => a + b, 0)', note: '畳み込み' },
    ],
  },
  {
    id: 'go',
    name: 'Go',
    snippets: [
      { text: 'fmt.Println("hello")', note: '標準出力' },
      { text: 'make([]int, 0, 8)', note: 'スライス確保' },
      { text: 'for i := range items {', note: '範囲反復' },
      { text: 'if err != nil {', note: 'エラー検査' },
      { text: 'defer file.Close()', note: '遅延実行' },
      { text: 'go worker(ch)', note: 'ゴルーチン起動' },
    ],
  },
  {
    id: 'rust',
    name: 'Rust',
    snippets: [
      { text: 'let mut v = Vec::new();', note: '可変ベクタ' },
      { text: 'iter.map(|x| x + 1).collect()', note: '写像して収集' },
      { text: 'match value {', note: 'パターンマッチ' },
      { text: 'Result::Ok(value)', note: '成功を包む' },
      { text: 'println!("{}", name)', note: '整形出力' },
      { text: 'vec.iter().filter(|&&x| x > 0)', note: '抽出' },
    ],
  },
  {
    id: 'sql',
    name: 'SQL',
    snippets: [
      { text: 'SELECT id, name FROM users', note: '列を取る' },
      { text: 'WHERE created_at > NOW()', note: '条件' },
      { text: 'GROUP BY category', note: '集約' },
      { text: 'ORDER BY score DESC', note: '並べ替え' },
      { text: 'LEFT JOIN orders ON u.id = o.user_id', note: '外部結合' },
      { text: 'COUNT(*) AS total', note: '件数' },
    ],
  },
];

export function languageById(id: string): Language | undefined {
  return LANGUAGES.find((l) => l.id === id);
}
