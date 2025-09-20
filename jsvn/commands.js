// default reading speed
const WORDS_PER_MINUTE = 238;
const WORDS_PER_MINUTE_TABLE = [
	WORDS_PER_MINUTE * 0.5,
	WORDS_PER_MINUTE * 0.75,
	WORDS_PER_MINUTE * 1,
	WORDS_PER_MINUTE * 1.25,
	WORDS_PER_MINUTE * 1.5
];

/**
 * Converts the specified character name to an element ID.
 */
function toCharacterID(name) {
	return name.toLowerCase().replaceAll(/[\W]/g, "_");
}

function parseCSSTransitions(str) {
	let cssShow = "";
	let cssHide = "";
	let cssSelected = "";
	
	const s = str.replaceAll(/{([^}]+)}/g, (match, p1, p2) => {
		const list = p1.split(",");
		
		for(const el of list) {
			const keyValue = el.split(":");
			if(keyValue[0].trim().toLowerCase() === "show") {
				cssShow = keyValue[1].trim();
			} else if(keyValue[0].trim().toLowerCase() === "hide") {
				cssHide = keyValue[1].trim();
			} else if(keyValue[0].trim().toLowerCase() === "selected") {
				cssSelected: keyValue[1].trim();
			} else {
				throw "Invalid CSS transition!";
			}
		}
		return "";
	});
	
	return { string: s, cssShow: cssShow, cssHide: cssHide, cssSelected: cssSelected };
}
	
var commands = {};

commands["@"] = class extends BranchingCommand {
	
	constructor() {
		super(...arguments);
	}
	
	async execute() {
		return this.nextCommand;
	}
};

commands["$"] = class extends Command {
	
	constructor() {
		super(...arguments);
		
		this.changes = [];
	}
	
	async execute() {
		const change = (gameObject, change, property, oldValue, newValue) => {
			this.changes.push({ gameObject: gameObject, change: change, property: property, oldValue: oldValue, newValue: newValue });
		};
		
		gameobjects.addGameObjectListener(change);
		
		try {
			eval(this.commandArguments);
		} catch(err) {
			throw err;
		} finally {
			gameobjects.removeGameObjectListener(change);
		}
		
		return this.nextCommand;
	}
	
	async undo() {
		for(const change of this.changes) {
			change.gameObject[change.property] = change.oldValue;
		}
		this.changes = [];
	}
	
};

commands["if"] = class extends BranchingCommand {
	
	constructor() {
		super(...arguments);
		
		this.result = false;
	}
	
	async execute() {
		this.result = eval(this.commandArguments);
		
		if(this.result) {
			if(this.children.length > 0) {
				return this.children[0];
			} else {
				throw "Missing commands after if statement at line " + this.lineNumber + ".";
			}
		}
		
		return this.nextCommandSibling;
	}
	
};

commands["else"] = class extends BranchingCommand {
	
	constructor() {
		super(...arguments);
	}
	
	async execute() {
		if(this.previousCommandSibling.commandName === "if") {
			if(this.previousCommandSibling.result) {
				return this.nextCommandSibling;
			} else if(this.children.length > 0) {
				return this.children[0];
			} else {
				throw "Missing commands after else statement at line " + this.lineNumber + ".";
			}
		} else throw "No preceding if statement before else statement at line " + this.lineNumber + ".";
	}
	
};

commands["goto"] = class extends Command {
	
	constructor() {
		super(...arguments);
	}
	
	get nextCommand() {
		const sceneCommand = this.rootCommand.find((c) => c.commandName === "@" && c.commandArguments === this.commandArguments);
		if(sceneCommand) {
			return sceneCommand;
		} else throw "No scene with the name \"" + this.commandArguments + "\" at line " + this.lineNumber + " exists.";
	}
	
	async execute() {
		return this.nextCommand;
	}
	
};

