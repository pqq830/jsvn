var config = {
	imagesPath: "./game/images/",
	videosPath: "./game/images/",
	musicPath: "./game/audio/",
	
	/*
	 The amount of time that must pass before skipping.
	*/
	skipDelay: 150,
	
	/*
	 The amount of time (in milliseconds) before playing the next command when the command doesn't output text, such as "pause".
	*/
	wordlessAutoMilliseconds: 2000,
	
	/*
	 The minimum amount of time (in milliseconds) before playing the next command.
	*/
	minAutoMilliseconds: 1500,
	
	/*
	 The maximum amount of time (in milliseconds) before playing the next command.
	*/
	maxAutoMilliseconds: 5000,
	
	/*
	 The name of the narrator.
	*/
	narratorName: "",
	
	/*
	 Whether undo is enabled or disabled.
	*/
	undoDisabled: false
	
};