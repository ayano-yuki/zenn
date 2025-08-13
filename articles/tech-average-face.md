---
title: "顔を混ぜる技術 ― 平均顔生成のアルゴリズム解説"
emoji: "😸"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [Python, OpenCV, 画像処理, アルゴリズム]
published: false
---
# はじめに
「平均顔」って聞いたことありますか？
これは、たくさんの顔を重ね合わせて作る、一つの“**平均的な顔**”のことです。

この記事では、PythonとOpenCVを使って、そんな平均顔をどうやって作るかを解説します。
顔処理に興味がある人はぜひチェックしてみてくださいね！

# 平均顔とは
平均顔とは、複数の個別の顔画像から共通する特徴を抽出し、それらを統合して作られた「合成された顔画像」のことを指します。具体的には、たくさんの顔のパーツ（目・鼻・口など）の位置や形を揃え、それぞれの対応する部分の情報を平均化することで、全体として一つの顔として表現します。

この「平均」というのは、単に画像を重ねるだけでなく、顔の特徴点を正確に合わせて形状や表情のズレを補正した上で平均化するため、自然でリアルな顔が生成されます。つまり、複数の顔の特徴が調和して一つの理想的な顔ができあがるイメージです。

心理学の研究によると、この平均顔は多くの人が「魅力的」と感じる傾向があります。これは平均顔が、顔の非対称や不規則な特徴を打ち消し、バランスの取れた顔の形を示すためと考えられています。

# 平均顔生成の全体フロー
平均顔を作るには、以下のステップを順に実行します。本記事のコードもこの流れに沿って実装しています。

1. **顔画像の収集**  
   平均化したい人物群の顔画像を集めます。解像度や顔の向きが揃っていると後の処理が安定します。

2. **顔ランドマーク検出（特徴点の取得）**  
   dlibの「68点ランドマークモデル」を使い、目・鼻・口・輪郭などの座標を検出します。  
   これらの点は位置合わせや変形の基準になります。

3. **画像のリサイズとスケーリング**  
   すべての画像を共通のサイズ（例：600×600）にリサイズし、ランドマーク座標も同じ倍率でスケーリングします。こうすることで後の合成が正確になります。

4. **Delaunay三角形分割を用いた位置合わせ（局所変形）**  
   平均ランドマーク形状を計算し、その上でDelaunay分割を行います。各三角形領域ごとにアフィン変換を適用し、形状の違いを補正します。

5. **ピクセルごとの平均化**  
   位置合わせ後の全画像を足し合わせ、枚数で割って各画素の平均値を求めます。これにより滑らかな平均顔が得られます。

6. **出力と仕上げ**  
   計算結果を整数型の画像に変換し、必要に応じて色補正やトリミングを行って保存します。

# 顔画像の前処理
平均顔生成の精度は、入力する顔画像の前処理で大きく変わります。ここでは、本記事のコードで行っている前処理手順を解説します。

1. **顔検出：dlibのHOGベース検出器を利用**  
   dlibが提供するHOG（Histogram of Oriented Gradients）ベースの顔検出器を使用します。  
   画像内から顔領域を検出し、処理対象を限定します。

2. **ランドマーク検出：dlibの68点モデル**  
   検出された顔領域に対して、dlibの「shape_predictor_68_face_landmarks.dat」を用いて68点の特徴点（目・鼻・口・輪郭など）を取得します。  
   これらの座標は位置合わせやDelaunay分割の基準になります。

3. **画像のリサイズとランドマーク座標のスケーリング**  
   全ての画像を共通サイズ（例：600×600）にリサイズし、それに合わせてランドマーク座標もスケーリングします。  
   これにより異なる解像度やアスペクト比の画像でも正しく重ね合わせができます。

4. **顔検出失敗時の処理**  
   顔検出やランドマーク検出に失敗した場合は、その画像をスキップします。  
   無理に処理を続けると平均顔に歪みやノイズが生じるためです。

# 位置合わせ（Alignment）の仕組み
平均顔生成では、単純に画像を重ねるだけでは目や口の位置がずれてしまい、不自然な結果になります。  
そこで、顔の形状を揃えるために位置合わせ（Alignment）を行います。

1. **顔の特徴点を基準に平均形状を算出**  
   すべての顔画像から取得したランドマーク（68点）を平均化し、基準となる「平均形状」を作ります。  
   この形状に全ての顔を変形して合わせます。

