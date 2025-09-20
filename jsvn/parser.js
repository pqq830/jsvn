var parser = {
	
	parse(script) {
		const lines = script.split("\n");
		
		const rootCommand = new BranchingCommand("#root", "");
		const parentStack = [];
		let parentCommand = rootCommand;
		
		for(let i=0; i<lines.length; i++) {
			const line = lines[i];
						
			let trimmedLine = line.trim();
			// check if the line is empty or a comment
			if(trimmedLine.length === 0 || trimmedLine.startsWith("#")) {
				continue;
			}
			
			// get the parent command for this command
			let tabDepth = 0;
			while(line.charAt(tabDepth) === "\t") tabDepth++;
			
			if(tabDepth === 0) {
				parentStack.length = 0;
				parentCommand = rootCommand;
			} else if(tabDepth === parentStack.length) {
				parentCommand = parentStack[parentStack.length - 1];
			} else if(tabDepth > parentStack.length) {
				throw "Invalid tab depth at line " + (i + 1) + "!";
			} else if(tabDepth < parentStack.length) {
				while(tabDepth < parentStack.length) {
					parentStack.pop();
				}
				if(parentStack.length === 0) {
					parentCommand = rootCommand;
				} else {
					parentCommand = parentStack[parentStack.length - 1];
				}
			}
			
			// extract the command name and the command arguments
			let spaceIndex = trimmedLine.indexOf(" ");
			if(spaceIndex === -1) {
				spaceIndex = trimmedLine.length;
			}
			
			let commandName = trimmedLine.substring(0, spaceIndex).trim();
			let commandArguments = trimmedLine.substring(spaceIndex).trim();
			
			// check if this is a special heading
			if(commandName.startsWith("[")) {
				const bracketOpeningIndex = trimmedLine.indexOf("[") + 1;
				const bracketClosingIndex = trimmedLine.lastIndexOf("]");
				if(bracketClosingIndex === -1) {
					throw "Missing closing bracket at line " + (i + 1) + "!";
				}
				commandName = "heading";
				commandArguments = trimmedLine.substring(bracketOpeningIndex, bracketClosingIndex);
			}
			
			let commandClass = commands[commandName];
			if(!commandClass) {
				// check if this is a special say command "<character>: <text>"
				const colonIndex = trimmedLine.indexOf(":");
				const escapedColon = trimmedLine.charAt(colonIndex - 1) === "\\";
				if(colonIndex > 0 && !escapedColon) {
					commandClass = commands["say"];
					commandName = "say";
					commandArguments = trimmedLine.substring(0, colonIndex).trim() + " " + trimmedLine.substring(colonIndex + 1).trim();
				}
				// treat all other unknown commands as a narrator say command
				else {
					if(escapedColon) {
						trimmedLine = trimmedLine.replace("\\:", ":");
					}
					
					commandClass = commands["say"];
					commandName = "say";
					commandArguments = (config.narratorName ? config.narratorName : "") + " " + trimmedLine;
				}
			}
			
			const command = new commandClass(commandName, commandArguments, i + 1);
			if(command instanceof BranchingCommand) {
				parentStack.push(command);
			}
			parentCommand.add(command);
		}
		
		return rootCommand;
	}
	
};