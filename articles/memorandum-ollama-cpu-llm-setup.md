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

たまにGPUがない環境でローカルLLMを使わざるを得なくなるため、その方法をまとめました。本来ならローカルでOllamaを動かす方が良いのですが、今回は**どの環境でも確実かつ簡単に動かすためにDockerの上でOllamaを動かす方法**を紹介します。Dockerを使うことでハッカソンのためだけに環境を汚さず、誰のパソコンでも動くシステム構成に繋がります。

本記事は「Dockerを触ったことがあり、GPUなし環境でLLMを動かしたい人」向けです。

# TL;DL
- GPUなしでも、Ollama + DockerでローカルLLMは実用レベルまで高速化できる
- 高速化のポイントは以下の4つ
  - リソース解放: Docker Desktopのメモリ・CPU割り当てを最大にする。
  - モデル選定: 「パラメータ数」と「量子化サイズ」を考慮したモデル選定をする。
  - 最適化: compose.yaml でメモリのスワップを防止し、パフォーマンスを安定させる。
  - UX改善: ストリーミングモードを活用し、1文字目が出るまでの待ち時間を削る。

# GPUが無い環境でローカルLLMを動かす「Ollama」とは？

Ollamaとは、**様々なLLMをWindows、Mac、Linuxのローカル環境で簡単にダウンロード、管理、実行できるOSS**です。
このソフトウェアはモデルを量子化して実行する技術に優れており、最新のハイエンドなGPUがなくても、ノートパソコンのCPUとメモリをうまく活用し、推論を行えます。（量子化下とは言え、GPUの速さには劣ります。）

内部的には、Ollamaは `llama.cpp` をエンジンとして採用しており、`GGUF` という形式に最適化されたモデルを使用しています。この形式は、重みを効率的に圧縮する「量子化」だけでなく、CPUの命令セット（AVX2やAVX-512など）を最大限に活用し、メモリをVRAMの代わりに用いることで、専用ハードウェアのない環境でも粘り強い推論を実現しています。

OllamaがサポートしているLLMは沢山あるので、使いたい物があるかがしたい方は下記のサイトで使いたいモノを探してみてください。

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

前章の構成でも動くLLMは構築できますが、CPUで動かす都合上どうしても処理の遅さが出てきます。例えば、一般的なビジネスノートPCで標準的なモデルを動かすと、生成速度は「1秒間に数文字」程度にまで落ち込みます。人間が文章を読むスピードに追いつかず、短いメールの返信案を作成させるだけでも、コーヒーを淹れに行けるほどの待ち時間が発生してしまうのが現実です。

そのためになるべく処理を早くするための方法をまとめます。

## 1. Docker Desktopのリソース割り当てを最大化

Dockerはパソコンの一部のリソース上で動作させるため、Dockerが使用できるリソースを増やすことで、計算量を増やし、高速化に繋がります。これはメモリやCPUが潤沢な環境で効果が出やすい方法で、Docker DesktopのSettings > Resources から、設定できます。

<画像>

## 2. 軽量なモデルの選定

ローカルLLMのパフォーマンスは、モデルの「パラメータ数」と「量子化サイズ」に大きく依存します。CPU駆動の場合、どんなに優れたアルゴリズムを使っても物理的なメモリ帯域がボトルネックになるため、これらを考慮したモデル選びが重要になります。

### パラメータ数の見方

モデル名の後ろにある 1.5b や 8b という数字はパラメータ数（約15億、80億個）を表しています。CPU環境では、パラメータ数が大きくなるほどメモリとのデータのやり取りが増え、生成速度が目に見えて低下します。Geminiに質問しつつ、実際に手元のノートPC（16GB RAM）で試した体感も含めると、下記の表のようになりそうです。

最近のLLMは進化が凄まじく、3b（30億パラメータ）クラスでも、1年前の巨大なモデルに匹敵する性能を持っています。そのためまずは、3b前後のモデルを動かしてみて、速度が足りなければサイズを下げ、賢さが足りなければサイズを上げる、とモデル選定はしやすかったです。

| パラメータ数 | 推奨メモリ | CPUでの体感速度 | 主なユースケース |
|-------------|------------|----------------|------------------|
| 0.5B - 1.5B | 8GB以下 | 高速（1秒間に15〜30文字程度） | 翻訳、要約、RAGの動作確認 |
| 3B - 4B | 8GB - 16GB | 実用的（1秒間に5〜10文字程度） | 記事執筆、シンプルなコード生成 |
| 7B - 9B | 16GB以上 | 低速（1秒間に2〜4文字程度） | 複雑な論理推論、高度な指示 |

### 量子化（Quantization）の見方

量子化は、モデルの重みを圧縮することで、メモリ消費量を元のサイズの約1/4まで抑えつつ、精度を維持する技術です。Ollamaは GGUF 形式を採用しており、デフォルトで 4-bit量子化されたモデル（q4_0 や q4_K_M等）を優先的に利用できます。

