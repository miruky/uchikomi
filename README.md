# uchikomi

[![CI](https://github.com/miruky/uchikomi/actions/workflows/ci.yml/badge.svg)](https://github.com/miruky/uchikomi/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Test](https://img.shields.io/badge/Test-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**各プログラミング言語の関数や構文を、画面の仮想キーボードを見ながら打ち込むタイピングゲームです。**

## 概要

言語を選ぶと、その言語で頻出する関数呼び出しや構文が一行ずつ出題されます。打つべき次の文字に合わせて画面下の仮想キーボードが光り、必要ならShiftも案内します。記号の多いコードを、運指を確かめながら速く正確に打つ練習に向いています。打鍵ごとにWPMと正確性が更新され、一巡するとまとめが出ます。

出題内容はデータとして言語別に持っており、言語や項目を足すのはその配列に追記するだけです。あらゆる言語の全関数を一度に網羅することはできないため、各言語の代表的な書き方を起点に、増やしやすい構造そのものを設計に据えています。

遊ぶ: https://miruky.github.io/uchikomi/

## 使い方

- 上部のタブで言語を選びます
- 表示された一行を、実際のキーボードで打ちます。次に打つ文字は仮想キーボード上で光ります
- 誤った文字は赤く表示され、ミスとして数えられます。Backspaceで戻れます
- 一行打ち終えると次の行へ進み、全行を終えるとWPMと正確性のまとめが出ます

## アーキテクチャ

![uchikomiのアーキテクチャ](docs/architecture.svg)

打鍵判定と統計を担う `TypingEngine`、文字から押すべきキーを導く `keyboard`、出題データの `snippets` を分け、`main` がそれらを使って画面とキーボードを描き、`keydown` を流し込みます。判定・統計・運指案内はDOM非依存の純粋なロジックとしてテストしています。

## 技術スタック

| カテゴリ | 技術 |
|:--|:--|
| 言語 | TypeScript 5(strict) |
| ビルド | Vite |
| テスト | Vitest(17テスト) |
| リンタ | ESLint + Prettier |
| CI / CD | GitHub Actions |
| 配信 | GitHub Pages |
| 実行時依存 | なし |

## プロジェクト構成

- `src/snippets.ts` — 言語ごとの出題データ(拡張点)
- `src/engine.ts` — 打鍵の進行判定とWPM・正確性の算出
- `src/keyboard.ts` — キー配列と、文字から押すキー・Shiftの導出
- `src/main.ts` — 画面・仮想キーボードの描画と入力処理
- `docs/architecture.svg` — アーキテクチャ図

## はじめ方

### 前提条件

- Node.js 20 以上

### セットアップ

```bash
git clone https://github.com/miruky/uchikomi.git
cd uchikomi
npm install
npm run dev
```

### テストの実行

```bash
npm test
```

### Lintの実行

```bash
npm run lint
```

### デプロイ

`main` ブランチへのプッシュで GitHub Actions がビルドし、GitHub Pages へ配信します。

## 設計方針

- **判定ロジックの分離** — 進行・統計・運指案内をDOM非依存にし、テストで担保する
- **データ駆動の出題** — 言語と項目をデータに集約し、追記だけで増やせる
- **運指まで案内** — 次の文字に対応する物理キーとShiftの要否を示し、記号の多いコードでも迷わない
- **US配列前提の素直な実装** — Shift記号は基底キーへ対応づけ、案内を単純に保つ
- **配色はトークンで一元化** — 配色変数を1か所に置き、`prefers-color-scheme` でライト・ダークへ追従する

## 制約

US配列を前提としています。日本語入力やデッドキーは扱わず、出題は各言語の代表的な一行です。実在する全言語・全関数を網羅するものではありません。

## ライセンス

[MIT](LICENSE)