commands["heading"] = class extends Command {
	
	constructor() {
		super(...arguments);	
	}
	
	async execute() {
		const headingEl = document.querySelector(".top.layer > .heading");
	
		headingEl.innerHTML = game.formatString(this.commandArguments);
		headingEl.classList.add("visible");
		
		await Promise.all(headingEl.getAnimations().map(a => a.finished));
		
		const action = await game.waitForAction(ACTION_PRIMARY | ACTION_SECONDARY);
		if(!action.isPrimary) {
			throw "secondary";
		}
		
		
		headingEl.classList.remove("visible");
		await Promise.all(headingEl.getAnimations().map(a => a.finished));
		
		return this.nextCommand;
	}
	
};

commands["bg"] = class extends Command {
	
	constructor() {
		super(...arguments);
		
		this.isImage = false;
		this.isVideo = false;
		this.isColor = false;
		
		if(this.commandArguments.endsWith(".webp") || this.commandArguments.endsWith(".png") || this.commandArguments.endsWith(".jpg") || this.commandArguments.endsWith(".jpeg") || this.commandArguments.endsWith(".gif")) {
			images[this.commandArguments] = null;
			this.isImage = true;
		} else if(this.commandArguments.endsWith(".webm") || this.commandArguments.endsWith(".mp4")) {
			videos[this.commandArguments] = null;
			this.isVideo = true;
		} else {
			this.isColor = true;
		}
	}
	
	async execute() {
		const backEl = document.querySelector(".bottom.layer > .background:last-child");
		const frontEl = document.createElement("div");
		frontEl.className = "background " + this.commandArguments.toCSSClassName();
		
		if(this.isImage) {
			frontEl.append(images[this.commandArguments]);
		} else if(this.isVideo) {
			const video = videos[this.commandArguments].cloneNode(true);
			video.autoplay = true;
			video.loop = true;
			frontEl.append(video);
		} else {
			frontEl.style.backgroundColor = this.commandArguments;
		}
		
		backEl.insertAdjacentElement("afterend", frontEl);
		frontEl.classList.add("visible");
		
		Promise.all(frontEl.getAnimations().map(a => a.finished)).then(() => {
			backEl.remove();
		});
		
		return this.nextCommand;
	}
	
	async undo() {
		const previousBgCommand = game.path.findLast((c) => c.commandName === "bg");
		if(previousBgCommand) {
			await previousBgCommand.execute();
		}			
	}
	
};

commands["say"] = class SayCommand extends Command {
	
	constructor() {
		super(...arguments);
		
		this.isBlocking = true;
		
		const spaceIndex = this.commandArguments.indexOf(" ");
		if(spaceIndex !== -1) {
			this.who = this.commandArguments.substring(0, spaceIndex);
			this.what = this.commandArguments.substring(spaceIndex + 1);
		} else throw "Error at line " + this.lineNumber + ": Invalid arguments!";
		
		const stateStart = this.who.indexOf("(");
		if(stateStart !== -1) {
			const stateEnd = this.who.indexOf(")", stateStart);
			if(stateEnd !== -1) {
				this.state = this.who.substring(stateStart + 1, stateEnd);
				this.who = this.who.substring(0, stateStart);
			} else throw "Error at line " + this.lineNumber + ": Missing closing ')' for character state!";
		} else {
			this.state = "";
		}
		
		const result = parseCSSTransitions(this.what);
		this.what = result.string;
		this.cssShow = result.cssShow;
		this.cssHide = result.cssHide;
	}
	
	async execute() {
		const dialogueBoxEl = document.querySelector(".dialogue-box");
		const whoEl = dialogueBoxEl.querySelector(".who");
		const whatEl = dialogueBoxEl.querySelector(".what");
		
		const whoCSS = this.who === "" ? "narrator" : this.who.toCSSClassName();
		dialogueBoxEl.className = "dialogue-box " + whoCSS + " " + this.state.toCSSClassName();
		if(this.cssShow !== "") {
			dialogueBoxEl.classList.add(this.cssShow);
		}
		
		if(this.who.toLowerCase() === "player") {
			whoEl.innerHTML = player.name;
		} else {
			whoEl.innerHTML = game.formatString(this.who);
		}
		
		whatEl.innerHTML = game.formatString(this.what);
		
		dialogueBoxEl.classList.add("visible");
		

		
		// focus the currently speaking character
		const characterElement = document.getElementById(this.who);
		if(characterElement) {
			characterElement.classList.add("focus");
		}
		
		// unfocus all other characters
		const characters = document.querySelectorAll(".character.layer > .character");
		for(const character of characters) {
			if(character !== characterElement) {
				character.classList.remove("focus");
			}
		}
		
		
		const wordCount = this.what.split(" ").length;
		const autoTime = (wordCount / WORDS_PER_MINUTE_TABLE[settings["Text"].autoSpeed.value - 1]) * 60 * 1000;
		const autoClamped = clamp(autoTime, config.minAutoMilliseconds, config.maxAutoMilliseconds);

		const action = await game.waitForAction(ACTION_PRIMARY | ACTION_SECONDARY, autoClamped);
		if(!action.isPrimary) {
			throw "secondary";
		}
		
		await Promise.all(dialogueBoxEl.getAnimations().map(a => a.finished));
		
		dialogueBoxEl.classList.remove("visible");
		if(this.cssHide !== "") {
			dialogueBoxEl.classList.remove(this.cssShow);
			dialogueBoxEl.classList.add(this.cssHide);
		}
		
		await Promise.all(dialogueBoxEl.getAnimations().map(a => a.finished));
		
		return this.nextCommand;
	}
	
	async undo() {
		const dialogueBoxEl = document.querySelector(".dialogue-box");
		dialogueBoxEl.classList.remove("visible");
			
		await Promise.all(dialogueBoxEl.getAnimations().map(a => a.finished));
	}
	
};

