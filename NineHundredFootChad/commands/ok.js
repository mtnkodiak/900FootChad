module.exports = {
	name: 'ok',
	description: 'Chad says OK!',
	async execute(message, client, reps = 1) {
		const Discord = require('discord.js');
		// const client = new Discord.Client();

		console.log('reps = "' + reps + '"');

		if (reps == "") {
			reps = 1;
		}

		if (isNaN(reps)) {
			message.reply("Syntax: =ok [n] where n is 1-20");
			return;
		}

		reps = Math.floor(reps);

		if (reps > 20) {
			console.log('TOO MANY OKS');
			message.reply("Sorry, max 20 OKs at a time right now!  Here, have just one.");
			reps = 1;
			console.log('reps = ' + reps);
		}


		// Voice only works in guilds, if the message does not come from a guild,
		// we ignore it
		if (!message.guild) return;

		// Only try to join the sender's voice channel if they are in one themselves
		if (message.member.voice.channel) {
			const connection = await message.member.voice.channel.join();

			this.playChad(connection, reps);

		} else {
			message.reply('You need to join a voice channel first!');
		}

	},
	async playChad(connection, reps) {
		console.log('top of playChad: reps = ' + reps);

		if (reps == 0 || typeof(reps) != "number") {
			return;
		}

		rndnum = Math.floor(Math.random() * 47) + 1;

		filenamestr = 'static/ok' + rndnum + '.mp3';
		const dispatcher = connection.play(filenamestr);
		dispatcher.on('start', () => {
			console.log('audio ' + filenamestr + ' is playing');
		});
		dispatcher.on('finish', () => {
			console.log('Finished playing ' + filenamestr + '!');
			this.playChad(connection, --reps);
		});

	}
}