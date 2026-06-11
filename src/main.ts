import './style.css';
import { TypingEngine } from './engine';
import { hintFor, ROWS } from './keyboard';
import { LANGUAGES, type Language } from './snippets';

const app = document.getElementById('app');
if (!app) throw new Error('#app が見つからない');

app.innerHTML = `
  <main class="wrap">
    <header class="head">
      <h1>uchikomi</h1>
      <p class="sub">各言語の関数を、仮想キーボードを見ながら打ち込む</p>
    </header>
    <nav class="langs" id="langs" aria-label="言語選択"></nav>
    <section class="stage">
      <div class="status" id="status"></div>
      <div class="target" id="target"></div>
      <p class="note" id="note"></p>
    </section>
    <section class="keyboard" id="keyboard" aria-hidden="true"></section>
    <section class="result" id="result" hidden></section>
  </main>
`;

const langsEl = app.querySelector<HTMLElement>('#langs')!;
const statusEl = app.querySelector<HTMLElement>('#status')!;
const targetEl = app.querySelector<HTMLElement>('#target')!;
const noteEl = app.querySelector<HTMLElement>('#note')!;
const keyboardEl = app.querySelector<HTMLElement>('#keyboard')!;
const resultEl = app.querySelector<HTMLElement>('#result')!;

let language: Language = LANGUAGES[0]!;
let index = 0;
let engine = new TypingEngine(language.snippets[0]!.text);
let totalCorrect = 0;
let totalMistakes = 0;
let totalTimeMs = 0;
let timer = 0;

const keyEls = new Map<string, HTMLElement[]>();

buildLangs();
buildKeyboard();
start(language);

function buildLangs(): void {
  for (const lang of LANGUAGES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang';
    btn.dataset.lang = lang.id;
    btn.textContent = lang.name;
    btn.addEventListener('click', () => start(lang));
    langsEl.appendChild(btn);
  }
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
  langsEl.querySelectorAll<HTMLElement>('.lang').forEach((el) => {
    el.classList.toggle('active', el.dataset.lang === lang.id);
  });
  loadSnippet();
  if (!timer) timer = window.setInterval(updateStatus, 200);
}

function loadSnippet(): void {
  engine = new TypingEngine(language.snippets[index]!.text);
  noteEl.textContent = language.snippets[index]!.note;
  renderTarget();
  renderHints();
  updateStatus();
}

function renderTarget(): void {
  targetEl.replaceChildren();
  for (const state of engine.states()) {
    const span = document.createElement('span');
    span.className = `ch ${state.status}`;
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
  statusEl.innerHTML =
    `<span>${language.name}</span>` +
    `<span>${index + 1} / ${language.snippets.length}</span>` +
    `<span>${engine.wpm()} WPM</span>` +
    `<span>正確性 ${acc}%</span>`;
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
  const minutes = totalTimeMs / 60000;
  const wpm = minutes > 0 ? Math.round(totalCorrect / 5 / minutes) : 0;
  const total = totalCorrect + totalMistakes;
  const acc = total > 0 ? Math.round((totalCorrect / total) * 100) : 100;
  resultEl.hidden = false;
  resultEl.innerHTML =
    `<h2>${language.name} 完了</h2>` +
    `<div class="result-stats"><div><strong>${wpm}</strong><span>WPM</span></div>` +
    `<div><strong>${acc}%</strong><span>正確性</span></div>` +
    `<div><strong>${language.snippets.length}</strong><span>打鍵した行</span></div></div>` +
    `<button type="button" class="retry">もう一度</button>`;
  resultEl.querySelector('.retry')!.addEventListener('click', () => start(language));
}

window.addEventListener('keydown', (ev) => {
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
  if (!resultEl.hidden) return;

  if (ev.key === 'Backspace') {
    ev.preventDefault();
    engine.backspace();
    renderTarget();
    renderHints();
    return;
  }
  if (ev.key === 'Tab' || ev.key === ' ') ev.preventDefault();
  if (ev.key.length !== 1) return;

  engine.input(ev.key);
  renderTarget();
  renderHints();
  updateStatus();
  if (engine.finished) window.setTimeout(advance, 220);
});
