// 仮想キーボードの配列定義と、文字から押すべきキーへの対応。
// US配列を前提に、shiftが要る記号は対応する基底キーとshiftを案内する。

export interface KeyDef {
  code: string; // 表示ラベル
  width: number; // 1.0 = 標準キー幅
}

export const ROWS: KeyDef[][] = [
  [
    { code: '`', width: 1 }, { code: '1', width: 1 }, { code: '2', width: 1 }, { code: '3', width: 1 },
    { code: '4', width: 1 }, { code: '5', width: 1 }, { code: '6', width: 1 }, { code: '7', width: 1 },
    { code: '8', width: 1 }, { code: '9', width: 1 }, { code: '0', width: 1 }, { code: '-', width: 1 },
    { code: '=', width: 1 }, { code: 'Back', width: 2 },
  ],
  [
    { code: 'Tab', width: 1.5 }, { code: 'q', width: 1 }, { code: 'w', width: 1 }, { code: 'e', width: 1 },
    { code: 'r', width: 1 }, { code: 't', width: 1 }, { code: 'y', width: 1 }, { code: 'u', width: 1 },
    { code: 'i', width: 1 }, { code: 'o', width: 1 }, { code: 'p', width: 1 }, { code: '[', width: 1 },
    { code: ']', width: 1 }, { code: '\\', width: 1.5 },
  ],
  [
    { code: 'Caps', width: 1.75 }, { code: 'a', width: 1 }, { code: 's', width: 1 }, { code: 'd', width: 1 },
    { code: 'f', width: 1 }, { code: 'g', width: 1 }, { code: 'h', width: 1 }, { code: 'j', width: 1 },
    { code: 'k', width: 1 }, { code: 'l', width: 1 }, { code: ';', width: 1 }, { code: "'", width: 1 },
    { code: 'Enter', width: 2.25 },
  ],
  [
    { code: 'Shift', width: 2.25 }, { code: 'z', width: 1 }, { code: 'x', width: 1 }, { code: 'c', width: 1 },
    { code: 'v', width: 1 }, { code: 'b', width: 1 }, { code: 'n', width: 1 }, { code: 'm', width: 1 },
    { code: ',', width: 1 }, { code: '.', width: 1 }, { code: '/', width: 1 }, { code: 'Shift', width: 2.75 },
  ],
  [{ code: 'Space', width: 12 }],
];

// shift記号 → 基底キー
const SHIFT_MAP: Record<string, string> = {
  '~': '`', '!': '1', '@': '2', '#': '3', $: '4', '%': '5', '^': '6', '&': '7',
  '*': '8', '(': '9', ')': '0', _: '-', '+': '=', '{': '[', '}': ']', '|': '\\',
  ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
};

export interface KeyHint {
  base: string; // 押す物理キーのラベル
  shift: boolean; // shiftが必要か
}

// 入力すべき文字から、押すキーとshiftの要否を返す。
export function hintFor(char: string): KeyHint | null {
  if (char === ' ') return { base: 'Space', shift: false };
  if (char >= 'A' && char <= 'Z') return { base: char.toLowerCase(), shift: true };
  if (SHIFT_MAP[char]) return { base: SHIFT_MAP[char]!, shift: true };
  if (/[a-z0-9`\-=[\]\\;',./]/.test(char)) return { base: char, shift: false };
  return null;
}
