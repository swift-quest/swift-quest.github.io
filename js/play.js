$(function() {
  var editor = $(".ss-editor");
  var first = true;
  var inputArea = $(".ss-input>textarea", editor)[0];
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
  var outputArea = $(".ss-output>textarea", editor)[0];
  var outputMirror = CodeMirror.fromTextArea(outputArea, {
    lineNumbers: false,
    lineWrapping: true,
    indentUnit: 4,
    readOnly: true,
    theme: "output",
  });
  var tryButton = $(".ss-try-button");
  var closeButton = $(".ss-close-button");
  tryButton.click(function() {
    editor.addClass("ss-show-output");
    tryButton.addClass("ss-show-output");
    closeButton.addClass("ss-show-output");
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
    editor.removeClass("ss-show-output");
    tryButton.removeClass("ss-show-output");
    closeButton.removeClass("ss-show-output");
  });
});
// $("nav.affix-top").removeClass("affix-top").addClass("affix");
