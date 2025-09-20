class BranchingCommand extends Command {

	constructor() {
		super(...arguments);
		
		this.children = [];
	}
	
	get firstCommandChild() {
		return this.children[0];
	}
	
	get lastCommandChild() {
		return this.children[this.children.length - 1];
	}
	
	get nextCommand() {
		if(this.children.length > 0) {
			return this.children[0];
		} else return super.nextCommand;
	}
	
	traverse(callbackFn) {
		callbackFn(this);
		
		for(const child of this.children) {
			if(child instanceof BranchingCommand) {
				child.traverse(callbackFn);
			} else {
				callbackFn(child);
			}
		}
	}
	
	find(callbackFn) {
		for(const child of this.children) {
			if(callbackFn(child)) {
				return child;
			}
			
			if(child instanceof BranchingCommand) {
				const result = child.find(callbackFn);
				if(result) {
					return result;
				}
			}
		}
			
		return null;
	}
	
	add(child) {
		if(child.parentCommand) {
			child.parentCommand.remove(child);
		}
		
		this.children.push(child);
		child.parentCommand = this;
	}
	
	remove(child) {
		const index = this.children.indexOf(child);
		if(index !== -1) {
			this.children.splice(index, 1);
			child.parentCommand = null;
		}
	}
	
	
}