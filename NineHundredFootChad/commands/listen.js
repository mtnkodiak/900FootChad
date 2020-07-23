module.exports = {
	name: 'listen',
	description: 'Let chad listen in to the voice channel',
	async execute(message, client, toggle) {
		const Discord = require('discord.js');

		console.log('toggle = "' + toggle + '"');

		if (toggle == "") {
			message.reply("Syntax: =listen [on|off]");
			return;
		}

		// Voice only works in guilds, if the message does not come from a guild,
		// we ignore it
		if (!message.guild) return;

		// Only try to join the sender's voice channel if they are in one themselves
		if (message.member.voice.channel) {
			const connection = await message.member.voice.channel.join();

			if (toggle = "on") {
				
			} else { //toggle = "off"

			}


			this.playChad(connection, reps);

		} else {
			message.reply('You need to join a voice channel first!');
		}



	}
}

