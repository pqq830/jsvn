var player = new GameObject({ name: "John", score: 10 });

var gameScript = `
@ init
	bg livingroom.jpg
	columns 6
	show girl column-2
	girl: Hello!
	move girl right
	move girl right
	$ player.score = 200;
	Ian: Hello World
	restart
`;