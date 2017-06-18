let isBattleStandalone = false;
let winCount = 0;
function flatMap(array, transform) {
    let result = [];
    for (let us of array.map((t) => transform(t))) {
        for (let u of us) {
            result.push(u);
        }
    }
    return result;
}
function anyOf(array) {
    if (array.length == 0) {
        return null;
    }
    return array[Math.floor(array.length * Math.random())];
}
function apply(thiz, action) {
    action(thiz);
    return thiz;
}
function delay(milliseconds, action) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            action();
            resolve();
        }, milliseconds);
    });
}
let container = document.getElementById("sq-container");
let fullscreenEffect = (document.getElementById("sq-fullscreen-effect") || parent.document.getElementById("sq-fullscreen-effect"));
let statusBox = document.getElementById("sq-status-box");
let monsters = document.getElementById("sq-monsters");
let enemyIndexMap = [1, 0, 2];
function enemyElement(i) {
    return monsters.children[enemyIndexMap[i]];
}
let audioBattle = document.getElementById("sq-audio-battle");
let audioBattleStarted = false;
let audioWin = document.getElementById("sq-audio-win");
let audioWinStarted = false;
let messageBox = document.getElementById("sq-message-box");
class Message {
    constructor(text, action = null, actionBefore = null) {
        this.text = text;
        this.action = action;
        this.actionBefore = actionBefore;
    }
}
function showMessages(messages) {
    function _showMessages(messages) {
        while (messageBox.children.length > 0) {
            messageBox.removeChild(messageBox.children[messageBox.children.length - 1]);
        }
        let message = messages.shift();
        if (message === undefined) {
            return Promise.resolve(undefined);
        }
        let nonnullMessage = message;
        let result = Promise.resolve(undefined);
        let actionBefore = message.actionBefore;
        if (actionBefore != null) {
            let nonnullActionBefore = actionBefore;
            result = result.then((_x) => nonnullActionBefore());
        }
        let messageBody = document.createElement("div");
        messageBox.appendChild(messageBody);
        messageBody.textContent = message.text;
        return result.then((_x) => {
            let nextIndicator = document.createElement("div");
            messageBox.appendChild(nextIndicator);
            nextIndicator.className = "sq-next-indicator";
            nextIndicator.innerHTML = '<img src="/img/battle/arrow-down.png" class="sq-blink" />';
            return new Promise((resolve, reject) => {
                messageBox.onclick = () => {
                    if (nonnullMessage.action == null) {
                        return resolve(undefined);
                    }
                    return resolve(nonnullMessage.action());
                };
            });
        }).then((value) => {
            return _showMessages(messages);
        });
    }
    messageBox.style.display = "flex";
    return _showMessages(messages.concat()).then((value) => {
        messageBox.style.display = "none";
    });
}
class Color {
    constructor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    get css() {
        return "rgb(".concat(String(this.red)).concat(",")
            .concat(String(this.green)).concat(",")
            .concat(String(this.blue)).concat(")");
    }
}
let selections = document.getElementById("sq-selections");
function clearSelections() {
    let children = selections.children;
    while (children.length > 0) {
        selections.removeChild(children.item(0));
    }
    selections.style.display = "none";
}
function removeSelections(numberOfSelections) {
    let children = selections.children;
    for (let i = 0; i < numberOfSelections && children.length > 0; i++) {
        selections.removeChild(children.item(children.length - 1));
    }
}
class SelectionItem {
    constructor(value, disabled = false) {
        this.value = value;
        this.disabled = disabled;
    }
}
class SelectionResult {
    constructor(value, update = null) {
        this.value = value;
        this.update = update;
    }
    then_(transform) {
        let thiz = this;
        let transformed = this.value.then(transform);
        if (this.update == null) {
            return transformed;
        }
        let updateTransformed = this.update.then((result) => {
            return result.then_(transform);
        });
        let promises = [transformed, updateTransformed];
        return Promise.race(promises);
    }
}
function _select(items, updatable, arrowImages, buttons, numberOfStacks) {
    let resolve2 = null;
    let update = new Promise((_resolve2, _reject2) => {
        resolve2 = _resolve2;
    });
    let value = new Promise((resolve, reject) => {
        for (let iString in items) {
            let i = Number(iString);
            let item = items[i];
            let arrowImage = arrowImages[i];
            let button = buttons[i];
            button.onclick = () => {
                while (selections.children.length > numberOfStacks) {
                    selections.removeChild(selections.children[selections.children.length - 1]);
                }
                for (let a of arrowImages) {
                    a.className = "sq-hidden";
                }
                arrowImage.className = "sq-fixed";
                resolve(item.value);
                let result2 = _select(items, updatable, arrowImages, buttons, numberOfStacks);
                if (resolve2 === null) {
                    throw "Never reaches here.";
                }
                resolve2(result2);
                button.onclick = () => { };
            };
        }
    });
    return new SelectionResult(value, updatable ? update : null);
}
function select(items, title = null, updatable = false) {
    let resolved = false;
    let selectionBox = document.createElement("div");
    selectionBox.className = "sq-box sq-selection";
    if (title != null) {
        let titleBox = document.createElement("div");
        selectionBox.appendChild(titleBox);
        titleBox.className = "sq-title";
        titleBox.textContent = title;
    }
    let list = document.createElement("ul");
    selectionBox.appendChild(list);
    let arrowImages = [];
    let buttons = [];
    let first = true;
    for (let item of items) {
        let listItem = document.createElement("li");
        list.appendChild(listItem);
        let button = document.createElement("button");
        listItem.appendChild(button);
        if (item != null && item.disabled) {
            button.disabled = true;
        }
        let arrow = document.createElement("span");
        button.appendChild(arrow);
        let arrowImage = document.createElement("img");
        arrow.appendChild(arrowImage);
        arrowImages.push(arrowImage);
        arrowImage.src = "/img/battle/arrow-right.png";
        if (!item.disabled && first) {
            arrowImage.className = "sq-blink";
            first = false;
        }
        else {
            arrowImage.className = "sq-hidden";
        }
        let itemLabel = document.createElement("span");
        button.appendChild(itemLabel);
        buttons.push(button);
        let itemValue = item.value;
        if (typeof itemValue === "string") {
            itemLabel.textContent = itemValue;
        }
        else {
            itemLabel.textContent = itemValue.name;
        }
    }
    selections.appendChild(selectionBox);
    selections.style.display = "block";
    let numberOfStacks = selections.children.length;
    return _select(items, updatable, arrowImages, buttons, numberOfStacks);
}
function attack(scene, target, damage, noDamageMessage, whole = false) {
    let messages = [];
    if (!target.isAlive) {
        if (!whole) {
            messages.push(new Message(target.name.concat("はすでにしんでいる。")));
        }
        return messages;
    }
    target.hurt(damage);
    let sceneSnapshot = scene.clone();
    if (damage > 0) {
        messages.push(new Message(target.name.concat("に").concat(String(damage)).concat("のダメージ。"), () => {
            updateStatusBox(sceneSnapshot);
            return Promise.resolve(undefined);
        }, () => {
            let animation;
            if (target.isEnemy) {
                let enemyIndex = sceneSnapshot.enemy.members.map((character) => character.name).indexOf(target.name);
                enemyElement(enemyIndex).style.visibility = "hidden";
                animation = delay(70, () => {
                    enemyElement(enemyIndex).style.visibility = "visible";
                }).then((_x) => {
                    return delay(70, () => {
                        enemyElement(enemyIndex).style.visibility = "hidden";
                    });
                }).then((_x) => {
                    return delay(70, () => {
                        enemyElement(enemyIndex).style.visibility = "visible";
                    });
                });
            }
            else {
                container.style.left = "-6px";
                animation = delay(60, () => {
                    container.style.left = "6px";
                }).then((_x) => {
                    return delay(60, () => {
                        container.style.left = "-6px";
                    });
                }).then((_x) => {
                    return delay(60, () => {
                        container.style.left = "6px";
                    });
                }).then((_x) => {
                    return delay(60, () => {
                        container.style.left = "0";
                    });
                });
            }
            return animation.then((_x) => {
                if (!sceneSnapshot.enemy.isAlive) {
                    messageBox.addEventListener("click", (event) => {
                        if (!audioWinStarted) {
                            audioBattle.pause();
                            audioWin.play();
                            audioWinStarted = true;
                        }
                    });
                }
                return undefined;
            });
        }));
    }
    else {
        messages.push(new Message(target.name.concat(noDamageMessage)));
    }
    if (!target.isAlive) {
        target.hasMagicShield = false;
        if (target.isEnemy) {
            messages.push(new Message(target.name.concat("をやっつけた。")));
        }
        else {
            messages.push(new Message(target.name.concat("はしんでしまった。")));
        }
    }
    return messages;
}
class Spell {
    constructor(name, color, mp, whole) {
        this.name = name;
        this.color = color;
        this.mp = mp;
        this.whole = whole;
    }
    isAvailable(scene) {
        return this.whole || this.targets(scene).length > 0;
    }
}
class RestorationSpell extends Spell {
    constructor(name, color, mp, whole, quantity, forDead = false) {
        super(name, color, mp, whole);
        this.quantity = quantity;
        this.forDead = forDead;
    }
    targets(scene) {
        return this.forDead ? scene.friend.membersDead : scene.friend.membersAlive.filter((member) => !member.isHpFull);
    }
    perform(scene, target) {
        if (this.forDead) {
            if (target.isAlive) {
                if (this.whole) {
                    return [];
                }
                else {
                    return [new Message(target.name.concat("にはきかなかった。"))];
                }
            }
        }
        else {
            if (!target.isAlive) {
                if (this.whole) {
                    return [];
                }
                else {
                    return [new Message(target.name.concat("にはきかなかった。"))];
                }
            }
        }
        let quantity = Math.max(0, Math.floor(this.quantity * ((Math.random() * 0.4) + 0.8)));
        target.restore(quantity);
        let sceneSnapshot = scene.clone();
        let messageText;
        if (this.forDead) {
            messageText = target.name.concat("はいきかえった。");
        }
        else {
            messageText = target.name.concat("のHPがかいふくした。");
        }
        return [new Message(messageText, () => { updateStatusBox(sceneSnapshot); return Promise.resolve(undefined); })];
    }
}
class AttackSpell extends Spell {
    constructor(name, color, mp, whole, damage) {
        super(name, color, mp, whole);
        this.damage = damage;
    }
    targets(scene) {
        return this.whole ? scene.enemy.members : scene.enemy.membersAlive;
    }
    perform(scene, target) {
        let damage = Math.max(0, Math.floor(this.damage * ((Math.random() * 0.4) + 0.8) / (target.isDefending ? 2 : 1) / (target.hasMagicShield ? 2 : 1)));
        return attack(scene, target, damage, "にはきかなかった。", this.whole);
    }
}
class MagicShieldSpell extends Spell {
    constructor() {
        super("マジックシールド", new Color(255, 255, 255), 13, false);
    }
    targets(scene) {
        return scene.friend.membersAlive.filter((character) => !character.hasMagicShield);
    }
    perform(scene, target) {
        if (target.hasMagicShield) {
            return [new Message(target.name.concat("にはきかなかった。"))];
        }
        target.hasMagicShield = true;
        return [new Message(target.name.concat("はまほうのたてにつつまれた。"))];
    }
}
class Spells {
}
Spells.healing = new RestorationSpell("ヒーリング", new Color(255, 255, 255), 5, false, 80);
Spells.resurrection = new RestorationSpell("リザレクション", new Color(255, 255, 255), 15, false, 999, true);
Spells.fireball = new AttackSpell("ファイアボール", new Color(254, 75, 38), 5, false, 70);
Spells.inferno = new AttackSpell("インフェルノ", new Color(254, 75, 38), 10, false, 130);
Spells.blizzard = new AttackSpell("ブリザード", new Color(38, 75, 254), 9, true, 70);
Spells.thunderbolt = new AttackSpell("サンダーボルト", new Color(254, 254, 75), 8, false, 100);
Spells.tempest = new AttackSpell("テンペスト", new Color(127, 127, 127), 12, true, 95);
Spells.magicShield = new MagicShieldSpell();
class Action {
    constructor(character) {
        this.character = character;
    }
}
class AttackAction extends Action {
    constructor(character, target) {
        super(character);
        this.target = target;
    }
    perform(scene) {
        let messages = [new Message(this.character.name.concat("のこうげき。"))];
        let damage = Math.max(0, Math.floor((this.character.attack - this.target.defense * Math.random()) / 2 / (this.target.isDefending ? 2 : 1)));
        for (let message of attack(scene, this.target, damage, "にダメージをあたえられない。")) {
            messages.push(message);
        }
        return messages;
    }
}
class SpellAction extends Action {
    constructor(character, spell, targets) {
        super(character);
        this.spell = spell;
        this.targets = targets;
    }
    perform(scene) {
        let canPerform = this.character.mp >= this.spell.mp;
        if (canPerform) {
            this.character.mp -= this.spell.mp;
        }
        let sceneSnapshot = scene.clone();
        let messages = [new Message(this.character.name.concat("は").concat(this.spell.name).concat("のまほうをつかった。"), () => { updateStatusBox(sceneSnapshot); return Promise.resolve(undefined); }, () => {
                fullscreenEffect.style.backgroundColor = this.spell.color.css;
                fullscreenEffect.style.visibility = "visible";
                return delay(80, () => {
                    fullscreenEffect.style.visibility = "hidden";
                }).then((_x) => {
                    return delay(80, () => {
                        fullscreenEffect.style.visibility = "visible";
                    });
                }).then((_x) => {
                    return delay(80, () => {
                        fullscreenEffect.style.visibility = "hidden";
                    });
                });
            })];
        if (canPerform) {
            for (let target of this.targets) {
                for (let message of this.spell.perform(scene, target)) {
                    messages.push(message);
                }
            }
        }
        else {
            messages.push(new Message("しかしMPがたりない。"));
        }
        return messages;
    }
}
class DefenseAction extends Action {
    constructor(character) {
        super(character);
        character.isDefending = true;
    }
    perform(scene) {
        return [new Message(this.character.name.concat("はみをまもっている。"))];
    }
}
class SummonAction extends Action {
    constructor(character, target) {
        super(character);
        this.target = target;
    }
    perform(scene) {
        this.target.hp = this.target.maxHp;
        let sceneSnapshot = scene.clone();
        let messages = [
            new Message(this.character.name.concat("はなかまをよんだ。"), () => { updateStatusBox(sceneSnapshot); return Promise.resolve(undefined); }),
            new Message(this.target.name.concat("があらわれた。"))
        ];
        return messages;
    }
}
class MultipleAction extends Action {
    constructor(character, actions) {
        super(character);
        this.actions = actions;
    }
    perform(scene) {
        let messages = [];
        for (let action of this.actions) {
            for (let message of action.perform(scene)) {
                messages.push(message);
            }
            if (scene.isBattleFinished) {
                break;
            }
        }
        return messages;
    }
}
class Character {
    constructor(name, hp, mp, attack, defense, agility, spells, isEnemy) {
        this.name = name;
        this.maxHp = hp;
        this.hp = hp;
        this.maxMp = mp;
        this.mp = mp;
        this.attack = attack;
        this.defense = defense;
        this.agility = agility;
        this.spells = spells;
        this.isEnemy = isEnemy;
        this.isDefending = false;
        this.hasMagicShield = false;
    }
    get isAlive() {
        return this.hp > 0;
    }
    get isHpFull() {
        return this.hp == this.maxHp;
    }
    hurt(damage) {
        this.hp = Math.max(0, this.hp - damage);
    }
    restore(quantity) {
        this.hp = Math.min(this.maxHp, this.hp + quantity);
    }
}
class PlayerCharacter extends Character {
    decideAction(scene) {
        let thiz = this;
        return select([new SelectionItem("こうげき"), new SelectionItem("まほう", this.spells.length == 0), new SelectionItem("ぼうぎょ")], this.name, true).then_((actionName) => {
            switch (actionName) {
                case "こうげき": {
                    return select(scene.enemy.members.filter((member) => member.isAlive).map((member) => new SelectionItem(member)), null, true).then_((target) => {
                        if (target == null) {
                            removeSelections(2);
                            return thiz.decideAction(scene);
                        }
                        return Promise.resolve(new AttackAction(this, target));
                    });
                }
                case "まほう": {
                    return thiz.decideSpellAction(scene);
                }
                case "ぼうぎょ": {
                    return Promise.resolve(new DefenseAction(this));
                }
                default: {
                    throw "Never reaches here.";
                }
            }
        }).then((action) => {
            clearSelections();
            return action;
        });
    }
    decideSpellAction(scene) {
        let thiz = this;
        return select(this.spells.map((spell) => new SelectionItem(spell, spell.mp > this.mp || !spell.isAvailable(scene))), null, true).then_((spell) => {
            if (spell == null) {
                removeSelections(2);
                return thiz.decideAction(scene);
            }
            if (spell.whole) {
                return Promise.resolve(spell.targets(scene)).then((targets) => new SpellAction(this, spell, targets));
            }
            else {
                return select(spell.targets(scene).map((member) => new SelectionItem(member)), null, true).then_((target) => {
                    if (target == null) {
                        removeSelections(2);
                        return thiz.decideSpellAction(scene);
                    }
                    return Promise.resolve(new SpellAction(this, spell, [target]));
                });
            }
        });
    }
    clone() {
        return new PlayerCharacter(this.name, this.hp, this.mp, this.attack, this.defense, this.agility, this.spells, this.isEnemy);
    }
}
class NonPlayerCharacter extends Character {
    constructor(name, hp, mp, attack, defense, agility, spells, isEnemy, decideAction) {
        super(name, hp, mp, attack, defense, agility, spells, isEnemy);
        this._decideAction = decideAction;
    }
    decideAction(scene) {
        return this._decideAction(this, scene);
    }
    clone() {
        return new NonPlayerCharacter(this.name, this.hp, this.mp, this.attack, this.defense, this.agility, this.spells, this.isEnemy, this._decideAction);
    }
}
class Party {
    constructor(members) {
        this.members = members;
    }
    get isAlive() {
        return this.members.reduce((alive, character) => alive || character.isAlive, false);
    }
    get membersAlive() {
        return this.members.filter((member) => member.isAlive);
    }
    get membersDead() {
        return this.members.filter((member) => !member.isAlive);
    }
    get anyMemberAlive() {
        return anyOf(this.membersAlive);
    }
    clone() {
        return new Party(this.members.map((member) => member.clone()));
    }
}
class Scene {
    constructor(friend, enemy, turn = 0) {
        this.friend = friend;
        this.enemy = enemy;
        this.turn = turn;
    }
    get characters() {
        return this.friend.members.concat(this.enemy.members);
    }
    get reversed() {
        return new Scene(this.enemy, this.friend, this.turn);
    }
    clone() {
        return new Scene(this.friend.clone(), this.enemy.clone(), this.turn);
    }
    decideTurnActions() {
        let scene = this;
        function decideActions(characters) {
            let character = characters.shift();
            if (character === undefined) {
                return Promise.resolve([]);
            }
            return character.decideAction(character.isEnemy ? scene.reversed : scene).then((action) => {
                return decideActions(characters).then((actions) => {
                    actions.unshift(action);
                    return actions;
                });
            });
        }
        return decideActions(this.characters.filter((character) => character.isAlive));
    }
    performTurn() {
        let scene = this;
        return this.decideTurnActions().then((actions) => {
            let sortedActions = actions.concat().sort((a, b) => b.character.agility - a.character.agility);
            function _performTurn(actions) {
                if (!scene.friend.isAlive) {
                    return Promise.resolve(scene.enemy);
                }
                if (!scene.enemy.isAlive) {
                    return Promise.resolve(scene.friend);
                }
                let action = actions.shift();
                if (action === undefined) {
                    return Promise.resolve(null);
                }
                if (!action.character.isAlive) {
                    return _performTurn(actions);
                }
                return showMessages(action.perform(scene)).then((value) => {
                    updateStatusBox(scene);
                    return _performTurn(actions);
                });
            }
            return _performTurn(sortedActions);
        }).then((party) => {
            scene.characters.forEach((character) => { character.isDefending = false; });
            scene.turn++;
            return party;
        });
    }
    performBattle() {
        let scene = this;
        return this.performTurn().then((winner) => {
            if (winner != null) {
                return Promise.resolve(winner);
            }
            return scene.performBattle();
        });
    }
    get isBattleFinished() {
        return this.friend.membersAlive.length == 0 || this.enemy.membersAlive.length == 0;
    }
}
function updateStatusBox(scene) {
    let names = statusBox.getElementsByClassName("sq-name")[0].getElementsByClassName("sq-value");
    let hps = statusBox.getElementsByClassName("sq-hp")[0].getElementsByClassName("sq-value");
    let mps = statusBox.getElementsByClassName("sq-mp")[0].getElementsByClassName("sq-value");
    let characters = scene.friend.members;
    for (let iString in characters) {
        let i = Number(iString);
        let character = characters[i];
        names[i].textContent = character.name;
        hps[i].textContent = String(character.hp);
        mps[i].textContent = String(character.mp);
    }
    let enemyMembers = scene.enemy.members;
    for (let iString in enemyMembers) {
        let i = Number(iString);
        let character = enemyMembers[i];
        enemyElement(i).style.visibility = character.isAlive ? "visible" : "hidden";
    }
}
function startBattle() {
    let darkKnightSummoned = false;
    let demonPriestSummoned = false;
    const scene = new Scene(new Party([
        new PlayerCharacter("ゆうしゃ", 153, 25, 162, 97, 72, [Spells.healing, Spells.resurrection, Spells.thunderbolt], false),
        new PlayerCharacter("せんし", 198, 0, 178, 111, 63, [], false),
        new PlayerCharacter("そうりょ", 101, 35, 76, 55, 75, [Spells.healing, Spells.resurrection, Spells.magicShield], false),
        new PlayerCharacter("まほうつかい", 77, 58, 60, 57, 48, [Spells.fireball, Spells.inferno, Spells.blizzard, Spells.tempest], false),
    ]), new Party([
        new NonPlayerCharacter("まおう", 999, 99, 185, 58, 61, [Spells.inferno, Spells.blizzard, Spells.tempest], true, (character, scene) => {
            if (!scene.friend.members[1].isAlive && !scene.friend.members[2].isAlive) {
                let summons = false;
                if (darkKnightSummoned) {
                    if (demonPriestSummoned) {
                        summons = Math.random() < 0.1;
                    }
                }
                else {
                    summons = Math.random() < 0.3;
                }
                if (summons) {
                    darkKnightSummoned = true;
                    return Promise.resolve(new SummonAction(character, scene.friend.members[1]));
                }
            }
            if (!scene.friend.members[2].isAlive && darkKnightSummoned) {
                let summons = false;
                if (demonPriestSummoned) {
                    summons = Math.random() < 0.1;
                }
                else {
                    summons = Math.random() < 0.3;
                }
                if (summons) {
                    demonPriestSummoned = true;
                    return Promise.resolve(new SummonAction(character, scene.friend.members[2]));
                }
            }
            let spellsAvailable = character.spells.filter((spell) => character.mp >= spell.mp);
            let spell = anyOf(spellsAvailable);
            if (spell && Math.random() < 0.8) {
                let targets;
                if (spell.whole) {
                    targets = spell.targets(scene);
                }
                else {
                    targets = [anyOf(spell.targets(scene))];
                }
                return Promise.resolve(new SpellAction(character, spell, targets));
            }
            else {
                return Promise.resolve(new AttackAction(character, scene.enemy.anyMemberAlive));
            }
        }),
        apply(new NonPlayerCharacter("あんこくきし", 250, 0, 181, 93, 73, [], true, (character, scene) => {
            return Promise.resolve(new MultipleAction(character, [
                new AttackAction(character, scene.enemy.anyMemberAlive),
                new AttackAction(character, scene.enemy.anyMemberAlive),
            ]));
        }), (thiz) => {
            switch (winCount) {
                case 0:
                    thiz.hp = 0;
                    break;
                default:
                    break;
            }
        }),
        apply(new NonPlayerCharacter("デモンプリースト", 180, 99, 121, 55, 59, [Spells.healing, Spells.resurrection, Spells.magicShield], true, (character, scene) => {
            let spellsAvailable = character.spells.filter((spell) => character.mp >= spell.mp);
            if (Math.random() < 0.5) {
                let spell = Spells.magicShield;
                if (spellsAvailable.indexOf(spell) >= 0) {
                    let targets = spell.targets(scene);
                    let target = scene.friend.members[0];
                    if (targets.indexOf(target) >= 0) {
                        return Promise.resolve(new SpellAction(character, spell, [target]));
                    }
                }
            }
            {
                let spell = Spells.resurrection;
                if (spellsAvailable.indexOf(spell) >= 0) {
                    let targets = spell.targets(scene);
                    if (targets.length > 0) {
                        let target = targets.sort((a, b) => { return b.maxHp - a.maxHp; })[0];
                        return Promise.resolve(new SpellAction(character, spell, [target]));
                    }
                }
            }
            {
                let spell = Spells.healing;
                if (spellsAvailable.indexOf(spell) >= 0) {
                    let targets = spell.targets(scene);
                    if (targets.length > 0) {
                        let target = targets.sort((a, b) => { return b.maxHp - a.maxHp; })[0];
                        return Promise.resolve(new SpellAction(character, spell, [target]));
                    }
                }
            }
            return Promise.resolve(new AttackAction(character, scene.enemy.anyMemberAlive));
        }), (thiz) => {
            switch (winCount) {
                case 0:
                    thiz.hp = 0;
                    break;
                default:
                    break;
            }
        }),
    ]));
    updateStatusBox(scene);
    return showMessages([new Message(scene.enemy.members[0].name.concat("があらわれた。"))]).then((value) => {
        return scene.performBattle();
    }).then((winner) => {
        if (winner == scene.friend) {
            winCount++;
            if (isBattleStandalone) {
                return select([new SelectionItem("もういちどたたかう")]).then_((item) => {
                    clearSelections();
                    return startBattle();
                });
            }
            else {
                location.href = "@next";
                return Promise.resolve(undefined);
            }
        }
        else {
            winCount = 0;
            let items;
            if (isBattleStandalone) {
                items = [new SelectionItem("やりなおす")];
            }
            else {
                items = [new SelectionItem("やりなおす"), new SelectionItem("つぎへすすむ")];
            }
            return select(items).then_((item) => {
                if (item == "やりなおす") {
                    clearSelections();
                    return startBattle();
                }
                location.href = "@next";
                return Promise.resolve(null);
            });
        }
    });
}
messageBox.addEventListener("click", (event) => {
    if (!audioBattleStarted) {
        audioBattle.play();
        audioBattleStarted = true;
    }
});
startBattle();
