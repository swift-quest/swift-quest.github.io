interface Named {
	name: string
}

function flatMap<T, U>(array: T[], transform: (t:T) => U[]): U[] {
	let result: U[] = [];
	for (let us of array.map((t) => transform(t))) {
		for (let u of us) {
			result.push(u);
		}
	}
	return result;
}
function anyOf<T>(array: T[]): T | null {
	if (array.length == 0) { return null; }
	return array[Math.floor(array.length * Math.random())];
}
function apply<T>(thiz: T, action: (thiz: T) => void): T {
	action(thiz);
	return thiz;
}

function delay(milliseconds: number, action: () => void): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		setTimeout(() => {
			action();
			resolve();
		}, milliseconds);
	});
}

let container = document.getElementById("sq-container") as HTMLElement;
let fullscreenEffect = document.getElementById("sq-fullscreen-effect") as HTMLElement;
let statusBox = document.getElementById("sq-status-box") as HTMLElement;
let monsters = document.getElementById("sq-monsters") as HTMLElement;
let enemyIndexMap = [1, 0, 2];
function enemyElement(i: number) {
	return (<HTMLElement>monsters.children[enemyIndexMap[i]]);
}
let audioBattle = document.getElementById("sq-audio-battle") as HTMLAudioElement;
let audioBattleStarted = false;
let audioWin = document.getElementById("sq-audio-win") as HTMLAudioElement;
let audioWinStarted = false;

let messageBox = document.getElementById("sq-message-box") as HTMLElement;
class Message {
	text: string;
	action: (() => Promise<void>) | null;
	actionBefore: (() => Promise<void>) | null;
	constructor(text: string, action: (() => Promise<void>) | null = null, actionBefore: (() => Promise<void>) | null = null) {
		this.text = text;
		this.action = action;
		this.actionBefore = actionBefore;
	}
}
function showMessages(messages: Message[]): Promise<void> {
	function _showMessages(messages: Message[]): Promise<void> {
		while (messageBox.children.length > 0) {
			messageBox.removeChild(messageBox.children[messageBox.children.length - 1]);
		}

		let message = messages.shift();
    if (message === undefined) { return Promise.resolve(undefined); }
    let nonnullMessage = message;
    let result: Promise<void> = Promise.resolve(undefined);
    let actionBefore = message.actionBefore
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
					if (nonnullMessage.action == null) { return resolve(undefined); }
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
	red: number;
	green: number;
	blue: number;

	constructor(red: number, green: number, blue: number) {
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

let selections = document.getElementById("sq-selections") as HTMLElement;
function clearSelections() {
	let children = selections.children;
	while(children.length > 0) {
		selections.removeChild(children.item(0));
	}
	selections.style.display = "none";
}
function removeSelections(numberOfSelections: number) {
	let children = selections.children;
	for (let i = 0; i < numberOfSelections && children.length > 0; i++) {
		selections.removeChild(children.item(children.length - 1));
	}
}
class SelectionItem<T> {
	value: T;
	disabled: boolean;

	constructor(value: T, disabled: boolean = false) {
		this.value = value;
		this.disabled = disabled;
	}
}
class SelectionResult<T> {
	value: Promise<T>;
	update: Promise<SelectionResult<T>> | null;
	constructor(value: Promise<T>, update: Promise<SelectionResult<T>> | null = null) {
		this.value = value;
		this.update = update;
	}
	then_<U>(transform: (x: T) => Promise<U>): Promise<U> {
		let thiz = this;
		let transformed = this.value.then(transform);
		if (this.update == null) {
			return transformed
		}
		let updateTransformed: Promise<U> = this.update.then((result: SelectionResult<T>) => {
			return result.then_(transform);
		});
		let promises: Promise<U>[] = [transformed, updateTransformed];
		return Promise.race(promises);
	}
}
function _select<T extends string|Named>(items: SelectionItem<T>[], updatable: boolean, arrowImages: HTMLElement[], buttons: HTMLElement[], numberOfStacks: number): SelectionResult<T> {
	let resolve2: ((x: SelectionResult<T> | Promise<SelectionResult<T>>) => void) | null = null;
	let update: Promise<SelectionResult<T>> | null = new Promise((_resolve2, _reject2) => {
		resolve2 = _resolve2;
	});
	let value = new Promise((resolve, reject) => {
			for (let iString in items) {
				let i: number = Number(iString);
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
					button.onclick = () => {};
				};
			}
	});

	return new SelectionResult(value, updatable ? update : null);
}

function select<T extends string|Named>(items: SelectionItem<T>[], title: string | null = null, updatable: boolean = false): SelectionResult<T> {
	let resolved = false;
	let selectionBox = document.createElement("div");
	selectionBox.className = "sq-box sq-selection"

	if (title != null) {
		let titleBox = document.createElement("div");
		selectionBox.appendChild(titleBox);
		titleBox.className = "sq-title";
		titleBox.textContent = title;
	}

	let list = document.createElement("ul");
	selectionBox.appendChild(list);

	let arrowImages: HTMLElement[] = [];
	let buttons: HTMLElement[] = [];
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
		} else {
			arrowImage.className = "sq-hidden";
		}

		let itemLabel = document.createElement("span");
		button.appendChild(itemLabel);
		buttons.push(button);
		let itemValue: string|Named = item.value;
		if (typeof itemValue === "string") {
			itemLabel.textContent = itemValue;
		} else {
			itemLabel.textContent = (<Named>itemValue).name;
		}
	}
	selections.appendChild(selectionBox);
	selections.style.display = "block";
	let numberOfStacks = selections.children.length;

	return _select(items, updatable, arrowImages, buttons, numberOfStacks);
}

