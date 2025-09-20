var splashscreen = new class extends Screen {

	constructor() {
		super(document.querySelector(".splash.screen"));
		
		this.MIN_VISIBLE_TIME = DEBUG ? 0 : 2000;
	}
	
	set message(value) {
		this.element.querySelector("#message").innerHTML = value;
	}
	
	get message() {
		return this.element.querySelector("#message").innerHTML;
	}

	set progress(value) {
		this.element.querySelector("#progress").style.width = value + "%";
	}
	
	get progress() {
		const value = parseInt(this.element.querySelector("#progress").style.width);
		
		return isNaN(value) ? 0 : value;
	}	
	
};