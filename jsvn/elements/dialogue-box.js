customElements.define("dialogue-box", class extends BaseElement {

	constructor() {
		super();
	}
	
	connectedCallback() {
		this.className = "dialogue-box hidden";
		this.innerHTML = `
			<div class="who"></div>
			<div class="what"></div>
		`;
	}
	
	get who() {
		return this.querySelector(".who");
	}
	
	get what() {
		return this.querySelector(".what");
	}
	
});