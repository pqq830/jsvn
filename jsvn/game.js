const ACTION_PRIMARY = 1;
const ACTION_SECONDARY = 2;
const ACTION_DIGIT = 4;
const ACTION_ANY = ACTION_PRIMARY | ACTION_SECONDARY | ACTION_DIGIT;

var game = new class {

	constructor() {
		this.rootCommand = null;
		this.currentCommand = null;
		
		this.path = [];
		
		this.variables = {};
		this.variables["prompt"] = "";
		
		this.playState = "stopped";
		
		this._auto = false;
		this.autoTime = 250;
		this._skip = false;
		
		let timeStamp = 0;
		const onAction = (e) => {
			console.log(e.which);
			if(e.target.closest(".ui.layer")) {
				return;
			}
			
			if(e.repeat) {
				if(Date.now() - timeStamp >= 1000) {
					timeStamp = Date.now();
				} else return;
			} else {
				timeStamp = e.timeStamp;
			}
			
			if(e.type === "pointerdown") {
				if(e.button === 0) {
					document.dispatchEvent(new GameEvent("primary", e.target));
				} else if(e.button === 2) {
					if(!config.undoDisabled) { 
						document.dispatchEvent(new GameEvent("secondary", e.target));
					}
				}
			} else if(e.type === "keydown") {
				if(e.which === 13 || e.which === 32) {
					document.dispatchEvent(new GameEvent("primary", e.target));
					e.preventDefault();
				} else if(e.which === 8) { // BACKSPACE
					if(!config.undoDisabled) {
						document.dispatchEvent(new GameEvent("secondary", e.target));
						e.preventDefault();
					}
				} else if(e.which >= 48 && e.which <= 57) {
					document.dispatchEvent(new GameEvent("key_" + (e.which - 48), e.target));
				}
			} 
		};
		
		let skipTimeout = null;
		let autoProgressInterval = null;
		
		document.addEventListener("gameevent", (e) => {
			if(e.type === "skip") {
				const skipStart = () => {
					document.dispatchEvent(new GameEvent("primary"));			
					skipTimeout = window.setTimeout(skipStart, config.skipDelay ? config.skipDelay : 150);
				};
				
				const skipStop = () => {
					if(skipTimeout) {
						window.clearTimeout(skipTimeout);
						skipTimeout = null;
					}
				};

				if(this.skip) {
					document.body.classList.add("fast-transitions");
					skipStart();
				} else {
					document.body.classList.remove("fast-transitions");
					skipStop();
				}
			} else if(e.type === "auto") {
				// update the auto progress 30 times a second
				const AUTO_PROGRESS_UPDATE_RATE = 1000 / 30;
				
				const autoStart = () => {
					let startTime = Date.now();
					
					autoProgressInterval = window.setInterval(() => {
						const elapsedTime = Date.now() - startTime;
						const progress = Math.min(elapsedTime / this.autoTime, 1.0);
						
						document.dispatchEvent(new GameEvent("autoprogress", null, progress));

						if(progress >= 1.0) {
							startTime = Date.now();
							document.dispatchEvent(new GameEvent("primary"));
						}
					}, AUTO_PROGRESS_UPDATE_RATE);
				};
				
				const autoStop = () => {
					if(autoProgressInterval) {
						window.clearInterval(autoProgressInterval);
						autoProgressInterval = null;
					}
				};

				if(this.auto) {
					autoStart();
				} else {
					autoStop();
				}				
			}
		});
		
		document.addEventListener("keydown", (e) => {
			if(e.which === 17) { // CTRL KEY
				this.skip = true;
			} else if(e.which === 65) { // A KEY
				this.auto = !this.auto;
			}
		});
		
		document.addEventListener("keyup", (e) => {
			if(e.which === 17) { // CTRL KEY
				this.skip = false;
			}
		});
		
		this.attachInputListeners = () => {
			document.addEventListener("pointerdown", onAction);
			document.addEventListener("keydown", onAction);
		};
		
		this.detachInputListeners = () => {
			document.removeEventListener("pointerdown", onAction);
			document.removeEventListener("keydown", onAction);
		};
	}
	
	set auto(value) {
		value = Boolean(value);
		if(this._auto !== value) {
			this._auto = value;
			document.dispatchEvent(new GameEvent("auto"));
		}
	}
	
	get auto() {
		return this._auto;
	}
	
	set skip(value) {
		value = Boolean(value);
		if(this._skip !== value) {
			this._skip = value;
			document.dispatchEvent(new GameEvent("skip"));
		}
	}
	
	get skip() {
		return this._skip;
	}
	
	formatString(s) {
		return s.replaceAll(/%([^%]+)%/g, (match, p1) => {
			return eval(p1);
		});
	}
	
	play() {
		if(this.playState === "playing") {
			return;
		}
		if(this.playState !== "paused") {
			this.path = [];
		}
		this.playState = "playing";
		this.attachInputListeners();
		document.dispatchEvent(new GameEvent("playing"));
		this.run();		
	}
	
	pause() {
		if(this.playState === "paused") {
			return;
		}
		this.playState = "paused";
		this.detachInputListeners();
		document.dispatchEvent(new GameEvent("paused"));
	}
	
	stop() {
		if(this.playState === "stopped") {
			return;
		}
		this.playState = "stopped";
		this.detachInputListeners();
		document.dispatchEvent(new GameEvent("stopped"));
	}
	
	async run() {
		this.currentCommand = this.rootCommand.firstCommandChild;
		while(this.currentCommand) {
			try {
				const nextCommand = await this.currentCommand.execute();
				this.path.push(this.currentCommand);
				
				this.currentCommand = nextCommand;
			} catch(err) {
				if(err === "secondary") {
					await this.currentCommand.undo();
					
					const lastBlockingCommandIndex = this.path.findLastIndex((c) => c.isBlocking);
					if(lastBlockingCommandIndex !== -1) {
						// undo all the commands before the last blocking command
						for(let i=this.path.length-1; i>lastBlockingCommandIndex; i--) {
							this.path[i].undo();
						}
						
						this.currentCommand = this.path[lastBlockingCommandIndex];
						this.path.splice(lastBlockingCommandIndex);
						
						const firstBlockingCommandIndex = this.path.findLastIndex((c) => c.isBlocking);
						if(firstBlockingCommandIndex !== -1) {
							for(let i=this.path.length-1; i>firstBlockingCommandIndex; i--) {
								await this.path[i].undo();
							}
							for(let i=firstBlockingCommandIndex+1; i<this.path.length; i++) {
								await this.path[i].execute();
							}
						} else {
							for(let i=this.path.length-1; i>=0; i--) {
								await this.path[i].undo();
							}
							for(let i=0; i<this.path.length; i++) {
								await this.path[i].execute();
							}
						}
					} else {
						for(let i=this.path.length-1; i>=0; i--) {
							await this.path[i].undo();
						}
						
						this.currentCommand = this.path[0];
						this.path = [];
					}
				} else {
					console.error(err);
					break;
				}				
			}
		}
	}
	
	debugPath() {
		debug.clear();
		for(let i=0; i<this.path.length; i++) {
			if(this.pathIndex === i) {
				debug.log(this.path[i], "active");
			} else {
				debug.log(this.path[i]);
			}
		}		
	}
	
	waitForAction(actionType = ACTION_PRIMARY | ACTION_SECONDARY, autoTime = 2000, pauseTime = 0) {
		return new Promise((resolve, reject) => {
			this.autoTime = autoTime;
			
			let pauseTimeout = null;
			if(pauseTime > 0) {
				pauseTimeout = window.setTimeout(() => {
					document.dispatchEvent(new GameEvent("primary"));
				}, pauseTime);
			}
			
			const cleanUp = () => {
				if(pauseTimeout) {
					window.clearTimeout(pauseTimeout);
				}
				document.removeEventListener("gameevent", eventListener);
			};
			
			const eventListener = (e) => {
				if(actionType&ACTION_PRIMARY && e.isPrimary) {
					cleanUp();
					resolve(e);
				} else if(actionType&ACTION_SECONDARY && e.isSecondary) {
					cleanUp();
					resolve(e);
				} else if(actionType&ACTION_DIGIT && e.type.startsWith("key_")) {
					console.log(actionType&ACTION_DIGIT);
					cleanUp();
					resolve(e);
				}
			};
			
			document.addEventListener("gameevent", eventListener);
		});
	}
	
};