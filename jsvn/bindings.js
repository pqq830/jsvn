var bindings = [];

document.addEventListener("DOMContentLoaded", () => {
	const bindingElements = document.querySelectorAll("[data-bind]");
	for(const bindingElement of bindingElements) {
		const bindingStrings = bindingElement.dataset.bind.split(",");
		for(const bindingString of bindingStrings) {
			const keyValueStrings = bindingString.split(":");
			
			const sourcePath = keyValueStrings[1].split(".");
			if(sourcePath.length < 2) {
				throw "Invalid source path in binding \"" + bindingString + "\"!";
			}
			
			let source = eval(sourcePath[0]);
			for(let i=1; i<sourcePath.length-1; i++) {
				source = eval(source[i]);
			}
			const sourceProperty = sourcePath[sourcePath.length - 1];
			
			// make sure the source is bindable
			if(!(source instanceof GameObject)) {
				throw "Cannot bind to the specified source as it's not a GameObject! Binding: \"" + bindingString + "\".";
			}
			
			bindings.push(new Binding(source, sourceProperty, bindingElement, keyValueStrings[0]));
		}
	}
	
});