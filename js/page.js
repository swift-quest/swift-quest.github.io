class CodePage {
  constructor(contents, isGuide) {
    if (contents.length <= 0) {
      throw "Illegal length of contents: " + contents.length;
    }
    this.contents = contents;
    this.isGuide = isGuide;
  }
}

class OutputPage {
  constructor(content, isGuide) {
    this.content = content;
    this.isGuide = isGuide;
  }
}

class SubtitlePage {
  constructor(content) {
    this.content = content;
  }
}
