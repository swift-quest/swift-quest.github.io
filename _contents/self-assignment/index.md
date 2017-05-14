---
layout: slide
title: "自分自身への代入"
---

今度は HP と MP を {% include terms/variable.md %} で表してみましょう。

HP を表す {% include terms/variable.md %} `hp` と MP を表す {% include terms/variable.md %} `mp` を作ります。

```swift
var hp = 153
var mp = 25
```

`HP` や `MP` のような {% include terms/variable-name.md %} にしなかったのは、 {% include terms/variable-name.md %} は小文字で付ける決まりになっているからです。

`HP` という名前の {% include terms/variable.md %} を作ることもできますが、コードを読んでいる人が混乱するのでやめましょう。

さて、 `hp` と `mp` を表示してみましょう。

```swift
var hp = 153
var mp = 25

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()
```

```
ゆうしゃ
HP 153
MP 25

```

次に、魔王が勇者を攻撃します。前回と同じようにダメージを計算しましょう。

```swift
var hp = 153
var mp = 25

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()

var damage = (185 - 97) / 2

print("まおうのこうげき。")
print("ゆうしゃに\(damage)のダメージ。")
print()
```

```
ゆうしゃ
HP 153
MP 25

まおうのこうげき。
ゆうしゃに44のダメージ。

```

次は、勇者の HP を `damage` の分だけ減らしたいところです。

ダメージを受けた後の勇者の HP は `hp - damage` です。

これを新しい `hp` の値として `hp` に {% include terms/assignment.md %} します。

```swift
var hp = 153
var mp = 25

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()

var damage = (185 - 97) / 2

print("まおうのこうげき。")
print("ゆうしゃに\(damage)のダメージ。")

hp = hp - damage
```

`hp = hp - damage` という式は、算数や数学の感覚では変なように感じられます。

算数や数学では = の左右は等しくないといけません。 `hp` と `hp - damage` が等しいというのは変です。

しかし、 Swift の `=` は単にの右側の値を左側に {% include terms/assignment.md %} するという意味なので、この式に問題はありません。

`hp = hp - damage` と書くと、 `hp - damage` 、つまり 153 - 44 の計算結果が新しい `hp` の値として {% include terms/assignment.md %} されます。

結果を表示してみます。

```swift
var hp = 153
var mp = 25

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()

var damage = (185 - 97) / 2

print("まおうのこうげき。")
print("ゆうしゃに\(damage)のダメージ。")
print()

hp = hp - damage

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()
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

ちゃんと HP がダメージの分だけ減って表示されましたね！

このように、 {% include terms/variable.md %} の値を増やしたり減らしたりすることはよくあるので、もっと簡単な書き方が用意されています。

```swift
var hp = 153
var mp = 25

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()

var damage = (185 - 97) / 2

print("まおうのこうげき。")
print("ゆうしゃに\(damage)のダメージ。")
print()

hp -= damage

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()
```

このように、 `hp -= damage` のように書くと `hp = hp - damage` と同じ意味になります。

同じように `a += b` と書くと `a = a + b` の意味になります。

コードを読む人にもわかりやすいので、 {% include terms/variable.md %} の値を増やしたり減らしたりするときは `+=` や `-=` を使うようにしましょう。

それでは、ついでに HP を回復する魔法「ヒーリング」を勇者に使わせてみましょう。

```swift
var hp = 153
var mp = 25

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()

var damage = (185 - 97) / 2

print("まおうのこうげき。")
print("ゆうしゃに\(damage)のダメージ。")
print()

hp -= damage

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()

print("ゆうしゃはヒーリングのまほうをつかった。")
print("ゆうしゃのHPがかいふくした。")
print()
```

HP が 30 回復したとすると、 `+=` を使って次のように書けます。

```swift
var hp = 153
var mp = 25

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()

var damage = (185 - 97) / 2

print("まおうのこうげき。")
print("ゆうしゃに\(damage)のダメージ。")
print()

hp -= damage

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()

print("ゆうしゃはヒーリングのまほうをつかった。")
print("ゆうしゃのHPがかいふくした。")
print()

hp += 30

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()
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

ゆうしゃはヒーリングのまほうをつかった。
ゆうしゃのHPがかいふくした。

ゆうしゃ
HP 139
MP 25

```

おや？魔法を使ったのに MP が減っていません。

忘れずに勇者の MP も減らしましょう。ヒーリングの消費 MP を 5 とするとこのようにすれば OK です。

```swift
var hp = 153
var mp = 25

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()

var damage = (185 - 97) / 2

print("まおうのこうげき。")
print("ゆうしゃに\(damage)のダメージ。")
print()

hp -= damage

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()

print("ゆうしゃはヒーリングのまほうをつかった。")
print("ゆうしゃのHPがかいふくした。")
print()

hp += 30
mp -= 5

print("ゆうしゃ")
print("HP \(hp)")
print("MP \(mp)")
print()
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

ゆうしゃはヒーリングのまほうをつかった。
ゆうしゃのHPがかいふくした。

ゆうしゃ
HP 139
MP 20

```

ちゃんと MP が減りましたね。

ずいぶんと RPG っぽくなってきました！
