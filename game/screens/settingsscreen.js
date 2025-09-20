var settingsscreen = new class extends Screen {

	constructor() {
		super(document.querySelector(".settings.screen"));
		
		this.element.addEventListener("change", (event) => {
			switch(event.target.type) {
				case "checkbox":
				case "radio":				
					settings[event.target.name][event.target.id].value = event.target.checked;
					break;
				case "range":
				case "number":
				case "text":
					settings[event.target.name][event.target.id].value = event.target.value;
					break;
			}
			
			settings.onchange(settings[event.target.name][event.target.id]);
		});
	}
	
	show() {
		settings.load();
		
		const article = this.element.querySelector("article");
		article.innerHTML = "";
		
		// create the settings
		for(const settingsGroup in settings) {
			if(typeof settings[settingsGroup] === "function") continue;
			
			article.innerHTML += "<h2>" + settingsGroup + "</h2>";
			for(const settingName in settings[settingsGroup]) {
				const setting = settings[settingsGroup][settingName];
				
				article.innerHTML += "<label for=\"" + settingName + "\">" + setting.name + "</label>";
				
				switch(setting.type) {
					case "checkbox":
						article.innerHTML += "<div style=\"text-align:right;\"><input type=\"checkbox\" name=\"" + settingsGroup + "\" id=\"" + settingName + "\"" + (setting.value ? " checked></div>" : "></div>");
						break;
					case "radio":
						article.innerHTML += "<div style=\"text-align:right;\"><input type=\"radio\" name=\"" + settingsGroup + "\" id=\"" + settingName + "\"" + (setting.value ? " checked></div>" : "></div>");
						break;
					case "range":
						article.innerHTML += "<div><input type=\"range\" name=\"" + settingsGroup + "\" id=\"" + settingName + "\" value=\"" + setting.value +"\" min=\"" + setting.min + "\" max=\"" + setting.max + "\"></div>";
						break;
					case "text":
						article.innerHTML += "<div><input type=\"text\" name=\"" + settingsGroup + "\" id=\"" + settingName + "\" value=\"" + setting.value + "\"></div>";
						break;
					case "number":
						article.innerHTML += "<div><input type=\"number\" name=\"" + settingsGroup + "\" id=\"" + settingName + "\" value=\"" + setting.value + "\"></div>";
						break;
				}
			}
		}
		
		super.show();
	}
	
	back() {
		settings.save();
		return super.back();
	}
};