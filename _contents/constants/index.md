---
layout: slide
title: "定数"
---

{% include terms/variable.md %} と似たものに **{% include terms/constant.md %}** があります。

{% include terms/variable.md %} は `var` で作ることができますが、 {% include terms/constant.md %} は `let` というキーワードで作ります。

```swift
var a = 2
let b = 2
```

{% include terms/variable.md %} は後から {% include terms/assignment.md %} して値を変更することができました。

```swift
var a = 2
a = 3
let b = 2
```

しかし、 {% include terms/constant.md %} は後から {% include terms/assignment.md %} して値を変更することができません。

```swift
var a = 2
a = 3
let b = 2
b = 3
```

実行しようとするとコンパイルエラーになります。

```
constant.swift:4:3: error: cannot assign to value: 'b' is a 'let' constant
b = 3
~ ^
constant.swift:3:1: note: change 'let' to 'var' to make it mutable
let b = 2
^~~
var
```

英語でおそろしげなエラーメッセージが表示されました😨

`b` が `let` で作られているので、 `b = 3` のように後から値を変更することができない、もし {% include terms/assignment.md %} しなおしたいなら `let` ではなく `var` を使えという内容です。

このように、 `let` で作られた {% include terms/constant.md %} の値は後から変更できません。

{% include terms/constant.md %} は値を変更できない分、 {% include terms/variable.md %} よりできることが少ないように思えます。

{% include terms/variable.md %} の方ができることが多いなら、一体 {% include terms/constant.md %} は何の役に立つのでしょうか。

1000 行もあるような長いコードを考えてみて下さい。 100 行目で {% include terms/variable.md %} `a` が作られて `365` が {% include terms/assignment.md %} されていたとします。

さて、 800 行目に `a` を使った計算が書かれていました。このとき `a` の値は `365` でしょうか。それとも別の値でしょうか。

それを知るためには途中のコードをすべて調べて `a` の値が変更されている箇所がないか確認しなければなりません。

もし `a` が {% include terms/constant.md %} だったらどうでしょう？

{% include terms/constant.md %} の値は後から変更できないので、もし 100 行目で `a` が `365` だったら 800 行目でも `365` のはずです。

つまり、値を変更する必要がない場合には、 {% include terms/variable.md %} ではなく {% include terms/constant.md %} を使うことでコードが読みやすくなるということです。

{% include terms/constant.md %} で良い場合には積極的に {% include terms/constant.md %} を使いましょう。

RPG ではどのようなときに {% include terms/constant.md %} が使えるでしょうか。

最大 HP や攻撃力は戦闘中に変化することがありません。

戦闘のプログラムでは、最大 HP や攻撃力を {% include terms/constant.md %} で表すと良さそうです。

最大 HP を `maxHp` 、最大 MP を `maxMp` 、攻撃力を `attack` 、防御力を `defense` で表すことにしましょう。


```swift
let maxHp = 153
let maxMp = 25
let attack = 162
let defense = 97
```

`maxHp` の H はなぜ大文字なのでしょうか。

最大 HP は英語で max HP なので、本来なら `max hp` としたいところです。

しかし、 {% include terms/variable.md %} や {% include terms/constant.md %} の名前にスペースを使うことはできません。

かといって `maxhp` としてしまうとどこが単語の区切りなのかわかりません。 max hp ではなく、 ma xhp かもしれません。

そこで、本来スペースの直後にあった文字を大文字にするのが慣例となっています。

`maxHp` のような書き方を {% include terms/camel-case.md %} と言います。

camel とはラクダのことです。どうして {% include terms/camel-case.md %} と呼ぶかというと、大文字の部分がラクダのコブのように見えるからです。

さて、この他に {% include terms/constant.md %} で表せるものがあります。

それはキャラクターの名前です。 `name` という {% include terms/constant.md %} で名前を表すことにしましょう。

```swift
let name = "ゆうしゃ"
let maxHp = 153
let maxMp = 25
let attack = 162
let defense = 97
```

このように、数値だけでなく {% include terms/character-string.md %} を {% include terms/variable.md %} や {% include terms/constant.md %} に {% include terms/assignment.md %} することもできます。

最大 HP や最大 MP は戦闘中変化することはありません。一方で、これまでやってきたように現在 HP や現在 MP は変化します。

ですので、 HP や MP は {% include terms/constant.md %} ではなく {% include terms/variable.md %} で表すべきです。

```swift
let name = "ゆうしゃ"
let maxHp = 153
var hp = maxHp
let maxMp = 25
var mp = maxMp
let attack = 162
let defense = 97
```

HP も MP も全回復した状態で戦闘が始まるものとして、 `hp = maxHp`, `mp = maxMp` として初期値を与えました。

このようにして、勇者のステータスを {% include terms/variable.md %} と {% include terms/constant.md %} で表すことができました。

さて、これらを使って戦闘をしたいところですが敵が必要です。魔王のステータスも同じように {% include terms/variable.md %} と {% include terms/constant.md %} で表してみましょう。

しかし、同じ名前の {% include terms/variable.md %} や {% include terms/constant.md %} を作ることはできません。

勇者のステータスの {% include terms/variable-name.md %} にすべて `1` を、魔王のステータスには `2` を付けることにしましょう。

まずは勇者のステータスの {% include terms/variable-name.md %} に `1` を付けます。

```swift
let name1 = "ゆうしゃ"
let maxHp1 = 153
var hp1 = maxHp1
let maxMp1 = 25
var mp1 = maxMp1
let attack1 = 162
let defense1 = 97
```

