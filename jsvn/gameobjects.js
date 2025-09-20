var gameobjects = new class {
	
	constructor() {
		this.objects = new Set();
		
		this.gameObjectsListeners = new Set();
		
		const gameObjectsListener = (gameObject, property, oldValue, newValue) => {
			for(const gameObjectListener of this.gameObjectsListeners) {
				gameObjectListener(gameObject, "property", property, oldValue, newValue);
			}
		};
		
		this.add = (obj) => {
			this.objects.add(obj);
			obj.addPropertyListener(gameObjectsListener);
		};
		
		this.remove = (obj) => {
			this.objects.delete(obj);
			obj.removePropertyListener(gameObjectsListener);
		};
	}
	
	addGameObjectListener(listener) {
		this.gameObjectsListeners.add(listener);
	}
	
	removeGameObjectListener(listener) {
		this.gameObjectsListeners.delete(listener);
	}
};