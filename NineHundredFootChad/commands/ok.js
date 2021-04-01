const playChad = require("../voiceutils/playChad");

exports.run = async (client, message, reps) => {

	const Discord = require('discord.js');

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
		client.voiceConnection = await message.member.voice.channel.join();

		await playChad.playChad(message.member.voice.channel, reps);

	} else {
		message.reply('You need to join a voice channel first!');
	}

}