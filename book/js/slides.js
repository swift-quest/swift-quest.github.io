function showPage(page) {
  document.getElementById("sq-text").innerHTML = texts[page];
}

var page = 0;

document.getElementById("sq-button").onclick = function() {
  page++;
  if (page == texts.length) {
    location.href = next;
    return;
  }

  showPage(page);
};

showPage(page);