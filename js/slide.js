let pages;
let pageIndex = 0;
let upperLeft;
let upperRight;
let lowerCenter;

let codeView;
let codeEntity;
let outputView;
let subtitleView;

let prevButton;
let nextButton;

class CursorPosition {
  constructor(line, character) {
    this.line = line;
    this.character = character;
  }
}

class AnimationFrame {
  constructor(cursorPosition, action, value = null) {
    this.cursorPosition = cursorPosition;
    this.action = action;
    this.value = value;
  }
}

function codeDiffAnimation(before, after) {
  let animation = [];

  let diff = JsDiff.diffChars(before, after);
  let done = (diff, toPartIndex) => {
    let result = "";
    for (let partIndex = 0; partIndex < toPartIndex; partIndex++) {
      let part = diff[partIndex];
      if (!part.removed) {
        result += part.value;
      }
    }
    return result;
  };
  let undone = (diff, fromPartIndex) => {
    let result = "";
    for (let partIndex = fromPartIndex; partIndex < diff.length; partIndex++) {
      let part = diff[partIndex];
      if (!part.added) {
        result += part.value;
      }
    }
    return result;
  };
  for (let partIndex = 0; partIndex < diff.length; partIndex++) {
    let part = diff[partIndex];
    let partValue = part.value;
    if (part.added) {
      let doneString = done(diff, partIndex);
      let undoneString = undone(diff, partIndex + 1);
      let lines = doneString.split("\n");
      let row = lines.length - 1;
      let column = lines[row].length;
      for (let endIndex = 1; endIndex <= partValue.length; endIndex++) {
        let character = partValue[endIndex - 1]
        animation.push(new AnimationFrame(
          new CursorPosition(row, column),
          "insert",
          character
        ));
        if (character == "\n") {
          row++;
          column = 0;
        } else {
          column++;
        }
      }
    } else if (part.removed) {
      let doneString = done(diff, partIndex);
      let undoneString = undone(diff, partIndex + 1);
      let lines = (doneString + partValue).split("\n");
      let row = lines.length - 1;
      let column = lines[row].length;
      for (let endIndex = partValue.length; endIndex > 0; endIndex--) {
        let character = partValue[endIndex - 1]
        animation.push(new AnimationFrame(
          new CursorPosition(row, column),
          "delete"
        ));
        if (character == "\n") {
          row--;
          if (row < 0) {
            row = 0;
            column = 0;
          } else {
            column = lines[row].length;
          }
        } else {
          column--;
        }
      }
    }
  }

  return animation;
}

function playAnimation(animation, target, delay, interval, update, completion = null) {
  if (delay > 0) {
    setTimeout(() => {
      playAnimation(animation, target, 0, interval, update, completion);
    }, delay);
    return;
  }

  if (animation.length == 0) {
    if (completion != null) {
      completion();
    }
    return;
  }

  update(target, animation[0]);

  let doPlayAnimation = () => {
    playAnimation(animation.slice(1, animation.length), target, 0, interval, update, completion);
  }
  if (interval == 0) {
    doPlayAnimation();
  } else {
    setTimeout(doPlayAnimation, interval);
  }
}

function initializePage() {
  let content = $("#sq-content");

  $("p", content).addClass("sq-subtitle");
  $("pre:has(code span)", content).addClass("sq-code");
  $("pre:not(:has(code span))", content).addClass("sq-output");
  $("div:has(pre.sq-code)", content).addClass("sq-code");
  $("div:has(pre.sq-output)", content).addClass("sq-output");
  $("code.highlighter-rouge").addClass("sq-code");

  pages = $("> *", content);

  let slide = $("#sq-slide");

  let upper = $(".sq-upper", slide);
  let lower = $(".sq-lower", slide);

  upperLeft = $(".sq-left", upper);
  upperRight = $(".sq-right", upper);

  codeEntity = CodeMirror.fromTextArea($(".sq-code", upperLeft)[0], {
    lineWrapping: true,
    indentUnit: 4,
    readOnly: true,
    mode: "text/x-swift",
    theme: "quest",
  });
  codeView = $("> *", upperLeft);

  let lowerLeft = $(".sq-left", lower);
  lowerCenter = $(".sq-center", lower);
  let lowerRight = $(".sq-right", lower);

  prevButton = $("button", lowerLeft);
  prevButton.click(() => {
    prev();
  });
  nextButton = $("button", lowerRight);
  nextButton.click(() => {
    next();
  });

  show(pageIndex);
}

