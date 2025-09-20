var images = {};

async function preLoadImages() {
	const numImages = Object.keys(images).length;
	console.log("Number of images: ", numImages);
	const promises = [];
	
	let numImagesLoaded = 0;
	for(const src in images) {
		promises.push(new Promise((resolve) => {
			const image = new Image();
			image.onload = () => {				
				images[src] = image;
				numImagesLoaded++;
				resolve();
			};
			image.onerror = () => {
				numImagesLoaded++;
				const error = document.createElement("div");
				error.className = "resource-error";
				error.innerHTML = "Could not load image \"" + src + "\"!";
				images[src] = error;
				resolve();
			};
			image.src = typeof config !== "undefined" && config.imagesPath ? config.imagesPath + src : src;
		}));
	}
	
	await Promise.all(promises);
}