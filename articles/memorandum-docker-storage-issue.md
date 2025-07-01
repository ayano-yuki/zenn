---
title: "Windows＋Docker開発でパソコンの容量が100GBの圧迫！その原因と解決法"
emoji: "📓"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [Docker, windows]
published: true
---
# はじめに
Dockerで呑気に開発していたら、いつの間にか100GBも占領されていたアヤノです。

Dockerは、ローカル環境を汚さず、どこでも・いつでも同じ開発環境を再現できる、とても便利なツールです。しかし、**その内部でどんなデータがどのように保存されているか**を正しく理解していないと、パソコンの容量がじわじわと圧迫され、気づいたときには「Cドライブが真っ赤！」なんてことになります。特にWindowsユーザーの場合、DockerはWSLを通して動作しているケースが多く、容量を開放するのがちょっと面倒です。

この記事では、「なぜDockerが容量を圧迫するのか？どう対処すればいいのか？」を解説していきます。

# TL;DR
- Dockerは便利だけど、使い続けるとWSL2の仮想ディスクが **勝手に巨大化** する  
- `docker system prune -a --volumes` で不要データは削除できるが、**仮想ディスクの物理サイズは自動で縮小されない**  
- Windowsのディスク容量を本当に空けるには、**仮想ディスクを手動で最適化（トリム）** する必要がある
- 今後のために、**こまめな削除・ホストマウント・自動化** など予防策も大切

# なぜDockerでストレージが死ぬのか？
Dockerは開発環境を簡単に構築できますが、大量のデータをWSL2の仮想ディスク（`.vhdx`ファイル）内に保存しています。保存している主なモノとしては、以下の3つがあります。DockerのコマンドやGUI操作によってこれらのデータを削除できます。

| 項目          | 内容の説明                               |
|---------------|----------------------------------------|
| **Dockerイメージ** | コンテナの元となるファイル群　| 
| **コンテナ**       | 実際に動いている、あるいは停止中のアプリケーションの実態　| 
| **ボリューム**     | データベースなどの永続データを保存　|

:::details ディスク使用状況を調べたい
ディスク使用状況をざっくり知るにはこのコマンドが便利です。

```powershell
docker system df

# ex
# >docker system df
# TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
# Images          0         0         0B        0B
# Containers      0         0         0B        0B
# Local Volumes   0         0         0B        0B
# Build Cache     0         0         0B        0B
```
:::

# docker system pruneで仮想ディスクをきれいにする
Dockerのデータを整理するときに使われるのは`docker system prune`です。これは、使われていないコンテナ、ネットワーク、イメージ、キャッシュなどを一括で削除してくれる便利なコマンドです。このコマンドを実行すると、不要なデータが一掃され、パソコンの空き容量が増えることが期待されます。

```sh
docker system prune -a --volumes

# - `-a` オプションは、使用されていないすべてのイメージも削除対象に含めます。  
# - `--volumes` を付けることで、使われていないボリュームもまとめて削除します。
```

また、このコマンドを使わなくてもDocker Desktopで同様な操作ができます。Docker Desktopで行うことにより、どのデータがどれくらい容量を使っているかを視覚的に確認しながら削除でき、コマンド操作に不慣れな方も安心して操作できます。

1. Docker Desktopを開く  
2. 左メニューの「Resources」→「Disk」へ移動  
3. 「Clean / Purge data」や「Prune system」などのボタンがあり、ここから不要なイメージやコンテナ、ボリュームを選択して削除できます

しかし、`docker system prune`をしても、**Windowsのドライブ容量が変化しない**場合があります。

# 上記の対処法でも容量が戻らない理由

前のセクションで紹介した操作は、Docker内部の不要データを削除するには有効ですが、それでもWindowsのディスク容量が大幅に回復しない場合がよくあります。これは、DockerがWindows上でWSL2という仮想環境内で動作しているためです。  

DockerのLinux環境のファイルは、WSL2の仮想ディスクファイル（`ext4.vhdx`）の中に保存されています。この仮想ディレクトリファイルの特徴は以下のようになっております。