commands[">"] = class MenuCommand extends BranchingCommand {
	
	constructor() {
		super(...arguments);
		
		this.isBlocking = true;
		
		const result = parseCSSTransitions(this.commandArguments);
		this.text = result.string;
		this.cssShow = result.cssShow;
		this.cssHide = result.cssHide;
		this.cssSelected = result.cssSelected;
	}
	
	async execute() {
		const menuEl = document.querySelector(".dialogue-menu");
		
		// if this isn't the first choice then skip to the next sibling command
		if(this.previousCommandSibling && this.previousCommandSibling.commandName === ">") {
			if(this.nextCommandSibling) {
				return this.nextCommandSibling;
			} else if(this.parentCommand) {
				let parentCommand = this.parentCommand;
				while(parentCommand) {
					if(parentCommand.nextCommandSibling) {
						return parentCommand.nextCommandSibling;
					}
					parentCommand = parentCommand.parentCommand;
				}
			}
			return null;
		}
		
		// get all the choices
		const choices = [ this ];
		
		let commandSibling = this.nextCommandSibling;
		while(commandSibling && commandSibling.commandName === ">") {
			choices.push(commandSibling);
			commandSibling = commandSibling.nextCommandSibling;
		}
		
		menuEl.innerHTML = "";
		
		// create a button for each choice
		for(let c=0; c<choices.length; c++) {
			const button = document.createElement("button");
			button.className = "item";
			button.innerHTML = game.formatString(choices[c].text);
			button.value = c;
			menuEl.append(button);
		}
		
		menuEl.className = "dialogue-menu visible";
		if(this.cssShow !== "") {
			menuEl.classList.add(this.cssShow);
		}
		
		await Promise.all(menuEl.getAnimations().map(a => a.finished));

		let action;
		while(true) {
			try {
				action = await game.waitForAction(ACTION_ANY);
				if(!action.target) {
					continue;
				}
			} catch(e) {
				action = e;
			}
				
			const item = action.target.closest(".item");
			if(action.isPrimary && item) {
				const choice = choices[item.value];
				if(choice) {
					menuEl.classList.remove("visible");
					if(this.cssHide !== "") {
						menuEl.classList.remove(this.cssShow);
						menuEl.classList.add(this.cssHide);
					}
					
					await Promise.all(menuEl.getAnimations().map(a => a.finished));
					
					if(game.skip && !settings.Skip.afterChoices.value) {
						game.skip = false;
					}
					
					return choice.nextCommand;
				}
			} else if(action.isDigit) {
				const item = document.querySelector(".dialogue-menu > .item:nth-child(" + action.digit + ")");
				if(item) {
					const choice = choices[action.digit - 1];
					menuEl.classList.remove("visible");
					
					await Promise.all(menuEl.getAnimations().map(a => a.finished));
					
					if(game.skip && !settings.Skip.afterChoices.value) {
						game.skip = false;
					}
					
					return choice.nextCommand;
				}
			} else if(action.isSecondary) {
				throw "secondary";
			}
		}
	}
	
	async undo() {
		const menuEl = document.querySelector(".dialogue-menu");
		menuEl.innerHTML = "";
		menuEl.classList.remove("visible");
		
		await Promise.all(menuEl.getAnimations().map(a => a.finished));
	}
	
};