function attack(scene: Scene, target: Character, damage: number, noDamageMessage: string, whole: boolean = false): Message[] {
	let messages: Message[] = [];

	if (!target.isAlive) {
		if (!whole) {
			messages.push(new Message(target.name.concat("はすでにしんでいる。")));
		}
		return  messages;
	}

	target.hurt(damage);
	let sceneSnapshot = scene.clone();
	if (damage > 0) {
		messages.push(new Message(target.name.concat("に").concat(String(damage)).concat("のダメージ。"), () => {
			updateStatusBox(sceneSnapshot);
			return Promise.resolve(undefined);
		}, () => {
			let animation: Promise<void>;
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
				// }).then((_x) => {
				// 	if (target.isAlive) {
				// 		return Promise.resolve(null);
				// 	} else {
				// 		return delay(300, () => {
				// 			enemyElement(enemyIndex).style.visibility = "hidden";
				// 		});
				// 	}
				});
			} else {
				container.style.left = "-6px";
				animation = delay(60, () => {
					container.style.left = "6px";
				}).then((_x) => {
					return delay(60, () => {
						container.style.left = "-6px";
					})
				}).then((_x) => {
					return delay(60, () => {
						container.style.left = "6px";
					})
				}).then((_x) => {
					return delay(60, () => {
						container.style.left = "0";
					})
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
	} else {
		messages.push(new Message(target.name.concat(noDamageMessage)));
	}
	if (!target.isAlive) {
		target.hasMagicShield = false;
		if (target.isEnemy) {
			messages.push(new Message(target.name.concat("をやっつけた。")));
		} else {
			messages.push(new Message(target.name.concat("はしんでしまった。")));
		}
	}

	return messages;
}

abstract class Spell implements Named {
	name: string;
	color: Color;
	mp: number;
	whole: boolean;

	constructor(name: string, color: Color, mp: number, whole: boolean) {
		this.name = name;
		this.color = color;
		this.mp = mp;
		this.whole = whole;
	}

	abstract targets(scene: Scene): Character[]
	abstract perform(scene: Scene, target: Character): Message[]

	isAvailable(scene: Scene): boolean {
		return this.whole || this.targets(scene).length > 0;
	}
}

class RestorationSpell extends Spell {
	quantity: number;
	forDead: boolean;
	constructor(name: string, color: Color, mp: number, whole: boolean, quantity: number, forDead: boolean = false) {
		super(name, color, mp, whole);
		this.quantity = quantity;
		this.forDead = forDead;
	}

	targets(scene: Scene): Character[] {
		return this.forDead ? scene.friend.membersDead : scene.friend.membersAlive.filter((member) => !member.isHpFull);
	}

	perform(scene: Scene, target: Character): Message[] {
		if (this.forDead) {
			if (target.isAlive) {
				if (this.whole) {
					return [];
				} else {
					return  [new Message(target.name.concat("にはきかなかった。"))];
				}
			}
		} else {
			if (!target.isAlive) {
				if (this.whole) {
					return [];
				} else {
					return  [new Message(target.name.concat("にはきかなかった。"))];
				}
			}
		}

		let quantity = Math.max(0, Math.floor(this.quantity * ((Math.random() * 0.4) + 0.8)));
		target.restore(quantity);
		let sceneSnapshot = scene.clone();
		let messageText: string;
		if (this.forDead) {
			messageText = target.name.concat("はいきかえった。");
		} else {
			messageText = target.name.concat("のHPがかいふくした。");
		}
		return [new Message(messageText, () => { updateStatusBox(sceneSnapshot); return Promise.resolve(undefined); })];
	}
}

class AttackSpell extends Spell {
	damage: number;
	whole: boolean;
	constructor(name: string, color: Color, mp: number, whole: boolean, damage: number) {
		super(name, color, mp, whole);
		this.damage = damage;
	}

	targets(scene: Scene): Character[] {
		return this.whole ? scene.enemy.members : scene.enemy.membersAlive;
	}

	perform(scene: Scene, target: Character): Message[] {
		let damage = Math.max(0, Math.floor(this.damage * ((Math.random() * 0.4) + 0.8) / (target.isDefending ? 2 : 1) / (target.hasMagicShield ? 2 : 1)));
		return attack(scene, target, damage, "にはきかなかった。", this.whole);
	}
}

class MagicShieldSpell extends Spell {
	constructor() {
		super("マジックシールド", new Color(255, 255, 255), 13, false);
	}

	targets(scene: Scene): Character[] {
		return scene.friend.membersAlive.filter((character) => !character.hasMagicShield);
	}

	perform(scene: Scene, target: Character): Message[] {
		if (target.hasMagicShield) {
			return [new Message(target.name.concat("にはきかなかった。"))];
		}

		target.hasMagicShield = true;
		return [new Message(target.name.concat("はまほうのたてにつつまれた。"))];
	}
}

class Spells {
	static healing = new RestorationSpell("ヒーリング", new Color(255, 255, 255), 5, false, 80);
	static resurrection = new RestorationSpell("リザレクション", new Color(255, 255, 255), 15, false, 999, true);
	static fireball = new AttackSpell("ファイアボール", new Color(254, 75, 38), 5, false, 70);
	static inferno = new AttackSpell("インフェルノ", new Color(254, 75, 38), 10, false, 130);
	static blizzard = new AttackSpell("ブリザード", new Color(38, 75, 254), 9, true, 70);
	static thunderbolt = new AttackSpell("サンダーボルト", new Color(254, 254, 75), 8, false, 100);
	static tempest = new AttackSpell("テンペスト", new Color(127, 127, 127), 12, true, 95);
	static magicShield = new MagicShieldSpell();
}

abstract class Action {
	character: Character;
	constructor(character: Character) {
		this.character = character;
	}
	abstract perform(scene: Scene): Message[]
}

class AttackAction extends Action {
	private target: Character;

	constructor(character: Character, target: Character) {
		super(character);
		this.target = target;
	}

	perform(scene: Scene): Message[] {
		let messages: Message[] = [new Message(this.character.name.concat("のこうげき。"))];
		let damage = Math.max(0, Math.floor((this.character.attack - this.target.defense * Math.random()) / 2 / (this.target.isDefending ? 2 : 1)));
		for (let message of attack(scene, this.target, damage, "にダメージをあたえられない。")) {
			messages.push(message);
		}
		return messages;
	}
}

class SpellAction extends Action {
	spell: Spell;
	targets: Character[];
	effect: (target: Character) => void;

	constructor(character: Character, spell: Spell, targets: Character[]) {
		super(character);
		this.spell = spell;
		this.targets = targets;
	}

	perform(scene: Scene): Message[] {
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
		} else {
			messages.push(new Message("しかしMPがたりない。"));
		}
		return messages;
	}
}

class DefenseAction extends Action {
	constructor(character: Character) {
		super(character);
		character.isDefending = true;
	}

	perform(scene: Scene): Message[] {
		return [new Message(this.character.name.concat("はみをまもっている。"))];
	}
}

class SummonAction extends Action {
		private target: Character;

	constructor(character: Character, target: Character) {
		super(character);
		this.target = target;
	}

	perform(scene: Scene): Message[] {
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
	private actions: Action[];

	constructor(character: Character, actions: Action[]) {
		super(character);
		this.actions = actions;
	}

	perform(scene: Scene): Message[] {
		let messages: Message[] = []
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

abstract class Character implements Named {
	name: string;
	maxHp: number;
	hp: number;
	maxMp: number;
	mp: number;
	attack: number;
	defense: number;
	agility: number;
	spells: Spell[];
	isEnemy: boolean;
	isDefending: boolean;
	hasMagicShield: boolean;

	constructor(name: string, hp: number, mp: number, attack: number, defense: number, agility: number, spells: Spell[], isEnemy: boolean) {
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

	get isAlive(): boolean {
		return this.hp > 0;
	}

	get isHpFull(): boolean {
		return this.hp == this.maxHp;
	}

	hurt(damage: number) {
		this.hp = Math.max(0, this.hp - damage);
	}

	restore(quantity: number) {
		this.hp = Math.min(this.maxHp, this.hp + quantity);
	}

	abstract decideAction(scene: Scene): Promise<Action>

	abstract clone(): Character
}

class PlayerCharacter extends Character {
	decideAction(scene: Scene): Promise<Action> {
		let thiz = this;
		return select([new SelectionItem<string>("こうげき"), new SelectionItem<string>("まほう", this.spells.length == 0), new SelectionItem<string>("ぼうぎょ")], this.name, true).then_((actionName) => {
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

	private decideSpellAction(scene: Scene): Promise<Action> {
		let thiz = this;
		return select(this.spells.map((spell: Spell) => new SelectionItem<Spell>(spell, spell.mp > this.mp || !spell.isAvailable(scene))), null, true).then_((spell: Spell/*|null*/) => {
			if (spell == null) {
				removeSelections(2);
				return thiz.decideAction(scene);
			}

			if (spell.whole) {
				return Promise.resolve(spell.targets(scene)).then((targets) => new SpellAction(this, spell, targets));
			} else {
				return select(spell.targets(scene).map((member) => new SelectionItem(member)), null, true).then_((target: Character/*|null*/) => {
					if (target == null) {
						removeSelections(2);
						return thiz.decideSpellAction(scene);
					}
					return Promise.resolve(new SpellAction(this, spell, [target]));
				});
			}
		});
	}

	clone(): Character {
		return new PlayerCharacter(this.name, this.hp, this.mp, this.attack, this.defense, this.agility, this.spells, this.isEnemy);
	}
}

class NonPlayerCharacter extends Character {
	private _decideAction: (character: Character, scene: Scene) => Promise<Action>

	constructor(name: string, hp: number, mp: number, attack: number, defense: number, agility: number, spells: Spell[], isEnemy: boolean, decideAction: (character: Character, scene: Scene) => Promise<Action>) {
		super(name, hp, mp, attack, defense, agility, spells, isEnemy)
		this._decideAction = decideAction
	}

	decideAction(scene: Scene): Promise<Action> {
		return this._decideAction(this, scene);
	}

	clone(): Character {
		return new NonPlayerCharacter(this.name, this.hp, this.mp, this.attack, this.defense, this.agility, this.spells, this.isEnemy, this._decideAction);
	}
}

class Party {
	members: Character[]

	constructor(members: Character[]) {
		this.members = members;
	}

	get isAlive(): boolean {
		return this.members.reduce((alive, character) => alive || character.isAlive, false);
	}

	get membersAlive(): Character[] {
		return this.members.filter((member) => member.isAlive);
	}

	get membersDead(): Character[] {
		return this.members.filter((member) => !member.isAlive);
	}

	get anyMemberAlive(): Character | null {
		return anyOf(this.membersAlive);
	}

	clone(): Party {
		return new Party(this.members.map((member) => member.clone()));
	}
}

class Scene {
	friend: Party;
	enemy: Party;
	turn: number;

	constructor(friend: Party, enemy: Party, turn: number = 0) {
		this.friend = friend;
		this.enemy = enemy;
		this.turn = turn;
	}

	get characters(): Character[] {
		return this.friend.members.concat(this.enemy.members);
	}

	get reversed(): Scene {
		return new Scene(this.enemy, this.friend, this.turn);
	}

	clone(): Scene {
		return new Scene(this.friend.clone(), this.enemy.clone(), this.turn);
	}

	decideTurnActions(): Promise<Action[]> {
		let scene = this;
		function decideActions(characters: Character[]): Promise<Action[]> {
			let character = characters.shift();
      if (character === undefined) { return Promise.resolve([]); }
			return character.decideAction(character.isEnemy ? scene.reversed : scene).then((action) => {
				return decideActions(characters).then((actions) => {
					actions.unshift(action);
					return actions;
				});
			});
		}
		return decideActions(this.characters.filter((character) => character.isAlive));
	}

	performTurn(): Promise<Party> {
		let scene = this;
		return this.decideTurnActions().then((actions: Action[]) => {
			let sortedActions = actions.concat().sort((a, b) => b.character.agility - a.character.agility);

			function _performTurn(actions: Action[]): Promise<Party | null> {
				if (!scene.friend.isAlive) { return Promise.resolve(scene.enemy); }
				if (!scene.enemy.isAlive) { return Promise.resolve(scene.friend); }

				let action = actions.shift();
        if (action === undefined) { return Promise.resolve(null); }
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
			scene.characters.forEach((character) => { character.isDefending = false; })
			scene.turn++;
			return party;
		});
	}

	performBattle(): Promise<Party> {
		let scene = this
		return this.performTurn().then((winner) => {
			if (winner != null) { return Promise.resolve(winner); }
			return scene.performBattle();
		});
	}

	get isBattleFinished(): boolean {
		return this.friend.membersAlive.length == 0 || this.enemy.membersAlive.length == 0;
	}
}

function updateStatusBox(scene: Scene) {
	let names = statusBox.getElementsByClassName("sq-name")[0].getElementsByClassName("sq-value");
	let hps = statusBox.getElementsByClassName("sq-hp")[0].getElementsByClassName("sq-value");
	let mps = statusBox.getElementsByClassName("sq-mp")[0].getElementsByClassName("sq-value");
	let characters = scene.friend.members;
	for (let iString in characters) {
		let i: number = Number(iString);
		let character = characters[i];
		(<HTMLElement>names[i]).textContent = character.name;
		(<HTMLElement>hps[i]).textContent = String(character.hp);
		(<HTMLElement>mps[i]).textContent = String(character.mp);
	}

	let enemyMembers = scene.enemy.members;
	for (let iString in enemyMembers) {
		let i: number = Number(iString);
		let character = enemyMembers[i];
		enemyElement(i).style.visibility = character.isAlive ? "visible" : "hidden";
	}
}

function startBattle(): Promise<void> {
	const scene = new Scene(
		new Party([
			new PlayerCharacter("ゆうしゃ", 153, 25, 162, 97, 72, [Spells.healing, Spells.resurrection, Spells.thunderbolt], false),
			new PlayerCharacter("せんし", 198, 0, 178, 111, 63, [], false),
			new PlayerCharacter("そうりょ", 101, 35, 76, 55, 75, [Spells.healing, Spells.resurrection, Spells.magicShield], false),
			new PlayerCharacter("まほうつかい", 77, 58, 60, 57, 48, [Spells.fireball, Spells.inferno, Spells.blizzard, Spells.tempest], false),
		]),
		new Party([
			new NonPlayerCharacter("まおう", 999, 99, 185, 58, 61, [Spells.inferno, Spells.blizzard, Spells.tempest], true, (character, scene) => {
				if (scene.turn == 0) {
					return Promise.resolve(new SummonAction(character, scene.friend.members[1]));
				}
				if (scene.turn == 1) {
					return Promise.resolve(new SummonAction(character, scene.friend.members[2]));
				}

				let spellsAvailable = character.spells.filter((spell) => character.mp >= spell.mp);
        let spell = anyOf(spellsAvailable);
				if (spell && Math.random() < 0.8) {
					let targets: Character[];
					if (spell.whole) {
						targets = spell.targets(scene);
					} else {
						targets = [anyOf(spell.targets(scene)) as Character];
					}
					return Promise.resolve(new SpellAction(character, spell, targets));
				} else {
					return Promise.resolve(new AttackAction(character, scene.enemy.anyMemberAlive as Character));
				}
			}),
			apply(new NonPlayerCharacter("あんこくきし", 250, 0, 181, 93, 73, [], true, (character, scene) => {
				return Promise.resolve(new MultipleAction(character, [
					new AttackAction(character, scene.enemy.anyMemberAlive as Character),
					new AttackAction(character, scene.enemy.anyMemberAlive as Character),
				]));
			}), (thiz) => { thiz.hp = 0; }),
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

				return Promise.resolve(new AttackAction(character, scene.enemy.anyMemberAlive as Character));
			}), (thiz) => { thiz.hp = 0; }),
		])
	);

	updateStatusBox(scene);
	return showMessages([new Message(scene.enemy.members[0].name.concat("があらわれた。"))]).then((value) => {
		return scene.performBattle();
	}).then((winner) => {
		if (winner == scene.friend) {
			location.href = "@next";
			return Promise.resolve(undefined);
		} else {
			return select([new SelectionItem("やりなおす"), new SelectionItem("つぎへすすむ")]).then_((item) => {
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