---
title: "Golang × WebAssembly超入門：たった数ステップで動かすサンプル"
emoji: "✨"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["Go", "WebAssembly", "フロントエンド"]
published: true
---
# はじめに
この記事では **GolangでWebAssembly (WASM) を動かす最小構成のサンプル** を紹介します。

対象読者は以下の方を想定しています。
- Goは触ったことがあるがWASMは初めて
- Goのコードをブラウザ上で動かしてみたい
- まずは簡単に試してみたい

最終的に 「**ブラウザのボタンをクリックし、Goの関数を呼び出し、メッセージを表示する**」 ところまで体験できます。

# WebAssembly (WASM)とは
WebAssembly (WASM) は、**ブラウザ上で動作する高速なバイナリフォーマット**です。
JavaScript以外の言語で書いた処理をWeb上に持ち込むことができるため、次のようなメリットがあります。

- 計算処理を高速化できる
- 既存のライブラリ資産を活用できる
- 型安全に保守しやすい

Go言語は標準でWASMターゲットをサポートしているため、特別なツールなしでビルドできます。

# GolangはWASMにビルドできる
Goのビルドはとてもシンプルで、Windowsは次のようにしてビルドします。

1. 環境変数 `GOOS=js` `GOARCH=wasm` を設定
2. `go build` でバイナリを作成
3. `wasm_exec.js` を同じディレクトリに置いてブラウザでロード

ブラウザで `wasm_exec.js` がGoのランタイムを提供し、JavaScriptからGo関数を呼び出せます。

# 実行環境
本記事の手順は以下の環境で確認しました。

- OS: Windows 10
- Go: 1.22.x
- Python: 3.x
- ブラウザ: Chrome最新版

他のOSでもほぼ同じ手順で動きます。

# Hello Worldをやってみよう
ここから、実際にサンプルを作ります。
フォルダ構成は次のようになります。

```
.
├── index.html
├── main.go
├── main.wasm         # ビルド後に生成される
├── wasm_exec.js      # Go標準ランタイムJS
```

## 1. Goプログラムの用意
`main.go`を作成し、以下を記述します。

```go
package main

import (
	"syscall/js"
)

func main() {
	c := make(chan struct{}, 0)

	// greet関数を定義
	greet := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		name := args[0].String()
		message := "Hello, " + name + "!"
		println(message)
		return js.ValueOf(message)
	})

	// JSグローバルオブジェクトに登録
	js.Global().Set("greet", greet)

	<-c // 終了しないようにブロック
}
```

## 2. プログラムをビルド
コマンドプロンプトで以下を実行します。

```powershell
# PowerShell
$env:GOOS="js"
$env:GOARCH="wasm"
go build -o main.wasm

# or 

# cmd
set GOOS=js
set GOARCH=wasm
go build -o main.wasm main.go
```

`main.wasm` が生成されます。

## 3. GoランタイムJSの用意
`wasm_exec.js` を同じディレクトリにコピーします。
`wasm_exec.js`は基本的に、Golangのフォルダ内にある`\misc\wasm`フォルダ内にあります。

```
# 例
C:\Go\misc\wasm\wasm_exec.js
```

Goのバージョンに対応するファイルを使ってください。

## 4. HTMLの用意
`index.html` を作成し、以下を記述します。

```HTML
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Go WASM Example</title>
  </head>
  <body>
    <h1>Go WebAssembly Example</h1>
    <button id="btn">Greet</button>
    <div id="output"></div>
    <script src="wasm_exec.js"></script>
    <script>
      const go = new Go();

      WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then(result => {
        go.run(result.instance);

        document.getElementById("btn").addEventListener("click", () => {
          const message = greet("Gopher");
          document.getElementById("output").textContent = message;
        });
      });
    </script>
  </body>
</html>
```

## 5. サーバーを立てる
ローカルファイルで開くと動かないため、簡易HTTPサーバーを立てます。

Pythonを使う場合:
```powershell
python -m http.server 8080
```
ブラウザで以下にアクセスします。

```
http://localhost:8080/
```
「Greet」ボタンをクリックすると、Hello, Gopher! が表示されます。
![実行結果](/images/articles/tech-golang-wasm_beginner/2.png)
*ボタンを押した結果*

# トラブルシューティング
**WASMファイルがロードできない**
- サーバーを立てずに開いている
- `wasm_exec.js` が同じフォルダにない
- ファイル名の綴りに誤りがある

**関数が呼べない**
- `js.Global().Set()` の記述が正しいか確認
- コンソールにエラーメッセージが出ていないか確認

# サンプルリポジトリ
今回のサンプルコードは以下に置いてあります。

https://github.com/ayano-yuki/HelloWasm/tree/main

# Tips
- Goのバージョンを上げたときはwasm_exec.jsも更新する
- GOOS GOARCHの設定は毎回忘れやすいので注意
- instantiateStreaming()は古いサーバーだと動かないことがあるため、必要に応じてfetch + instantiateを使う

# おわりに
GoのWASMサポートはとてもシンプルで、わずか数ステップでブラウザで動作させられます。
このサンプルをベースに、ロジックの拡張やUIとの連携にチャレンジしてみてください。