- `ext4.vhdx` は一つの大きな仮想ディスクで、Linuxファイルシステム全体を格納しています。  
- 中身のファイルを削除しても、WindowsのホストOS側から見るとこの仮想ディスクファイルのサイズは縮みません。  
- 一度膨らんだ仮想ディスクのサイズは、自動で縮小されない仕様になっています。

そのため、**Dockerの中で不要なファイルを削除しても、WSL2仮想ディスクファイル自体の容量は減らず、結果としてWindowsのドライブ容量に反映されない**のです。

この問題を放置しておくと、Dockerを使い続ける限り仮想ディスクのサイズがどんどん大きくなっていきます。そして、普通のファイル削除の感覚で `docker system prune` を繰り返しても、WSL2仮想ディスクのファイルサイズは減らず、気づいたときには100GBもDockerに占領されます。


# 本当の解決策：WSL2仮想ディスクの手動最適化（Windows Proエディションの場合）
`docker system prune` をいくら実行してもストレージ容量が戻らない原因は、WSL2の仮想ディスク（`.vhdx`）が肥大化しているためです。これを解決するには、「手動で仮想ディスクを最適化（トリム）」する必要があります。以下の手順で、仮想ディスクのサイズを縮小できます。下記のコマンドは全てPowerShellで実行してください。

1. WSL上のDocker関連プロセスをすべて停止する
   ```powershell
   # PowerShell または コマンドプロンプトで以下を実行：

   wsl --shutdown
   ```
2. Optimize-VHD コマンドを使う
   ```powershell
   # PowerShellを「管理者として実行」し、以下のように入力：

   Optimize-VHD -Path "$env:USERPROFILE\AppData\Local\Docker\wsl\data\ext4.vhdx" -Mode full

   # - 「-Path」 の部分は環境によって異なる可能性があるので、必要に応じてパスを確認してください。
   # - このコマンドは Windows の Hyper-V 機能を使うため、Hyper-Vが有効化されている必要があります。
   ```
:::message alert
- PowerShell で `Optimize-VHD` を使うには、Hyper-V を有効にしておく必要があります。
- 最適化中はWSL2やDockerを起動しないようにしましょう。
- 万が一に備えて、`.vhdx` ファイルのバックアップをとっておくと安心です。
:::

:::details Hyper-V が有効か確認する方法
`Optimize-VHD` を使うには、Hyper-Vが有効になっている必要があります。  
以下の手順で確認・有効化できます：

1. [Windowsキー] → 「Windowsの機能の有効化または無効化」と入力して開く  
2. 「Hyper-V」にチェックが入っているか確認  
3. 入っていなければチェックを入れて「OK」→再起動で反映されます
:::

# 本当の解決策：WSL2仮想ディスクの手動最適化（Windows Homeエディションの場合）
※前の方法よりもいい方法を教えてもらったので、変更しました（2025/7/1編集）。

Windows Homeを使っている場合、Hyper-Vマネージャーを使ったvhdxファイルの管理機能が利用できないことがあります。そのため、diskpartコマンドを使ってvhdxファイルの未使用領域を圧縮し、物理ファイルサイズを削減する方法を使用します。この方法では、必要なDockerのデータを保持したまま、論理的に削除済みとなったデータが占有していたディスク領域を物理的に開放できます。

1. 全てのDockerのデータを削除する（Docker DesktopでもOK）
   ```powershell
   docker system prune -a --volumes
   ```
2. Docker Desktopを終了し、WSL全体を停止します。
   ```powershell
   # タスクトレイからDocker Desktopを右クリックし、「Quit Docker Desktop」を押して、Docker Desktopを閉じる

   wsl --shutdown
   ```
3. WSLで動いているDocker関連のディストロ名を確認する
   - この中にある「docker ~」を次の手順のために覚える。
   ```powershell
   wsl -l -v

   # ex
   # > wsl -l -v
   #   NAME              STATE           VERSION
   # * Ubuntu            Running         2
   #   docker-desktop    Running         2
   ```
