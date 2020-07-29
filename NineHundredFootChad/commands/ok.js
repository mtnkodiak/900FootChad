const playChad = require("../voiceutils/playChad");

exports.run = (client, message, reps) => {
	//const Playchad = require('playChad');
	const voiceutils = require("../voiceutils/playChad");

	// name: 'ok',
	// description: 'Chad says OK!',
	//async execute(message, client, mongoClient, reps = 1) {
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

		playChad.playChad(message.member.voice.channel, reps);

	} else {
		message.reply('You need to join a voice channel first!');
	}

}