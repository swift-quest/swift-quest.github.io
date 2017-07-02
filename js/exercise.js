$(() => {
  let content = $("#sq-content");
  // $("pre:has(code span)", content).addClass("sq-code");
  $("pre:not(:has(code span))", content).addClass("sq-output");
});