さらに軽量化して高速にしたい場合は、より圧縮率の高いタグ（q2_K など）を指定することも可能ですが、ビット数を下げすぎると回答の整合性が崩れるリスク（日本語が不自然になる等）があります。そのためまずは、標準の4-bitで試し、速度に満足できない場合にのみ、より小さい量子化サイズを検討するといいかもしれません。

## 3. Docker構成の最適化

Dockerコンテナとホスト間のやり取りをスムーズにし、処理の遅延を抑えてレスポンスを高速化するために、 `compose.yaml` を最適化します。

パフォーマンスを最大限に引き出すための主な修正内容は以下の通りです。
| 設定項目 | 設定値（例） | 最適化の効果と目的 |
|---------|--------------|------------------|
| ulimits (memlock) | -1 (unlimited) | メモリのスワップ（HDD/SSDへの書き出し）を防止します。データを高速な物理メモリ上に固定することで、ディスクI/Oによる遅延を排除し、推論速度を安定させます。 |
| mem_swappiness | 0 | Linuxカーネルに対し、可能な限り物理メモリを使用するよう強制します。物理メモリに余裕がある限りスワップを発生させないため、パフォーマンスの低下を防ぎます。<br><br>※mem_swappiness は、Docker Composeのバージョンや環境によって sysctls 下での記述が必要な場合があります。 |
| ネットワークモード | network_mode: "host" | コンテナのネットワーク抽象化層（ブリッジ）をバイパスします。API経由で大量のデータをやり取りする際、通信のオーバーヘッドを削減し、応答速度を改善します（※Linux環境限定）。 |

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama-docker
    # network_mode: "host" # Linux環境で通信速度を極限まで高める場合に有効化
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    deploy:
      resources:
        reservations:
          cpus: '0.000' 
    mem_swappiness: 0
    ulimits:
      memlock: -1
      stack: 67108864
```

## 4. APIレスポンスのパース

APIレスポンスをパースすることで処理の遅延感を減らし、ユーザーから見た高速化が出来ます。

ollamaでは、APIリクエストの**stream（ストリーミングモード）**を活用し、ローカルLLMが生成したテキストをリアルタイムで1文字ずつ画面に流し込むことで、APIレスポンスをパースできます。さらに、 `jq` を使って、JSONの塊の中から「必要な文字だけ」を即座に抜き出し、改行せずに表示し続けることができます。

通常、`stream: false` の場合は、LLMがすべての回答を生成し終わるまで待機（数秒〜数十秒）が発生します。 しかし、ストリーミングを `jq` でリアルタイム処理すると：最初の1文字目までの待ち時間（TTFT）が極限まで短くなり、全体の処理時間は同じでも、ユーザーは「読みながら待てる」ため、体感速度が劇的に向上します。また、一度に受け取る情報量が減り、メモリ消費も抑えられ、巨大なレスポンスも処理しやすくなります。

```bash
# Windows
$url = "http://localhost:11434/api/generate"
$body = @{
    model  = "qwen2.5:0.5b"
    prompt = "Hello"
    stream = $true
} | ConvertTo-Json

# HttpClientの準備
$client = New-Object System.Net.Http.HttpClient
$content = New-Object System.Net.Http.StringContent($body, [System.Text.Encoding]::UTF8, "application/json")

# リクエスト送信（非同期ストリームを開始）
$response = $client.PostAsync($url, $content).Result
$stream = $response.Content.ReadAsStreamAsync().Result
$reader = New-Object System.IO.StreamReader($stream)

# データの逐次読み取り
while (-not $reader.EndOfStream) {
    $line = $reader.ReadLine()
    if ($line) {
        $json = $line | ConvertFrom-Json
        
        # 文章の表示（改行なしで出力）
        Write-Host -NoNewline $json.response
        
        # 終了時に統計情報を表示
        if ($json.done) {
            Write-Host "`n`n[Finish] Time: $($json.total_duration / 1000000000)s"
        }
    }
}

# リソース解放
$reader.Close()
$client.Dispose()
```

```bash
# Mac or Linux
curl -N http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:0.5b",
  "prompt": "Hello",
  "stream": true
}' | stdbuf -oL jq -r --unbuffered '.response' | tr -d '\n'


# 生成速度などの情報が欲しい場合
curl -s -N http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:0.5b",
  "prompt": "Hello",
  "stream": true
}' | while read -r line; do
    echo "$line" | jq -r 'if .done then "\n\n[Finish] Time: \(.total_duration)" else .response end' | tr -d '\n'
done
```

## 5. （諦めて）ローカルに直接Ollamaをインストールする

Dockerは仮想化レイヤーを通す関係で、処理の重さが出てきます。そのため、とにかく速度を出したい場合は、ローカルに直接Ollamaをインストールすることが手っ取り早い高速化になります。

Ollamaをローカルに直接インストールする事で、仮想化レイヤーを通さない分、5〜15%程度の速度向上が見込めます。

# おわりに

ハッカソンで使うまではLLM初心者だったので、GPUが無くても一応動くローカルLLMがあることに驚きました。ですが、GPUがないと遅すぎて使い物にならないので高速化は必須で、今後の発展に要期待です。