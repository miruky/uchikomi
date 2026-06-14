import './style.css';
import { TypingEngine } from './engine';
import { hintFor, ROWS } from './keyboard';
import { LANGUAGES, languageById, type Language } from './snippets';
import { bestFor, recordScore } from './records';
import { langIdFromSearch, searchForLang } from './share';
import { applyTheme, loadTheme, nextTheme, THEME_LABEL, type ThemeMode } from './theme';

const app = document.getElementById('app');
if (!app) throw new Error('#app が見つからない');

let theme: ThemeMode = loadTheme();
applyTheme(theme);

app.innerHTML = `
  <main class="wrap">
    <input class="catch" id="catch" tabindex="-1" aria-hidden="true" autocomplete="off"
      autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="text" />
    <header class="head reveal">
      <div class="brand">
        <p class="kicker">コードタイピング</p>
        <h1 class="wordmark">uchikomi<span class="caret" aria-hidden="true"></span></h1>
      </div>
      <button type="button" class="theme-toggle" id="theme"></button>
    </header>
    <p class="lede reveal d1">各言語の関数や構文を、画面のキーボードで運指を確かめながら打つ。記号の多いコードを速く正確に打つ練習に。</p>
    <nav class="langs reveal d2" id="langs" aria-label="言語選択"></nav>
    <section class="stage reveal d3" aria-label="出題">
      <div class="status" id="status"></div>
      <div class="target" id="target"></div>
      <p class="note" id="note" aria-live="polite"></p>
      <div class="progress" id="progress" aria-hidden="true"></div>
    </section>
    <section class="keyboard reveal d4" id="keyboard" aria-hidden="true"></section>
    <section class="result" id="result" hidden></section>
  </main>
`;

const langsEl = app.querySelector<HTMLElement>('#langs')!;
const statusEl = app.querySelector<HTMLElement>('#status')!;
const targetEl = app.querySelector<HTMLElement>('#target')!;
const noteEl = app.querySelector<HTMLElement>('#note')!;
const progressEl = app.querySelector<HTMLElement>('#progress')!;
const keyboardEl = app.querySelector<HTMLElement>('#keyboard')!;
const resultEl = app.querySelector<HTMLElement>('#result')!;
const themeBtn = app.querySelector<HTMLButtonElement>('#theme')!;
const catchEl = app.querySelector<HTMLInputElement>('#catch')!;

// ソフトキーボードしか無い端末では、隠しinputへ打鍵を集める。
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

const initialId = langIdFromSearch(location.search, (id) => languageById(id) !== undefined);
let language: Language = (initialId ? languageById(initialId) : undefined) ?? LANGUAGES[0]!;
let index = 0;
let engine = new TypingEngine(language.snippets[0]!.text);
let totalCorrect = 0;
let totalMistakes = 0;
let totalTimeMs = 0;
let timer = 0;

const keyEls = new Map<string, HTMLElement[]>();

setupTheme();
setupInput();
buildLangs();
buildKeyboard();
start(language);

// タッチ端末: 画面に触れたら隠しinputへフォーカスしてソフトキーボードを出し、
// beforeinput から打鍵を取り込む(物理キーボードの keydown と二重に数えない)。
function setupInput(): void {
  if (!coarsePointer) return;
  const focusCatch = (): void => {
    if (resultEl.hidden) catchEl.focus({ preventScroll: true });
  };
  document.addEventListener('pointerdown', focusCatch);
  catchEl.addEventListener('beforeinput', (ev) => {
    if (ev.isComposing) return;
    if (ev.inputType === 'insertText' && ev.data) {
      for (const ch of ev.data) processChar(ch);
    } else if (ev.inputType === 'deleteContentBackward') {
      engine.backspace();
      renderTarget();
      renderHints();
    }
    ev.preventDefault();
    catchEl.value = '';
  });
}

function setupTheme(): void {
  renderThemeBtn();
  themeBtn.addEventListener('click', () => {
    theme = nextTheme(theme);
    applyTheme(theme);
    renderThemeBtn();
  });
}

function renderThemeBtn(): void {
  themeBtn.innerHTML = `${themeIcon(theme)}<span>${THEME_LABEL[theme]}</span>`;
  themeBtn.setAttribute('aria-label', `表示テーマを切り替える(現在: ${THEME_LABEL[theme]})`);
}

