$(function() {
  var editor = $(".sq-editor");
  var first = true;
  var inputArea = $(".sq-input>textarea", editor)[0];
  var inputMirror = CodeMirror.fromTextArea(inputArea, {
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    indentUnit: 4,
    mode: "text/x-swift",
  });
  inputMirror.on("focus", function() {
    if (first) {
      inputMirror.setValue("");
      first = false;
    }
  });
  var outputArea = $(".sq-output>textarea", editor)[0];
  var outputMirror = CodeMirror.fromTextArea(outputArea, {
    lineNumbers: false,
    lineWrapping: true,
    indentUnit: 4,
    readOnly: true,
    theme: "output",
  });
  var playButton = $(".sq-play-button");
  var closeButton = $(".sq-close-button");
  playButton.click(function() {
    editor.addClass("sq-show-output");
    playButton.addClass("sq-show-output");
    closeButton.addClass("sq-show-output");
    var source = inputMirror.getValue();
    SwiftQuest.postSource(source).done(function(result) {
        if (result.status == 'success') {
            outputMirror.setValue(result.result);
        } if (result.status == 'timeout') {
            alert('エラーが発生しました。プログラムの実行にかかる時間が長すぎます。');
        } else if (result.status == 'noSource') {
            alert('システムエラーが発生しました。');
        }
    }).fail(function() {
        alert('ネットワークエラーが発生しました。');
    });
  });
  closeButton.click(function() {
    editor.removeClass("sq-show-output");
    playButton.removeClass("sq-show-output");
    closeButton.removeClass("sq-show-output");
  });
});
// $("nav.affix-top").removeClass("affix-top").addClass("affix");
