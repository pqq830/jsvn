class Binding {
	
	constructor(source, sourceProperty, target, targetProperty) {
		this.source = source;
		this.sourceProperty = sourceProperty;
		this.target = target;
		this.targetProperty = targetProperty;
		
		this.propertyListener = (source, property) => {
			if(sourceProperty === this.sourceProperty) {
				this.target[this.targetProperty] = this.source[this.sourceProperty];
			}
		};
		
		this.source.addPropertyListener(this.propertyListener);
		
		// check if the target is an input
		if(this.target.nodeName === "INPUT") {
			this.changeListener = () => {
				switch(this.target.type) {
					case "checkbox":
					case "radio":
						this.source[this.sourceProperty] = Boolean(this.target[this.targetProperty]);
						break;
					case "number":
					case "range":
						this.source[this.sourceProperty] = parseFloat(this.target[this.targetProperty]);
						break;
					default:
						this.source[this.sourceProperty] = this.target[this.targetProperty];
				}
			};
			this.target.addEventListener("change", this.changeListener);
		}
		
		// set the initial value
		this.target[this.targetProperty] = this.source[this.sourceProperty];
	}
	
	remove() {
		this.source.removePropertyListener(this.propertyListener);
		
		if(this.changeListener) {
			this.target.remove("change", this.changeListener);
			this.changeListener = null;
		}
	}
	
}