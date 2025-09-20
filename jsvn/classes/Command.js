class Command {

	constructor(commandName, commandArguments, lineNumber) {
		this.commandName = commandName;
		this.commandArguments = commandArguments;
		this.lineNumber = lineNumber;
		this.parentCommand = null;
		this.isBlocking = false;
	}
	
	get rootCommand() {
		if(this.parentCommand) {
			return this.parentCommand.rootCommand;
		}
		return this;
	}
	
	get previousCommandSibling() {
		if(this.parentCommand) {
			const index = this.parentCommand.children.indexOf(this);
			if(index > 0) {
				return this.parentCommand.children[index - 1];
			}
		}
		return null;
	}
	
	get nextCommandSibling() {
		if(this.parentCommand) {
			const index = this.parentCommand.children.indexOf(this);
			if(index + 1 < this.parentCommand.children.length) {
				return this.parentCommand.children[index + 1];
			}
		}
		return null;
	}
	
	get nextCommand() {
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
		} else {
			return null;
		}
	}
	
	get previousCommand() {
		if(this.previousCommandSibling) {
			return this.previousCommandSibling;
		} else if(this.parentCommand) {
			return this.parentCommand.previousCommandSibling;
		} else {
			return null;
		}
	}
	
	async execute() {
	}
	
	async undo() {
	}
	
	toString() {
		return this.lineNumber + ": " + this.commandName + " " + this.commandArguments;
	}
}