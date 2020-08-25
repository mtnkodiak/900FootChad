async function playChad(channel, reps) {
	console.log('top of playChad: reps = ' + reps);

	if (reps == 0 || typeof (reps) != "number") {
		return;
	}
	
	const connection = await channel.join();

	rndnum = Math.floor(Math.random() * 47) + 1;

	filenamestr = 'static/ok' + rndnum + '.mp3';
	//filenamestr = 'static/celebrate.mp3';
	const dispatcher = await connection.play(filenamestr);
	dispatcher.on('start', () => {
		console.log('audio ' + filenamestr + ' is playing');
	});
	dispatcher.on('finish', () => {
		console.log('Finished playing ' + filenamestr + '!');
		this.playChad(channel, --reps);
	});

}
async function playCelebration(channel) {
	console.log('top of playCelebration');
	
	const connection = await channel.join();

	filenamestr = './static/celebration.mp3';
	const dispatcher = await connection.play(filenamestr);
	dispatcher.on('start', () => {
		console.log('audio ' + filenamestr + ' is playing');
	});
	dispatcher.on('finish', () => {
		console.log('Finished playing ' + filenamestr + '!');
	});

}
module.exports = { playChad, playCelebration };
	