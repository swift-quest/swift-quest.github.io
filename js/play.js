$(function() {
  var editor = $(".sq-editor");
  var first = true;
  var inputArea = $(".sq-input>.sq-mirror>textarea", editor)[0];
  var inputMirror = CodeMirror.fromTextArea(inputArea, {
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    indentUnit: 4,
    mode: "text/x-swift",
    theme: "quest",
  });
  inputMirror.on("focus", function() {
    if (first) {
      inputMirror.setValue("");
      first = false;
    }
  });
  var outputArea = $(".sq-output>.sq-mirror>textarea", editor)[0];
  var outputMirror = CodeMirror.fromTextArea(outputArea, {
    lineNumbers: false,
    lineWrapping: true,
    indentUnit: 4,
    readOnly: true,
    theme: "output",
  });
  var outputSpinner = $(".sq-output>.sq-spinner", editor);
  var playButton = $(".sq-play-button");
  var closeButton = $(".sq-close-button");
  playButton.click(function() {
    outputMirror.setValue("");
    outputSpinner.css({ display: "flex" });
    playButton.attr("disabled", true);
    editor.addClass("sq-show-output");
    playButton.addClass("sq-show-output");
    closeButton.addClass("sq-show-output");
    var defaultOutput = "ここに結果が表示されます。";
    var source = inputMirror.getValue();
    SwiftQuest.postSource(source).done(function(result) {
        if (result.status == 'success') {
            outputMirror.setValue(result.result);
        } else if (result.status == 'timeout') {
            outputMirror.setValue(defaultOutput);
            alert('プログラムの実行にかかる時間が長すぎるため、中断されました。');
        } else if (result.status == 'noSource') {
            outputMirror.setValue(defaultOutput);
            alert('システムエラーが発生しました。');
        }
    }).fail(function() {
        outputMirror.setValue(defaultOutput);
        alert('ネットワークエラーが発生しました。');
    }).always(function() {
        outputSpinner.css({ display: "none" });
        playButton.attr("disabled", false);
    });
  });
  closeButton.click(function() {
    editor.removeClass("sq-show-output");
    playButton.removeClass("sq-show-output");
    closeButton.removeClass("sq-show-output");
  });
});
// $("nav.affix-top").removeClass("affix-top").addClass("affix");