function themeIcon(mode: ThemeMode): string {
  const open = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  if (mode === 'light') {
    return `${open}<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>`;
  }
  if (mode === 'dark') {
    return `${open}<path d="M20 14.4A8 8 0 0 1 9.6 4 7 7 0 1 0 20 14.4Z"/></svg>`;
  }
  return `${open}<circle cx="12" cy="12" r="8.4"/><path d="M12 3.6a8.4 8.4 0 0 1 0 16.8Z" fill="currentColor" stroke="none"/></svg>`;
}

function buildLangs(): void {
  for (const lang of LANGUAGES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang';
    btn.dataset.lang = lang.id;
    btn.textContent = lang.name;
    const pb = document.createElement('span');
    pb.className = 'pb';
    pb.hidden = true;
    btn.appendChild(pb);
    btn.addEventListener('click', () => start(lang));
    langsEl.appendChild(btn);
  }
  refreshPbMarks();
}

// 自己ベストを持つ言語タブに小さな印を出す。
function refreshPbMarks(): void {
  langsEl.querySelectorAll<HTMLElement>('.lang').forEach((el) => {
    const pb = el.querySelector<HTMLElement>('.pb');
    if (pb) pb.hidden = bestFor(el.dataset.lang ?? '') === undefined;
  });
}

function buildKeyboard(): void {
  for (const row of ROWS) {
    const rowEl = document.createElement('div');
    rowEl.className = 'krow';
    for (const key of row) {
      const keyEl = document.createElement('div');
      keyEl.className = 'key';
      keyEl.style.flexGrow = String(key.width);
      keyEl.textContent = key.code;
      rowEl.appendChild(keyEl);
      const list = keyEls.get(key.code) ?? [];
      list.push(keyEl);
      keyEls.set(key.code, list);
    }
    keyboardEl.appendChild(rowEl);
  }
}

function start(lang: Language): void {
  language = lang;
  index = 0;
  totalCorrect = 0;
  totalMistakes = 0;
  totalTimeMs = 0;
  resultEl.hidden = true;
  // 共有できるよう現在の言語をURLに残す(履歴は積まない)。
  history.replaceState(null, '', searchForLang(lang.id));
  langsEl.querySelectorAll<HTMLElement>('.lang').forEach((el) => {
    el.classList.toggle('active', el.dataset.lang === lang.id);
  });
  buildProgress();
  loadSnippet();
  if (coarsePointer) catchEl.focus({ preventScroll: true });
  if (!timer) timer = window.setInterval(updateStatus, 200);
}

function buildProgress(): void {
  progressEl.replaceChildren();
  for (let i = 0; i < language.snippets.length; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    progressEl.appendChild(dot);
  }
}

function renderProgress(): void {
  progressEl.querySelectorAll<HTMLElement>('.dot').forEach((dot, i) => {
    dot.classList.toggle('done', i < index);
    dot.classList.toggle('current', i === index);
  });
}

function loadSnippet(): void {
  engine = new TypingEngine(language.snippets[index]!.text);
  noteEl.textContent = language.snippets[index]!.note;
  renderTarget();
  renderHints();
  renderProgress();
  updateStatus();
  // 新しい行に切り替わったことをやわらかく見せる
  targetEl.classList.remove('enter');
  void targetEl.offsetWidth;
  targetEl.classList.add('enter');
}

function renderTarget(): void {
  targetEl.replaceChildren();
  for (const state of engine.states()) {
    const span = document.createElement('span');
    span.className = `ch ${state.status}`;
    if (state.char === ' ') span.classList.add('space');
    span.textContent = state.char;
    targetEl.appendChild(span);
  }
}

function renderHints(): void {
  keyEls.forEach((els) => els.forEach((el) => el.classList.remove('next', 'shift')));
  const next = engine.nextChar();
  if (next === null) return;
  const hint = hintFor(next);
  if (!hint) return;
  for (const el of keyEls.get(hint.base) ?? []) el.classList.add('next');
  if (hint.shift) for (const el of keyEls.get('Shift') ?? []) el.classList.add('shift');
}

function updateStatus(): void {
  const acc = Math.round(engine.accuracy() * 100);
  const best = bestFor(language.id);
  statusEl.innerHTML =
    metric('言語', `<span class="v">${language.name}</span>`, 'lang-name') +
    metric('行', `<span class="v">${index + 1}<span class="unit">/ ${language.snippets.length}</span></span>`) +
    metric('WPM', `<span class="v">${engine.wpm()}</span>`) +
    metric('正確性', `<span class="v">${acc}<span class="unit">%</span></span>`) +
    metric('自己ベスト', `<span class="v">${best ? best.wpm : '—'}<span class="unit">${best ? 'wpm' : ''}</span></span>`);
}