2. **Delaunay三角形分割とは何か**  
   平均形状の特徴点を三角形に分割する手法です。  
   Delaunay分割は、どの三角形の外接円にも他の点が含まれないように分割され、局所変形時の歪みを最小限にできます。

3. **各画像の三角形ごとにアフィン変換をかける局所ワーピング**  
   各三角形を基準に、元画像の対応する三角形をアフィン変換して平均形状の三角形に合わせます。  
   これをすべての三角形について行うことで、顔全体の形状を自然に整えられます。

4. **`warp_triangle`関数の説明と役割**  
   - 三角形の領域を切り出す  
   - アフィン変換を適用して変形  
   - マスクで合成先の三角形領域に貼り付ける  
   この関数が、三角形単位での局所的な位置合わせの中核を担います。

5. **防御的な境界チェックの重要性**  
   画像外の座標や幅・高さがゼロの領域が発生する場合があります。  
   これらを無視せず処理するとエラーや画質劣化の原因になるため、コード中で範囲外やサイズ不正をチェックしています。

# ピクセルごとの平均化
位置合わせが終わったら、すべての画像を重ねて平均顔を作ります。ここでは、画素（ピクセル）単位での平均化処理を行います。

1. **全画像のワープ後画像を合成**  
   各入力画像を平均形状にワープした後、同じ配列サイズの画像として加算していきます。  
   これにより、全画像の対応する位置の画素値を蓄積できます。

2. **各画素値の単純平均を計算**  
   蓄積した画素値を、画像枚数で割ることで平均値を算出します。  
   この単純平均により、全員の特徴がほどよくブレンドされた「平均顔」が得られます。

3. **出力画像の型変換とクリッピング処理**  
   平均計算の中間結果は浮動小数（`float32`）ですが、画像として保存するために `uint8` に変換します。  
   この際、計算誤差で発生する0未満や255超の値は、`np.clip` で0〜255の範囲に収めます。

# 実装例：Pythonで平均顔を作る
ここでは、実際にPythonを使って平均顔を生成するコード例を紹介します。  
今回の実装では、以下の主要ライブラリを利用します。

- **OpenCV** (`cv2`)：画像処理全般（読み込み、変換、描画など）
- **dlib**：顔検出とランドマーク検出
- **NumPy**：配列演算や座標処理
- **SciPy**（`scipy.spatial.Delaunay`）：Delaunay三角形分割の計算

## 主な関数

- **`get_landmarks(image)`**  
  顔検出とランドマーク検出を行い、68個の特徴点座標を返します。  
  顔が検出できなかった場合は `None` を返すようになっています。

- **`apply_affine_transform(src, src_tri, dst_tri, size)`**  
  3点の対応関係からアフィン変換行列を求め、元の三角形領域を新しい位置へ変形します。

- **`warp_triangle(img1, img2, t1, t2)`**  
  三角形領域を切り出してワープし、合成先の画像に貼り付けます。  
  境界外やサイズ不正を避けるため、防御的なチェックを行っています。

- **`calculate_average_face(images, landmarks_list, output_size)`**  
  - 平均形状を求めてDelaunay分割  
  - 各画像を三角形単位でワープ  
  - ワープ結果を加算し、最後に平均化して平均顔画像を返します。

## プログラム
今回の平均顔生成は以下の構成で実装します。

```
./
├── images/ # 入力画像（正面の顔写真）
│ ├── 1.jpg
│ ├── 2.jpg
├── average_face_delaunay.py # メインスクリプト
├── shape_predictor_68_face_landmarks.dat # dlibの顔ランドマークモデル
├── Dockerfile # Docker設定
```

以下が実装例です。  
Delaunay三角形分割とアフィン変換を用いて、複数の顔画像を平均化します。

