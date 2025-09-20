customElements.define("dialogue-menu", class extends BaseElement {

	constructor() {
		super();
	}
	
	connectedCallback() {
		this.className = "dialogue-menu hidden";
	}
	
});