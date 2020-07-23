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

		

	}
}

