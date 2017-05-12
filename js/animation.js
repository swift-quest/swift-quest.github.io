class CursorPosition {
  constructor(line, character) {
    this.line = line;
    this.character = character;
  }
}

class DiffAnimationFrame {
  constructor(cursorPosition, action, value = null) {
    this.cursorPosition = cursorPosition;
    this.action = action;
    this.value = value;
  }
}

function getDiffAnimation(snapshots) {
  if (snapshots.length <= 0) { return []; }
  if (snapshots.length == 1) { return [snapshots[0]]; }
  if (snapshots.length > 2) {
    let tail = snapshots.map((snapshot) => snapshot); // clone
    let head = tail.shift();
    return getDiffAnimation([head, tail[0]]).concat(getDiffAnimation(tail));
  }

  let before = snapshots[0];
  let after = snapshots[1];

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
        animation.push(new DiffAnimationFrame(
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
        animation.push(new DiffAnimationFrame(
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
  let skipped = false;
  let chainedSkip = null;
  let skip = () => {
    skipped = true;
    if (chainedSkip != null) {
      chainedSkip();
      return;
    }
    playAnimation(animation, target, 0, 0, update, completion);
  };

  if (delay > 0) {
    setTimeout(() => {
      if (skipped) { return; }
      chainedSkip = playAnimation(animation, target, 0, interval, update, completion);
    }, delay);
    return skip;
  }

  if (animation.length == 0) {
    if (completion != null) {
      completion();
    }
    return skip;
  }

  update(target, animation[0]);

  let doPlayAnimation = () => {
    if (skipped) { return; }
    chainedSkip = playAnimation(animation.slice(1, animation.length), target, 0, interval, update, completion);
  }
  if (interval == 0) {
    doPlayAnimation();
  } else {
    setTimeout(doPlayAnimation, interval);
  }
  return skip;
}
