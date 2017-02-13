---
layout: slide
title: "変数"
---

**{% include terms/variable.md %}** を使うと値や計算の結果をとっておくことができます。

言葉で説明するより見た方がわかりやすいので、早速 {% include terms/variable.md %} を作ってみましょう。

```swift
var a = 2
```

このように書くと、 `a` という名前の {% include terms/variable.md %} を作り、そこに `2` という値を入れておくことができます。

`var` は、新しい {% include terms/variable.md %} を作るためのキーワードです。

```swift
var a = 2
print(a)
```

のようにして `a` の中に入っている値を表示することができます。

```
2
```

`a` に入っている値を使って計算することもできます。

```swift
var a = 2
print(a + 3)
```

```
5
```

計算結果を {% include terms/variable.md %} に入れておくこともできます。

```swift
var a = 2 * 3
print(a)
```

```
6
```

{% include terms/variable.md %} に入っている値を後から変更することもできます。

```swift
var a = 2 * 3
print(a)

a = 10
print(a)
```

```
6
10
```

`=` を使って {% include terms/variable.md %} に値を入れることを **{% include terms/assignment.md %}** と言います。

算数や数学の = は左右の値が等しいことを意味しますが、多くのプログラミング言語では `=` の右側の値を左側に {% include terms/assignment.md %} するという意味になります。

`a = 10` の行に `var` を書かなくて良いのは、 `a` という {% include terms/variable.md %} が `var a = 2 * 3` の行ですでに作られているからです。

{% include terms/variable.md %} の名前のことを {% include terms/variable-name.md %} と言います。

今は `a` という 1 文字の {% include terms/variable-name.md %} を使っていますが、 2 文字以上のもっと長い {% include terms/variable-name.md %} をつけることもできます。

次に、 {% include terms/variable.md %} があるとどんなときにうれしいのかを見てみましょう。

今、勇者の HP は 153 だとします。

```swift
print("ゆうしゃ")
print("HP 153")
print("MP 25")
```

```
ゆうしゃ
HP 153
MP 25
```

魔王の攻撃力は 185 、勇者の防御力は 97 だとすると、魔王の攻撃はこのようになります。

```swift
print("ゆうしゃ")
print("HP 153")
print("MP 25")

print()

print("まおうのこうげき。")
print("ゆうしゃに\((185 - 97) / 2)のダメージ。")
```

```
ゆうしゃ
HP 153
MP 25

まおうのこうげき。
ゆうしゃに44のダメージ。
```

途中の `print()` は <code class="sq-output">MP 25</code> と  <code class="sq-output"まおうのこうげき。</code> の間に空行を入れるためのものです。

`print` は `()` の中を表示して改行する命令なので、 `()` の中が空だと改行だけします。

さて、次にダメージを受けた後の勇者の HP を表示してみましょう。

```swift
print("ゆうしゃ")
print("HP 153")
print("MP 25")

print()

print("まおうのこうげき。")
print("ゆうしゃに\((185 - 97) / 2)のダメージ。")

print()

print("ゆうしゃ")
print("HP \(153 - (185 - 97) / 2)")
print("MP 25")
```

```
ゆうしゃ
HP 153
MP 25

まおうのこうげき。
ゆうしゃに44のダメージ。

ゆうしゃ
HP 109
MP 25
```

おっと、 `(185 - 97) / 2` という同じ計算を 2 回書くことになりました。

同じ計算を 2 回も書くのは面倒くさいので、 `(185 - 97) / 2` の計算結果をとっておいて、それを後から使えたら便利です。

こんなときこそ {% include terms/variable.md %} の出番です。

`(185 - 97) / 2` の計算結果を {% include terms/variable.md %} に代入してとっておきましょう。

 ダメージを表すので、 {% include terms/variable-name.md %} は `damage` （ダメージ）としましょう。するとこうなります。

```swift
print("ゆうしゃ")
print("HP 153")
print("MP 25")

print()

var damage = (185 - 97) / 2

print("まおうのこうげき。")
print("ゆうしゃに\(damage)のダメージ。")

print()

print("ゆうしゃ")
print("HP \(153 - damage)")
print("MP 25")
```

`(185 - 97) / 2` の計算結果を {% include terms/variable.md %} `damage` に保存しておくことで、同じ計算を 2 回書かなくてよくなりました。

同じコードを 2 回書きたくないのは、面倒くさいからだけではありません。

{% include terms/variable.md %} を使わない元のコードはこちらでした。

```swift
print("ゆうしゃ")
print("HP 153")
print("MP 25")

print()

print("まおうのこうげき。")
print("ゆうしゃに\((185 - 97) / 2)のダメージ。")

print()

print("ゆうしゃ")
print("HP \(153 - (185 - 97) / 2)")
print("MP 25")
```

このとき、ゲームバランスを調整していて、魔王の攻撃力を 197 に変更したくなったとします。

`185` はコードの中の 2 箇所に書かれているので、両方を修正しなければなりません。

しかし、まちがえて片方だけ修正してしまったとしましょう。

```swift
print("ゆうしゃ")
print("HP 153")
print("MP 25")

print()

print("まおうのこうげき。")
print("ゆうしゃに\((197 - 97) / 2)のダメージ。")

print()

print("ゆうしゃ")
print("HP \(153 - (185 - 97) / 2)")
print("MP 25")
```

これを実行するとどうなるでしょう？

```
ゆうしゃ
HP 153
MP 25

まおうのこうげき。
ゆうしゃに50のダメージ。

ゆうしゃ
HP 109
MP 25
```

50 のダメージを受けたら勇者の HP は 103 にならないといけないのに、 109 と表示されてしまいました。

このようなプログラムの不具合を {% include terms/bug.md %} と言います。

同じコードを色んなところに繰り返して書くと、修正するときにすべて修正しなければなりません。

そして、修正が漏れてしまうとプログラムの {% include terms/bug.md %} を引き起こします。

コードの繰り返しを防ぎ、 {% include terms/bug.md %} を減らすためにも {% include terms/variable.md %} は重要なのです。
