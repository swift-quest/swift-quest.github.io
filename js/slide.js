let pages;
let pageIndex = 0;
let upperLeft;
let upperRight;
let lowerCenter;

let prevButton;
let nextButton;

function codeDiffAnimation(before, after) {
  let animation = []

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
      for (let endIndex = 1; endIndex <= partValue.length; endIndex++) {
        animation.push(done(diff, partIndex) + partValue.substring(0, endIndex) + undone(diff, partIndex + 1));
      }
    } else if (part.removed) {
      for (let endIndex = partValue.length - 1; endIndex >= 0; endIndex--) {
        animation.push(done(diff, partIndex) + partValue.substring(0, endIndex) + undone(diff, partIndex + 1));
      }
    } else {
      animation.push(done(diff, partIndex) + partValue + undone(diff, partIndex + 1));
    }
  }

  return animation;
}

function playAnimation(animation, target, delay, completion) {
  if (animation.length == 0) {
    completion();
    return;
  }

  target.html(animation[0]);
  setTimeout(() => {
    playAnimation(animation.slice(1, animation.length), target, delay, completion);
  }, delay);
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

  $("> *", upperLeft).detach();
  $("> *", upperRight).detach();
  $("> *", lowerCenter).detach();

  for (let i = 0; i <= pageIndex; i++) {
    let page = $(pages[i]);
    if (page.hasClass("sq-code")) {
      if (i == pageIndex && !page.hasClass("sq-guide") && action == "next") {
        upperLeft.addClass("sq-highlighted");

        let before = $(".sq-guide", upperLeft).length != 0 ? "" : upperLeft.text();
        page.wrap("<div></div>");
        let after = page.parent().text();
        page.unwrap();

        let animation = codeDiffAnimation(before, after);

        $("> *", upperLeft).detach();
        upperLeft.append('<pre class="sq-code"><code></code></pre>');
        let target = $("code", upperLeft);
        if (animation.length > 0) {
          target.html(before);
        }
        prevButton.prop("disabled", true);
        nextButton.prop("disabled", true);
        setTimeout(() => {
          playAnimation(animation, target, 80, () => {
            $("> *", upperLeft).detach();
            upperLeft.append(page);
            prevButton.prop("disabled", false);
            nextButton.prop("disabled", false);
            upperLeft.removeClass("sq-highlighted");
          });
        }, 800);
      } else {
        $("> *", upperLeft).detach();
        upperLeft.append(page);
      }
    }
    if (page.hasClass("sq-output")) {
      $("> *", upperRight).detach();
      let showResult = () => {
        $("> *", upperRight).detach();
        upperRight.append(page);
      };
      if (i == pageIndex && !page.hasClass("sq-guide") && action == "next") {
        upperRight.append('<div class="sq-spinner"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></div>');
        setTimeout(() => {
          showResult();
        }, 500);
      } else {
        showResult();
      }
    }
    if (page.hasClass("sq-subtitle")) {
      $("> *", lowerCenter).detach();
      lowerCenter.append(page);
    }
  }
}

$(() => {
  initializePage();
});