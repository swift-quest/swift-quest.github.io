var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var isBattleStandalone = false;
var winCount = 0;
function flatMap(array, transform) {
    var result = [];
    for (var _i = 0, _a = array.map(function (t) { return transform(t); }); _i < _a.length; _i++) {
        var us = _a[_i];
        for (var _b = 0, us_1 = us; _b < us_1.length; _b++) {
            var u = us_1[_b];
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
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            action();
            resolve();
        }, milliseconds);
    });
}
var container = document.getElementById("sq-container");
var fullscreenEffect = (document.getElementById("sq-fullscreen-effect") || parent.document.getElementById("sq-fullscreen-effect"));
var statusBox = document.getElementById("sq-status-box");
var monsters = document.getElementById("sq-monsters");
var enemyIndexMap = [1, 0, 2];
function enemyElement(i) {
    return monsters.children[enemyIndexMap[i]];
}
var audioBattle = document.getElementById("sq-audio-battle");
var audioBattleStarted = false;
var audioWin = document.getElementById("sq-audio-win");
var audioWinStarted = false;
var messageBox = document.getElementById("sq-message-box");
var Message = (function () {
    function Message(text, action, actionBefore) {
        if (action === void 0) { action = null; }
        if (actionBefore === void 0) { actionBefore = null; }
        this.text = text;
        this.action = action;
        this.actionBefore = actionBefore;
    }
    return Message;
}());
function showMessages(messages) {
    function _showMessages(messages) {
        while (messageBox.children.length > 0) {
            messageBox.removeChild(messageBox.children[messageBox.children.length - 1]);
        }
        var message = messages.shift();
        if (message === undefined) {
            return Promise.resolve(undefined);
        }
        var nonnullMessage = message;
        var result = Promise.resolve(undefined);
        var actionBefore = message.actionBefore;
        if (actionBefore != null) {
            var nonnullActionBefore_1 = actionBefore;
            result = result.then(function (_x) { return nonnullActionBefore_1(); });
        }
        var messageBody = document.createElement("div");
        messageBox.appendChild(messageBody);
        messageBody.textContent = message.text;
        return result.then(function (_x) {
            var nextIndicator = document.createElement("div");
            messageBox.appendChild(nextIndicator);
            nextIndicator.className = "sq-next-indicator";
            nextIndicator.innerHTML = '<img src="/img/battle/arrow-down.png" class="sq-blink" />';
            return new Promise(function (resolve, reject) {
                messageBox.onclick = function () {
                    if (nonnullMessage.action == null) {
                        return resolve(undefined);
                    }
                    return resolve(nonnullMessage.action());
                };
            });
        }).then(function (value) {
            return _showMessages(messages);
        });
    }
    messageBox.style.display = "flex";
    return _showMessages(messages.concat()).then(function (value) {
        messageBox.style.display = "none";
    });
}
var Color = (function () {
    function Color(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    Object.defineProperty(Color.prototype, "css", {
        get: function () {
            return "rgb(".concat(String(this.red)).concat(",")
                .concat(String(this.green)).concat(",")
                .concat(String(this.blue)).concat(")");
        },
        enumerable: true,
        configurable: true
    });
    return Color;
}());
var selections = document.getElementById("sq-selections");
function clearSelections() {
    var children = selections.children;
    while (children.length > 0) {
        selections.removeChild(children.item(0));
    }
    selections.style.display = "none";
}
function removeSelections(numberOfSelections) {
    var children = selections.children;
    for (var i = 0; i < numberOfSelections && children.length > 0; i++) {
        selections.removeChild(children.item(children.length - 1));
    }
}
var SelectionItem = (function () {
    function SelectionItem(value, disabled) {
        if (disabled === void 0) { disabled = false; }
        this.value = value;
        this.disabled = disabled;
    }
    return SelectionItem;
}());
var SelectionResult = (function () {
    function SelectionResult(value, update) {
        if (update === void 0) { update = null; }
        this.value = value;
        this.update = update;
    }
    SelectionResult.prototype.then_ = function (transform) {
        var thiz = this;
        var transformed = this.value.then(transform);
        if (this.update == null) {
            return transformed;
        }
        var updateTransformed = this.update.then(function (result) {
            return result.then_(transform);
        });
        var promises = [transformed, updateTransformed];
        return Promise.race(promises);
    };
    return SelectionResult;
}());
function _select(items, updatable, arrowImages, buttons, numberOfStacks) {
    var resolve2 = null;
    var update = new Promise(function (_resolve2, _reject2) {
        resolve2 = _resolve2;
    });
    var value = new Promise(function (resolve, reject) {
        var _loop_1 = function (iString) {
            var i = Number(iString);
            var item = items[i];
            var arrowImage = arrowImages[i];
            var button = buttons[i];
            button.onclick = function () {
                while (selections.children.length > numberOfStacks) {
                    selections.removeChild(selections.children[selections.children.length - 1]);
                }
                for (var _i = 0, arrowImages_1 = arrowImages; _i < arrowImages_1.length; _i++) {
                    var a = arrowImages_1[_i];
                    a.className = "sq-hidden";
                }
                arrowImage.className = "sq-fixed";
                resolve(item.value);
                var result2 = _select(items, updatable, arrowImages, buttons, numberOfStacks);
                if (resolve2 === null) {
                    throw "Never reaches here.";
                }
                resolve2(result2);
                button.onclick = function () { };
            };
        };
        for (var iString in items) {
            _loop_1(iString);
        }
    });
    return new SelectionResult(value, updatable ? update : null);
}
function select(items, title, updatable) {
    if (title === void 0) { title = null; }
    if (updatable === void 0) { updatable = false; }
    var resolved = false;
    var selectionBox = document.createElement("div");
    selectionBox.className = "sq-box sq-selection";
    if (title != null) {
        var titleBox = document.createElement("div");
        selectionBox.appendChild(titleBox);
        titleBox.className = "sq-title";
        titleBox.textContent = title;
    }
    var list = document.createElement("ul");
    selectionBox.appendChild(list);
    var arrowImages = [];
    var buttons = [];
    var first = true;
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        var listItem = document.createElement("li");
        list.appendChild(listItem);
        var button = document.createElement("button");
        listItem.appendChild(button);
        if (item != null && item.disabled) {
            button.disabled = true;
        }
        var arrow = document.createElement("span");
        button.appendChild(arrow);
        var arrowImage = document.createElement("img");
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
        var itemLabel = document.createElement("span");
        button.appendChild(itemLabel);
        buttons.push(button);
        var itemValue = item.value;
        if (typeof itemValue === "string") {
            itemLabel.textContent = itemValue;
        }
        else {
            itemLabel.textContent = itemValue.name;
        }
    }
    selections.appendChild(selectionBox);
    selections.style.display = "block";
    var numberOfStacks = selections.children.length;
    return _select(items, updatable, arrowImages, buttons, numberOfStacks);
}
function attack(scene, target, damage, noDamageMessage, whole) {
    if (whole === void 0) { whole = false; }
    var messages = [];
    if (!target.isAlive) {
        if (!whole) {
            messages.push(new Message(target.name.concat(" is already dead.")));
        }
        return messages;
    }
    target.hurt(damage);
    var sceneSnapshot = scene.clone();
    if (damage > 0) {
        messages.push(new Message(target.name.concat(" took ").concat(String(damage)).concat(" damage!"), function () {
            updateStatusBox(sceneSnapshot);
            return Promise.resolve(undefined);
        }, function () {
            var animation;
            if (target.isEnemy) {
                var enemyIndex_1 = sceneSnapshot.enemy.members.map(function (character) { return character.name; }).indexOf(target.name);
                enemyElement(enemyIndex_1).style.visibility = "hidden";
                animation = delay(70, function () {
                    enemyElement(enemyIndex_1).style.visibility = "visible";
                }).then(function (_x) {
                    return delay(70, function () {
                        enemyElement(enemyIndex_1).style.visibility = "hidden";
                    });
                }).then(function (_x) {
                    return delay(70, function () {
                        enemyElement(enemyIndex_1).style.visibility = "visible";
                    });
                    // }).then((_x) => {
                    //   if (target.isAlive) {
                    //     return Promise.resolve(null);
                    //   } else {
                    //     return delay(300, () => {
                    //       enemyElement(enemyIndex).style.visibility = "hidden";
                    //     });
                    //   }
                });
            }
            else {
                container.style.left = "-6px";
                animation = delay(60, function () {
                    container.style.left = "6px";
                }).then(function (_x) {
                    return delay(60, function () {
                        container.style.left = "-6px";
                    });
                }).then(function (_x) {
                    return delay(60, function () {
                        container.style.left = "6px";
                    });
                }).then(function (_x) {
                    return delay(60, function () {
                        container.style.left = "0";
                    });
                });
            }
            return animation.then(function (_x) {
                if (!sceneSnapshot.enemy.isAlive) {
                    messageBox.addEventListener("click", function (event) {
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
            messages.push(new Message(target.name.concat(" was defeated.")));
        }
        else {
            messages.push(new Message(target.name.concat(" perished.")));
        }
    }
    return messages;
}
var Spell = (function () {
    function Spell(name, color, mp, whole) {
        this.name = name;
        this.color = color;
        this.mp = mp;
        this.whole = whole;
    }
    Spell.prototype.isAvailable = function (scene) {
        return this.whole || this.targets(scene).length > 0;
    };
    return Spell;
}());
var RestorationSpell = (function (_super) {
    __extends(RestorationSpell, _super);
    function RestorationSpell(name, color, mp, whole, quantity, forDead) {
        if (forDead === void 0) { forDead = false; }
        var _this = _super.call(this, name, color, mp, whole) || this;
        _this.quantity = quantity;
        _this.forDead = forDead;
        return _this;
    }
    RestorationSpell.prototype.targets = function (scene) {
        return this.forDead ? scene.friend.membersDead : scene.friend.membersAlive.filter(function (member) { return !member.isHpFull; });
    };
    RestorationSpell.prototype.perform = function (scene, target) {
        if (this.forDead) {
            if (target.isAlive) {
                if (this.whole) {
                    return [];
                }
                else {
                    return [new Message(target.name.concat(" got no effect."))];
                }
            }
        }
        else {
            if (!target.isAlive) {
                if (this.whole) {
                    return [];
                }
                else {
                    return [new Message(target.name.concat(" got no effect."))];
                }
            }
        }
        var quantity = Math.max(0, Math.floor(this.quantity * ((Math.random() * 0.4) + 0.8)));
        target.restore(quantity);
        var sceneSnapshot = scene.clone();
        var messageText;
        if (this.forDead) {
            messageText = target.name.concat(" was revived.");
        }
        else {
            messageText = target.name.concat("'s wounds were healed.");
        }
        return [new Message(messageText, function () { updateStatusBox(sceneSnapshot); return Promise.resolve(undefined); })];
    };
    return RestorationSpell;
}(Spell));
var AttackSpell = (function (_super) {
    __extends(AttackSpell, _super);
    function AttackSpell(name, color, mp, whole, damage) {
        var _this = _super.call(this, name, color, mp, whole) || this;
        _this.damage = damage;
        return _this;
    }
    AttackSpell.prototype.targets = function (scene) {
        return this.whole ? scene.enemy.members : scene.enemy.membersAlive;
    };
    AttackSpell.prototype.perform = function (scene, target) {
        var damage = Math.max(0, Math.floor(this.damage * ((Math.random() * 0.4) + 0.8) / (target.isDefending ? 2 : 1) / (target.hasMagicShield ? 2 : 1)));
        return attack(scene, target, damage, " got no effect.", this.whole);
    };
    return AttackSpell;
}(Spell));
var MagicShieldSpell = (function (_super) {
    __extends(MagicShieldSpell, _super);
    function MagicShieldSpell() {
        return _super.call(this, "Magic Shield", new Color(255, 255, 255), 13, false) || this;
    }
    MagicShieldSpell.prototype.targets = function (scene) {
        return scene.friend.membersAlive.filter(function (character) { return !character.hasMagicShield; });
    };
    MagicShieldSpell.prototype.perform = function (scene, target) {
        if (target.hasMagicShield) {
            return [new Message(target.name.concat(" got no effect."))];
        }
        target.hasMagicShield = true;
        return [new Message(target.name.concat(" was covered in a magic sheild."))];
    };
    return MagicShieldSpell;
}(Spell));
var Spells = (function () {
    function Spells() {
    }
    return Spells;
}());
Spells.healing = new RestorationSpell("Healing", new Color(255, 255, 255), 5, false, 80);
Spells.resurrection = new RestorationSpell("Resurrection", new Color(255, 255, 255), 15, false, 999, true);
Spells.fireball = new AttackSpell("Fireball", new Color(254, 75, 38), 5, false, 70);
Spells.inferno = new AttackSpell("Inferno", new Color(254, 75, 38), 10, false, 130);
Spells.blizzard = new AttackSpell("Blizzard", new Color(38, 75, 254), 9, true, 70);
Spells.thunderbolt = new AttackSpell("Thunderbolt", new Color(254, 254, 75), 8, false, 100);
Spells.tempest = new AttackSpell("Tempest", new Color(127, 127, 127), 12, true, 95);
Spells.magicShield = new MagicShieldSpell();
var Action = (function () {
    function Action(character) {
        this.character = character;
    }
    return Action;
}());
var AttackAction = (function (_super) {
    __extends(AttackAction, _super);
    function AttackAction(character, target) {
        var _this = _super.call(this, character) || this;
        _this.target = target;
        return _this;
    }
    AttackAction.prototype.perform = function (scene) {
        var messages = [new Message(this.character.name.concat(" attacks."))];
        var damage = Math.max(0, Math.floor((this.character.attack - this.target.defense * Math.random()) / 2 / (this.target.isDefending ? 2 : 1)));
        for (var _i = 0, _a = attack(scene, this.target, damage, " took no damage!"); _i < _a.length; _i++) {
            var message = _a[_i];
            messages.push(message);
        }
        return messages;
    };
    return AttackAction;
}(Action));
var SpellAction = (function (_super) {
    __extends(SpellAction, _super);
    function SpellAction(character, spell, targets) {
        var _this = _super.call(this, character) || this;
        _this.spell = spell;
        _this.targets = targets;
        return _this;
    }
    SpellAction.prototype.perform = function (scene) {
        var _this = this;
        var canPerform = this.character.mp >= this.spell.mp;
        if (canPerform) {
            this.character.mp -= this.spell.mp;
        }
        var sceneSnapshot = scene.clone();
        var messages = [new Message(this.character.name.concat(" casts ").concat(this.spell.name).concat("."), function () { updateStatusBox(sceneSnapshot); return Promise.resolve(undefined); }, function () {
                fullscreenEffect.style.backgroundColor = _this.spell.color.css;
                fullscreenEffect.style.visibility = "visible";
                return delay(80, function () {
                    fullscreenEffect.style.visibility = "hidden";
                }).then(function (_x) {
                    return delay(80, function () {
                        fullscreenEffect.style.visibility = "visible";
                    });
                }).then(function (_x) {
                    return delay(80, function () {
                        fullscreenEffect.style.visibility = "hidden";
                    });
                });
            })];
        if (canPerform) {
            for (var _i = 0, _a = this.targets; _i < _a.length; _i++) {
                var target = _a[_i];
                for (var _b = 0, _c = this.spell.perform(scene, target); _b < _c.length; _b++) {
                    var message = _c[_b];
                    messages.push(message);
                }
            }
        }
        else {
            messages.push(new Message("Not enough MP."));
        }
        return messages;
    };
    return SpellAction;
}(Action));
var DefenseAction = (function (_super) {
    __extends(DefenseAction, _super);
    function DefenseAction(character) {
        var _this = _super.call(this, character) || this;
        character.isDefending = true;
        return _this;
    }
    DefenseAction.prototype.perform = function (scene) {
        return [new Message(this.character.name.concat(" is defending."))];
    };
    return DefenseAction;
}(Action));
var SummonAction = (function (_super) {
    __extends(SummonAction, _super);
    function SummonAction(character, target) {
        var _this = _super.call(this, character) || this;
        _this.target = target;
        return _this;
    }
    SummonAction.prototype.perform = function (scene) {
        this.target.hp = this.target.maxHp;
        var sceneSnapshot = scene.clone();
        var messages = [
            new Message(this.character.name.concat(" calls for backup."), function () { updateStatusBox(sceneSnapshot); return Promise.resolve(undefined); }),
            new Message(this.target.name.concat(" appears."))
        ];
        return messages;
    };
    return SummonAction;
}(Action));
var MultipleAction = (function (_super) {
    __extends(MultipleAction, _super);
    function MultipleAction(character, actions) {
        var _this = _super.call(this, character) || this;
        _this.actions = actions;
        return _this;
    }
    MultipleAction.prototype.perform = function (scene) {
        var messages = [];
        for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
            var action = _a[_i];
            for (var _b = 0, _c = action.perform(scene); _b < _c.length; _b++) {
                var message = _c[_b];
                messages.push(message);
            }
            if (scene.isBattleFinished) {
                break;
            }
        }
        return messages;
    };
    return MultipleAction;
}(Action));
var Character = (function () {
    function Character(name, hp, mp, attack, defense, agility, spells, isEnemy) {
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
    Object.defineProperty(Character.prototype, "isAlive", {
        get: function () {
            return this.hp > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Character.prototype, "isHpFull", {
        get: function () {
            return this.hp == this.maxHp;
        },
        enumerable: true,
        configurable: true
    });
    Character.prototype.hurt = function (damage) {
        this.hp = Math.max(0, this.hp - damage);
    };
    Character.prototype.restore = function (quantity) {
        this.hp = Math.min(this.maxHp, this.hp + quantity);
    };
    return Character;
}());
var PlayerCharacter = (function (_super) {
    __extends(PlayerCharacter, _super);
    function PlayerCharacter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PlayerCharacter.prototype.decideAction = function (scene) {
        var _this = this;
        var thiz = this;
        return select([new SelectionItem("Attack"), new SelectionItem("Magic", this.spells.length == 0), new SelectionItem("Defend")], this.name, true).then_(function (actionName) {
            switch (actionName) {
                case "Attack": {
                    return select(scene.enemy.members.filter(function (member) { return member.isAlive; }).map(function (member) { return new SelectionItem(member); }), null, true).then_(function (target) {
                        if (target == null) {
                            removeSelections(2);
                            return thiz.decideAction(scene);
                        }
                        return Promise.resolve(new AttackAction(_this, target));
                    });
                }
                case "Magic": {
                    return thiz.decideSpellAction(scene);
                }
                case "Defend": {
                    return Promise.resolve(new DefenseAction(_this));
                }
                default: {
                    throw "Never reaches here.";
                }
            }
        }).then(function (action) {
            clearSelections();
            return action;
        });
    };
    PlayerCharacter.prototype.decideSpellAction = function (scene) {
        var _this = this;
        var thiz = this;
        return select(this.spells.map(function (spell) { return new SelectionItem(spell, spell.mp > _this.mp || !spell.isAvailable(scene)); }), null, true).then_(function (spell /*|null*/) {
            if (spell == null) {
                removeSelections(2);
                return thiz.decideAction(scene);
            }
            if (spell.whole) {
                return Promise.resolve(spell.targets(scene)).then(function (targets) { return new SpellAction(_this, spell, targets); });
            }
            else {
                return select(spell.targets(scene).map(function (member) { return new SelectionItem(member); }), null, true).then_(function (target /*|null*/) {
                    if (target == null) {
                        removeSelections(2);
                        return thiz.decideSpellAction(scene);
                    }
                    return Promise.resolve(new SpellAction(_this, spell, [target]));
                });
            }
        });
    };
    PlayerCharacter.prototype.clone = function () {
        return new PlayerCharacter(this.name, this.hp, this.mp, this.attack, this.defense, this.agility, this.spells, this.isEnemy);
    };
    return PlayerCharacter;
}(Character));
var NonPlayerCharacter = (function (_super) {
    __extends(NonPlayerCharacter, _super);
    function NonPlayerCharacter(name, hp, mp, attack, defense, agility, spells, isEnemy, decideAction) {
        var _this = _super.call(this, name, hp, mp, attack, defense, agility, spells, isEnemy) || this;
        _this._decideAction = decideAction;
        return _this;
    }
    NonPlayerCharacter.prototype.decideAction = function (scene) {
        return this._decideAction(this, scene);
    };
    NonPlayerCharacter.prototype.clone = function () {
        return new NonPlayerCharacter(this.name, this.hp, this.mp, this.attack, this.defense, this.agility, this.spells, this.isEnemy, this._decideAction);
    };
    return NonPlayerCharacter;
}(Character));
var Party = (function () {
    function Party(members) {
        this.members = members;
    }
    Object.defineProperty(Party.prototype, "isAlive", {
        get: function () {
            return this.members.reduce(function (alive, character) { return alive || character.isAlive; }, false);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Party.prototype, "membersAlive", {
        get: function () {
            return this.members.filter(function (member) { return member.isAlive; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Party.prototype, "membersDead", {
        get: function () {
            return this.members.filter(function (member) { return !member.isAlive; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Party.prototype, "anyMemberAlive", {
        get: function () {
            return anyOf(this.membersAlive);
        },
        enumerable: true,
        configurable: true
    });
    Party.prototype.clone = function () {
        return new Party(this.members.map(function (member) { return member.clone(); }));
    };
    return Party;
}());
var Scene = (function () {
    function Scene(friend, enemy, turn) {
        if (turn === void 0) { turn = 0; }
        this.friend = friend;
        this.enemy = enemy;
        this.turn = turn;
    }
    Object.defineProperty(Scene.prototype, "characters", {
        get: function () {
            return this.friend.members.concat(this.enemy.members);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "reversed", {
        get: function () {
            return new Scene(this.enemy, this.friend, this.turn);
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.clone = function () {
        return new Scene(this.friend.clone(), this.enemy.clone(), this.turn);
    };
    Scene.prototype.decideTurnActions = function () {
        var scene = this;
        function decideActions(characters) {
            var character = characters.shift();
            if (character === undefined) {
                return Promise.resolve([]);
            }
            return character.decideAction(character.isEnemy ? scene.reversed : scene).then(function (action) {
                return decideActions(characters).then(function (actions) {
                    actions.unshift(action);
                    return actions;
                });
            });
        }
        return decideActions(this.characters.filter(function (character) { return character.isAlive; }));
    };
    Scene.prototype.performTurn = function () {
        var scene = this;
        return this.decideTurnActions().then(function (actions) {
            var sortedActions = actions.concat().sort(function (a, b) { return b.character.agility - a.character.agility; });
            function _performTurn(actions) {
                if (!scene.friend.isAlive) {
                    return Promise.resolve(scene.enemy);
                }
                if (!scene.enemy.isAlive) {
                    return Promise.resolve(scene.friend);
                }
                var action = actions.shift();
                if (action === undefined) {
                    return Promise.resolve(null);
                }
                if (!action.character.isAlive) {
                    return _performTurn(actions);
                }
                return showMessages(action.perform(scene)).then(function (value) {
                    updateStatusBox(scene);
                    return _performTurn(actions);
                });
            }
            return _performTurn(sortedActions);
        }).then(function (party) {
            scene.characters.forEach(function (character) { character.isDefending = false; });
            scene.turn++;
            return party;
        });
    };
    Scene.prototype.performBattle = function () {
        var scene = this;
        return this.performTurn().then(function (winner) {
            if (winner != null) {
                return Promise.resolve(winner);
            }
            return scene.performBattle();
        });
    };
    Object.defineProperty(Scene.prototype, "isBattleFinished", {
        get: function () {
            return this.friend.membersAlive.length == 0 || this.enemy.membersAlive.length == 0;
        },
        enumerable: true,
        configurable: true
    });
    return Scene;
}());
function updateStatusBox(scene) {
    var names = statusBox.getElementsByClassName("sq-name")[0].getElementsByClassName("sq-value");
    var hps = statusBox.getElementsByClassName("sq-hp")[0].getElementsByClassName("sq-value");
    var mps = statusBox.getElementsByClassName("sq-mp")[0].getElementsByClassName("sq-value");
    var characters = scene.friend.members;
    for (var iString in characters) {
        var i = Number(iString);
        var character = characters[i];
        names[i].textContent = character.name;
        hps[i].textContent = String(character.hp);
        mps[i].textContent = String(character.mp);
    }
    var enemyMembers = scene.enemy.members;
    for (var iString in enemyMembers) {
        var i = Number(iString);
        var character = enemyMembers[i];
        enemyElement(i).style.visibility = character.isAlive ? "visible" : "hidden";
    }
}
function startBattle() {
    var darkKnightSummoned = false;
    var demonPriestSummoned = false;
    var scene = new Scene(new Party([
        new PlayerCharacter("Hero", 153, 25, 162, 97, 72, [Spells.healing, Spells.resurrection, Spells.thunderbolt], false),
        new PlayerCharacter("Warrior", 198, 0, 178, 111, 63, [], false),
        new PlayerCharacter("Cleric", 101, 35, 76, 55, 75, [Spells.healing, Spells.resurrection, Spells.magicShield], false),
        new PlayerCharacter("Mage", 77, 58, 60, 57, 48, [Spells.fireball, Spells.inferno, Spells.blizzard, Spells.tempest], false),
    ]), new Party([
        new NonPlayerCharacter("Archfiend", 999, 99, 185, 58, 61, [Spells.inferno, Spells.blizzard, Spells.tempest], true, function (character, scene) {
            if (!scene.friend.members[1].isAlive && !scene.friend.members[2].isAlive) {
                var summons = false;
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
                var summons = false;
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
            var spellsAvailable = character.spells.filter(function (spell) { return character.mp >= spell.mp; });
            var spell = anyOf(spellsAvailable);
            if (spell && Math.random() < 0.8) {
                var targets = void 0;
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
        apply(new NonPlayerCharacter("Dark Knight", 250, 0, 181, 93, 73, [], true, function (character, scene) {
            return Promise.resolve(new MultipleAction(character, [
                new AttackAction(character, scene.enemy.anyMemberAlive),
                new AttackAction(character, scene.enemy.anyMemberAlive),
            ]));
        }), function (thiz) {
            switch (winCount) {
                case 0:
                    thiz.hp = 0;
                    break;
                default:
                    break;
            }
        }),
        apply(new NonPlayerCharacter("Demon Priest", 180, 99, 121, 55, 59, [Spells.healing, Spells.resurrection, Spells.magicShield], true, function (character, scene) {
            var spellsAvailable = character.spells.filter(function (spell) { return character.mp >= spell.mp; });
            if (Math.random() < 0.5) {
                var spell = Spells.magicShield;
                if (spellsAvailable.indexOf(spell) >= 0) {
                    var targets = spell.targets(scene);
                    var target = scene.friend.members[0];
                    if (targets.indexOf(target) >= 0) {
                        return Promise.resolve(new SpellAction(character, spell, [target]));
                    }
                }
            }
            {
                var spell = Spells.resurrection;
                if (spellsAvailable.indexOf(spell) >= 0) {
                    var targets = spell.targets(scene);
                    if (targets.length > 0) {
                        var target = targets.sort(function (a, b) { return b.maxHp - a.maxHp; })[0];
                        return Promise.resolve(new SpellAction(character, spell, [target]));
                    }
                }
            }
            {
                var spell = Spells.healing;
                if (spellsAvailable.indexOf(spell) >= 0) {
                    var targets = spell.targets(scene);
                    if (targets.length > 0) {
                        var target = targets.sort(function (a, b) { return b.maxHp - a.maxHp; })[0];
                        return Promise.resolve(new SpellAction(character, spell, [target]));
                    }
                }
            }
            return Promise.resolve(new AttackAction(character, scene.enemy.anyMemberAlive));
        }), function (thiz) {
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
    return showMessages([new Message(scene.enemy.members[0].name.concat(" appears."))]).then(function (value) {
        return scene.performBattle();
    }).then(function (winner) {
        if (winner == scene.friend) {
            winCount++;
            if (isBattleStandalone) {
                return select([new SelectionItem("Again")]).then_(function (item) {
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
            var items = void 0;
            if (isBattleStandalone) {
                items = [new SelectionItem("Retry")];
            }
            else {
                items = [new SelectionItem("Retry"), new SelectionItem("Next")];
            }
            return select(items).then_(function (item) {
                if (item == "Retry") {
                    clearSelections();
                    return startBattle();
                }
                location.href = "@next";
                return Promise.resolve(null);
            });
        }
    });
}
messageBox.addEventListener("click", function (event) {
    if (!audioBattleStarted) {
        audioBattle.play();
        audioBattleStarted = true;
    }
});
startBattle();
