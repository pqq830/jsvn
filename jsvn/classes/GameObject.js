class GameObject {

	constructor(model) {
		for(const key in model) {
			Object.defineProperty(this, key, {
				set: (value) => {
					const oldValue = model[key];
					
					model[key] = value;
					this.notifyPropertyChanged(key, oldValue, value);
				},
				get: () => {
					return model[key];
				}
			});
		}
		
		this.propertyListeners = new Set();
		
		gameobjects.add(this);
	}
	
	addPropertyListener(listener) {
		this.propertyListeners.add(listener);
	}
	
	removePropertyListener(listener) {
		this.propertyListeners.delete(listener);
	}
	
	notifyPropertyChanged(property, oldValue, newValue) {
		for(const listener of this.propertyListeners) {
			listener(this, property, oldValue, newValue);
		}
	}
	
}