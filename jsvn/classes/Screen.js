class Screen {

	constructor(element) {
		this.element = element;
	}
	
	/**
	 * Shows this screen and hides all other screens as there can only be one visible screen at the time.
	 */
	show() {
		this.element.classList.add("visible");
	}
	
	/**
	 * Hides this screen.
	 */
	hide() {
		this.element.classList.remove("visible");
	}
	
	/**
	 * Goes back to the last visible screen and returns true. If there
	 * was no last screen it will return false.
	 */
	back() {
		this.hide();
	}
	
}