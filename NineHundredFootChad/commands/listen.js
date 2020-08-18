exports.run = async (client, message, toggle) => {

	const Discord = require('discord.js');
//	const starttalk = require('../voiceutils/starttalk.js');

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

	    client.voiceConnection = await message.member.voice.channel.join();

		// // Connect to the db
		// mongoClient.connect("mongodb://localhost:27017/9fchad", function (err, db) {
		// 	if (!err) {
		// 		console.log("We are connected to the MongoDB.");
		// 	} else {
		// 		console.log("MongoDB connection issue.  Err = " + err);
		// 	}
		// });

		//var collection = db.collection('');

		// const startTalk = async (member, speaking) => {
		// 		if (speaking) {
		// 			const vc = await this.getvc(message.member);
		// 			console.log("got vc=", vc);
		// 			const audio = vc.receiver.createStream(user, { mode: 'pcm' });

		// 			console.log(member.displayName + ' started talking.');
		// 		}
		// 		else {
		// 			console.log(member.displayName + ' stopped talking');
		// 		}
		// 	};
		if (toggle == "on") {
			//console.log("toggle on, starttalk.starttalk() = " + starttalk.startTalk());
			client.okEnabled = true;
			message.reply("Chad is listening for OKs."); 
			//client.on(('guildMemberSpeaking', starttalk.startTalk()));
		} else { //toggle = "off"
			client.okEnabled = false;
			message.reply("Chad is no longer listening for OKs.");
		}

	} else {
		message.reply('You need to join a voice channel first!');
	}
}
