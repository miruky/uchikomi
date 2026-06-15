// 運指ヒント(次に押すキーの点灯)の表示設定をlocalStorageに保持する。
// 既定は表示。慣れた人が消して負荷を上げられるようにする。

const KEY = 'uchikomi.hints.v1';

// 'off' のときだけ非表示。既定(null・不明値)は表示にする。
export function parseHints(raw: string | null): boolean {
  return raw !== 'off';
}

export function loadHints(): boolean {
  try {
    return parseHints(localStorage.getItem(KEY));
  } catch {
    return true;
  }
}

export function saveHints(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // 保存できなくても操作は続行する
  }
}
