---
title: "アルゴリズム完全に理解したのメモ"
emoji: "📓"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["アルゴリズム"]
published: true
---
# はじめに
この記事は、「このアルゴリズムは、完全に理解した」となった時のメモ書きです（半永久的に更新する）。

:::message alert
ここに書いている内容は私の解釈なので、間違っている可能性があります。
:::

# imos法（いもす法）
Imos法（いもす法）は、特定の区間に対して連続的に行う累積和を効率的にするアルゴリズムです。これを使うと計算量がO(N+Q)[^1]となりますが、ある方向にだけ累積和を行っているので、MASみたいな双方向で影響を与える累積和の場合だと使えないかもです（いつか検証したい）。

## アルゴリズム
1. 連続的な累積和を行う配列arrと、arrの長さ+1の大きさの累積和管理用配列diffを用意する
2. diffに対して、累積和を行う区間iの開始位置にNを加算し、停止位置にNを減算する
   - N：区間に対して行う累積和
   - 開始位置と停止位置に行ったこの処理で、ループで加算減算した時と同じ結果が得られる！
3. diff[i+1]にdiff[i]を足す算
   - これのおかげで、停止位置まで来ると、開始位置に行った加算を打ち消す
4. arr[i+1]にdiff[i+1]を足す
5. 2に戻り、累積和を続ける

![imos](/images/articles/memorandum-algorithm_completely_understand/imoshou.png)
*imos法のアルゴリズム*

:::details プログラムの例
通常は、特定の区間に大して連続で累積和を行う場合は、以下のようになります。この例だと、計算量がO(Q*N)となり、膨大になります。
```python
arr = [1, 2, 3, 4, 5]
n = len(arr)

# 通常の連続的な累積和
for i in range(n):
    current_sum = 0
    for j in range(i+1):
        current_sum += arr[j]
    arr[i] = current_sum

print(*arr) # 1 3 7 15 31
```

imos法を使うと以下のようになり、計算量がO(N+Q)と大幅に減ります。
```python
arr = [1, 2, 3, 4, 5]
n = len(arr)

# imos法
diff = [0]*(n+1)
for i, num in enumerate(arr):
    diff[i+1] += num
    diff[n] -= num
    diff[i+1] += diff[i]
    if i+1 < n:
        arr[i+1] += diff[i+1]

print(*arr) # 1 3 7 15 31
```
:::

## 重要な点
- 繰り返し処理で累積和をするのではなく、開始地点と終了地点に加算・減算する
- 今の累積和の結果を次の累積和に加算する



[^1]: 累積和の回数がQ、配列長がNです。