4. DockerのWSLディストロ(.vhdx) のファイルパスを見つける
   ```powershell
   Get-ChildItem -Path "$env:USERPROFILE\AppData\Local\Docker" -Recurse -Filter *.vhdx

   # 例：C:\Users\<UserName>\AppData\Local\Docker\wsl\disk\docker_data.vhdx
   ```
5. diskpartを使って、未使用領域を圧縮し、物理ファイルサイズを削減する
   ```powershell
   # 管理者権限でPowerShellまたはcmdを開く
   diskpart

   # diskpartプロンプトで以下を実行
   select vdisk file="<4で見つけたパス>"
   attach vdisk readonly
   compact vdisk
   detach vdisk
   exit
   ```
6. Docker Desktop を起動する

:::details 前の方法（かなり危険：Dockerの完全初期化）
1. 全てのDockerのデータを削除する（Docker DesktopでもOK）
   ```powershell
   docker system prune -a --volumes
   ```
2. Docker Desktopを終了し、WSL全体を停止します。
   ```powershell
   # タスクトレイからDocker Desktopを右クリックし、「Quit Docker Desktop」を押して、Docker Desktopを閉じる

   wsl --shutdown
   ```
3. WSLで動いているDocker関連のディストロ名を確認する
   - この中にある「docker ~」を次の手順のために覚える。
   ```powershell
   wsl -l -v

   # ex
   # > wsl -l -v
   #   NAME              STATE           VERSION
   # * Ubuntu            Running         2
   #   docker-desktop    Running         2
   ```
4. DockerのWSLディストロをアンインストール（登録解除）
   ```powershell
   # 「wsl --unregister [ディストロ]」のようにする
   wsl --unregister docker-desktop
   ```
5. 肥大化した .vhdx ファイルの削除
    - 下記のフォルダにある .vhdx を直接削除（または名前変更）します。
      - `C:\Users\<UserName>\AppData\Local\Docker\wsl\disk\docker_data.vhdx`
6. Docker Desktop を起動し、WSL2環境の再生成を待つ
:::


# その他の対策と予防法
仮想ディスクの最適化によって一時的に容量を取り戻すことはできますが、根本的な対策として、普段からストレージが膨らみにくい使い方を心がけることが重要です。ここでは、日常的にできる予防策や注意点を紹介します。

1. 使い終わったコンテナ・イメージ・ボリュームをこまめに削除
    - Dockerを使っていると、実験的なイメージや停止中のコンテナがどんどん溜まっていきます。不要なものは定期的に削除しましょう。
        | 操作内容                     | コマンド                           |
        |------------------------------|------------------------------------|
        | 使っていないコンテナの削除   | `docker container prune`          |
        | 未使用のイメージの削除       | `docker image prune -a`           |
        | 未使用のボリュームの削除     | `docker volume prune`             |

1. Docker Desktopのストレージ使用量を定期チェック
    - Docker Desktopの「Settings > Resources > Disk」から、現在使用しているディスク容量を可視化できます。「Delete unused data」ボタンで安全にクリーンアップも可能です。

1. Dockerボリュームの保存先をホスト側に変える
    - DockerボリュームのデータをWSLの内部ではなく、Windowsのホストディレクトリにマウントすることで、`.vhdx` ファイルの肥大化をある程度抑えることができます。
      - 例）`docker run -v C:\mydata:/var/lib/mysql ... `

1. 自動化スクリプトで定期的なクリーンアップ
    - `docker system prune` を週1で実行するような簡単なバッチファイルを作ってタスクスケジューラで実行するなど、メンテナンスをルーチン化するのも有効です。

# おわりに
Windows＋Docker開発する際はこの辺りに気を付けて、パソコンの容量が過度に圧迫されないようにしてください。また、定期的にパソコン内の掃除をしましょう。私みたいに100GBも圧迫してからの掃除はパソコンの寿命にも悪影響です。

## 参考
- [【最適化・格納先変更】Docker 肥大化したext4.vhdxの対処方法](https://zenn.dev/haretokidoki/articles/49dacc3516c441)
- [Dockerに占領されたディスク領域を解放する方法](https://zenn.dev/motoishimotoi/articles/e5b8a5f29a9e45)