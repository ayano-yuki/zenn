---
title: "Vivliostyleのインストールと、プロジェクトの作成"
free: true
---

# 環境構築：Node.jsのインストール

:::message
既に**Node.jsバージョン12以上**をインストールしている場合はスキップしてください。
:::

Vivlistyleのプロジェクトを作成するためには、Node.jsが必要なのでインストールします。
下記の公式サイトから自身の環境に合ったバージョン12以上のNode.jsをダウンロードしてください。

https://nodejs.org/ja/download

# Vivlistyleのプロジェクト作成

下記のコマンドを用いて、Vivlistyleのプロジェクトを作成します。
コマンド内にある`<book-title>`を作成する書籍の名称にして実行してください。

```bash
npm create book <book-title>
```

このコマンドを実行すると、プロジェクトの設定のために以下の5つの入力が求められる。
基本的には本の作成に影響しませんが、テーマを自作しない場合は目的にあったテーマを選択してください。

| 項目 | 形式 | 概要と留意点 |
| :--- | :--- | :--- |
| **本の説明** | 文字入力 | 書籍の概要。 |
| **著者名** | 文字入力 | 著者名または執筆者名。 |
| **メールアドレス** | 文字入力 | 連絡用メールアドレス。 |
| **ライセンス** | 選択式 | 著作物のライセンス体系を選択。 <br>（例: MIT, MPL-2.0, Unlicense, WTFPL, X11, Zlib, UNLICENSED） |
| **テーマ** | 選択式 | 書籍のレイアウトやデザインを決定するテーマを選択。 |


:::details 選択可能な主要テーマ（2025/11/11時点）
  * `@vivliostyle/theme-base`: Vivliostyleテーマの基盤となるベーステーマおよびCSSツールキット
  * `@vivliostyle/theme-techbook`: 技術同人誌（Techbook）の執筆に特化したテーマ
  * `@vivliostyle/theme-academic`: 学術的な文書作成に適したテーマ
  * `@o2project/vivliostyle-theme-o2project`: O2 Project向けのVivliostyleテーマ
  * `@mitsuharu/vivliostyle-theme-noto-sans-jp`: フォントをNoto Sans JPなどに設定するテーマ（他のテーマとの併用が必須）
  * `vivliostyle-theme-macneko-techbook`: Techbook向けのVivliostyleテーマ
:::