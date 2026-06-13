// 選んだ言語をURLのクエリ(?lang=)に載せ、共有リンクから復元できるようにする。

// クエリ文字列から妥当な言語idを取り出す。未知・不正なら null。
export function langIdFromSearch(search: string, isValid: (id: string) => boolean): string | null {
  const id = new URLSearchParams(search).get('lang');
  return id && isValid(id) ? id : null;
}

// 言語idを載せたクエリ文字列(先頭に ? を含む)を作る。
export function searchForLang(id: string): string {
  return `?${new URLSearchParams({ lang: id }).toString()}`;
}