commands["prompt"] = class PromptCommand extends Command {
	
	constructor() {
		super(...arguments);
		
		this.defaultValue = "";
		
		this.query = this.commandArguments.replaceAll(/\[(.+)\]/g, (match, p1) => {
			this.defaultValue = p1;
			return "";
		});
		
		this.isBlocking = true;
	}
	
	async execute() {
		const dialoguePromptEl = document.querySelector(".dialogue-prompt");
		const queryEl = dialoguePromptEl.querySelector(".query");
		const inputEl = dialoguePromptEl.querySelector(".input");
		
		queryEl.innerHTML = game.formatString(this.query);
		inputEl.value = "";
		inputEl.placeholder = game.formatString(this.defaultValue);
		
		dialoguePromptEl.className = "dialogue-prompt visible";
		
		await Promise.all(dialoguePromptEl.getAnimations().map(a => a.finished));
		
		inputEl.focus();
		
		let inputCompleted = false;
		const inputListener = (e) => {
			e.stopPropagation();
			
			if(e.which === 13) {
				inputCompleted = true;
				inputEl.removeEventListener("keydown", inputListener);
				document.dispatchEvent(new GameEvent("primary"));
			}
		};
		inputEl.addEventListener("keydown", inputListener);
		
		while(true) {
			const action = await game.waitForAction(ACTION_PRIMARY | ACTION_SECONDARY);
			if(action.isPrimary && inputCompleted) {
				break;
			} else if(!action.isPrimary) {
				inputEl.removeEventListener("keydown", inputListener);
				throw "secondary";
			}
		}
		
		const value = inputEl.value.trim();
		if(value.length > 0) {
			prompt.value = value;
		} else {
			prompt.value = game.formatString(this.defaultValue);
		}
		
		dialoguePromptEl.className = "dialogue-prompt";
		await Promise.all(dialoguePromptEl.getAnimations().map(a => a.finished));
		
		return this.nextCommand;
	}
	
	async undo() {
		const dialoguePromptEl = document.querySelector(".dialogue-prompt");
		const queryEl = dialoguePromptEl.querySelector(".query");
		const inputEl = dialoguePromptEl.querySelector(".input");
		
		dialoguePromptEl.classList.remove("visible");
		queryEl.innerHTML = "";
		inputEl.value = "";
		inputEl.placeholder = "";
		
		await Promise.all(dialoguePromptEl.getAnimations().map(a => a.finished));
	}
	
};

commands["pause"] = class extends Command {
	
	constructor() {
		super(...arguments);
		
		this.isBlocking = true;
		
		if(this.commandArguments != "") {
			const result = this.commandArguments.match(/^([0-9\.]+)\s*(\w*)$/);
			if(result) {
				this.duration = parseFloat(result[1]);
				if(isNaN(this.duration)) {
					throw "Invalid duration at line " + this.lineNumber + ".";
				}
				
				if(result[2] === "s" || result[2] === "ms" || result[2] === "") {
					this.unit = result[2] === "s" ? "s" : "ms";
				} else throw "Invalid time unit at line " + this.lineNumber + ".";
			} else {
				throw "Invalid pause command at line " + this.lineNumber + ".";
			}
		} else {
			this.duration = 0;
			this.unit = "ms";
		}
	}
	
	async execute() {
		const action = await game.waitForAction(ACTION_PRIMARY | ACTION_SECONDARY, undefined, this.unit === "s" ? this.duration * 1000 : this.duration);
		if(action.isPrimary) {
			return this.nextCommand;
		} else throw "secondary";
	}
	
	async undo() {
	}
	
};

