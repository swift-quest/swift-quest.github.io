---
layout: slide
title: "文字列のprint"
---

HP が 153 のとき、それを画面に表示するにはこのようなコードを書きました。

```swift
print(153)
```

```
153
```

<code class="sq-output">153</code> ではなく <code class="sq-output">HP 153</code> と表示するにはどうすればいいでしょうか？

`()` の中に `HP 153` と書くとどうなるか試してみます。

```swift
print(HP 153)
```

```
ERROR at line 1, col 10: expected ',' separator
print(HP 153)
         ^
        ,
ERROR at line 1, col 7: use of unresolved identifier 'HP'
print(HP 153)
      ^~
```

何か色々英語が表示されました😱

最初に ERROR （エラー）と書かれています。何かまずいことをしてしまったようです。

これは、コードをコンパイルして機械語に変換するのに失敗したというエラーです。

コンパイルに失敗したエラーのことをコンパイルエラーと呼びます。

コンパイルエラーがあるままではプログラムを実行することはできません。

コードをなおしてコンパイルできるようにしなければなりません。

実は、 `print` の `()` の中に書いたものを何でもそのまま表示するわけではありません。

これまでも `print(153 - 5)` と書いたときに、 <code class="sq-output">153 - 5</code> ではなく <code class="sq-output">148</code> と式の計算結果が表示されていました。

このことからも `print` の `()` の中がそのまま表示されるわけではないことがわかると思います。

`()` の中をそのまま表示するには、 `()` の中を `""` で囲う必要があります。

`""` で囲って <code class="sq-output">HP 153</code> と表示されるようにしてみます。

```swift
print("HP 153")
```

```
HP 153
```

今度はコンパイルエラーにならず、ちゃんと <code class="sq-output">HP 153</code> と表示できました。

`""` で囲まれた部分を、文字が連なったものという意味で文字列と呼びます。

`print` の `()` の中には、数字や数式だけでなく、文字列を書くこともできるのです。

`print` を複数回使って RPG のステータスっぽく表示してみましょう。

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

おお、 RPG っぽいですね！

このように、 `print` は 1 行に 1 回書くことができ、複数回書けば複数行の表示をすることができます。

では、文字列と計算式を混ぜて使いたいときはどうすればいいでしょうか？

HP 153 から 5 のダメージを受けたときは `153 - 5` でコンピューターに計算してもらうことができました。

しかし、 `"HP 153 - 5`" だと `""` の中がそのまま表示されてしまいます。

```swift
print("HP 153 - 5")
```

```
HP 153 - 5
```

文字列の中に式の計算結果を埋め込むにはこのように書きます。

```swift
print("HP \(153 - 5)")
```

```
HP 148
```

`\()` のカッコで囲まれた部分は式とみなされ、その計算結果が文字列に埋め込まれます。

これを文字列補間といいます。

文字列補間を使えば、こんなこともできます。

```swift
print("ゆうしゃのこうげき。")
print("まおうに\((162 - 58) / 2)のダメージ！")
```

```
ゆうしゃのこうげき。
まおうに52のダメージ！
```

前にやったように、 162 は勇者の攻撃力、 58 は魔王の防御力です。

文字列補間を使って文字列に式を埋め込むことで、より RPG っぽい表示ができるようになりました。