```python
import cv2
import dlib
import numpy as np
import os
from glob import glob
from scipy.spatial import Delaunay

PREDICTOR_PATH = "shape_predictor_68_face_landmarks.dat"
IMAGE_DIR = "images"
OUTPUT_SIZE = (600, 600)

# 顔検出器
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(PREDICTOR_PATH)

def get_landmarks(image):
    faces = detector(image, 1)
    if len(faces) == 0:
        return None
    return np.array([[p.x, p.y] for p in predictor(image, faces[0]).parts()])

def apply_affine_transform(src, src_tri, dst_tri, size):
    warp_mat = cv2.getAffineTransform(np.float32(src_tri), np.float32(dst_tri))
    return cv2.warpAffine(src, warp_mat, (size[0], size[1]), None, flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)

def warp_triangle(img1, img2, t1, t2):
    r1 = cv2.boundingRect(np.float32([t1]))
    r2 = cv2.boundingRect(np.float32([t2]))

    # 防御チェック：範囲外やサイズ0の矩形を無視
    h, w = img1.shape[:2]
    if (r1[0] < 0 or r1[1] < 0 or r1[0]+r1[2] > w or r1[1]+r1[3] > h or
        r2[0] < 0 or r2[1] < 0 or r2[0]+r2[2] > w or r2[1]+r2[3] > h or
        r1[2] <= 0 or r1[3] <= 0 or r2[2] <= 0 or r2[3] <= 0):
        return

    t1_rect = [(t1[i][0] - r1[0], t1[i][1] - r1[1]) for i in range(3)]
    t2_rect = [(t2[i][0] - r2[0], t2[i][1] - r2[1]) for i in range(3)]

    img1_rect = img1[r1[1]:r1[1]+r1[3], r1[0]:r1[0]+r1[2]]
    if img1_rect.size == 0:
        return

    size = (r2[2], r2[3])
    warped = apply_affine_transform(img1_rect, t1_rect, t2_rect, size)

    mask = np.zeros((r2[3], r2[2], 3), dtype=np.float32)
    cv2.fillConvexPoly(mask, np.int32(t2_rect), (1.0, 1.0, 1.0), 16, 0)

    img2[r2[1]:r2[1]+r2[3], r2[0]:r2[0]+r2[2]] *= (1 - mask)
    img2[r2[1]:r2[1]+r2[3], r2[0]:r2[0]+r2[2]] += warped * mask

def calculate_average_face(images, landmarks_list, output_size=OUTPUT_SIZE):
    average_points = np.mean(np.array(landmarks_list), axis=0)
    subdiv = Delaunay(average_points)
    average_image = np.zeros((output_size[1], output_size[0], 3), dtype=np.float32)

    for i in range(len(images)):
        img = np.float32(images[i])
        img_warped = np.zeros_like(average_image)

        for tri in subdiv.simplices:
            t1 = [landmarks_list[i][j] for j in tri]
            t2 = [average_points[j] for j in tri]
            warp_triangle(img, img_warped, t1, t2)

        average_image += img_warped

    average_image /= len(images)
    return np.uint8(np.clip(average_image, 0, 255))

# メイン処理
images = []
landmarks_list = []
for file in glob(os.path.join(IMAGE_DIR, "*.jpg")):
    img = cv2.imread(file)
    if img is None:
        continue

    lm = get_landmarks(img)
    if lm is None:
        print(f"スキップ（顔検出失敗）: {file}")
        continue

    # 画像とランドマークをスケーリングして統一
    h, w = img.shape[:2]
    resized_img = cv2.resize(img, OUTPUT_SIZE)
    scale_x = OUTPUT_SIZE[0] / w
    scale_y = OUTPUT_SIZE[1] / h
    lm_scaled = np.array([[int(x * scale_x), int(y * scale_y)] for (x, y) in lm])

    images.append(resized_img)
    landmarks_list.append(lm_scaled)

if images:
    avg_face = calculate_average_face(images, landmarks_list)
    cv2.imwrite("average_face_delaunay.jpg", avg_face)
    print("✅ average_face_delaunay.jpg を出力しました")
else:
    print("⚠ 顔が検出できる画像が見つかりませんでした。")
```

自身の環境を汚したくない場合は、以下のDockerfileをお使いください。

```Docker
FROM python:3.10-slim

# システムパッケージのインストール（dlib用ビルド環境とOpenCV依存）
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libboost-all-dev \
    libopenblas-dev \
    libx11-dev \
    libgtk-3-dev \
    libgl1-mesa-glx \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ
WORKDIR /app

# 必要ファイルをコピー
COPY average_face_delaunay.py .
COPY shape_predictor_68_face_landmarks.dat .

# Pythonパッケージインストール
RUN pip install --no-cache-dir numpy opencv-python dlib scipy

# imagesフォルダはボリュームマウント予定なのでコピーしない

CMD ["python", "average_face_delaunay.py"]
```

ビルドコマンドと実行コマンドは以下の物です。
```
# ビルド
docker build -t average-face .

# 実行
docker run --rm -v ${PWD}\images:/app/images -v ${PWD}:/app average-face
```

# 実践時のポイント・注意点
平均顔生成を行う際には、以下のポイントを押さえておくと品質が向上します。