const defaultCharacterClassName = new Map();

commands["show"] = class extends Command {
	
	constructor() {
		super(...arguments);
		
		const args = this.commandArguments.split(" ");
		
		this.elementID = args[0];
		this.classList = args.splice(1);
	}
	
	async execute() {
		const element = document.getElementById(this.elementID);
		if(element) {		
			let defaultClassName = defaultCharacterClassName.get(this.elementID);
			if(!defaultClassName) {
				defaultClassName = element.className;
				defaultCharacterClassName.set(this.elementID, defaultClassName);
			}
			
			element.className = defaultClassName;
			element.classList.add("visible");
			for(const c of this.classList) {
				element.classList.add(c);
			}
		} else throw "Could not find an element with the ID '" + this.elementID + "'!";
		
		return this.nextCommand;
	}
	
}

commands["hide"] = class extends Command {
	
	constructor() {
		super(...arguments);
		
		this.elementID = this.commandArguments;
	}
	
	async execute() {
		const element = document.getElementById(this.elementID);
		if(element) {
			element.classList.remove("visible");
			element.style.backgroundPosition = "left bottom";
		} else throw "No element with the ID '" +  this.elementID + "' at line " + this.lineNumber + "!";
		
		return this.nextCommand;
	}
	
}

commands["focus"] = class extends Command {
	
	constructor() {
		super(...arguments);
		
		this.elementID = this.commandArguments;
	}
	
	async execute() {
		const element = document.getElementById(this.elementID);
		if(element) {
			element.classList.add("focus");
		} else throw "No element with the ID '" +  this.elementID + "' at line " + this.lineNumber + "!";
		
		return this.nextCommand;
	}
	
}

commands["unfocus"] = class extends Command {
	
	constructor() {
		super(...arguments);
		
		this.elementID = this.commandArguments;
	}
	
	async execute() {
		const element = document.getElementById(this.elementID);
		if(element) {
			element.classList.remove("focus");
		} else throw "No element with the ID '" +  this.elementID + "' at line " + this.lineNumber + "!";
		
		return this.nextCommand;
	}
	
}

commands["move"] = class extends Command {
	
	constructor() {
		super(...arguments);
		
		const args = this.commandArguments.split(" ");
		this.elementID = args[0];
		this.direction = args.length > 1 ? args[1] : "";
		this.duration = args.length > 2 ? args[2] : "250ms";
	}
	
	execute() {
		return new Promise((resolve, reject) => {
			const element = document.getElementById(this.elementID);
			if(element) {
				const style = window.getComputedStyle(element);

				const transitionProperty = style.transitionProperty.split(",");
				const transitionDuration = style.transitionDuration.split(",");
				const index = transitionProperty.findIndex(p => p === "background-position");
				if(index !== -1) {
					transitionDuration[index] = this.duration;
					
					element.style.transitionDuration = transitionDuration.join(",");
				}
				
				let marginLeft = parseInt(style.marginLeft);
				let marginRight = parseInt(style.marginRight);
				
				switch(this.direction) {
					case "left":
						if((marginLeft < 0 && marginRight > 0) || (marginLeft === 0 && marginRight === 0)) {
							marginLeft -= 100;
							marginRight += 100;
						} else {
							marginLeft -= 100;
						}
						break;
					case "right":
						if(marginLeft < 0 && marginRight > 0) {
							marginLeft += 100;
							marginRight -= 100;
						} else {
							marginLeft += 100;
						}
						break;
				}
				
				element.style.marginLeft = marginLeft + "%";
				element.style.marginRight = marginRight + "%";
				
				Promise.all(element.getAnimations().map(a => a.finished)).then(() => {
					const column = parseInt(style.gridColumn) + (marginLeft > 0 ? 1 : marginRight > 0 ? -1 : 0);
					
					element.classList.add("no-transitions");
					element.style.marginLeft = "0%";
					element.style.marginRight = "0%";
					//element.style.gridColumn = column;
					element.setAttribute("style", "grid-column: " + column + " !important");
					
					window.setTimeout(() => {
						element.classList.remove("no-transitions");
						resolve(this.nextCommand);
					}, 10);
				});
				
			} else reject("No element with the ID '" +  this.elementID + "' at line " + this.lineNumber + "!");
		});
	}
	
}

