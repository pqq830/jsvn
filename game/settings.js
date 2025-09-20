var settings = {
	"Display": {
		"transitions": { "name": "Disable Transitions", "type": "checkbox", "value": false }
	},
	
	"Skip": {
		"unseenText": { "name": "Skip Unread Dialogue", "type": "checkbox", "value": false },
		"afterChoices": { "name": "Skip After Choices", "type": "checkbox", "value": false }
	},
	
	"Text": {
		"textSpeed": { "name": "Text Speed", "type": "range", "value": 5, "min": 1, "max": 5 },
		"autoSpeed": { "name": "Auto Speed", "type": "range", "value": 5, "min": 1, "max": 5 }
	},
	
	"Sound": {
		"musicVolume": { "name": "Music Volume", "type": "range", "value": 5, "min": 1, "max": 5 },
		"soundVolume": { "name": "Sound Volume", "type": "range", "value": 5, "min": 1, "max": 5 },
		"voiceVolume": { "name": "Voice Volume", "type": "range", "value": 5, "min": 1, "max": 5 }
	},
	
	onchange: function(setting) {
		switch(setting.name) {
			case "Disable Transitions":
				document.body.classList.toggle("no-transitions");
				break;
			case "Music Volume":
				const musicElement = document.getElementById("audio_music");
				if(musicElement) {
					musicElement.volume = setting.value / setting.max;
				}
				break;
			case "Sound Volume":
				const soundElement = document.getElementById("audio_sound");
				if(soundElement) {
					soundElement.volume = setting.value / setting.max;
				}
				break;
			case "Voice Volume":
				const voiceElement = document.getElementById("audio_voice");
				if(voiceElement) {
					voiceElement.volume = setting.value / setting.max;
				}
				break;
		}
	},
	
	save() {
		window.localStorage.setItem("settings", JSON.stringify(settings));
	},
	
	load() {
		const item = window.localStorage.getItem("settings");
		if(item) {
			Object.assign(settings, JSON.parse(item));
		}
	},
	
	clear() {
		window.localStorage.removeItem("settings");
	}
};