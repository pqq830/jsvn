var sounds = {};

async function preLoadSounds() {
	const numSounds = Object.keys(sounds).length;
	console.log("Number of sounds: ", numSounds);
	
	let numLoadedSounds = 0;
	const promises = [];
	
	for(const key in sounds) {
		const sound = sounds[key];
		
		promises.push(new Promise((resolve) => {
			const audio = document.createElement("audio");
			audio.className = "game-audio";
			audio.preload = "auto";
			audio.src = sound;
			sounds[key] = audio;
			
			const status = () => {
				if(audio.readyState === 4) {
					numLoadedSounds++;
					resolve();
				} else {
					window.setTimeout(status, 10);
				}
			};
			status();
		}));
	}
		
	await Promise.all(promises);
}