commands["reset"] = class extends Command {
	
	constructor() {
		super(...arguments);

		this.elementID = this.commandArguments;
	}
	
	async execute() {
		const element = document.getElementById(this.elementID);
		if(element) {
			element.style.backgroundPosition = "left bottom";
		} else throw "No element with the ID '" +  this.elementID + "' at line " + this.lineNumber + "!";
		
		return this.nextCommand;
	}
	
}

commands["columns"] = class extends Command {
	
	constructor() {
		super(...arguments);

		this.columns = parseInt(this.commandArguments);
	}
	
	async execute() {
		const characterLayer = document.querySelector(".character.layer");
		switch(this.columns) {
			case 2:
				characterLayer.classList.add("columns-2");
				characterLayer.classList.remove("columns-3");
				characterLayer.classList.remove("columns-4");
				characterLayer.classList.remove("columns-5");
				characterLayer.classList.remove("columns-6");
				break;
			case 3:
				characterLayer.classList.remove("columns-2");
				characterLayer.classList.add("columns-3");
				characterLayer.classList.remove("columns-4");
				characterLayer.classList.remove("columns-5");
				characterLayer.classList.remove("columns-6");
				break;
			case 4:
				characterLayer.classList.remove("columns-2");
				characterLayer.classList.remove("columns-3");
				characterLayer.classList.add("columns-4");
				characterLayer.classList.remove("columns-5");
				characterLayer.classList.remove("columns-6");
				break;
			case 5:
				characterLayer.classList.remove("columns-2");
				characterLayer.classList.remove("columns-3");
				characterLayer.classList.remove("columns-4");
				characterLayer.classList.add("columns-5");
				characterLayer.classList.remove("columns-6");
				break;
			case 6:
				characterLayer.classList.remove("columns-2");
				characterLayer.classList.remove("columns-3");
				characterLayer.classList.remove("columns-4");
				characterLayer.classList.remove("columns-5");
				characterLayer.classList.add("columns-6");
				break;
		}	
		
		return this.nextCommand;
	}
	
}

/**
 * play <channel> <sound path> <loop | once> <fadein | fadeout | fadeinout> <duration>
 */
