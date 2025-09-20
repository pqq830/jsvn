class BaseElement extends HTMLElement {

	constructor() {
		super();
	}
	
	show() {
		this.classList.replace("hidden", "visible");
	}
	
	hide() {
		this.classList.replace("visible", "hidden");
	}
	
};