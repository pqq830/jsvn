var videos = {};

async function preLoadVideos() {
	const numVideos = Object.keys(videos).length;
	console.log("Number of videos: ", numVideos);
	const promises = [];
	
	let numVideosLoaded = 0;
	for(const src in videos) {
		promises.push(new Promise((resolve) => {
			const video = document.createElement("video");
			video.preload = true;
			video.addEventListener("canplaythrough", () => {
				numVideosLoaded++;
				videos[src] = video;
				resolve();
			}, { once: true });
			video.addEventListener("error", () => {
				numVideosLoaded++;
				const error = document.createElement("div");
				error.className = "resource-error";
				error.innerHTML = "Could not load video \"" + src + "\"!";
				videos[src] = error;
				resolve();
			});
			video.src = typeof config !== "undefined" && config.videosPath ? config.videosPath + src : src;
		}));
	}
	
	await Promise.all(promises);
}