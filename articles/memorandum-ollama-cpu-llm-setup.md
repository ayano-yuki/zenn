---
title: "GPUが無い環境でローカルLLMを動かす方法"
emoji: "📓"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [llm, ollama]
published: false
---
# はじめに

こんにちは！
ハッカソンでGPUがないノートパソコンで、ローカルLLMを動かすことに苦戦したアヤノです。

たまにGPUがない環境でローカルLLMを使わざる得なくなるため、その方法をまとめました。
本来ならローカルでOllamaを動かす方が良いのですが、今回は**どの環境でも確実かつ簡単に動かすためにDockerの上でOllamaを動かく方法**を紹介します。Dockerを使うことでハッカソンのためだけに環境を汚さず、誰のパソコンでも動くシステム構成に繋がります。

本記事は「Dockerを触ったことがあり、GPUなし環境でLLMを動かしたい人」向けです。

# TL;DL
- 

# GPUが無い環境でローカルLLMを動かす「Ollama」とは？

Ollamaとは、**様々なLLMをWindows、Mac、Linuxのローカル環境で簡単にダウンロード、管理、実行できるオープンソースのソフトウェア**です。
このソフトウェアはモデルを量子化して実行する技術に優れており、最新のハイエンドなGPUがなくても、ノートパソコンのCPUとメモリをうまく活用し、推論を行えます。（量子化下とは言え、GPUの速さには劣ります。）

内部的には、Ollamaは `llama.cpp` をエンジンとして採用しており、`GGUF` という形式に最適化されたモデルを使用しています。この形式は、重みを効率的に圧縮する「量子化」だけでなく、CPUの命令セット（AVX2やAVX-512など）を最大限に活用し、メモリをVRAMの代わりに用いることで、専用ハードウェアのない環境でも粘り強い推論を実現しています。

OllamaがサポートしているしているLLMは沢山あるので、使いたい物があるかがしたい方は下記のサイトで使いたいモノを探してみてください。

https://ollama.com/search

# 環境構築（Docker）

さっそく、OllamaのDocker環境を構築しましょう。
初めは、OllamaのDocker環境となる `compose.yaml` を用意します。

```yaml
# compose.yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama-docker
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama

volumes:
  ollama-data:
```

`compose.yaml` が用意できたら、下記のコマンドで、Docker環境を立ち上げます。

```bash
docker compose up
```

Docker環境を立ち上げたら、使用するモデルのダウンロードを行います。
今回は、ハッカソンでお世話になった `qwen2.5:0.5b` を使います。

```bash
docker exec -it ollama-docker ollama pull qwen2.5:0.5b
```

これで、Docker環境でOllamaを用いたLLMが構築できました。
LLMが動いているかの動作確認は下記のコマンドで行い、問題なく動いている事が確認出来たらあとは自由に使うだけです。

```bash
# windows
$body = @{
  model  = "qwen2.5:0.5b"
  prompt = "Hello"
  stream = $false
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:11434/api/generate `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

```bash
# Mac or Linux

curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:0.5b",
  "prompt": "Hello",
  "stream": false
}'
```

LLMなので返答は固定ではありませんが、下記のような内容が返ってきたら問題ないです。

```
<試してから書く>
```

# 高速化

前章の構成でも動くLLMは構築できますが、CPUで動かす都合上どうしても処理の遅さが出てきます。
例えば、一般的なビジネスノートPCで標準的なモデルを動かすと、生成速度は「1秒間に数文字」程度にまで落ち込みます。人間が文章を読むスピードに追いつかず、短いメールの返信案を作成させるだけでも、コーヒーを淹れに行けるほどの待ち時間が発生してしまうのが現実です。

そのためになるべく処理を早くするための方法をまとめます。

## 1. Docker Desktopのリソース割り当てを最大化

Dockerはパソコンの一部のリソース上で動作させるため、Dockerが使用できるリソースを増やすことで、計算量を増やし、高速化に繋がります。これはメモリやCPUが潤沢な環境で効果が出やすい方法で、Docker DesktopのSettings > Resources から、設定できます。

<画像>

## 2. 軽量なモデルの選定

ローカルLLMのモデルは、～（良い感じに書く）


## 3. Docker構成の最適化



## 4. APIレスポンスのパース



## 5. （諦めて）ローカルに直接Ollamaをインストールする

Dockerは仮想化レイヤーを通す関係で、処理の重さが出てきます。
そのため、とにかく速度を出したい場合は、ローカルに直接Ollamaをインストールすることが手っ取り早い高速化になります。

Ollamaをローカルに直接インストールする事で、仮想化レイヤーを通さない分、5〜15%程度の速度向上が見込めます

# まとめ