function metric(key: string, value: string, extra = ''): string {
  return `<div class="metric ${extra}">${value}<span class="k">${key}</span></div>`;
}

function advance(): void {
  totalCorrect += engine.position;
  totalMistakes += engine.mistakeCount;
  totalTimeMs += engine.elapsedMs();
  index += 1;
  if (index >= language.snippets.length) showResult();
  else loadSnippet();
}

function showResult(): void {
  window.clearInterval(timer);
  timer = 0;
  renderProgress();
  const minutes = totalTimeMs / 60000;
  const wpm = minutes > 0 ? Math.round(totalCorrect / 5 / minutes) : 0;
  const total = totalCorrect + totalMistakes;
  const acc = total > 0 ? Math.round((totalCorrect / total) * 100) : 100;

  const { best, updated } = recordScore(language.id, { wpm, accuracy: acc });
  refreshPbMarks();

  resultEl.hidden = false;
  resultEl.classList.remove('show');
  void resultEl.offsetWidth;
  resultEl.classList.add('show');
  resultEl.innerHTML =
    `<h2><b>${language.name}</b> 完了</h2>` +
    `<div class="result-stats">` +
    cell(wpm, 'WPM', bestLine('WPM', best.wpm, updated)) +
    cell(acc, '正確性', bestLine('正確性', best.accuracy, updated, '%'), '%') +
    cell(language.snippets.length, '打鍵した行') +
    `</div>` +
    `<button type="button" class="retry">もう一度</button>`;
  resultEl.querySelector('.retry')!.addEventListener('click', () => start(language));
  resultEl.querySelector<HTMLElement>('.retry')!.focus({ preventScroll: true });
  countUp();
}

function cell(value: number, label: string, best = '', suffix = ''): string {
  return (
    `<div class="cell">` +
    `<strong data-count="${value}" data-suffix="${suffix}">0${suffix}</strong>` +
    `<span class="label">${label}</span>` +
    best +
    `</div>`
  );
}

function bestLine(_label: string, value: number, updated: boolean, suffix = ''): string {
  const cls = updated ? 'best fresh' : 'best';
  const text = updated ? '自己ベスト更新' : `自己ベスト ${value}${suffix}`;
  return `<span class="${cls}">${text}</span>`;
}

// 結果の数値を0から目標へカウントアップする。reduced-motion時は即時表示。
function countUp(): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  resultEl.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';
    if (reduce) {
      el.textContent = `${to}${suffix}`;
      return;
    }
    const duration = 640;
    const startAt = performance.now();
    const tick = (now: number): void => {
      const p = Math.min(1, (now - startAt) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `${Math.round(to * eased)}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

window.addEventListener('keydown', (ev) => {
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return;

  if (!resultEl.hidden) {
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Escape') {
      ev.preventDefault();
      start(language);
    }
    return;
  }

  if (ev.key === 'Escape') {
    ev.preventDefault();
    start(language);
    return;
  }
  if (ev.key === 'Backspace') {
    ev.preventDefault();
    engine.backspace();
    renderTarget();
    renderHints();
    return;
  }
  if (ev.key === 'Tab' || ev.key === ' ') ev.preventDefault();
  if (ev.key.length !== 1) return;
  processChar(ev.key);
});

// 1文字を判定に流し、表示・運指・統計・フィードバックを更新する。
// 行が終わったら次へ進む。完了済みなら何もしない(二重に進めない)。
function processChar(char: string): void {
  if (engine.finished) return;
  const ok = engine.input(char);
  renderTarget();
  renderHints();
  updateStatus();
  flashFeedback(char, ok);
  if (engine.finished) window.setTimeout(advance, 220);
}

// 打鍵のたびに、押したキーを点灯させる。誤打は赤く点滅し、打鍵対象を小さく揺らす。
function flashFeedback(char: string, ok: boolean): void {
  const hint = hintFor(char);
  if (hint) {
    for (const el of keyEls.get(hint.base) ?? []) {
      const cls = ok ? 'hit' : 'miss';
      el.classList.remove('hit', 'miss');
      void el.offsetWidth; // アニメーションを確実に再生させる
      el.classList.add(cls);
      el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
    }
  }
  if (!ok) {
    targetEl.classList.remove('shake');
    void targetEl.offsetWidth;
    targetEl.classList.add('shake');
    targetEl.addEventListener('animationend', () => targetEl.classList.remove('shake'), {
      once: true,
    });
  }
}
