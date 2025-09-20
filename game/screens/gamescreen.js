var gamescreen = new class extends Screen {
	
	constructor() {
		super(document.querySelector(".game.screen"));
		
		const btnMenu = document.getElementById("btn_menu");
		const btnAuto = document.getElementById("btn_auto");
		const btnSkip = document.getElementById("btn_skip");
		
		btnAuto.onclick = () => {
			btnAuto.ariaChecked = btnAuto.ariaChecked === "true" ? "false" : "true";
			game.auto = btnAuto.ariaChecked === "true";
		};
		btnSkip.onclick = () => {
			btnSkip.ariaChecked = btnSkip.ariaChecked === "true" ? "false" : "true";
			game.skip = btnSkip.ariaChecked === "true";
		};
		
		document.addEventListener("gameevent", (event) => {
			if(event.type === "stopped") {
				startscreen.show();
			} else if(event.type === "auto") {
				btnAuto.ariaChecked = game.auto.toString();
			} else if(event.type === "skip") {
				btnSkip.ariaChecked = game.skip.toString();
			}
		});
	}
	
	show() {
		game.play();
		super.show();
	}
	
};