このように、 {% include terms/variable-name.md %} には数字を使うこともできます。ただし、 {% include terms/variable-name.md %} の最初の文字は数字にできません。

`a1` という {% include terms/variable-name.md %} は可能ですが、 `1a` という {% include terms/variable.md %} を作ることはできません。

さて、次は魔王のステータスです。

```swift
let name1 = "ゆうしゃ"
let maxHp1 = 153
var hp1 = maxHp1
let maxMp1 = 25
var mp1 = maxMp1
let attack1 = 162
let defense1 = 97

let name2 = "まおう"
let maxHp2 = 999
var hp2 = 999
let maxMp2 = 99
let mp2 = maxMp2
let attack2 = 185
let defense2 = 58
```

では、 1 ターン分の戦闘を作ってみましょう。

まず、今の HP と MP を表示します。せっかくなので <code class="sq-output">HP 153 / 153</code> のように、現在 HP と最大 HP を表示してみましょう。

```swift
let name1 = "ゆうしゃ"
let maxHp1 = 153
var hp1 = maxHp1
let maxMp1 = 25
var mp1 = maxMp1
let attack1 = 162
let defense1 = 97

let name2 = "まおう"
let maxHp2 = 999
var hp2 = 999
let maxMp2 = 99
let mp2 = maxMp2
let attack2 = 185
let defense2 = 58

print(name1)
print("HP \(hp1) / \(maxHp1)")
print("MP \(mp1) / \(maxMp1)")
print()
```

```
ゆうしゃ
HP 153 / 153
MP 25 / 25

```

魔王は敵なので、魔王の HP と MP は表示しません（ RPG では敵の HP と MP は表示されないことが多いです）。

次に、勇者の攻撃です。ダメージの計算は、勇者の攻撃力 `attack1` から魔王の防御力 `defense2` を引いて 2 で割ります。

```swift
let name1 = "ゆうしゃ"
let maxHp1 = 153
var hp1 = maxHp1
let maxMp1 = 25
var mp1 = maxMp1
let attack1 = 162
let defense1 = 97

let name2 = "まおう"
let maxHp2 = 999
var hp2 = 999
let maxMp2 = 99
let mp2 = maxMp2
let attack2 = 185
let defense2 = 58

print(name1)
print("HP \(hp1) / \(maxHp1)")
print("MP \(mp1) / \(maxMp1)")
print()

var damage = (attack1 - defense2) / 2
hp2 -= damage
print("\(name1)のこうげき。")
print("\(name2)に\(damage)のダメージ。")
print()
```

```
ゆうしゃ
HP 153 / 153
MP 25 / 25

ゆうしゃのこうげき。
まおうに52のダメージ。
```

次は魔王の攻撃です。逆に魔王の攻撃力 `attack2` から勇者の防御力 `defense1` を引いて 2 で割ります。

```swift
let name1 = "ゆうしゃ"
let maxHp1 = 153
var hp1 = maxHp1
let maxMp1 = 25
var mp1 = maxMp1
let attack1 = 162
let defense1 = 97

let name2 = "まおう"
let maxHp2 = 999
var hp2 = 999
let maxMp2 = 99
let mp2 = maxMp2
let attack2 = 185
let defense2 = 58

print(name1)
print("HP \(hp1) / \(maxHp1)")
print("MP \(mp1) / \(maxMp1)")
print()

var damage = (attack1 - defense2) / 2
hp2 -= damage
print("\(name1)のこうげき。")
print("\(name2)に\(damage)のダメージ。")
print()

damage = (attack2 - defense1) / 2
hp1 -= damage
print("\(name2)のこうげき。")
print("\(name1)に\(damage)のダメージ。")
print()
```

```
ゆうしゃ
HP 153 / 153
MP 25 / 25

ゆうしゃのこうげき。
まおうに52のダメージ。

まおうのこうげき。
ゆうしゃに44のダメージ。

```

最後にもう一度勇者の HP と MP を表示しましょう。

```swift
let name1 = "ゆうしゃ"
let maxHp1 = 153
var hp1 = maxHp1
let maxMp1 = 25
var mp1 = maxMp1
let attack1 = 162
let defense1 = 97

let name2 = "まおう"
let maxHp2 = 999
var hp2 = 999
let maxMp2 = 99
let mp2 = maxMp2
let attack2 = 185
let defense2 = 58

print(name1)
print("HP \(hp1) / \(maxHp1)")
print("MP \(mp1) / \(maxMp1)")
print()

var damage = (attack1 - defense2) / 2
hp2 -= damage
print("\(name1)のこうげき。")
print("\(name2)に\(damage)のダメージ。")
print()

damage = (attack2 - defense1) / 2
hp1 -= damage
print("\(name2)のこうげき。")
print("\(name1)に\(damage)のダメージ。")
print()

print(name1)
print("HP \(hp1) / \(maxHp1)")
print("MP \(mp1) / \(maxMp1)")
print()
```

```
ゆうしゃ
HP 153 / 153
MP 25 / 25

ゆうしゃのこうげき。
まおうに52のダメージ。

まおうのこうげき。
ゆうしゃに44のダメージ。

ゆうしゃ
HP 109 / 153
MP 25 / 25

```

これで 1 ターンの戦闘ができました！

ステータスを色々変更して実行してみると楽しそうです。

ステータスが {% include terms/variable.md %} や {% include terms/constant.md %} で表されると、より一層 RPG っぽくなりましたね！