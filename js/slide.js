let pages;
let pageIndex = 0;
let upperLeft;
let upperRight;
let lowerCenter;

let prevButton;
let nextButton;

function enumerate(array /*: JQuery*/) {
  let enumerated = [];
  for (let index = 0; index < array.length; index++) {
    enumerated.push([index, array[index]]);
  }
  return enumerated;
}

function initializePage() {
  let main = $(".sq-slide")

  $("p", main).addClass("sq-subtitle");
  $("pre:has(code span)", main).addClass("sq-code");
  $("pre:not(:has(code span))", main).addClass("sq-output");
  $("div:has(pre.sq-code)", main).addClass("sq-code");
  $("div:has(pre.sq-output)", main).addClass("sq-output");
  $("code.highlighter-rouge").addClass("sq-code");

  pages = $("> *", main);
  pages.detach();

  // subtitles = $("p.sq-subtitle").detach();
  // codes = $("div.sq-code").detach();
  // outputs = $("div.sq-output").detach();

  main.append('<div class="sq-upper"></div>');
  let upper = $(".sq-upper", main);
  main.append('<div class="sq-lower"></div>');
  let lower = $(".sq-lower", main);

  upper.append('<div class="sq-left"></div>');
  upperLeft = $(".sq-left", upper);
  upper.append('<div class="sq-right"></div>');
  upperRight = $(".sq-right", upper);

  lower.append('<div class="sq-left"></div>');
  let lowerLeft = $(".sq-left", lower);
  lower.append('<div class="sq-center"></div>');
  lowerCenter = $(".sq-center", lower);
  lower.append('<div class="sq-right"></div>');
  let lowerRight = $(".sq-right", lower);

  // upperLeft.append(codes);
  // upperRight.append(outputs);

  lowerLeft.append('<button><i class="fa fa-arrow-left" aria-hidden="true"></i></button>');
  prevButton = $("button", lowerLeft);
  prevButton.click(() => {
    prev();
  });
  // lowerCenter.append(subtitles);
  lowerRight.append('<button><i class="fa fa-arrow-right" aria-hidden="true"></i></button>');
  nextButton = $("button", lowerRight);
  nextButton.click(() => {
    next();
  });

  show(pageIndex);
}

function prev() {
  show(--pageIndex);
}

function next() {
  show(++pageIndex);
}

function show(pageIndex) {
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
      $("> *", upperLeft).detach();
      upperLeft.append(page);
    }
    if (page.hasClass("sq-output")) {
      $("> *", upperRight).detach();
      let showResult = () => {
        $("> *", upperRight).detach();
        upperRight.append(page);
      };
      if (i == pageIndex && !page.hasClass("sq-guide")) {
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