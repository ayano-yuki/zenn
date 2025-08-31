---
title: "Golang初心者がゼロから学ぶ学習記録"
emoji: "🐬"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: [Golang]
published: true
---
# はじめに
ハロハロ～、Golangを諸事情で勉強することになったアヤノです。
この記事は、ゼロからGolangを勉強し、そのアウトプットとして作成しました。
つまり、アヤノのGolangの学習記録です。

※フロントエンド編、Android編、ios編を書くかもです。

# 勉強に使ったサイト
今回の勉強で使ったサイトは以下にあるものです。文法は基本的にA Tour of Goで勉強し、その他のサイトで理解が甘い箇所を補足していくように勉強しました。

- 文法
  - [A Tour of Go](https://go-tour-jp.appspot.com/list)
  - [Effective Go — プログラミング言語 Go ドキュメント v0.1 documentation](http://go.shibu.jp/effective_go.html)
  - [テスト駆動開発でGO言語を学びましょう](https://andmorefine.gitbook.io/learn-go-with-tests)
- コーディングスタイル[^1]
  - [knsh14/uber-style-guide-ja](https://github.com/knsh14/uber-style-guide-ja)
  - [Go Style | styleguide](https://google.github.io/styleguide/go/)

[^1]: 定期的に読み直す必要がありそう

# 文法: Basics
## Imports
プログラム内で使用するパッケージ（ライブラリ）を読み込むために書く。何も使わない場合は書かなくてもOK！
```go
package main

import (
	"fmt"
	"math"
)

func main() {
	fmt.Printf("Now you have %g problems.\n", math.Sqrt(7))
}
```

## Exported names
Goは、読み込んだパッケージの最初の文字が大文字で始まるもの（関数・変数・構造体等の全部）に全てアクセスできる。私のイメージだと、オブジェクト指向のpublicになる条件が「最初が大文字か否か」となる。
```golang
package main

import (
	"fmt"
	"math"
)

func main() {
	fmt.Println(math.Pi) //大文字なので参照できる
}
```

## Functions
関数は、pythonみたいに引数の型と戻り値の型を最後に書く。また、連続で同じ型の引数を書く場合は省略出来たりする。Go特有の文法としては、戻り値に名前をつけることができ、returnの後に書く戻り値を省略できる点がある。業務レベルだと、add関数みたいなデフォルトの書き方が好まれそう。
```go
package main

import "fmt"

func add(x int, y int) int {
	return x + y
}

func swap(x, y string) (string, string) {
	return y, x
}

func split(sum int) (x, y int) {
	x = sum * 4 / 9
	y = sum - x
	return
}

func main() {
	fmt.Println(add(42, 13))
    a, b := swap("hello", "world")
	fmt.Println(a, b)
    fmt.Println(split(17))
}
```
## Variables
変数宣言は、JavaScriptみたいな書き方をする。Goの特有の文法としては、var宣言の省略として`:=`があるが、これは関数内でしか使えないので注意がいる。また、この書き方をすることで、型も省略できる。
```go
package main

import "fmt"

func main() {
	var i, j int = 1, 2
	k := 3
	c, python, java := true, false, "no!"

	fmt.Println(i, j, k, c, python, java)
}
```
goで使える基本型の一覧は以下のようになっている。また、表で使われているゼロ値と言うのは、変数に初期値を与えずに宣言した場合に代入される値のことである。
| 型名         | 説明                                      | ゼロ値 |
|:-----------:|-----------------------------------------|:------:|
| `bool`      | 真偽値（`true` または `false`）         | `false` |
| `string`    | 文字列型                               | `""` （空文字列） |
| `int`       | 符号付き整数（実装依存のサイズ）        | `0` |
| `int8`      | 8ビットの符号付き整数                  | `0` |
| `int16`     | 16ビットの符号付き整数                 | `0` |
| `int32`     | 32ビットの符号付き整数                 | `0` |
| `int64`     | 64ビットの符号付き整数                 | `0` |
| `uint`      | 符号なし整数（実装依存のサイズ）        | `0` |
| `uint8`     | 8ビットの符号なし整数                  | `0` |
| `uint16`    | 16ビットの符号なし整数                 | `0` |
| `uint32`    | 32ビットの符号なし整数                 | `0` |
| `uint64`    | 64ビットの符号なし整数                 | `0` |
| `uintptr`   | ポインタを格納するための整数型          | `0` |
| `byte`      | `uint8` の別名                         | `0` |
| `rune`      | `int32` の別名（Unicode コードポイント） | `0` |
| `float32`   | 32ビットの浮動小数点数                 | `0.0` |
| `float64`   | 64ビットの浮動小数点数                 | `0.0` |
| `complex64` | 実数部と虚数部が `float32` の複素数     | `0 + 0i` |
| `complex128`| 実数部と虚数部が `float64` の複素数     | `0 + 0i` |

## Type conversions
型変換は他の言語と同じように「型（値）」で行う。
```go
package main

import (
	"fmt"
	"math"
)

func main() {
	var x, y int = 3, 4
	var f float64 = math.Sqrt(float64(x*x + y*y))
	var z uint = uint(f)
	fmt.Println(x, y, z)
}
```

## Type inference
型を指定せずに変数を宣言する場合( `:=` や `var =` )は、変数の型は右側の変数から型推論される。
```go
package main

import "fmt"

func main() {
	v := 42
	fmt.Printf("v is of type %T\n", v) #%Tで型が確認できる
}
```

## Constants
定数宣言は、他の言語と同じような書き方をする。定数は、文字、文字列、真偽値、数値のみで使え、`:=`での宣言はできない。
```go
package main

import "fmt"

const Pi = 3.14

func main() {
	const World = "世界"
	fmt.Println("Hello", World)
	fmt.Println("Happy", Pi, "Day")

	const Truth = true
	fmt.Println("Go rules?", Truth)
}
```

## For
Goは、ループ文がFor文だけで、文法自体はCやJavaに近い。Forはセミコロンで3つの部分に区切られており、各区切りが無くても動作する。つまり、区切りなしでも無限ループとして動作します。注意する点は、Go特有の「（）が少ない」がForには適応される点です。
- **初期化ステートメント**: 最初のイテレーション(繰り返し)の前に初期化が実行されます
- **条件式**: イテレーション毎に評価されます。
- **後処理ステートメント**: イテレーション毎の最後に実行されます
```go
package main

import "fmt"

func main() {
	sum := 0
	for i := 0; i < 10; i++ {
		sum += i
	}
	fmt.Println(sum)
}
```

## If
他の言語とほぼ同じように行う。他の言語との違い？は、for のように条件の前に評価するための簡単なステートメントを書くことができる点である。このステートメントは、`if`のスコープでのみ有効となる。
```go
package main

import (
	"fmt"
	"math"
)

func pow(x, n, lim float64) float64 {
	if v := math.Pow(x, n); v < lim {
		return v
	} else {
		fmt.Printf("%g >= %g\n", v, lim)
	}
	// can't use v here, though
	return lim
}

func main() {
	fmt.Println(
		pow(3, 2, 10),
		pow(3, 3, 20),
	)
}
```

## Switch
Switch文は他の言語と同じな書き方をするが、Goのswitchのcaseは定数である必要はなく、 関係する値は整数である必要はないということが特徴である。また、switch caseは、上から下へcaseを評価し、caseの条件が一致すれば、そこで自動的にbreakする。
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("When's Saturday?")
	today := time.Now().Weekday()
	switch time.Saturday {
	case today + 0:
		fmt.Println("Today.")
	case today + 1:
		fmt.Println("Tomorrow.")
	case today + 2:
		fmt.Println("In two days.")
	default:
		fmt.Println("Too far away.")
	}
}
```

## Defer
deferは、 deferへ渡した関数の実行を、呼び出し元の関数の終わり(returnする)まで遅延させる。defer へ渡した関数の引数は、すぐに評価されますが、その関数自体は呼び出し元の関数がreturnするまで実行されない。
```go
package main

import "fmt"

func main() {
	var i int = 1;
	defer fmt.Println("i[1]: ", i);

	i++;
	fmt.Println("i[2]: ", i);
}
```

deferへ渡した関数が複数ある場合、その呼び出しはスタック( stack )される。呼び出し元の関数がreturnするとき、 defer へ渡した関数は LIFO(last-in-first-out) の順番で実行される。
```go
package main

import "fmt"

func main() {
	fmt.Println("counting")

	for i := 0; i < 10; i++ {
		defer fmt.Println(i)
	}

	fmt.Println("done")
}
```

## Pointers
Goはポインタがある。`&変数`はアドレス、`*変数`は中身を表す。
（ポインタって業務で使うん？）
```go
package main

import "fmt"

func main() {
	i, j := 42, 2701

	p := &i         // point to i
	fmt.Println(*p) // read i through the pointer
	*p = 21         // set i through the pointer
	fmt.Println(i)  // see the new value of i

	p = &j         // point to j
	*p = *p / 37   // divide j through the pointer
	fmt.Println(j) // see the new value of j
}
```

## Structs
構造体は他の言語と同じような扱い。
```go
package main

import "fmt"

type Vertex struct {
	X int
	Y int
}

func main() {
	v := Vertex{1, 2}
	v.X = 4
	fmt.Println(v.X)
}
```

構造体へのアクセスはポインタを返しても行える。**フィールドXを持つstructのポインタpがある場合、フィールドXにアクセスするには `(*p).X `のように書くことができるが、この表記法は大変面倒なので、Goでは代わりに `p.X` と書くこともできる**。
```go
package main

import "fmt"

type Vertex struct {
	X int
	Y int
}

func main() {
	v := Vertex{1, 2}
	p := &v
	p.X = 1e9 //(*p).X ではないことに注目！
	fmt.Println(v)
}
```

## Arrays
配列は固定長で、配列の書き方がPythonとは全く違うので注意。
```go
package main

import "fmt"

func main() {
	var a [2]string //ココが他とは違う
	a[0] = "Hello"  //扱い方は同じ
	a[1] = "World"
	fmt.Println(a[0], a[1])
	fmt.Println(a)

	primes := [6]int{2, 3, 5, 7, 11, 13}
	fmt.Println(primes)
}
```

## Slices
スライスはスライスは配列への参照のようなもので、配列とは異なり可変長である。`a[low : high]`のようなコロンで区切られた二つのインデックス low と high の境界を指定することによってスライスが形成される。

注意すべきところは、スライスはどんなデータも格納しておらず、単に元の配列の部分列を指す点である。**スライスの要素を変更すると、その元となる配列の対応する要素も変更され、同じ元となる配列を共有している他のスライスもその変更が反映される**。つまり、スライｓは浅いコピーをしている状態である。
```go
package main

import "fmt"

func main() {
	names := [4]string{
		"John",
		"Paul",
		"George",
		"Ringo",
	}
	fmt.Println(names)

	a := names[0:2]
	b := names[1:3]
	fmt.Println(a, b)

	b[0] = "XXX"
	fmt.Println(a, b)
	fmt.Println(names)
}
```

### Creating a slice with make
スライスは、組み込みの make 関数を使用して作成することができる。
```go
package main

import "fmt"

func main() {
	// []intは配列の大きさがない＝可変長＝スライス
	// スライスは元配列が無くても、大きさなし配列を宣言することで使える
	a := make([]int, 5)
	printSlice("a", a)

	b := make([]int, 0, 5)
	printSlice("b", b)

	c := b[:2]
	printSlice("c", c)

	d := c[2:5]
	printSlice("d", d)
}

func printSlice(s string, x []int) {
	//len=今のスライスの大きさ、cap=元の配列の大きさ
	fmt.Printf("%s len=%d cap=%d %v\n", s, len(x), cap(x), x)
}
```

### Appending to a slice
スライスへ新しい要素を追加するには、Goの組み込みの append を使う。
```go
package main

import "fmt"

func main() {
	var s []int
	printSlice(s)

	// 「 func append(s []T, vs ...T) []T 」が定義
	// append works on nil slices.
	s = append(s, 0)
	printSlice(s)

	// The slice grows as needed.
	s = append(s, 1)
	printSlice(s)

	// We can add more than one element at a time.
	s = append(s, 2, 3, 4)
	printSlice(s)
}

func printSlice(s []int) {
	fmt.Printf("len=%d cap=%d %v\n", len(s), cap(s), s)
}
```

## Range
for ループに利用する range は、スライスや、マップ( map )をひとつずつ反復処理するために使う。スライスをrangeで繰り返す場合、rangeは反復毎に2つの変数を返す 
- 1つ目の変数：インデックス( index )
- 2つ目の変数：インデックスの場所の要素のコピー
```go
package main

import "fmt"

var pow = []int{1, 2, 4, 8, 16, 32, 64, 128}

func main() {
	for i, v := range pow {
		fmt.Printf("2**%d = %d\n", i, v)
	}
}
```

インデックスや値は、 " _ "(アンダーバー) へ代入することで捨てることができる。しインデックスだけが必要なのであれば、2つ目の値を省略してもいい（例：`for i := range pow`）。
```go
package main

import "fmt"

func main() {
	pow := make([]int, 10)
	for i := range pow {
		pow[i] = 1 << uint(i) // == 2**i
	}
	for _, value := range pow {
		fmt.Printf("%d\n", value)
	}
}
```

## Maps
map はキーと値とを関連付ける辞書型のようなものである。マップのゼロ値は `nil` です。 nil マップはキーを持っておらず、またキーを追加することもできない。make 関数は指定された型のマップを初期化して、使用可能な状態で返す。
```go
package main

import "fmt"

type Vertex struct {
	Lat, Long float64
}

var m = map[string]Vertex{
	"Bell Labs": Vertex{
		40.68433, -74.39967,
	},
	"Google": Vertex{
		37.42202, -122.08408,
	},
}

func main() {
	fmt.Println(m)
}
```

### Mutating Maps
- **m へ要素(elem)の挿入や更新**: `m[key] = elem`
- **要素の取得**: `elem = m[key]`
- **要素の削除**: `delete(m, key)`
- **キーに対する要素が存在するか**: "elem, ok = m[key]"
  - もし、 m に key があれば、変数 ok は true となり、存在しなければ、 ok は false となる。また、mapに key が存在しない場合、 elem はmapの要素の型のゼロ値となる。
```go
package main

import "fmt"

func main() {
	m := make(map[string]int)

	m["Answer"] = 42
	fmt.Println("The value:", m["Answer"])

	m["Answer"] = 48
	fmt.Println("The value:", m["Answer"])

	delete(m, "Answer")
	fmt.Println("The value:", m["Answer"])

	v, ok := m["Answer"]
	fmt.Println("The value:", v, "Present?", ok)
}
```

## Function values
（あまり使わないやつ）
関数も変数として扱え、他の変数のように関数に渡すことができる。関数値( function value )は、関数の引数に取ることもでき、戻り値としても利用できる。
```go
package main

import (
	"fmt"
	"math"
)

func compute(fn func(float64, float64) float64) float64 {
	return fn(3, 4)
}

func main() {
	hypot := func(x, y float64) float64 {
		return math.Sqrt(x*x + y*y)
	}
	fmt.Println(hypot(5, 12))

	fmt.Println(compute(hypot))
	fmt.Println(compute(math.Pow))
}
```

## Function closures
（未知の概念）
 クロージャは、それ自身の外部から変数を参照する関数値である。 この関数は、参照された変数へアクセスして変えることができる。つまり、つまり、関数内にグローバル変数と関数が作れるってこと？
 ```go
 package main

import "fmt"

func adder() func(int) int {
    sum := 0  // 関数の外側にある変数
    return func(x int) int {
        sum += x  // 外部の変数 `sum` にアクセスし、変更
        return sum
    }
}

func main() {
    posAdder := adder()  // `adder()` を呼び出してクロージャを取得

    fmt.Println(posAdder(1))  // 1
    fmt.Println(posAdder(2))  // 3 (1 + 2)
    fmt.Println(posAdder(3))  // 6 (1 + 2 + 3)
}
```

# 文法: Methods and interfaces
## Methods
Goには、クラス( class )のしくみはないが、型にメソッド( method )を定義できる。メソッドは、特別なレシーバ( receiver )引数を関数に取り、func キーワードとメソッド名の間に自身の引数リストで表現する。
```go
package main

import (
	"fmt"
	"math"
)

type Vertex struct {
	X, Y float64
}

func (v Vertex) Abs() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

func main() {
	v := Vertex{3, 4}
	fmt.Println(v.Abs())
}
```

structの型だけではなく、任意の型(type)にもメソッドを宣言できる。レシーバを伴うメソッドの宣言は、レシーバ型が同じパッケージにある必要があり、 他のパッケージに定義している型に対して、レシーバを伴うメソッドを宣言できない。
```go
package main

import (
	"fmt"
	"math"
)

type MyFloat float64

func (f MyFloat) Abs() float64 {
	if f < 0 {
		return float64(-f)
	}
	return float64(f)
}

func main() {
	f := MyFloat(-math.Sqrt2)
	fmt.Println(f.Abs())
}
```

ポインタレシーバでもメソッドを宣言できる。ポインタレシーバを持つメソッドは、レシーバが指す変数を変更できる。 レシーバ自身を更新することが多いため、変数レシーバよりもポインタレシーバの方が一般的である。

:::details ポインタレシーバを使う理由
- メソッドがレシーバが指す先の変数を変更するため
- メソッドの呼び出し毎に変数のコピーを避ける
:::

```go
package main

import (
	"fmt"
	"math"
)

type Vertex struct {
	X, Y float64
}

func (v Vertex) Abs() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

func (v *Vertex) Scale(f float64) {
	v.X = v.X * f
	v.Y = v.Y * f
}

func main() {
	v := Vertex{3, 4}
	v.Scale(10)
	fmt.Println(v.Abs())
}
```

## Interfaces
interfaceは、メソッドのシグニチャの集まりで定義される。インターフェースの値のメソッドを呼び出すと、その基底型の同じ名前のメソッドが実行される。
```go
package main

import "fmt"

type I interface {
	M()
}

type T struct {
	S string
}

func (t *T) M() {
	if t == nil {
		fmt.Println("<nil>")
		return
	}
	fmt.Println(t.S)
}

func main() {
	var i I

	var t *T
	i = t
	describe(i)
	i.M()

	i = &T{"hello"}
	describe(i)
	i.M()
}

func describe(i I) {
	fmt.Printf("(%v, %T)\n", i, i)
}
```

## Type assertions
型アサーション は、インターフェースの値の基になる具体的な値を利用する手段を提供する。
例えば、`t := i.(T)`は、インターフェースの値 i が具体的な型 T を保持し、基になる T の値を変数 t に代入することを主張する。i が T を保持していない場合、この文は panic を引き起こす。

インターフェースの値が特定の型を保持しているかどうかを テスト するために、型アサーションは2つの値(基になる値とアサーションが成功したかどうかを報告するブール値)を返すことができる。これをプログラムで書くと`t, ok := i.(T)`となり、i が T を保持していれば、 t は基になる値になり、 ok は真(true)になる。そうでなければ、 ok は偽(false)になり、 t は型 T のゼロ値になり panic は起きない。
```go
package main

import "fmt"

func main() {
	var i interface{} = "hello"

	s := i.(string)
	fmt.Println(s)

	s, ok := i.(string)
	fmt.Println(s, ok)

	f, ok := i.(float64)
	fmt.Println(f, ok)

	f = i.(float64) // panic
	fmt.Println(f)
}
```

## Type switches
型switch はいくつかの型アサーションを直列に使用できる構造である。型switchは通常のswitch文と似ていますが、型switchのcaseは型(値ではない)を指定し、それらの値は指定されたインターフェースの値が保持する値の型と比較される。
```go
package main

import "fmt"

func do(i interface{}) {
	switch v := i.(type) {
	case int:
		fmt.Printf("Twice %v is %v\n", v, v*2)
	case string:
		fmt.Printf("%q is %v bytes long\n", v, len(v))
	default:
		fmt.Printf("I don't know about type %T!\n", v)
	}
}

func main() {
	do(21)
	do("hello")
	do(true)
}
```

# 文法: Concurrency
## Goroutines
goroutine (ゴルーチン)は、Goのランタイムに管理される軽量なスレッドである。`go f(x, y, z)`と書けば、新しいgoroutineが実行される。
```go
package main

import (
	"fmt"
	"time"
)

func say(s string) {
	for i := 0; i < 5; i++ {
		time.Sleep(100 * time.Millisecond)
		fmt.Println(s)
	}
}

func main() {
	go say("world")
	say("hello")
}

```

## Channels
チャネル( Channel )型は、チャネルオペレータの <- を用いて値の送受信ができる通り道である。マップとスライスのように、チャネルは使う前に`ch := make(chan int)`のように生成する。
```go
package main

import "fmt"

func sum(s []int, c chan int) {
	sum := 0
	for _, v := range s {
		sum += v
	}
	c <- sum // send sum to c
}

func main() {
	s := []int{7, 2, 8, -9, 4, 0}

	c := make(chan int)
	go sum(s[:len(s)/2], c)
	go sum(s[len(s)/2:], c)
	x, y := <-c, <-c // receive from c

	fmt.Println(x, y, x+y)
}
```

## Buffered Channels
チャネルは バッファ ( buffer )として使え、バッファを持つチャネルを初期化するには、 make の２つ目の引数にバッファの長さを与える。バッファが詰まった時はチャネルへの送信をブロックし、バッファが空の時にはチャネルの受信をブロックする。
```go
package main

import "fmt"

func main() {
	ch := make(chan int, 2)
	ch <- 1
	ch <- 2
	fmt.Println(<-ch)
	fmt.Println(<-ch)
}
```

## Range and Close
送り手は、これ以上の送信する値がないことを示すため、チャネルを close できる。 受け手は、受信の式に2つ目のパラメータを割り当てることで、そのチャネルがcloseされているかどうかを確認できる。
```go
package main

import (
	"fmt"
)

func fibonacci(n int, c chan int) {
	x, y := 0, 1
	for i := 0; i < n; i++ {
		c <- x
		x, y = y, x+y
	}
	close(c)
}

func main() {
	c := make(chan int, 10)
	go fibonacci(cap(c), c)
	for i := range c {
		fmt.Println(i)
	}
}
```

## Select
select ステートメントは、goroutineを複数の通信操作で待たせる。select は、複数ある case のいずれかが準備できるようになるまでブロックし、準備ができた case を実行する。もし、複数の case の準備ができている場合、 case はランダムに選択される。
```go
package main

import "fmt"

func fibonacci(c, quit chan int) {
	x, y := 0, 1
	for {
		select {
		case c <- x:
			x, y = y, x+y
		case <-quit:
			fmt.Println("quit")
			return
		}
	}
}

func main() {
	c := make(chan int)
	quit := make(chan int)
	go func() {
		for i := 0; i < 10; i++ {
			fmt.Println(<-c)
		}
		quit <- 0
	}()
	fibonacci(c, quit)
}
```

どの case も準備ができていないのであれば、 select の中の default が実行される。ブロックせずに送受信するなら、 default の case を使う。
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	tick := time.Tick(100 * time.Millisecond)
	boom := time.After(500 * time.Millisecond)
	for {
		select {
		case <-tick:
			fmt.Println("tick.")
		case <-boom:
			fmt.Println("BOOM!")
			return
		default:
			fmt.Println("    .")
			time.Sleep(50 * time.Millisecond)
		}
	}
}
```

# コーディングスタイル
（新しい学びになった点を列挙）
## Group Similar Declarations
- 宣言をグループにまとめる。
  - グルーピングすることによって、変数名に差をつけないでグルーピングができる。
    - 変数名に差をつけなくてもいいわけではない。
```go
import (
  "a"
  "b"
)

const (
  a = 1
  b = 2
)

var (
  a = 1
  b = 2
)

type (
  Area float64
  Volume float64
)
```

## Function Names
関数名にはGoコミュニティの規則であるMixedCapsに従う。
```go
func HelloWorld() {
    fmt.Println("Hello, World!")
}

func AddNumbers(a int, b int) int {
    return a + b
}

func GetUserName(id int) string {
    return fmt.Sprintf("User%d", id)
}
```