function prev() {
  show(--pageIndex, "prev");
}

function next() {
  show(++pageIndex, "next");
}

function show(pageIndex, action) {
  if (pageIndex == 0) {
    prevButton.prop("disabled", true);
  } else {
    prevButton.prop("disabled", false);
  }
  if (pageIndex == pages.length - 1) {
    nextButton.prop("disabled", true);
  } else {
    nextButton.prop("disabled", false);
  }

  // page で変わる要素は code, output, subtitle の一つだけなので
  // 単純に "prev" を実行するとそのページで表示されるべき内容より
  // 新しいページの内容が表示されてしまう。
  // そのため、毎回最初のページからたどって
  // そのページで表示されるべき code, output, subtitle を探す。
  let codePage = null;
  let outputPage = null;
  let subtitlePage = null;
  for (let i = 0; i <= pageIndex; i++) {
    let page = $(pages[i]);
    if (page.hasClass("sq-code")) {
      codePage = page;
    } else if (page.hasClass("sq-output")) {
      outputPage = page;
    } else if (page.hasClass("sq-subtitle")) {
      subtitlePage = page;
    }
  }

  let targetPage = pages[pageIndex];
  let isTargetPage = (page) => {
    if (page == null) {
      return false;
    }
    return page[0] == targetPage; // page は JQeury 型なので [0] が必要
  };

  showCode(codePage, action, isTargetPage(codePage));
  showOutput(outputPage, action, isTargetPage(outputPage));
  showSubtitle(subtitlePage, action, isTargetPage(subtitlePage));
}

function showCode(page, action, isTargetPage) {
  let before = codeEntity.getValue();
  let after;
  if (page == null) {
    after = "";
  } else if (page.hasClass("sq-guide")) {
    after = before;
  } else {
    after = $("code", page).text();
  }

  let animation = codeDiffAnimation(before, after);
  let makeUpdate = (enablesScroll) => {
    return (target, frame) => {
      let cursorPosition = {
        line: frame.cursorPosition.line,
        ch: frame.cursorPosition.character
      };
      target.setCursor(cursorPosition.line, cursorPosition.ch);
      if (enablesScroll) {
        target.scrollIntoView(cursorPosition);
      }
      if (frame.action == "insert") {
        target.getDoc().replaceRange(frame.value, cursorPosition, cursorPosition);
      } else if (frame.action == "delete") {
        target.execCommand("delCharBefore");
      } else {
        throw "Never reaches here.";
      }
    };
  }

  if (isTargetPage && action == "next") {
    upperLeft.addClass("sq-highlighted");
    prevButton.prop("disabled", true);
    nextButton.prop("disabled", true);
    playAnimation(animation, codeEntity, 800, 80, makeUpdate(true), () => {
      prevButton.prop("disabled", false);
      nextButton.prop("disabled", false);
      upperLeft.removeClass("sq-highlighted");
    });
  } else {
    playAnimation(animation, codeEntity, 0, 0, makeUpdate(false));
  }
}

function showOutput(page, action, isTargetPage) {
  $("> *", upperRight).detach();
  if (page == null) {
    return;
  }
  let showResult = () => {
    $("> *", upperRight).detach();
    upperRight.append(page);
  };
  if (isTargetPage && !page.hasClass("sq-guide") && action == "next") {
    upperRight.append('<div class="sq-spinner"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></div>');
    setTimeout(() => {
      showResult();
    }, 500);
  } else {
    showResult();
  }
}

function showSubtitle(page, action, isTargetPage) {
  $("> *", lowerCenter).detach();
  if (page == null) {
    return;
  }
  lowerCenter.append(page);
}

$(() => {
  initializePage();
});