commands["play"] = class extends Command {

	constructor() {
		super(...arguments);
		
		const args = this.commandArguments.split(" ");
		if(args.length < 2) {
			throw new ParserError("Missing required arguments at line " + this.lineNumber + "!");
		}
		
		this.channel = args[0];
		this.soundPath = args[1];
		this.loop = args[2] === "loop";
		this.timing = args.length > 3 ? args[3] : "none";
		this.duration = args.length > 4 ? parseFloat(args[4]) : 2;
		if(isNaN(this.duration)) {
			this.duration = 2;
		}
		
		switch(this.channel) {
			case "music":
				sounds[this.soundPath] = config.musicPath + this.soundPath;
				break;
			case "sound":
				sounds[this.soundPath] = config.soundPath + this.soundPath;
				break;
			case "voice":
				sounds[this.soundPath] = config.voicePath + this.soundPath;
				break;
			default:
				throw "Invalid audio channel at line " + this.lineNumber + "!";
		}
	}
	
	execute() {
		return new Promise((resolve) => {
			const createAudio = () => {
				let maxVolume = 1;
				switch(this.channel) {
					case "music":
						maxVolume = settings["Sound"].musicVolume.value / settings["Sound"].musicVolume.max;
						break;
					case "sound":
						maxVolume = settings["Sound"].soundVolume.value / settings["Sound"].soundVolume.max;
						break;
					case "voice":
						maxVolume = settings["Sound"].voiceVolume.value / settings["Sound"].voiceVolume.max;
						break;
				}
				
				// I have no idea why I need to clone the audio element for the sound to start :/
				const audio = sounds[this.soundPath].cloneNode();
				audio.id = "audio_" + this.channel;
				audio.autoplay = true;
				audio.loop = this.loop;
				audio.volume = this.timing.startsWith("fadein") ? 0 : maxVolume;
				document.body.append(audio);
				
				if(this.timing.startsWith("fadein")) {
					const step = 1.0 / (this.duration * 1000 / 100);
					const fadein = () => {
						audio.volume = Math.min(maxVolume, audio.volume + step);
						if(audio.volume < maxVolume) {
							audio.timeout = window.setTimeout(fadein, 100);
						} else {
							audio.timeout = null;
						}
					};
					fadein();
				}
			};
		
			const audio = document.getElementById("audio_" + this.channel);
			if(audio) {
				// check if the channel is fading out, in which case we terminate it
				if(audio.timeout) {
					window.clearTimeout(audio.timeout);
					audio.remove();
					createAudio();
					resolve(this.nextCommand);
					return;
				}
			
				// fade out the existing music and then remove the audio element
				if(this.timing === "fadeout" || this.timing === "fadeinout") {
					const fadeout = () => {
						audio.volume = Math.max(0, audio.volume - 0.05);
						if(audio.volume > 0) {
							audio.timeout = window.setTimeout(fadeout, 100);
						} else {
							audio.timeout = null;
							audio.remove();
							createAudio();
						}
					};
				} else {
					audio.remove();
					createAudio();
				}
			} else {
				createAudio();
			}
			
			resolve(this.nextCommand);
		});
	}
	
};

/**
 * stop <channel> <fadeout duration>
 */
commands["stop"] = class extends Command {
	
	constructor() {
		super(...arguments);
		
		const args = this.commandArguments.split(" ");
		if(args.length < 1) {
			throw new ParseError("Missing required arguments at line " + this.lineNumber + "!");
		}
		
		this.channel = args[0];
		this.duration = args.length > 1 ? parseFloat(args[1]) : 2;
		if(isNaN(this.duration)) {
			this.duration = 2;
		}
	}
	
	execute() {
		return new Promise((resolve) => {
			const audio = document.getElementById("audio_" + this.channel);
			if(audio) {
				if(audio.timeout) {
					window.clearTimeout(audio.timeout);
				}
				const fadeout = () => {
					audio.volume = Math.max(0, audio.volume - 0.05);
					if(audio.volume > 0) {
						audio.timeout = window.setTimeout(fadeout, 100);
					} else {
						audio.remove();
					}
				};
				fadeout();
			}
		
			resolve(this.nextCommand);
		});
	}
	
};

/**
 * Handle the audio channels based on the current playState of the game.
 */
document.addEventListener("gameevent", (event) => {
	if(!["playing", "paused", "stopped"].includes(event.type)) {
		return;
	}
	
	const music = document.getElementById("audio_music");
	const sound = document.getElementById("audio_sound");
	const voice = document.getElementById("audio_voice");
	
	switch(event.type) {
		case "playing":
			if(music) music.play();
			if(sound) sound.play();
			if(voice) voice.play();
			break;
		case "paused":
			if(music) music.pause();
			if(sound) sound.pause();
			if(voice) voice.pause();
			break;
		case "stopped":
			if(music) music.remove();
			if(sound) sound.remove();
			if(voice) voice.remove();
			break;
	}
});

commands["exit"] = class extends Command {
	
	constructor() {
		super(...arguments);
	}
	
	async execute() {
		game.stop();
	}
	
};

commands["restart"] = class extends Command {
	
	constructor() {
		super(...arguments);
	}
	
	async execute() {
		game.stop();
	}
	
};