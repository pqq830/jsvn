customElements.define("dialogue-prompt", class extends BaseElement {

	constructor() {
		super();
	}
	
	connectedCallback() {
		this.className = "dialogue-prompt hidden";
		this.innerHTML = `
			<div class="query"></div>
			<input class="input" type="text">
		`;
		
		const input = this.querySelector("input");
		input.addEventListener("keyup", (event) => {
			event.stopPropagation();
			
			if(event.which === 13) {
				this.dispatchEvent(new SubmitEvent("submit"));
			}
		});
	}
	
	get queryElement() {
		return this.querySelector(".query");
	}
	
	get inputElement() {
		return this.querySelector("input");
	}
	
	set query(value) {
		this.queryElement.innerHTML = value;
	}
	
	get query() {
		return this.queryElement.innerHTML;
	}
	
	set value(value) {
		return this.inputElement.value = value;
	}
	
	get value() {
		return this.inputElement.value;
	}
	
	set placeholder(value) {
		this.inputElement.placeholder = value;
	}
	
	get placeholder() {
		return this.inputElement.placeholder;
	}
	
});