1. **入力画像のサイズや顔向きの均一化**  
   - 解像度やアスペクト比が異なる画像を混ぜると歪みやブレが発生します。  
   - 顔の正面向き（frontal）写真を揃えることで位置合わせ精度が向上します。

2. **ランドマーク検出の精度と失敗対策**  
   - 照明条件や表情によって検出精度が低下する場合があります。  
   - 顔検出に失敗した画像は処理から除外する仕組みを入れると安定します。

3. **三角形分割の安定性**  
   - Delaunay分割はランドマークの配置に依存するため、平均形状を基準に行うのが安定的です。  
   - 個別画像で分割しないことで、全画像で三角形の対応関係が一致します。

4. **出力画像の色味調整（必要に応じて）**  
   - 入力画像のライティング差により、平均顔の色味がくすむことがあります。  
   - ヒストグラム正規化や色補正を行うと見栄えが良くなります。

# 応用例
平均顔生成は、単なる画像合成の面白さだけでなく、さまざまな応用が可能です。

1. **性別・年齢・地域別平均顔の比較**  
   - 男性・女性別や年齢層別に平均顔を作成し、特徴の違いを可視化できます。  
   - 地域ごとの比較では文化的・遺伝的特徴の分析にも活用できます。

2. **GANなど他手法との組み合わせ**  
   - 平均顔をGAN（Generative Adversarial Networks）の入力や条件情報として利用することで、より自然で高解像度な顔画像を生成可能です。  
   - StyleGANなどと組み合わせれば、平均顔から多様な派生顔を作ることもできます。

3. **美しさ評価への応用**  
   - 平均顔を美的評価モデルに入力し、スコアを計測することで、美的基準との関係を調べられます。  
   - 美容・ファッション業界やマーケティングのデザイン調整にも応用可能です。

# まとめ
本記事では、平均顔生成の原理から実装方法、そして応用例までを紹介しました。

- **平均顔の仕組み**  
  顔画像を位置合わせし、画素ごとに平均化することで特徴がなめらかに統合されます。

- **実装のポイント**  
  ランドマーク検出の精度や、入力画像の均一化が結果の品質を左右します。  
  Delaunay三角形分割による局所変形は自然な位置合わせに効果的です。

- **応用可能性**  
  分類や比較、GANとの統合、美的評価など、多くの分野で活用できます。

平均顔は、単なる「面白い画像生成」にとどまらず、心理学・認知科学・AIの研究にもつながる奥深いテーマです。  
ぜひ、あなたのデータセットやアイデアでオリジナルの平均顔を作ってみてください。

# 付録：なぜ平均顔は美しく見えるのか？科学とAIで読み解く
## 1. 心理学的背景
**アヴェレージング効果**（Averageness Effect）とは、多数の顔を平均化すると美しく見える現象です。これは、極端な特徴や非対称性が打ち消され、バランスの取れた顔になるためです。

進化心理学では、平均顔は**遺伝的多様性**や**良好な健康状態**を示すシグナルとされています。非対称性や特異な特徴は病気や遺伝的変異の可能性を示唆するため、私たちは本能的に、これらの兆候が少ない平均的な顔を魅力的に感じると考えられています。

## 2. 認知科学の視点
脳は顔を認識する際に、過去に見た顔の「プロトタイプ（典型）」を形成します。平均顔はこのプロトタイプに近く、脳にとって認識しやすい顔です。この**プロトタイプ効果**によって、脳は顔を処理する際の負担が少なく、その**処理のしやすさ**が親しみやすさや好感に繋がります。

## 3. AIと美の評価
顔認識AIや美的評価モデルは、顔の**対称性**や**各パーツの配置**といった多くの要素を数値化して評価します。これらの要素が平均顔の持つ特徴と高い相関関係にあるため、AIも平均顔を「美しい」と判断しやすい傾向があります。これは、AIが人間の美の基準に潜む**数学的な規則性**を学習しているためと考えられます。

## 4. 文化差と主観性
美の基準は文化や地域、個人によって異なります。平均顔の「美しさ」はあくまで「健康的で欠点がない」という普遍的な傾向であり、完全に普遍的ではありません。

**人種**や**文化圏**が異なれば、それぞれの「平均的な顔」も異なります。また、**性的二型性**、つまり男性らしさや女性らしさといった特徴も美の評価に影響します。これらの要素は、文化や個人の好みによってその重要性が変動します。したがって、私たちが感じる「美」は、平均顔の普遍的な傾向と文化的・個人的な好みが組み合わさって形成されるものです。