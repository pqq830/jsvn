class GameEvent extends CustomEvent {
	
	constructor(type, target = null) {
		super("gameevent", { detail: { type: type, target: target } });
	}
	
	get type() {
		return this.detail.type;
	}
	
	get digit() {
		if(this.type.startsWith("key_")) {
			return parseInt(this.type.substring(4));
		}
		return null;
	}

	get isPrimary() {
		return this.type === "primary";
	}
	
	get isSecondary() {
		return this.type === "secondary";
	}
	
	get isDigit() {
		return this.type.startsWith("key_");
	}
	
	get target() {
		return this.detail.target;
	}
	
}