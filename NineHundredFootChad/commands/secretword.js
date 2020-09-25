exports.run = async (client, message, toggle) => {

	const Discord = require('discord.js');
	var randomWords = require('random-words');

	console.log('secretword toggle = "' + toggle + '"');

	if (toggle != "on" && toggle != "off") {
		message.reply("Syntax: =secretword [on|off]");
		isItOn = "OFF";
		if (client.secretWordGame == true) {
			isItOn = "ON";
		}
		message.reply("Secretword game is currently " + isItOn);

		if (client.secretWordGame == true) {
			message.reply("The current Secretword game has been going on since: " + client.secretWordStartedTime);
		}
		return;
	}
	
	if (toggle == "on") {
		message.reply("Secretword game activated.  If you speak the secret word, you win a prize!  It's imaginary!")
		client.secretWordGame = true;
		client.secretWordGameWord = randomWords();
		client.secretWordGameChannel = message.channel;
		client.secretWordStartedTime = new Date();

		console.log("secret word chosen: " + client.secretWordGameWord);
		
	    client.voiceConnection = await message.member.voice.channel.join();

	} else if (toggle == "off") { //off
		message.channel.send("Secretword game stopped.  The secret word was: " + client.secretWordGameWord);
		let duration = Date.now() - client.secretWordStartedTime;
		message.channel.send("Secretword game lasted " + duration.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
);
		client.secretWordGame = false;
	}

}