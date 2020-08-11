exports.run = async (client, message, toggle) => {

	const Discord = require('discord.js');
	var randomWords = require('random-words');

	console.log('secretword toggle = "' + toggle + '"');

	if (toggle != "on" && toggle != "off") {
		message.reply("Syntax: =secretword [on|off]");
		return;
	}
	
	if (toggle == "on") {
		message.reply("Secretword game activated.  If you speak the secret word, you win a prize!  It's imaginary!")
		client.secretWordGame = true;
		client.secretWordGameWord = randomWords();
		client.secretWordGameChannel = message.channel;
		console.log("secret word chosen: " + client.secretWordGameWord);
	} else { //off
		message.channel.send("Secretword game stopped.  The secret word was: " + client.secretWordGameWord);
		client.secretWordGame = false;
	}

}