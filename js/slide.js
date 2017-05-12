const PAGE_KEY = "p";

let pages;
let pageIndex;
let upperLeft;
let upperRight;
let lowerCenter;

let codeEntity;
let outputEntity;
let subtitleView;

let prevButton;
let nextButton;
let skipAnimation = null;

function initializePage() {
  let content = $("#sq-content");

  $("p", content).addClass("sq-subtitle");
  $("pre:has(code span)", content).addClass("sq-code");
  $("pre:not(:has(code span))", content).addClass("sq-output");
  $("div:has(pre.sq-code)", content).addClass("sq-code");
  $("div:has(pre.sq-output)", content).addClass("sq-output");
  $("code.highlighter-rouge").addClass("sq-code");

  let jPages = $("> *", content);
  pages = [];
  let lastPage = null;
  for (let i = 0; i < jPages.length; i++) {
    let jPage = $(jPages[i]);
    let page;
    if (jPage.hasClass("sq-code")) {
      let content = $("code", jPage).text();
      if (lastPage instanceof CodePage && !lastPage.isGuide) {
        lastPage.contents.push(content);
        continue;
      } else {
        page = new CodePage(
          [content],
          jPage.hasClass("sq-guide")
        );
      }
    } else if (jPage.hasClass("sq-output")) {
      page = new OutputPage(
        $("code", jPage).text(),
        jPage.hasClass("sq-guide")
      );
    } else if (jPage.hasClass("sq-subtitle")) {
      page = new SubtitlePage(jPage.html());
    } else {
      throw "Illegal page: " + jPage.html();
    }
    pages.push(page);
    lastPage = page;
  }

  let slide = $("#sq-slide");

  let upper = $(".sq-upper", slide);
  let lower = $(".sq-lower", slide);

  upperLeft = $(".sq-left", upper);
  upperRight = $(".sq-right", upper);

  codeEntity = CodeMirror.fromTextArea($(".sq-code textarea", upperLeft)[0], {
    lineWrapping: true,
    indentUnit: 4,
    readOnly: true,
    mode: "text/x-swift",
    theme: "quest",
  });
  outputEntity = $(".sq-output code", upperRight);

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

  let pageName = getUrlParameters()[PAGE_KEY];
  if (pageName) {
    pageIndex = Math.floor(Number(pageName)) - 1;
    if (isNaN(pageIndex)) {
      pageIndex = 0;
    } else if (pageIndex < 0) {
      pageIndex = 0;
    } else if (pageIndex >= pages.length) {
      pageIndex = pages.length - 1;
    }
  } else {
    pageIndex = 0;
  }

  show(pageIndex);
}

function prev() {
  if (skipAnimation != null) {
    skipAnimation();
  }
  show(--pageIndex, "prev");
  updateUrl();
}

function next() {
  if (skipAnimation != null) {
    skipAnimation();
  }
  show(++pageIndex, "next");
  updateUrl();
}

function updateUrl() {
  history.replaceState(null, '', location.pathname + "?" + PAGE_KEY + "=" + (pageIndex + 1));
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
    let page = pages[i];
    if (page instanceof CodePage) {
      codePage = page;
    } else if (page instanceof OutputPage) {
      outputPage = page;
    } else if (page instanceof SubtitlePage) {
      subtitlePage = page;
    }
  }

  let targetPage = pages[pageIndex];
  let isTargetPage = (page) => {
    if (page == null) {
      return false;
    }
    return page == targetPage;
  };

  showCode(codePage, action, isTargetPage(codePage));
  showOutput(outputPage, action, isTargetPage(outputPage));
  showSubtitle(subtitlePage, action, isTargetPage(subtitlePage));
}

function showCode(page, action, isTargetPage) {
  let guideView = $(".sq-overlay", upperLeft);
  guideView.text("");
  let snapshots = [];
  snapshots.push(codeEntity.getValue());
  if (page == null) {
    snapshots.push("");
  } else if (page.isGuide) {
    guideView.text(page.contents[0]);
    codeEntity.setValue("");
    return;
  } else {
    for (let snapshot of page.contents) {
      snapshots.push(snapshot);
    }
  }

  let animation = getDiffAnimation(snapshots);
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
    skipAnimation = playAnimation(animation, codeEntity, 800, 80, makeUpdate(true), () => {
      skipAnimation = null;
      upperLeft.removeClass("sq-highlighted");
    });
  } else {
    playAnimation(animation, codeEntity, 0, 0, makeUpdate(false));
  }
}

function showOutput(page, action, isTargetPage) {
  let content;
  let guideView = $(".sq-overlay", upperRight);
  guideView.text("");
  if (page == null) {
    content = "";
  } else if (page.isGuide) {
    guideView.text(page.content);
    outputEntity.text("");
    return;
  } else {
    content = page.content;
  }
  let showResult = () => {
    $("> *", guideView).detach();
    outputEntity.text(content);
  };
  if (isTargetPage && !page.isGuide && action == "next") {
    outputEntity.text("");
    $("> *", guideView).detach();
    guideView.append('<div class="sq-spinner"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></div>');
    let skipped = false;
    let doSkipAnimation = () => {
      if (skipped) { return; }
      skipped = true;
      skipAnimation = null;
      showResult();
    };
    skipAnimation = doSkipAnimation;
    setTimeout(() => {
      doSkipAnimation();
    }, 500);
  } else {
    showResult();
  }
}

function showSubtitle(page, action, isTargetPage) {
  let content;
  if (page == null) {
    content = "";
  } else {
    content = page.content;
  }
  lowerCenter.html(`<p>${content}</p>`);
}

$(() => {
  initializePage();
});