async function main() {
	splashscreen.show();
	
	const loadStartTime = Date.now();
	
	game.rootCommand = parser.parse(gameScript);
	
	splashscreen.progress = 0;
	splashscreen.message = "Loading images...";
	await preLoadImages();
	splashscreen.progress = 30;
	splashscreen.message = "Loading videos...";
	await preLoadVideos();
	progress.progress = 60;
	splashscreen.message = "Loading sounds...";
	await preLoadSounds();
	
	const loadStopTime = Date.now();
	const elapsedTime = loadStopTime - loadStartTime;
	if(elapsedTime < splashscreen.MIN_VISIBLE_TIME) {
		const random = Math.random();
		splashscreen.progress = 80;
		if(random < 0.2) {
			splashscreen.message = "Generating 3D landscape...";
		} else if(random < 0.4) {
			splashscreen.message = "Author fell asleep, wait a little more...";
		} else if(random < 0.6) {
			splashscreen.message = "The framers are working hard...";
		} else if(random < 0.7) {
			splashscreen.message = "We're going to WAR!";
		} else {
			splashscreen.message = "The developer coulnd't think of any more useless messages...";
		}
		await new Promise((resolve) => window.setTimeout(resolve, splashscreen.MIN_VISIBLE_TIME - elapsedTime));
	}
	
	splashscreen.progress = 100;
	splashscreen.message = "Press any key to continue...";
	if(!DEBUG) {
		await new Promise((resolve) => {
			const inputListener = (event) => {
				document.removeEventListener("keydown", inputListener);
				document.removeEventListener("pointerdown", inputListener);
				resolve();
			};
			document.addEventListener("keydown", inputListener);
			document.addEventListener("pointerdown", inputListener);
		});
	}
	
	startscreen.show();
}

document.addEventListener("DOMContentLoaded", main);